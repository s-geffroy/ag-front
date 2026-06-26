// requireAuth: resolve the session cookie to a user and attach it to the request. Also a tiny
// fixed-window rate limiter for the login endpoint (ADR 0033 / owasp-security).
import type { Request, Response, NextFunction } from 'express';
import { getSessionUser } from '../db/repo';
import { SESSION_COOKIE } from './session';

export interface AuthedRequest extends Request {
  user?: { id: string; email: string; role: string };
  sessionId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const sessionId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  const user = sessionId ? getSessionUser(sessionId) : undefined;
  if (!user) {
    res.status(401).json({ error: 'unauthenticated' });
    return;
  }
  req.user = { id: user.id, email: user.email, role: user.role };
  req.sessionId = sessionId;
  next();
}

export function isAdmin(req: AuthedRequest): boolean {
  return req.user?.role === 'owner_admin';
}

// --- login rate limit: max attempts per IP per window ---
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;
const hits = new Map<string, number[]>();

export function loginRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_ATTEMPTS;
}
