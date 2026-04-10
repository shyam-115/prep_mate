import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

// Route modules
import authRoutes from './modules/auth/auth.routes';
import topicRoutes from './modules/topics/topics.routes';
import conceptRoutes from './modules/concepts/concepts.routes';
import questionRoutes from './modules/questions/questions.routes';
import progressRoutes from './modules/progress/progress.routes';
import streakRoutes from './modules/streak/streak.routes';
import milestoneRoutes from './modules/milestones/milestones.routes';
import onboardingRoutes from './modules/onboarding/onboarding.routes';
import adminUserRoutes from './modules/admin/admin.routes';

// Swagger
import { swaggerSpec } from './config/swagger';

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        env.FRONTEND_URL.replace(/\/$/, ''),
        'http://localhost:5173',
      ];
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// ── Request parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── HTTP logging ──────────────────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

// ── Rate limiting (global) ────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ── API Routes ────────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/topics`, topicRoutes);
app.use(`${API}/concepts`, conceptRoutes);
app.use(`${API}/questions`, questionRoutes);
app.use(`${API}/me/progress`, progressRoutes);
app.use(`${API}/me/streak`, streakRoutes);
app.use(`${API}/me/milestones`, milestoneRoutes);
app.use(`${API}/me/onboarding`, onboardingRoutes);
app.use(`${API}/admin`, adminUserRoutes);

// ── API Docs ──────────────────────────────────────────────────────────────────
app.use(`${API}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
