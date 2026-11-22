import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';
import Logo from './Logo.jsx';
import { FEATURES } from '../features.js';
import { useAuth } from '../AuthContext.jsx';

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const link = ({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-gradient-to-r from-sky to-violet text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`;
  return (
    <div className="flex min-h-screen">
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 overflow-y-auto border-r border-white/10 bg-ink p-4 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-5 flex items-center justify-between"><Link to="/dashboard"><Logo light /></Link>
          <button className="text-white lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button></div>
        <nav className="space-y-1" onClick={() => setOpen(false)}>
          <NavLink to="/dashboard" className={link}><LayoutDashboard className="h-4 w-4" /> Dashboard</NavLink>
          {FEATURES.map((f) => <NavLink key={f.to} to={f.to} className={link}><f.icon className="h-4 w-4" style={{ color: undefined }} /> {f.title}</NavLink>)}
          <NavLink to="/profile" className={link}><User className="h-4 w-4" /> Profile and reminders</NavLink>
        </nav>
      </aside>
      {open && <div className="fixed inset-0 z-20 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-violet/10 bg-white/90 px-4 py-3 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button>
          <span className="hidden text-sm text-slate-600 lg:block">Hello, <b className="text-ink">{user?.name}</b></span>
          <button className="btn-ghost" onClick={() => { signOut(); nav('/'); }}><LogOut className="h-4 w-4" /> Log out</button>
        </header>
        <main className="flex-1"><Outlet /></main>
      </div>
    </div>
  );
}
