import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

/**
 * Configure Nodemailer transporter based on SMTP settings.
 * Supports Gmail, Custom SMTP, etc.
 */
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using the configured SMTP transporter.
 */
export async function sendMail({ to, subject, html }: MailOptions): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    logger.info({ to, subject, messageId: info.messageId }, 'Email sent via SMTP');
  } catch (err) {
    logger.error({ err, to, subject }, 'Failed to send email via SMTP');
    throw err;
  }
}

/**
 * Branded OTP verification email for PrepMate.
 * Displays the 6-digit code in large, easy-to-read digit blocks.
 */
export function otpEmailHtml(otp: string, recipientName: string): string {
  const digits = otp.split('').map((d) => `
    <td style="
      display:inline-block;
      width:44px;
      height:56px;
      line-height:56px;
      margin:0 4px;
      border-radius:10px;
      background:#1a1f36;
      color:#ffffff;
      font-size:28px;
      font-weight:800;
      text-align:center;
      font-family:'Courier New',Courier,monospace;
      letter-spacing:0;
    ">${d}</td>`).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your PrepMate Verification Code</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;">PrepMate</p>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;letter-spacing:0.5px;">INTERVIEW PREP PLATFORM</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Verify your email address</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                Hi ${recipientName}, enter the code below in the PrepMate app to verify your email. This code is valid for <strong style="color:#4f46e5;">3 minutes</strong>.
              </p>

              <!-- OTP digits -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>${digits}</tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-align:center;">
                Do not share this code with anyone. PrepMate will never ask for it.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f3f4f6;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                If you didn't create a PrepMate account, you can safely ignore this email.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#d1d5db;">
                &copy; ${new Date().getFullYear()} PrepMate. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Password reset email with a secure link.
 */
export function resetPasswordHtml(link: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Reset your PrepMate password</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;">PrepMate</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#111827;">Reset your password</h1>
              <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
                Click the button below to reset your password. This link expires in <strong>1 hour</strong>.
              </p>
              <a href="${link}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
                Reset Password
              </a>
              <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
                If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 40px 24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#d1d5db;">&copy; ${new Date().getFullYear()} PrepMate. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
