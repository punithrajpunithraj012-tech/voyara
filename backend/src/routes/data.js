
import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import db from '../db.js';
import { requireAuth, parse, wrap } from '../auth.js';

const r = Router();
r.use(requireAuth);

const idOf = (req) => parse(z.coerce.number().int().positive(), req.params.id);

const tripSchema = z.object({
  title: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(120),
  itinerary: z.any()
});

const tripOut = (t) => ({
  id: t.id,
  title: t.title,
  destination: t.destination,
  createdAt: t.created_at,
  itinerary: JSON.parse(t.itinerary)
});

// ---- Trips ----

r.get('/trips', wrap(async (req, res) => {
  const result = await db.query(
    'SELECT * FROM trips WHERE user_id=$1 ORDER BY id DESC',
    [req.userId]
  );
  res.json({ trips: result.rows.map(tripOut) });
}));

r.post('/trips', wrap(async (req, res) => {
  const d = parse(tripSchema, req.body);
  const result = await db.query(
    'INSERT INTO trips (user_id,title,destination,itinerary) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.userId, d.title, d.destination, JSON.stringify(d.itinerary)]
  );
  res.status(201).json({ trip: tripOut(result.rows[0]) });
}));

r.put('/trips/:id', wrap(async (req, res) => {
  const d = parse(tripSchema, req.body);
  const result = await db.query(
    'UPDATE trips SET title=$1,destination=$2,itinerary=$3 WHERE id=$4 AND user_id=$5 RETURNING *',
    [d.title, d.destination, JSON.stringify(d.itinerary), idOf(req), req.userId]
  );
  if (!result.rowCount) return res.status(404).json({ error: 'Trip not found.' });
  res.json({ trip: tripOut(result.rows[0]) });
}));

r.delete('/trips/:id', wrap(async (req, res) => {
  await db.query('DELETE FROM trips WHERE id=$1 AND user_id=$2', [idOf(req), req.userId]);
  res.json({ ok: true });
}));

// ---- Expenses ----

const expSchema = z.object({
  title: z.string().trim().min(1).max(100),
  amount: z.coerce.number().positive().max(1e9),
  category: z.string().trim().max(30).default('Other'),
  tripId: z.coerce.number().int().positive().nullable().optional()
});

r.get('/expenses', wrap(async (req, res) => {
  const result = await db.query(
    'SELECT id,title,amount,category,spent_on AS date,trip_id AS "tripId" FROM expenses WHERE user_id=$1 ORDER BY id DESC',
    [req.userId]
  );
  res.json({ expenses: result.rows });
}));

r.post('/expenses', wrap(async (req, res) => {
  const d = parse(expSchema, req.body);
  const result = await db.query(
    'INSERT INTO expenses (user_id,trip_id,title,amount,category) VALUES ($1,$2,$3,$4,$5) RETURNING id,title,amount,category,spent_on AS date,trip_id AS "tripId"',
    [req.userId, d.tripId ?? null, d.title, d.amount, d.category]
  );
  res.status(201).json({ expense: result.rows[0] });
}));

r.delete('/expenses/:id', wrap(async (req, res) => {
  await db.query('DELETE FROM expenses WHERE id=$1 AND user_id=$2', [idOf(req), req.userId]);
  res.json({ ok: true });
}));

// ---- Packing ----

r.get('/packing', wrap(async (req, res) => {
  const result = await db.query(
    'SELECT id,item,checked FROM packing_items WHERE user_id=$1 ORDER BY id',
    [req.userId]
  );
  res.json({
    items: result.rows.map((i) => ({ ...i, checked: !!i.checked }))
  });
}));

