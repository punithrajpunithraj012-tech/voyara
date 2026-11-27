import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Layout from './components/Layout.jsx';
import { Spinner } from './components/UI.jsx';
import Landing from './pages/Landing.jsx';
import { Login, Register, Forgot } from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Planner from './pages/Planner.jsx';
import Assistant from './pages/Assistant.jsx';
import PlaceFinder from './pages/PlaceFinder.jsx';
import Safety from './pages/Safety.jsx';
import RouteMap from './pages/RouteMap.jsx';
import Weather from './pages/Weather.jsx';
import Budget from './pages/Budget.jsx';
import Group from './pages/Group.jsx';
import Saved from './pages/Saved.jsx';
import Packing from './pages/Packing.jsx';
import Profile from './pages/Profile.jsx';
import Timetable from './pages/Timetable.jsx';

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Preparing your travel space..." />;
  return user ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();
  const guest = (el) => (user ? <Navigate to="/dashboard" replace /> : el);
  return <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={guest(<Login />)} />
    <Route path="/register" element={guest(<Register />)} />
    <Route path="/forgot" element={<Forgot />} />
    <Route element={<Protected />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/plan" element={<Planner />} />
      <Route path="/create" element={<Navigate to="/plan" replace />} />
      <Route path="/assistant" element={<Assistant />} />
      <Route path="/explore" element={<PlaceFinder title="Explore Destinations" subtitle="Find attractions, landmarks and places worth adding to your journey." types={[['attractions', 'Attractions']]} radius={15000} />} />
      <Route path="/nearby" element={<PlaceFinder title="Nearby Essentials" subtitle="Find useful places around you or near a destination." types={[['attractions', 'Attractions'], ['restaurants', 'Food'], ['hotels', 'Stays'], ['pharmacy', 'Pharmacies'], ['hospitals', 'Hospitals']]} locate />} />
      <Route path="/hotels" element={<PlaceFinder title="Places to Stay" subtitle="Explore hotels, hostels and guest houses around your destination." types={[['hotels', 'Stays']]} note="Place details come from OpenStreetMap community data. Check directly with each property for availability and prices." />} />
      <Route path="/restaurants" element={<PlaceFinder title="Food and Cafés" subtitle="Find restaurants, cafés and local food stops near your destination." types={[['restaurants', 'Food']]} note="Opening hours appear only where contributors have added them. Place listings may not include reviews, ratings or live availability." />} />
      <Route path="/gems" element={<PlaceFinder title="Hidden Gems" subtitle="Discover viewpoints, nature spots and lesser-known places to explore." types={[['gems', 'Hidden gems']]} radius={25000} note="These places are sourced from community map data, not ranked by popularity. Check access and local conditions before visiting." />} />
      <Route path="/safety" element={<Safety />} />
      <Route path="/map" element={<RouteMap />} />
      <Route path="/weather" element={<Weather />} />
      <Route path="/budget" element={<Budget />} />
      <Route path="/group" element={<Group />} />
      <Route path="/saved" element={<Saved />} />
      <Route path="/packing" element={<Packing />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/timetable" element={<Timetable />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
