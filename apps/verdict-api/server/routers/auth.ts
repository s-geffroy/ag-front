import { Router } from 'express';
import { z } from 'zod';
import { getUserByEmail } from '../db/repo';
import { verifyPassword, hashPassword } from '../auth/password';
import { issueSession, clearSession, SESSION_COOKIE } from '../auth/session';
import { requireAuth, loginRateLimited, type AuthedRequest } from '../auth/middleware';

const LoginInput = z.object({
  email: z.string().trim().min(1).max(320),
  password: z.string().min(1).max(200),
});

// Pre-computed bcrypt hash verified against when the account does not exist → constant-time login,
// no user-enumeration via timing (ADR 0033).
const DUMMY_HASH = hashPassword('verdict-timing-equalizer-' + Math.random().toString(36));

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const ip = req.ip || 'unknown';
  if (loginRateLimited(ip)) {
    res.status(429).json({ error: 'too_many_requests' });
    return;
  }
  const parsed = LoginInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid' });
    return;
  }
  const user = getUserByEmail(parsed.data.email);
  const passwordOk = verifyPassword(parsed.data.password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !user.is_active || !passwordOk) {
    res.status(401).json({ error: 'invalid_credentials' });
    return;
  }
  issueSession(res, user.id);
  res.json({ user: { id: user.id, email: user.email, role: user.role } });
});

authRouter.post('/logout', (req: AuthedRequest, res) => {
  clearSession(res, req.cookies?.[SESSION_COOKIE]);
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, (req: AuthedRequest, res) => {
  res.json({ user: req.user });
});
