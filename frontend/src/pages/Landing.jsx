import { Link } from 'react-router-dom';
import { Route, Bot, Map, ShieldCheck, Wallet, Users, CloudSun, Sparkles } from 'lucide-react';
import Logo from '../components/Logo.jsx';
const FEATS = [
  [Route, 'Plan your next experience', 'Build trips and occasion plans with clear steps and a map.', '#8C3F37'],
  [Bot, 'AI when you want it', 'Get thoughtful suggestions, then edit every detail yourself.', '#B66B4E'],
  [Map, 'Explore with confidence', 'Discover places and organise stops around your plans.', '#A7A18C'],
  [CloudSun, 'Stay one step ahead', 'Keep useful trip details and practical updates together.', '#D6AD68'],
  [Wallet, 'Budgets your way', 'Use smart estimates or create and manage your own budget.', '#B95743'],
  [Users, 'Bring everyone together', 'Coordinate people, tasks and shared plans in one space.', '#8C3F37'],
];
const STEPS = [['1','Bring your people','Start a trip, celebration, college event or get-together.'],['2','Shape the plan','Use AI suggestions or build everything your own way.'],['3','Make it happen','Keep people, places, tasks and budgets connected.']];
export default function Landing() {
  return <div className="min-h-screen bg-ink">
    <section className="relative isolate flex min-h-[88svh] flex-col overflow-hidden">
      <img src="/hero.svg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover"/>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/45"/>
      <header className="flex items-center justify-between px-5 py-5 sm:px-10">
        <Logo light/>
        <div className="flex gap-2"><Link to="/login" className="btn border border-white/40 text-white hover:bg-white/10">Log in</Link><Link to="/register" className="btn-accent">Get started</Link></div>
      </header>
      <div className="vy-rise mt-auto px-5 pb-16 sm:px-10 sm:pb-24">
        <span className="glass mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold text-white"><Sparkles className="h-4 w-4 text-sun"/> One space for plans worth sharing</span>
        <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl">Every plan.<br/><span className="bg-gradient-to-r from-sun via-coral to-white bg-clip-text text-transparent">Every occasion.</span></h1>
        <p className="mt-5 max-w-xl text-lg text-white/85">From weekend trips and college activities to celebrations and get-togethers, bring the details and the people behind every plan into one shared space.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link to="/register" className="btn-accent px-6 py-3 text-base">Create your plan</Link><Link to="/login" className="btn bg-white px-6 py-3 text-base text-ink hover:bg-sand">I already have an account</Link></div>
      </div>
    </section>
    <section className="bg-sand px-5 py-16 sm:px-10"><div className="mx-auto max-w-6xl">
      <h2 className="text-center text-3xl font-extrabold sm:text-4xl">Everything comes together here</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">AI can help you get started. You stay in control of every choice.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{FEATS.map(([Icon,t,d,c])=><div key={t} className="card transition hover:-translate-y-1 hover:shadow-lg"><span className="mb-3 inline-grid h-11 w-11 place-items-center rounded-2xl text-white" style={{background:c}}><Icon className="h-5 w-5"/></span><h3 className="text-lg font-bold">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div>)}</div>
      <h2 className="mt-20 text-center text-3xl font-extrabold">From idea to experience</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">{STEPS.map(([n,t,d])=><div key={n} className="rounded-3xl bg-ink p-6 text-white"><span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sun to-coral font-display font-extrabold text-ink">{n}</span><h3 className="mt-4 font-display text-lg font-bold text-white">{t}</h3><p className="mt-1 text-sm text-white/75">{d}</p></div>)}</div>
      <p className="mt-12 flex items-center justify-center gap-2 text-center text-sm text-slate-500"><ShieldCheck className="h-4 w-4"/> Built around your choices. Map data © OpenStreetMap contributors.</p>
    </div></section>
  </div>;
}
