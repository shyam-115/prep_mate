import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { env } from '../../config/env';

const COOKIE_NAME = 'refreshToken';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7d in ms
  path: '/',
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTS);
    res.json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const oldToken = req.cookies[COOKIE_NAME] as string | undefined;
    if (!oldToken) {
      res.status(401).json({ error: 'No refresh token provided' });
      return;
    }
    const { accessToken, newRefreshToken } = await authService.refresh(oldToken);
    res.cookie(COOKIE_NAME, newRefreshToken, COOKIE_OPTS);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies[COOKIE_NAME] as string | undefined;
    if (token) await authService.logout(token);
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.verifyOtp(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function resendOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.resendOtp(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.resetPassword(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.changePassword(req.user!.id, req.body);
    // Immediately clear the refresh cookie so this browser session is dead and re-login happens
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.deleteAccount(req.user!.id, req.body);
    // Immediately clear the refresh cookie so this browser session is dead
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
