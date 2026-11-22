import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { FEATURES } from '../features.js';
import { useAuth } from '../AuthContext.jsx';
import { api } from '../api.js';
import { Page } from '../components/UI.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [due, setDue] = useState([]);
  useEffect(() => {
    api('/reminders').then((d) => {
      const limit = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
      setDue(d.reminders.filter((r) => !r.done && r.date <= limit));
    }).catch(() => {});
  }, []);
  return (
    <Page title={`Where to next, ${user.name.split(' ')[0]}?`} subtitle="Pick a tool below. Plan My Entire Trip is the best place to start.">
      {due.length > 0 && (
        <div className="mb-6 rounded-2xl border border-sun/50 bg-sun/15 p-4">
          <p className="mb-1 flex items-center gap-2 font-bold text-ink"><Bell className="h-4 w-4" /> Reminders due soon</p>
          <ul className="text-sm text-slate-700">{due.map((r) => <li key={r.id}>{r.date}: {r.title}</li>)}</ul>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} className={`card group flex gap-4 transition hover:-translate-y-0.5 hover:shadow-md ${f.main ? 'sm:col-span-2 lg:col-span-3 !border-0 !bg-gradient-to-r !from-ink !via-[#2a1f8f] !to-violet' : ''}`}>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white" style={{ background: f.color }}><f.icon className="h-6 w-6" /></span>
            <span><span className={`block font-display text-lg font-bold ${f.main ? 'text-white' : 'text-ink'}`}>{f.title}</span>
              <span className={`text-sm ${f.main ? 'text-white/80' : 'text-slate-600'}`}>{f.desc}</span></span>
          </Link>
        ))}
      </div>
    </Page>
  );
}
