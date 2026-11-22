import jwt from 'jsonwebtoken';

export const signToken = (user) => jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in to continue.' });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }
}

export function parse(schema, data) {
  const r = schema.safeParse(data);
  if (!r.success) {
    const e = new Error(r.error.issues.map((i) => `${i.path.join('.') || 'input'}: ${i.message}`).join('; '));
    e.status = 400;
    throw e;
  }
  return r.data;
}

export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