r.post('/packing', wrap(async (req, res) => {
  const { items } = parse(
    z.object({ items: z.array(z.string().trim().min(1).max(80)).min(1).max(60) }),
    req.body
  );

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      await client.query(
        'INSERT INTO packing_items (user_id,item) VALUES ($1,$2)',
        [req.userId, item]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  res.status(201).json({ ok: true });
}));

r.patch('/packing/:id', wrap(async (req, res) => {
  const { checked } = parse(z.object({ checked: z.boolean() }), req.body);
  await db.query(
    'UPDATE packing_items SET checked=$1 WHERE id=$2 AND user_id=$3',
    [checked ? 1 : 0, idOf(req), req.userId]
  );
  res.json({ ok: true });
}));

r.delete('/packing/:id', wrap(async (req, res) => {
  await db.query('DELETE FROM packing_items WHERE id=$1 AND user_id=$2', [idOf(req), req.userId]);
  res.json({ ok: true });
}));

// ---- Reminders ----

r.get('/reminders', wrap(async (req, res) => {
  const result = await db.query(
    'SELECT id,title,remind_on AS date,done FROM reminders WHERE user_id=$1 ORDER BY remind_on',
    [req.userId]
  );
  res.json({
    reminders: result.rows.map((x) => ({ ...x, done: !!x.done }))
  });
}));

r.post('/reminders', wrap(async (req, res) => {
  const d = parse(
    z.object({
      title: z.string().trim().min(1).max(120),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD')
    }),
    req.body
  );
  await db.query(
    'INSERT INTO reminders (user_id,title,remind_on) VALUES ($1,$2,$3)',
    [req.userId, d.title, d.date]
  );
  res.status(201).json({ ok: true });
}));

r.patch('/reminders/:id', wrap(async (req, res) => {
  const { done } = parse(z.object({ done: z.boolean() }), req.body);
  await db.query(
    'UPDATE reminders SET done=$1 WHERE id=$2 AND user_id=$3',
    [done ? 1 : 0, idOf(req), req.userId]
  );
  res.json({ ok: true });
}));

r.delete('/reminders/:id', wrap(async (req, res) => {
  await db.query('DELETE FROM reminders WHERE id=$1 AND user_id=$2', [idOf(req), req.userId]);
  res.json({ ok: true });
}));

// ---- Groups ----

const groupOut = (g) => ({
  id: g.id,
  name: g.name,
  code: g.code,
  isOwner: undefined,
  data: JSON.parse(g.data)
});

const memberOf = async (gid, uid) => {
  const result = await db.query(
    'SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2',
    [gid, uid]
  );
  return result.rowCount > 0;
};

r.get('/groups', wrap(async (req, res) => {
  const result = await db.query(
    'SELECT g.* FROM groups_ g JOIN group_members m ON m.group_id=g.id WHERE m.user_id=$1 ORDER BY g.id DESC',
    [req.userId]
  );
  res.json({ groups: result.rows.map(groupOut) });
}));

r.post('/groups', wrap(async (req, res) => {
  const { name } = parse(z.object({ name: z.string().trim().min(2).max(80) }), req.body);
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();

  const userResult = await db.query('SELECT name FROM users WHERE id=$1', [req.userId]);
  if (!userResult.rows[0]) return res.status(401).json({ error: 'Account not found.' });

  const data = { members: [userResult.rows[0].name], options: [], expenses: [], itinerary: null };

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const groupResult = await client.query(
      'INSERT INTO groups_ (owner_id,name,code,data) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.userId, name, code, JSON.stringify(data)]
    );
    const group = groupResult.rows[0];

    await client.query(
      'INSERT INTO group_members (group_id,user_id) VALUES ($1,$2)',
      [group.id, req.userId]
    );
    await client.query('COMMIT');
    res.status(201).json({ group: groupOut(group) });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

r.post('/groups/join', wrap(async (req, res) => {
  const { code } = parse(
    z.object({ code: z.string().trim().toUpperCase().min(4).max(12) }),
    req.body
  );

  const groupResult = await db.query('SELECT * FROM groups_ WHERE code=$1', [code]);
  const g = groupResult.rows[0];
  if (!g) return res.status(404).json({ error: 'No group found with that code.' });

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const membership = await client.query(
      'SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2',
      [g.id, req.userId]
    );

    if (!membership.rowCount) {
      await client.query(
        'INSERT INTO group_members (group_id,user_id) VALUES ($1,$2)',
        [g.id, req.userId]
      );

      const userResult = await client.query('SELECT name FROM users WHERE id=$1', [req.userId]);
      const data = JSON.parse(g.data);
      const me = userResult.rows[0]?.name;

      if (me && !data.members.includes(me)) data.members.push(me);

      await client.query(
        'UPDATE groups_ SET data=$1 WHERE id=$2',
        [JSON.stringify(data), g.id]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  const updated = await db.query('SELECT * FROM groups_ WHERE id=$1', [g.id]);
  res.json({ group: groupOut(updated.rows[0]) });
}));

r.put('/groups/:id', wrap(async (req, res) => {
  const id = idOf(req);

  if (!(await memberOf(id, req.userId))) {
    return res.status(403).json({ error: 'You are not a member of this group.' });
  }

  const data = parse(
    z.object({
      members: z.array(z.string().trim().min(1).max(40)).max(30),
      options: z.array(
        z.object({ name: z.string().max(80), votes: z.array(z.string()).max(30) })
      ).max(20),
      expenses: z.array(
        z.object({ desc: z.string().max(80), amount: z.number().positive(), paidBy: z.string().max(40) })
      ).max(200),
      itinerary: z.any().optional()
    }),
    req.body
  );

  const result = await db.query(
    'UPDATE groups_ SET data=$1 WHERE id=$2 RETURNING *',
    [JSON.stringify(data), id]
  );

  if (!result.rows[0]) return res.status(404).json({ error: 'Group not found.' });
  res.json({ group: groupOut(result.rows[0]) });
}));

export default r;
