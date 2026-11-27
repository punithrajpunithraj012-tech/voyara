import { Link } from 'react-router-dom';
import { Route, Bot, Map, ShieldCheck, Wallet, Users, CloudSun, Sparkles, ArrowUpRight, Compass, MapPin, Backpack, Clock3, Navigation } from 'lucide-react';
import Logo from '../components/Logo.jsx';

const FEATURES = [
  [Compass, 'Discover places worth the journey', 'Explore attractions, local favourites, food stops and hidden corners around your destination.'],
  [Route, 'Make every stop count', 'Build a route with multiple stops, review the distance and continue navigation in Google Maps.'],
  [Sparkles, 'Turn ideas into an itinerary', 'Create a day-by-day travel plan with practical suggestions you can edit and make your own.'],
  [Wallet, 'Keep your budget in view', 'Set a spending limit and track trip expenses as your plans take shape.'],
  [CloudSun, 'Be ready for changing weather', 'Check the forecast and find indoor alternatives when the weather changes.'],
  [Users, 'Travel better together', 'Bring your group into the plan, compare options and keep shared costs organised.'],
];
const STEPS = [
  ['01', 'Choose your destination', 'Start with the place you want to discover and the dates you have in mind.'],
  ['02', 'Build your journey', 'Add places, shape your route and create a day-by-day itinerary.'],
  ['03', 'Travel with confidence', 'Keep your budget, essentials and travel details together.'],
];

export default function Landing() {
  return <div className="min-h-screen overflow-hidden bg-[#171114] text-[#faf4eb]">
    <section className="relative isolate flex min-h-[92svh] flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{background:'radial-gradient(ellipse at 78% 24%,rgba(169,77,61,.25),transparent 38%),radial-gradient(ellipse at 18% 78%,rgba(214,173,104,.12),transparent 34%),linear-gradient(145deg,#171114 5%,#241719 58%,#351d20 100%)'}}/>
      <div className="absolute -right-24 top-28 -z-10 h-80 w-80 rounded-full border border-amber-200/10 shadow-[0_0_100px_rgba(214,173,104,.12)]"/>
      <div className="absolute right-8 top-44 -z-10 h-52 w-52 rounded-full border border-amber-200/10"/>
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-10">
        <Logo light/>
        <div className="flex gap-2"><Link to="/login" className="btn border border-white/15 bg-white/5 text-white hover:bg-white/10">Log in</Link><Link to="/register" className="btn-accent">Start planning <ArrowUpRight className="h-4 w-4"/></Link></div>
      </header>
      <div className="vy-rise mx-auto mt-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-10 lg:grid-cols-[1.08fr_.92fr] lg:pb-28">
        <div>
          <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold tracking-[.12em] text-amber-100"><Sparkles className="h-4 w-4 text-[#d6ad68]"/> EVERY MOMENT. ONE PLACE.</span>
          <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.04] tracking-[-.06em] text-white sm:text-7xl">Your next trip.<br/><span className="bg-gradient-to-r from-[#ead09a] via-[#d6ad68] to-[#d88d72] bg-clip-text text-transparent">Beautifully planned.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#f5e9df]/70 sm:text-lg">Discover places, plan your route, build a day-by-day itinerary and keep every travel detail together with MYRAVO.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link to="/register" className="btn-primary px-6 py-3.5">Plan your first trip <ArrowUpRight className="h-4 w-4"/></Link><Link to="/login" className="btn border border-white/15 bg-white/5 px-6 py-3.5 text-white hover:bg-white/10">Open my trips</Link></div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-white/55"><span className="flex items-center gap-2"><Navigation className="h-4 w-4 text-[#d6ad68]"/> Routes and places</span><span className="flex items-center gap-2"><Bot className="h-4 w-4 text-[#d6ad68]"/> AI-assisted itineraries</span><span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-[#d6ad68]"/> Trip budgets</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-[#a94d3d]/20 blur-3xl"/>
          <div className="glass relative rounded-[2rem] p-4 shadow-glow-strong sm:p-5">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold tracking-[.16em] text-white/45">A SAMPLE JOURNEY</p><p className="mt-1 font-display text-xl font-bold text-white">A weekend in Coorg</p></div><span className="chip">3 days · 2 travellers</span></div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#59332f] via-[#392528] to-[#263d36] p-5">
              <div className="flex h-40 items-end rounded-xl bg-[radial-gradient(ellipse_at_70%_25%,rgba(214,173,104,.36),transparent_35%),linear-gradient(135deg,rgba(255,238,211,.12),rgba(15,15,15,.12))] p-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-100/70">Find your somewhere</p><p className="mt-1 font-display text-3xl font-bold text-white">Coorg, Karnataka</p></div></div>
              <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-black/20 p-3"><MapPin className="h-4 w-4 text-[#ead09a]"/><p className="mt-2 text-xs text-white/45">Route</p><p className="text-sm font-bold text-white">Bengaluru → Coorg</p></div><div className="rounded-xl bg-black/20 p-3"><Clock3 className="h-4 w-4 text-[#ead09a]"/><p className="mt-2 text-xs text-white/45">Trip length</p><p className="text-sm font-bold text-white">3 days</p></div></div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d6ad68]/15 text-[#ead09a]"><Bot className="h-5 w-5"/></span><div><p className="text-sm font-bold text-white">MYRAVO Travel AI</p><p className="text-xs text-white/45">Ideas, routes and practical tips</p></div></div><ArrowUpRight className="h-4 w-4 text-white/50"/></div>
          </div>
        </div>
      </div>
    </section>
    <section className="px-5 py-20 sm:px-10"><div className="mx-auto max-w-7xl">
      <div className="mx-auto max-w-2xl text-center"><span className="text-xs font-extrabold tracking-[.22em] text-[#d6ad68]">ONE TRIP. ONE CLEAR PLAN.</span><h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-5xl">From the first idea<br/><span className="text-[#d6ad68]">to the way back home.</span></h2><p className="mt-5 leading-7 text-[#f5e9df]/55">The essentials for a smoother journey, organised in one travel workspace.</p></div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{FEATURES.map(([Icon,title,desc])=><div key={title} className="group rounded-3xl border border-white/[.09] bg-white/[.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#d6ad68]/30 hover:bg-white/[.06]"><span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#d6ad68]/12 text-[#ead09a]"><Icon className="h-5 w-5"/></span><h3 className="font-display text-lg font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-[#f5e9df]/55">{desc}</p></div>)}</div>
      <div className="mt-20 grid gap-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#67252a]/35 via-white/[.025] to-[#d6ad68]/[.07] p-7 sm:p-10 md:grid-cols-3">{STEPS.map(([n,title,desc])=><div key={n}><p className="font-display text-4xl font-bold text-[#d6ad68]/70">{n}</p><h3 className="mt-3 font-display text-xl font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-[#f5e9df]/55">{desc}</p></div>)}</div>
      <div className="mt-12 flex flex-col items-center gap-3 text-center"><Link to="/register" className="btn-accent px-6">Start planning with MYRAVO <ArrowUpRight className="h-4 w-4"/></Link><p className="flex items-center gap-2 text-xs text-[#f5e9df]/35"><ShieldCheck className="h-4 w-4"/> Your trip details stay in your account. Map data © OpenStreetMap contributors.</p></div>
    </div></section>
  </div>;
}
