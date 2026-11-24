import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, parse, wrap } from '../auth.js';
import { geocode, findPlaces, forecast, haversineKm } from './geo.js';

const r = Router();
r.use(requireAuth);

const aiConfigured = () => Boolean(process.env.GROQ_API_KEY);

async function askClaude(system, messages, maxTokens = 900) {
  const groqMessages = [
    { role: 'system', content: system },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      messages: groqMessages,
      max_completion_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Groq API error:', errorBody);
    const e = new Error('The AI service returned an error. Check GROQ_API_KEY in backend/.env.');
    e.status = 502;
    throw e;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

const SYSTEM = `You are MYRAVO, a friendly, practical travel assistant. Keep answers concise and well organised.
Never invent hotel ratings, reviews, opening hours, live traffic or prices; say when something should be verified locally.
Current trip context (JSON, may be empty): `;

// Simple keyword replies so demo mode is still useful. Clearly labelled as DEMO in the response.
function demoReply(text, ctx) {
  const t = text.toLowerCase();
  const dest = ctx?.destination ? ` for ${ctx.destination}` : '';
  if (/pack/.test(t)) return `Packing basics${dest}: ID and tickets, phone and charger, power bank, light layers, comfortable shoes, basic medicines, a refillable bottle, and a rain jacket. The Packing Checklist page can save these for you.`;
  if (/rain|weather/.test(t)) return `Check the Weather page for the 7-day forecast. If rain is likely, plan museums, galleries, cinemas and covered markets, and keep outdoor viewpoints for dry days.`;
  if (/safe|emergency|police|hospital/.test(t)) return `Open the Safety page to find nearby hospitals, police stations and pharmacies on the map. In India dial 112 for emergencies. Share your live location with someone you trust and keep copies of your documents.`;
  if (/budget|cost|expens/.test(t)) return `A rough rule: split your budget about 35% stay, 25% food, 20% transport, 15% activities, 5% buffer. Use the Budget page to track real spending.`;
  return `I'm running in DEMO mode (no AI key connected), so I can only give general tips. Try asking about packing, weather, safety or budget. Add GROQ_API_KEY to backend/.env for full AI answers.`;
}

r.get('/status', (_req, res) => res.json({ aiConfigured: aiConfigured() }));

r.post('/chat', wrap(async (req, res) => {
  const { messages, context } = parse(z.object({
    messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(4000) })).min(1).max(30),
    context: z.any().optional()
  }), req.body);
  if (!aiConfigured()) return res.json({ reply: demoReply(messages.at(-1).content, context), demo: true });
  const reply = await askClaude(SYSTEM + JSON.stringify(context || {}).slice(0, 4000), messages);
  res.json({ reply, demo: false });
}));

const ACT = { cultural: 'cultural', adventure: 'adventure', relaxation: 'relaxed', food: 'food-focused', nature: 'nature' };
const PER_DAY_COST = { budget: 2500, mid: 6000, premium: 14000 }; // INR per person per day, ROUGH planning figures

function nearestNeighbour(items, start) {
  const left = [...items], out = []; let cur = start;
  while (left.length) {
    let bi = 0, bd = Infinity;
    left.forEach((p, i) => { const d = haversineKm(cur, p); if (d < bd) { bd = d; bi = i; } });
    cur = left.splice(bi, 1)[0]; out.push(cur);
  }
  return out;
}

r.post('/plan', wrap(async (req, res) => {
  const a = parse(z.object({
    destination: z.string().trim().min(2).max(100), start: z.string().trim().max(100).optional().default(''),
    days: z.coerce.number().int().min(1).max(10), budget: z.coerce.number().min(0).max(1e8).default(0),
    people: z.coerce.number().int().min(1).max(30).default(1),
    style: z.enum(['cultural', 'adventure', 'relaxation', 'food', 'nature']).default('cultural'),
    companions: z.string().max(30).default('friends'), notes: z.string().max(300).default(''),
  }), req.body);

  const [dest] = await geocode(a.destination);
  if (!dest) return res.status(404).json({ error: `Could not find "${a.destination}" on the map. Try a more specific name.` });
  const center = { lat: dest.lat, lon: dest.lon };
  const type = a.style === 'nature' || a.style === 'adventure' ? 'gems' : 'attractions';
  const [attr, extra, food, stay, wx] = await Promise.all([
    findPlaces({ ...center, type: 'attractions', radius: 15000, limit: 40 }).catch(() => []),
    findPlaces({ ...center, type, radius: 20000, limit: 20 }).catch(() => []),
    findPlaces({ ...center, type: 'restaurants', radius: 8000, limit: 20 }).catch(() => []),
    findPlaces({ ...center, type: 'hotels', radius: 8000, limit: 10 }).catch(() => []),
    forecast(center.lat, center.lon).catch(() => null),
  ]);
  const pool = [...new Map([...extra, ...attr].map((p) => [p.name, p])).values()];
  const perDay = 3, need = a.days * perDay;
  const picked = nearestNeighbour(pool.slice(0, Math.max(need, 1) + 6).slice(0, need), center); // route-optimised order
  const dayPlans = Array.from({ length: a.days }, (_, i) => {
    const stops = picked.slice(i * perDay, (i + 1) * perDay).map((p) => ({ ...p, note: '' }));
    let km = 0; stops.forEach((s, j) => { km += haversineKm(j ? stops[j - 1] : center, s); });
    return {
      day: i + 1, title: `Day ${i + 1}`, stops, approxTravelKm: +km.toFixed(1), approxTravelMin: Math.round((km / 25) * 60),
      eat: food.slice(i * 2, i * 2 + 2).map((f) => f.name), weather: wx?.days[i] || null
    };
  });
  const level = a.budget && a.budget / a.people / a.days < 3500 ? 'budget' : a.budget && a.budget / a.people / a.days > 10000 ? 'premium' : 'mid';
  const estPerPerson = PER_DAY_COST[level] * a.days;
  const itinerary = {
    destination: dest.name, center, start: a.start, days: dayPlans, people: a.people, style: a.style, companions: a.companions,
    stays: stay.slice(0, 5), weatherSource: wx ? wx.source : null,
    estimate: {
      level, perPersonInr: estPerPerson, totalInr: estPerPerson * a.people,
      disclaimer: 'Rough planning estimate only (not live prices). Travel-time figures are straight-line approximations; use the Map page for real road routes.'
    },
    summary: null, aiGenerated: false,
  };
  if (!dayPlans.some((d) => d.stops.length)) itinerary.warning = 'OpenStreetMap returned no named attractions near this destination. Try a larger city or nearby town.';
  if (aiConfigured()) {
    try {
      const compact = dayPlans.map((d) => `Day ${d.day}: ${d.stops.map((s) => s.name).join(', ')}`).join('\n');
      itinerary.summary = await askClaude(SYSTEM + '{}',
        [{ role: 'user', content: `Write a friendly 4-sentence overview and 3 practical tips for a ${a.days}-day ${ACT[a.style]} trip to ${a.destination} for ${a.people} (${a.companions}). Special needs: ${a.notes || 'none'}. Stops:\n${compact}\nOnly mention the stops listed.` }], 500);
      itinerary.aiGenerated = true;
    } catch { /* keep plan without AI text */ }
  }
  if (!itinerary.summary) itinerary.summary = `DEMO summary (no AI key connected): ${a.days} days in ${a.destination}, ordered so nearby places are visited together. Stops come from OpenStreetMap data.`;
  res.json({ itinerary });
}));

export default r;
