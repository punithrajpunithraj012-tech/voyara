import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowUpRight, Sparkles, Map, Route, Wallet, Compass } from 'lucide-react';
import { FEATURES } from '../features.js';
import { useAuth } from '../AuthContext.jsx';
import { api } from '../api.js';

const QUICK = [
  { to: '/plan', label: 'Plan a trip', sub: 'Build your itinerary', icon: Route },
  { to: '/map', label: 'Plan a route', sub: 'Add stops along the way', icon: Map },
  { to: '/explore', label: 'Discover places', sub: 'Find somewhere new', icon: Compass },
  { to: '/budget', label: 'Trip budget', sub: 'Track your spending', icon: Wallet }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [due, setDue] = useState([]);
  useEffect(() => {
    api('/reminders').then((data) => {
      const limit = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
      setDue((data.reminders || []).filter((reminder) => !reminder.done && reminder.date <= limit));
    }).catch(() => {});
  }, []);
  const firstName = user?.name?.split(' ')[0] || 'traveller';

  return <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-9">
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-[#d6ad68]/20 bg-[#2b1b1d] p-6 shadow-glow sm:p-9">
      <div className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-[#a94d3d]/25 blur-3xl"/>
      <div className="absolute bottom-0 right-1/4 -z-10 h-32 w-32 rounded-full bg-[#d6ad68]/10 blur-3xl"/>
      <span className="chip"><Sparkles className="h-3.5 w-3.5"/> YOUR MYRAVO TRAVEL SPACE</span>
      <p className="mt-5 text-sm font-semibold text-[#f5e9df]/55">WELCOME BACK</p>
      <h1 className="mt-1 max-w-3xl font-display text-3xl font-bold leading-tight text-white sm:text-5xl">Ready for your next journey, {firstName}?<br/><span className="text-[#ead09a]">Let’s make a good plan.</span></h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-[#f5e9df]/65 sm:text-base">Your destinations, routes, itineraries and trip essentials—together in one place.</p>
      <div className="mt-7 flex flex-wrap gap-3"><Link to="/plan" className="btn-accent">Build an itinerary <ArrowUpRight className="h-4 w-4"/></Link><Link to="/assistant" className="btn border border-white/15 bg-white/5 text-white hover:bg-white/10"><Sparkles className="h-4 w-4"/> Ask Travel AI</Link></div>
    </section>
    {due.length > 0 && <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4"><Bell className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"/><div><p className="font-bold text-amber-100">Travel reminders coming up</p><ul className="mt-1 text-sm text-amber-100/70">{due.map((reminder) => <li key={reminder.id}>{reminder.date}: {reminder.title}</li>)}</ul></div></div>}
    <section className="mt-9">
      <div className="mb-4"><p className="text-xs font-extrabold tracking-[.2em] text-[#d6ad68]">START HERE</p><h2 className="mt-1 font-display text-2xl font-bold" style={{ color: 'var(--mf-text)' }}>Your travel shortcuts</h2></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{QUICK.map(({ to, label, sub, icon: Icon }) => <Link key={to} to={to} className="group rounded-3xl border p-4 transition hover:-translate-y-1 hover:shadow-glow" style={{ background: 'var(--mf-surface)', borderColor: 'var(--mf-line)' }}><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#d6ad68]/15 text-[#d6ad68]"><Icon className="h-5 w-5"/></span><p className="mt-4 text-sm font-extrabold" style={{ color: 'var(--mf-text)' }}>{label}</p><p className="mt-1 text-xs" style={{ color: 'var(--mf-muted)' }}>{sub}</p></Link>)}</div>
    </section>
    <section className="mt-10">
      <div className="mb-4"><p className="text-xs font-extrabold tracking-[.2em] text-[#d6ad68]">YOUR TRAVEL TOOLKIT</p><h2 className="mt-1 font-display text-2xl font-bold" style={{ color: 'var(--mf-text)' }}>Everything for the journey</h2></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{FEATURES.map((feature) => <Link key={feature.to} to={feature.to} className="group flex items-center gap-4 rounded-3xl border p-4 transition hover:-translate-y-0.5 hover:border-[#d6ad68]/35" style={{ background: 'var(--mf-surface)', borderColor: 'var(--mf-line)' }}><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-glow" style={{ background: 'linear-gradient(135deg,#67252a,#a94d3d)' }}><feature.icon className="h-5 w-5"/></span><span className="min-w-0 flex-1"><span className="block font-display font-bold" style={{ color: 'var(--mf-text)' }}>{feature.title}</span><span className="mt-0.5 block text-xs leading-5" style={{ color: 'var(--mf-muted)' }}>{feature.desc}</span></span><ArrowUpRight className="h-4 w-4 shrink-0 text-[#d6ad68] transition group-hover:-translate-y-1 group-hover:translate-x-1"/></Link>)}</div>
    </section>
    <p className="mt-10 flex items-center gap-2 text-xs" style={{ color: 'var(--mf-muted)' }}><Compass className="h-4 w-4"/> Plan thoughtfully. Travel your way.</p>
  </div>;
}
