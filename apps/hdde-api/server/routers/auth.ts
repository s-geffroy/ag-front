import { Router } from 'express';
import { z } from 'zod';
import { getUserByEmail } from '../db/repo';
import { verifyPassword, hashPassword } from '../auth/password';
import { issueSession, clearSession, SESSION_COOKIE } from '../auth/session';
import { requireAuth, loginRateLimited, type AuthedRequest } from '../auth/middleware';

// Identifier may be a plain username or an email — internal analyst accounts (ADR 0033).
const LoginInput = z.object({
  email: z.string().trim().min(1).max(320),
  password: z.string().min(1).max(200),
});

// Pre-computed bcrypt hash of a random value: verified against when the account does not exist, so a
// missing user costs the same ~bcrypt time as a wrong password → no user-enumeration via timing.
const DUMMY_HASH = hashPassword('hdde-timing-equalizer-' + Math.random().toString(36));

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  // req.ip is derived from the single trusted proxy hop (trust proxy = 1), not the spoofable raw
  // X-Forwarded-For header — so the rate-limit key cannot be forged (ADR 0033).
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
  // Always run a bcrypt compare (real hash or dummy) so the response time does not reveal whether the
  // email exists. Same generic error in every failure case.
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
