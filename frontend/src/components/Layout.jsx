import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User, Map, Plus, Users, Sun, Moon, Sparkles, CalendarDays, Compass, MoreHorizontal, Bookmark, Wallet } from 'lucide-react';
import { useTheme } from '../ThemeContext.jsx';
import Logo from './Logo.jsx';
import { FEATURES } from '../features.js';
import { useAuth } from '../AuthContext.jsx';

const feature = (path) => FEATURES.find((item) => item.to === path);
const GROUPS = [
  { title: 'Plan and organise', items: ['/create', '/plan', '/timetable', '/budget', '/assistant'] },
  { title: 'Discover', items: ['/explore', '/map', '/nearby', '/hotels', '/restaurants', '/gems', '/weather', '/safety'] },
  { title: 'Your space', items: ['/group', '/saved', '/packing'] },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const nav = useNavigate();
  const link = ({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-violet-400/15 text-violet-100' : 'text-white/65 hover:bg-white/10 hover:text-white'}`;
  const closeMenu = () => setOpen(false);

  return <div className="flex min-h-screen" style={{ background: 'var(--mf-bg)', color: 'var(--mf-text)' }}>
    <aside className={`fixed inset-y-0 left-0 z-40 w-[290px] overflow-y-auto border-r border-white/10 bg-[#171426] p-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="mb-8 flex items-center justify-between"><Link to="/dashboard" onClick={closeMenu}><Logo light /></Link><button className="text-white lg:hidden" onClick={closeMenu} aria-label="Close menu"><X /></button></div>
      <nav className="space-y-6" aria-label="All MYRAVO sections">
        <section><p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[.2em] text-violet-200/50">Overview</p><NavLink to="/dashboard" end className={link} onClick={closeMenu}><LayoutDashboard size={18}/> Home</NavLink></section>
        {GROUPS.map((group) => <section key={group.title}>
          <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[.2em] text-violet-200/50">{group.title}</p>
          <div className="space-y-1">{group.items.map((path) => { const item = feature(path); if (!item) return null; const Icon = item.icon; return <NavLink key={path} to={path} className={link} onClick={closeMenu}><Icon size={18}/><span>{path === '/create' ? 'Create anything' : path === '/plan' ? 'Trip itinerary' : path === '/assistant' ? 'MYRAVO AI' : path === '/group' ? 'Groups and collaboration' : item.title}</span></NavLink>; })}</div>
        </section>)}
        <section><p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[.2em] text-violet-200/50">Account</p><NavLink to="/profile" className={link} onClick={closeMenu}><User size={18}/> Profile and reminders</NavLink></section>
      </nav>
      <div className="mt-8 rounded-3xl border border-violet-300/15 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/5 p-4">
        <span className="chip"><Sparkles size={13}/> MYRAVO FUTURE</span>
        <p className="mt-3 text-sm font-bold text-white">Make room for what matters.</p>
        <p className="mt-1 text-xs leading-relaxed text-white/55">Your plans, people and possibilities in one place.</p>
      </div>
    </aside>
    {open && <button aria-label="Close navigation" className="fixed inset-0 z-30 cursor-default bg-black/60 lg:hidden" onClick={closeMenu}/>}
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-20 flex min-h-[68px] items-center justify-between border-b px-4 py-2 backdrop-blur-xl sm:px-6" style={{ background: 'color-mix(in srgb, var(--mf-bg) 88%, transparent)', borderColor: 'var(--mf-line)' }}>
        <div className="flex items-center gap-3"><button className="btn-ghost !min-h-10 !px-3 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></button><span className="text-sm font-extrabold tracking-[.2em] text-violet-300 lg:hidden">MYRAVO</span><span className="hidden text-sm lg:block" style={{ color: 'var(--mf-muted)' }}>Welcome back, <b style={{ color: 'var(--mf-text)' }}>{user?.name}</b></span></div>
        <div className="flex items-center gap-2"><button className="btn-ghost !min-h-10 !px-3" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>{theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}<span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span></button><button className="btn-ghost !min-h-10 !px-3" onClick={() => { signOut(); nav('/'); }}><LogOut size={16}/><span className="hidden sm:inline">Log out</span></button></div>
      </header>
      <main className="flex-1 pb-24 lg:pb-8"><Outlet /></main>
    </div>
    <nav aria-label="Main mobile navigation" className="fixed inset-x-0 bottom-0 z-20 border-t px-2 pt-2 shadow-[0_-8px_32px_rgba(10,8,25,.2)] backdrop-blur-xl lg:hidden" style={{ background: 'color-mix(in srgb, var(--mf-surface) 94%, transparent)', borderColor: 'var(--mf-line)', paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}>
      <div className="mx-auto grid max-w-xl grid-cols-5 items-end">
        <NavLink to="/dashboard" className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${isActive ? 'text-violet-300' : 'text-slate-400'}`}><LayoutDashboard size={20}/><span>Home</span></NavLink>
        <NavLink to="/create" className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${isActive ? 'text-violet-300' : 'text-slate-400'}`}><CalendarDays size={20}/><span>Plan</span></NavLink>
        <NavLink to="/map" className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${isActive ? 'text-violet-300' : 'text-slate-400'}`}><Map size={20}/><span>Map</span></NavLink>
        <NavLink to="/group" className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${isActive ? 'text-violet-300' : 'text-slate-400'}`}><Users size={20}/><span>Groups</span></NavLink>
        <button onClick={() => setOpen(true)} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${open ? 'text-violet-300' : 'text-slate-400'}`} aria-label="More features"><MoreHorizontal size={20}/><span>More</span></button>
      </div>
    </nav>
  </div>;
}
