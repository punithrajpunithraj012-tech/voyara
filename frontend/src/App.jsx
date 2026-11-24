import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Layout from './components/Layout.jsx';
import { Spinner } from './components/UI.jsx';
import Landing from './pages/Landing.jsx';
import { Login, Register, Forgot } from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Planner from './pages/Planner.jsx';
import Create from './pages/Create.jsx';
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
  if (loading) return <Spinner label="Signing you in..." />;
  return user ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();
  const guest = (el) => (user ? <Navigate to="/dashboard" replace /> : el);
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={guest(<Login />)} />
      <Route path="/register" element={guest(<Register />)} />
      <Route path="/forgot" element={<Forgot />} />
      <Route element={<Protected />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plan" element={<Planner />} />
        <Route path="/create" element={<Create />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/explore" element={<PlaceFinder title="Explore Destinations" subtitle="Search any city or town to see its attractions on the map." types={[['attractions', 'Attractions']]} radius={15000} />} />
        <Route path="/nearby" element={<PlaceFinder title="Nearby Places" subtitle="Pick a category and find places around you or around any location." types={[['attractions', 'Attractions'], ['restaurants', 'Food'], ['hotels', 'Stays'], ['pharmacy', 'Pharmacies'], ['hospitals', 'Hospitals']]} locate />} />
        <Route path="/hotels" element={<PlaceFinder title="Hotels and Accommodation" subtitle="Hotels, hostels and guest houses from OpenStreetMap." types={[['hotels', 'Stays']]} note="OpenStreetMap does not include ratings, reviews or live prices, so Voyara does not show any. Use the website link or phone number to check availability." />} />
        <Route path="/restaurants" element={<PlaceFinder title="Restaurants and Food Finder" subtitle="Restaurants, cafes and fast food around a location." types={[['restaurants', 'Food']]} note="Opening hours appear only where OpenStreetMap contributors have added them. Voyara shows no reviews or ratings." />} />
        <Route path="/gems" element={<PlaceFinder title="Hidden Gems Explorer" subtitle="Waterfalls, viewpoints, peaks, beaches and ruins that are easy to miss." types={[['gems', 'Hidden gems']]} radius={25000} note="Gems are picked from natural and historic features in OpenStreetMap. They are not ranked by popularity, so check access and local conditions before you go." />} />
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
    </Routes>
  );
}
