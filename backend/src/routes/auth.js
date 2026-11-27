import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
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

async function sendPasswordResetEmail(email, code) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'MYRAVO';

  if (!apiKey || !senderEmail) {
    const error = new Error('Password reset email is not configured yet. Please try again later or contact support.');
    error.status = 503;
    throw error;
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email }],
      subject: 'Your MYRAVO password reset code',
      textContent: `Your MYRAVO password reset code is ${code}. It expires in 15 minutes. If you did not request this, you can ignore this email.`,
      htmlContent: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#281b1b"><p style="font-weight:700;letter-spacing:3px;color:#67252a">MYRAVO</p><h1 style="font-size:24px">Reset your password</h1><p>Use this one-time code to reset your MYRAVO password:</p><div style="font-size:30px;font-weight:700;letter-spacing:7px;padding:18px;background:#f7f1e8;border-radius:12px;text-align:center">${code}</div><p>This code expires in 15 minutes. If you did not request it, you can safely ignore this email.</p></div>`
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Brevo password reset email failed:', response.status, detail);
    const error = new Error('We could not send the reset email right now. Please try again in a few minutes.');
    error.status = 502;
    throw error;
  }
}

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
    if (err.code === '23505') return res.status(409).json({ error: 'An account with this email already exists.' });
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

const forgotLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

r.post('/forgot', forgotLimiter, wrap(async (req, res) => {
  if (!(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL) && process.env.NODE_ENV !== 'development') {
    const error = new Error('Password reset email is not configured yet. Please try again later.');
    error.status = 503;
    throw error;
  }
  const { email } = parse(z.object({ email: emailField }), req.body);
  const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  const generic = { message: 'If that email is registered, password reset instructions will be sent shortly.' };
  if (!user) return res.json(generic);

  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  const tokenHash = crypto.createHash('sha256').update(code).digest('hex');

  await db.query(
    'UPDATE users SET reset_token_hash=$1, reset_expires=$2 WHERE id=$3',
    [tokenHash, Date.now() + 15 * 60 * 1000, user.id]
  );

  try {
    if (process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL) {
      await sendPasswordResetEmail(email, code);
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`[MYRAVO DEV] Password reset code for ${email}: ${code}`);
      return res.json({ ...generic, demo: true, demoCode: code });
    } else {
      const error = new Error('Password reset email is not configured yet. Please try again later.');
      error.status = 503;
      throw error;
    }
  } catch (error) {
    await db.query('UPDATE users SET reset_token_hash=NULL, reset_expires=NULL WHERE id=$1', [user.id]);
    throw error;
  }

  res.json({ ...generic, demo: false });
}));

r.post('/reset', wrap(async (req, res) => {
  const { email, code, password: pw } = parse(
    z.object({ email: emailField, code: z.string().trim().min(4).max(80), password }),
    req.body
  );

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  const suppliedHash = crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');

  const ok = user &&
    Number(user.reset_expires) > Date.now() &&
    user.reset_token_hash === suppliedHash;

  if (!ok) return res.status(400).json({ error: 'That reset code is invalid or has expired.' });

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
