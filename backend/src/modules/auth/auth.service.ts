import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../../models/User';
import { RefreshToken } from '../../models/RefreshToken';
import { Streak } from '../../models/Streak';
import { Milestone } from '../../models/Milestone';
import { UserProgress } from '../../models/UserProgress';
import { Onboarding } from '../../models/Onboarding';
import { AuditLog } from '../../models/AuditLog';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { sendMail, otpEmailHtml, resetPasswordHtml } from '../../utils/mailer';
import {
  generateOtp,
  hashOtp,
  verifyOtp as compareOtp,
  OTP_EXPIRY_MS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
} from '../../utils/otp';
import { createError } from '../../middleware/errorHandler';
import { env } from '../../config/env';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyOtpInput,
  ResendOtpInput,
  DeleteAccountInput,
  ChangePasswordInput,
} from './auth.schema';
import { logger } from '../../utils/logger';

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Register ──────────────────────────────────────────────────────────────────
export async function register(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    // Prevent email enumeration: if already registered but unverified, silently
    // re-issue an OTP instead of revealing account existence to an attacker.
    if (!existing.emailVerified) {
      await _issueAndSendOtp(existing._id.toString(), existing.email, existing.name);
      return { message: 'Account created. Please check your email for your 6-digit verification code.' };
    }
    throw createError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    // Always require email verification — OTP enforces this
    emailVerified: false,
    otpAttempts: 0,
  });

  try {
    await _issueAndSendOtp(user._id.toString(), user.email, user.name);
  } catch (mailErr) {
    // Email delivery is best-effort during registration; account is still created.
    // The user can request a resend from the OTP page.
    logger.warn({ mailErr, email: user.email }, 'OTP email failed to send — account still created');
  }

  return { message: 'Account created. Please check your email for your 6-digit verification code.' };
}

// ── Verify OTP ────────────────────────────────────────────────────────────────
export async function verifyOtp(input: VerifyOtpInput) {
  const user = await User.findOne({ email: input.email }).select(
    '+otpCode +otpExpires +otpAttempts'
  );

  // Generic message — prevents user-enumeration via the verify endpoint
  const invalidErr = createError('Invalid or expired verification code', 400);

  if (!user) throw invalidErr;
  if (user.emailVerified) throw createError('This email is already verified', 400);

  // Brute-force lockout
  if ((user.otpAttempts ?? 0) >= OTP_MAX_ATTEMPTS) {
    throw createError(
      'Too many incorrect attempts. Please request a new verification code.',
      429
    );
  }

  // Expiry check
  if (!user.otpExpires || user.otpExpires < new Date()) {
    throw createError('Your verification code has expired. Please request a new one.', 400);
  }

  // No OTP issued
  if (!user.otpCode) throw invalidErr;

  // Constant-time comparison via bcrypt
  const isValid = await compareOtp(input.otp, user.otpCode);

  if (!isValid) {
    await User.updateOne({ _id: user._id }, { $inc: { otpAttempts: 1 } });
    const remaining = OTP_MAX_ATTEMPTS - ((user.otpAttempts ?? 0) + 1);
    if (remaining <= 0) {
      throw createError(
        'Too many incorrect attempts. Please request a new verification code.',
        429
      );
    }
    throw createError(`Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`, 400);
  }

  // OTP is correct — activate account and clear all OTP fields
  await User.updateOne(
    { _id: user._id },
    {
      $set:   { emailVerified: true },
      $unset: { otpCode: '', otpExpires: '', otpAttempts: '' },
    }
  );

  return { message: 'Email verified successfully. You can now log in.' };
}

// ── Resend OTP ────────────────────────────────────────────────────────────────
export async function resendOtp(input: ResendOtpInput) {
  // Always return the same message to prevent email enumeration
  const genericResponse = { message: 'If this email is registered and unverified, a new code has been sent.' };

  const user = await User.findOne({ email: input.email }).select('+otpExpires');
  if (!user || user.emailVerified) return genericResponse;

  // Cooldown: reject if last OTP was issued less than OTP_RESEND_COOLDOWN_MS ago
  if (user.otpExpires) {
    const issuedAt = user.otpExpires.getTime() - OTP_EXPIRY_MS;
    const cooldownEnds = issuedAt + OTP_RESEND_COOLDOWN_MS;
    if (Date.now() < cooldownEnds) {
      const waitSec = Math.ceil((cooldownEnds - Date.now()) / 1000);
      throw createError(`Please wait ${waitSec} seconds before requesting another code.`, 429);
    }
  }

  try {
    await _issueAndSendOtp(user._id.toString(), user.email, user.name);
  } catch (mailErr) {
    logger.warn({ mailErr, email: user.email }, 'Resend OTP email failed');
  }

  return genericResponse;
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user) throw createError('Invalid email or password', 401);
  if (user.status === 'BLOCKED') throw createError('Your account has been blocked', 403);

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw createError('Invalid email or password', 401);

  if (!user.emailVerified) {
    throw createError('Please verify your email before logging in', 403);
  }

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const rawRefreshToken = signRefreshToken(user._id.toString());

  await RefreshToken.create({
    token: rawRefreshToken,
    userId: user._id,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });

  return { accessToken, refreshToken: rawRefreshToken, user };
}

