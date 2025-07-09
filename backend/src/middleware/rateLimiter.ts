// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { getLogger } from '../common/logs';

const logger = getLogger('RateLimiter');

// Gemeinsamer Handler für alle Limiter
const logRateLimitExceeded = (message: string) => {
  return (req: Request, res: Response) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    logger.warn(`Rate limit exceeded – IP: ${ip} – Path: ${req.originalUrl}`);
    res.status(429).json({ message });
  };
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zu viele Anfragen von dieser IP, bitte versuche es später erneut.',
  handler: logRateLimitExceeded('Zu viele Anfragen von dieser IP, bitte versuche es später erneut.'),
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zu viele Login-Versuche von dieser IP, bitte versuche es später erneut.',
  handler: logRateLimitExceeded('Zu viele Login-Versuche von dieser IP, bitte versuche es später erneut.'),
});

export const userUpdateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zu viele Anfragen zum Benutzer-Update. Bitte später erneut versuchen.',
  handler: logRateLimitExceeded('Zu viele Anfragen zum Benutzer-Update. Bitte später erneut versuchen.'),
});
