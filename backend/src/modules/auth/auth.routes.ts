import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  resendOtpSchema,
  deleteAccountSchema,
  changePasswordSchema,
} from './auth.schema';
import * as ctrl from './auth.controller';

import rateLimit from 'express-rate-limit';

/** General auth limiter — covers register, login, forgot-password */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' },
});

/**
 * Strict OTP submission limiter — prevents brute-force at the HTTP layer
 * even before the service-layer attempt counter kicks in.
 */
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP attempts, please wait before trying again.' },
});

/** Resend limiter — prevents OTP flooding / email spam */
const otpResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many resend requests, please wait before trying again.' },
});

/** Strict limiter for the destructive delete-account action */
const deleteAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many delete requests, please wait before trying again.' },
});

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Create a new account and trigger OTP email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string }
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: Account created, OTP sent }
 *       400: { description: Validation error }
 *       409: { description: Email already exists and verified }
 */
router.post('/register', authLimiter, validate(registerSchema), ctrl.register);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify email using the 6-digit OTP
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email }
 *               otp:   { type: string, pattern: '^\d{6}$' }
 *     responses:
 *       200: { description: Email verified }
 *       400: { description: Invalid or expired OTP }
 *       429: { description: Too many attempts or cooldown active }
 */
router.post('/verify-otp', otpVerifyLimiter, validate(verifyOtpSchema), ctrl.verifyOtp);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend the 6-digit verification OTP
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: OTP resent (or silently suppressed) }
 *       429: { description: Resend cooldown active }
 */
router.post('/resend-otp', otpResendLimiter, validate(resendOtpSchema), ctrl.resendOtp);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive access token
 *     tags: [Auth]
 *     security: []
 */
router.post('/login', authLimiter, validate(loginSchema), ctrl.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Exchange refresh cookie for new access token
 *     tags: [Auth]
 *     security: []
 */
router.post('/refresh', ctrl.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and invalidate refresh token
 *     tags: [Auth]
 */
router.post('/logout', authenticate, ctrl.logout);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: [Auth]
 *     security: []
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), ctrl.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password via token
 *     tags: [Auth]
 *     security: []
 */
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), ctrl.resetPassword);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 */
router.get('/me', authenticate, ctrl.getMe);

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Change the current user's password
 *     tags: [Auth]
 */
router.patch('/change-password', authenticate, authLimiter, validate(changePasswordSchema), ctrl.changePassword);

/**
 * @swagger
 * /auth/me:
 *   delete:
 *     summary: Permanently delete authenticated user's account and all associated data
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, description: 'Current password to confirm deletion' }
 *     responses:
 *       200: { description: Account deleted }
 *       401: { description: Incorrect password }
 *       404: { description: User not found }
 */
router.delete('/me', authenticate, deleteAccountLimiter, validate(deleteAccountSchema), ctrl.deleteAccount);

export default router;