// ── Refresh ───────────────────────────────────────────────────────────────────
export async function refresh(oldToken: string) {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(oldToken);
  } catch {
    throw createError('Invalid refresh token', 401);
  }

  const stored = await RefreshToken.findOne({ token: oldToken });
  if (!stored) throw createError('Refresh token not recognised', 401);
  if (stored.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: stored._id });
    throw createError('Refresh token expired', 401);
  }

  const user = await User.findById(payload.sub);
  if (!user || user.status === 'BLOCKED') throw createError('User not found or blocked', 401);

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const newRefreshToken = signRefreshToken(user._id.toString());
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  // Rotate atomically: replace old token record with new one
  await RefreshToken.findOneAndReplace(
    { _id: stored._id },
    { token: newRefreshToken, userId: user._id, expiresAt },
    { upsert: true }
  );

  return { accessToken, newRefreshToken };
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout(refreshToken: string) {
  await RefreshToken.deleteOne({ token: refreshToken });
}

// ── Forgot Password ───────────────────────────────────────────────────────────
export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await User.findOne({ email: input.email });
  // Always respond the same way to prevent email enumeration
  if (!user) return { message: 'If an account exists, a reset link has been sent.' };

  const { v4: uuidv4 } = await import('uuid');
  const resetToken = uuidv4();
  const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.resetToken = resetToken;
  user.resetTokenExp = resetTokenExp;
  await user.save();

  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendMail({
    to: user.email,
    subject: 'Reset your PrepMate password',
    html: resetPasswordHtml(resetLink),
  });

  return { message: 'If an account exists, a reset link has been sent.' };
}

// ── Reset Password ────────────────────────────────────────────────────────────
export async function resetPassword(input: ResetPasswordInput) {
  const user = await User.findOne({ resetToken: input.token }).select(
    '+resetToken +resetTokenExp'
  );
  if (!user || !user.resetTokenExp || user.resetTokenExp < new Date()) {
    throw createError('Invalid or expired reset link', 400);
  }

  user.passwordHash = await bcrypt.hash(input.password, 12);
  user.resetToken = undefined;
  user.resetTokenExp = undefined;
  await user.save();

  // Invalidate all refresh tokens for this user on password change
  await RefreshToken.deleteMany({ userId: user._id });

  return { message: 'Password reset successfully. Please log in.' };
}

// ── Change Password ───────────────────────────────────────────────────────────
export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw createError('User not found', 404);

  const passwordOk = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!passwordOk) throw createError('Incorrect current password', 401);

  user.passwordHash = await bcrypt.hash(input.newPassword, 12);
  await user.save();

  // Clear all refresh tokens so they have to log in again on other devices.
  await RefreshToken.deleteMany({ userId: user._id });
  
  return { message: 'Password updated successfully. Please log in again.' };
}

// ── Get Me ────────────────────────────────────────────────────────────────────
export async function getMe(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw createError('User not found', 404);
  return user;
}

// ── Delete Account ────────────────────────────────────────────────────────────
export async function deleteAccount(userId: string, input: DeleteAccountInput) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw createError('User not found', 404);

  // Verify password before destroying all data
  const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordOk) throw createError('Incorrect password', 401);

  const uid = new mongoose.Types.ObjectId(userId);

  // Cascade-delete all user-owned documents in parallel
  await Promise.all([
    RefreshToken.deleteMany({ userId: uid }),
    Streak.deleteMany({ userId: uid }),
    Milestone.deleteMany({ userId: uid }),
    UserProgress.deleteMany({ userId: uid }),
    Onboarding.deleteMany({ userId: uid }),
    AuditLog.deleteMany({ actorId: uid }),
  ]);

  // Delete the user last so foreign-key references are already gone
  await User.deleteOne({ _id: uid });

  logger.info({ userId }, 'Account deleted by user');
  return { message: 'Account deleted successfully.' };
}

// ── Internal Helpers ──────────────────────────────────────────────────────────

/**
 * Generate a new OTP, hash it, persist to user document, and send the email.
 * Extracts the common logic shared by register() and resendOtp().
 */
async function _issueAndSendOtp(userId: string, email: string, name: string): Promise<void> {
  const rawOtp = generateOtp();
  const hashedOtp = await hashOtp(rawOtp);
  const otpExpires = new Date(Date.now() + OTP_EXPIRY_MS);

  await User.updateOne(
    { _id: new mongoose.Types.ObjectId(userId) },
    {
      $set: {
        otpCode: hashedOtp,
        otpExpires,
        otpAttempts: 0,
      },
    }
  );

  await sendMail({
    to: email,
    subject: 'Your PrepMate verification code',
    html: otpEmailHtml(rawOtp, name),
  });
}
