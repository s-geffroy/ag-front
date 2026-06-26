import { Router } from 'express';
import { z } from 'zod';
import { getUserByEmail } from '../db/repo';
import { verifyPassword } from '../auth/password';
import { issueSession, clearSession, SESSION_COOKIE } from '../auth/session';
import { requireAuth, loginRateLimited, type AuthedRequest } from '../auth/middleware';

const LoginInput = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const ip = (
    req.headers['x-forwarded-for']?.toString().split(',')[0] ||
    req.ip ||
    'unknown'
  ).trim();
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
  // Constant-ish response: same generic error whether the email exists or the password is wrong.
  if (!user || !user.is_active || !verifyPassword(parsed.data.password, user.password_hash)) {
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
