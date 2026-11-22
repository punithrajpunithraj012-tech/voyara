import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import './db.js';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import geoRoutes from './routes/geo.js';
import aiRoutes from './routes/ai.js';
import { requireAuth } from './auth.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('JWT_SECRET is missing or too short. Copy backend/.env.example to backend/.env and set it.');
  process.exit(1);
}

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, aiConfigured: Boolean(process.env.GROQ_API_KEY) }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), authRoutes);
app.use('/api/geo', requireAuth, rateLimit({ windowMs: 60 * 1000, max: 120 }), geoRoutes);
app.use('/api/ai', rateLimit({ windowMs: 60 * 1000, max: 30 }), aiRoutes);
app.use('/api', dataRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Unknown API route.' }));
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Something went wrong on the server.' : err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Voyara API running on http://localhost:${port}`));
