// Opaque session cookies backed by the `sessions` table (ADR 0033). The cookie holds only a random
// session id; all state lives server-side and is revoked on logout.
import type { Response } from 'express';
import { config } from '../config';
import { createSession, deleteSession } from '../db/repo';

export const SESSION_COOKIE = 'hdde_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

export function issueSession(res: Response, userId: string): void {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const id = createSession(userId, expiresAt.toISOString());
  res.cookie(SESSION_COOKIE, id, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'strict',
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}

export function clearSession(res: Response, sessionId: string | undefined): void {
  if (sessionId) deleteSession(sessionId);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
}
