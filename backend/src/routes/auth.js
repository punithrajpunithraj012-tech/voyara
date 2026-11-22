import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import db from '../db.js';
import { signToken, requireAuth, parse, wrap } from '../auth.js';

const r = Router();

const password = z.string().min(8, 'must be at least 8 characters').max(100)
  .regex(/[A-Za-z]/, 'must contain a letter')
  .regex(/[0-9]/, 'must contain a number');

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  homeCity: u.home_city,
  preferences: JSON.parse(u.preferences || '{}')
});

const emailField = z.string().trim().toLowerCase().email();

r.post('/register', wrap(async (req, res) => {
  const { name, email, password: pw } = parse(
    z.object({ name: z.string().trim().min(2).max(60), email: emailField, password }),
    req.body
  );

  const hash = await bcrypt.hash(pw, 12);

  try {
    const result = await db.query(
      'INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING *',
      [name, email, hash]
    );
    const user = result.rows[0];
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    throw err;
  }
}));

r.post('/login', wrap(async (req, res) => {
  const { email, password: pw } = parse(
    z.object({ email: emailField, password: z.string().min(1) }),
    req.body
  );

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(pw, user.password_hash))) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  res.json({ token: signToken(user), user: publicUser(user) });
}));

r.post('/forgot', wrap(async (req, res) => {
  const { email } = parse(z.object({ email: emailField }), req.body);
  const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  const out = {
    message: 'If that email is registered, a reset code has been created.',
    demo: true
  };

  if (user) {
    const token = crypto.randomBytes(4).toString('hex');

    await db.query(
      'UPDATE users SET reset_token_hash=$1, reset_expires=$2 WHERE id=$3',
      [
        crypto.createHash('sha256').update(token).digest('hex'),
        Date.now() + 15 * 60 * 1000,
        user.id
      ]
    );

    console.log(`[DEMO] Password reset code for ${email}: ${token}`);

    if (process.env.NODE_ENV !== 'production') out.demoCode = token;
  }

  res.json(out);
}));

r.post('/reset', wrap(async (req, res) => {
  const { email, code, password: pw } = parse(
    z.object({ email: emailField, code: z.string().min(4), password }),
    req.body
  );

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  const ok = user &&
    Number(user.reset_expires) > Date.now() &&
    user.reset_token_hash === crypto.createHash('sha256').update(code.trim()).digest('hex');

  if (!ok) {
    return res.status(400).json({ error: 'That reset code is invalid or has expired.' });
  }

  await db.query(
    'UPDATE users SET password_hash=$1, reset_token_hash=NULL, reset_expires=NULL WHERE id=$2',
    [await bcrypt.hash(pw, 12), user.id]
  );

  res.json({ message: 'Password updated. You can log in now.' });
}));

r.get('/me', requireAuth, wrap(async (req, res) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [req.userId]);
  const user = result.rows[0];

  if (!user) return res.status(401).json({ error: 'Account not found.' });

  res.json({ user: publicUser(user) });
}));

r.put('/profile', requireAuth, wrap(async (req, res) => {
  const d = parse(
    z.object({
      name: z.string().trim().min(2).max(60),
      homeCity: z.string().max(80).default(''),
      preferences: z.record(z.any()).default({})
    }),
    req.body
  );

  const result = await db.query(
    'UPDATE users SET name=$1, home_city=$2, preferences=$3 WHERE id=$4 RETURNING *',
    [d.name, d.homeCity, JSON.stringify(d.preferences), req.userId]
  );

  res.json({ user: publicUser(result.rows[0]) });
}));

export default r;