import { Link } from 'react-router-dom';
import { Route, Bot, Map, ShieldCheck, Wallet, Users, CloudSun, Sparkles, ArrowUpRight, CalendarDays, Compass, WandSparkles, Layers3 } from 'lucide-react';
import Logo from '../components/Logo.jsx';

const FEATS = [
  [Route, 'Plan every experience', 'Trips, celebrations, campus events and everything worth bringing people together for.', 'from-violet-500/20 to-indigo-500/5', 'text-violet-300'],
  [Bot, 'AI that works with you', 'Get a thoughtful starting point, then shape every detail exactly your way.', 'from-fuchsia-500/20 to-violet-500/5', 'text-fuchsia-300'],
  [Map, 'Move with confidence', 'Discover places, organise stops and open your journey in Google Maps.', 'from-cyan-500/20 to-blue-500/5', 'text-cyan-300'],
  [CalendarDays, 'Keep everyone in sync', 'Shared schedules, tasks and updates that keep the whole group moving.', 'from-amber-500/20 to-orange-500/5', 'text-amber-300'],
  [Wallet, 'Make every rupee count', 'Plan your budget manually or use smart estimates as a starting point.', 'from-emerald-500/20 to-teal-500/5', 'text-emerald-300'],
  [Users, 'Bring your people in', 'One shared space for plans, conversations, responsibilities and memories.', 'from-pink-500/20 to-rose-500/5', 'text-pink-300'],
];
const STEPS = [['01','Imagine it','Start with a trip, a celebration or a simple idea.'],['02','Shape it','Use AI suggestions or build your plan from scratch.'],['03','Live it','Bring your people, places and plans together.']];
export default function Landing() {
  return <div className="min-h-screen overflow-hidden" style={{background:'#11101b',color:'#f5f3ff'}}>
    <section className="relative isolate flex min-h-[92svh] flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{background:'radial-gradient(ellipse at 78% 25%,rgba(118,87,246,.28),transparent 38%),radial-gradient(ellipse at 18% 75%,rgba(66,220,195,.11),transparent 34%),linear-gradient(145deg,#11101b 5%,#171426 60%,#21163b 100%)'}}/>
      <div className="absolute -right-24 top-28 -z-10 h-80 w-80 rounded-full border border-violet-300/10 shadow-[0_0_100px_rgba(118,87,246,.16)]"/>
      <div className="absolute right-8 top-44 -z-10 h-52 w-52 rounded-full border border-violet-300/10"/>
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-10">
        <Logo light/>
        <div className="flex gap-2"><Link to="/login" className="btn border border-white/15 bg-white/5 text-white hover:bg-white/10">Log in</Link><Link to="/register" className="btn-accent">Get started <ArrowUpRight className="h-4 w-4"/></Link></div>
      </header>
      <div className="vy-rise mx-auto mt-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-10 lg:grid-cols-[1.1fr_.9fr] lg:pb-28">
        <div>
          <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold tracking-[.12em] text-violet-100"><Sparkles className="h-4 w-4 text-amber-300"/> YOUR WORLD, BETTER PLANNED</span>
          <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.04] tracking-[-.06em] text-white sm:text-7xl">Make plans.<br/><span className="bg-gradient-to-r from-[#b7a7ff] via-[#8e73ff] to-[#5de5d0] bg-clip-text text-transparent">Make moments.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-violet-100/65 sm:text-lg">One intelligent space for the journeys you take, the events you create and the people you bring together.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link to="/register" className="btn-primary px-6 py-3.5">Start creating <ArrowUpRight className="h-4 w-4"/></Link><Link to="/login" className="btn border border-white/15 bg-white/5 px-6 py-3.5 text-white hover:bg-white/10">Explore your workspace</Link></div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-white/45"><span className="flex items-center gap-2"><WandSparkles className="h-4 w-4 text-violet-300"/> AI-assisted, human-led</span><span className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-teal-300"/> Every plan in one place</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-violet-500/15 blur-3xl"/>
          <div className="glass relative rounded-[2rem] p-4 shadow-glow-strong sm:p-5">
            <div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-white/45">YOUR NEXT CHAPTER</p><p className="mt-1 font-display text-xl font-bold text-white">Weekend escape</p></div><span className="chip">✨ In the making</span></div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#34305b] via-[#292344] to-[#174b50] p-5">
              <div className="flex h-40 items-end rounded-xl bg-[radial-gradient(ellipse_at_70%_30%,rgba(93,229,208,.5),transparent_35%),linear-gradient(135deg,rgba(183,167,255,.18),rgba(15,15,28,.12))] p-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-100/70">A little further</p><p className="mt-1 font-display text-2xl font-bold text-white">Find your somewhere.</p></div></div>
              <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-black/20 p-3"><Compass className="h-4 w-4 text-teal-200"/><p className="mt-2 text-xs text-white/45">Destination</p><p className="text-sm font-bold text-white">Somewhere new</p></div><div className="rounded-xl bg-black/20 p-3"><Users className="h-4 w-4 text-violet-200"/><p className="mt-2 text-xs text-white/45">Your people</p><p className="text-sm font-bold text-white">Together</p></div></div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-400/15 text-violet-200"><Bot className="h-5 w-5"/></span><div><p className="text-sm font-bold text-white">Your AI co-planner</p><p className="text-xs text-white/45">Ideas when you need them</p></div></div><ArrowUpRight className="h-4 w-4 text-white/50"/></div>
          </div>
        </div>
      </div>
    </section>
    <section className="px-5 py-20 sm:px-10"><div className="mx-auto max-w-7xl">
      <div className="mx-auto max-w-2xl text-center"><span className="text-xs font-extrabold tracking-[.22em] text-violet-300">ONE SPACE. MANY POSSIBILITIES.</span><h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-5xl">Everything your plans need.<br/><span className="text-violet-300">Nothing in your way.</span></h2><p className="mt-5 leading-7 text-violet-100/55">Start simple. Add detail as you go. Keep control of every decision.</p></div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{FEATS.map(([Icon,t,d,g,c])=><div key={t} className="group rounded-3xl border border-white/[.08] bg-white/[.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-300/25 hover:bg-white/[.06]"><span className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${g} ${c}`}><Icon className="h-5 w-5"/></span><h3 className="font-display text-lg font-bold text-white">{t}</h3><p className="mt-2 text-sm leading-6 text-violet-100/55">{d}</p></div>)}</div>
      <div className="mt-20 grid gap-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/10 via-white/[.025] to-teal-400/5 p-7 sm:p-10 md:grid-cols-3">{STEPS.map(([n,t,d])=><div key={n}><p className="font-display text-4xl font-bold text-violet-300/70">{n}</p><h3 className="mt-3 font-display text-xl font-bold text-white">{t}</h3><p className="mt-2 text-sm leading-6 text-violet-100/55">{d}</p></div>)}</div>
      <p className="mt-12 flex items-center justify-center gap-2 text-center text-xs text-violet-100/35"><ShieldCheck className="h-4 w-4"/> Your choices stay yours. Map data © OpenStreetMap contributors.</p>
    </div></section>
  </div>;
}