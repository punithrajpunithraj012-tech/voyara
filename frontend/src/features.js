import { Route, Bot, Compass, Map, MapPin, Hotel, Utensils, Wallet, CloudSun, Users, Gem, ShieldCheck, Bookmark, Backpack, CalendarDays } from 'lucide-react';

export const FEATURES = [
  { to: '/plan', title: 'Create a Trip Plan', desc: 'Build a day-by-day itinerary, then edit and save it.', icon: Route, color: '#67252A', main: true },
  { to: '/assistant', title: 'MYRAVO AI Assistant', desc: 'Get practical help with travel ideas, packing, budgets and decisions.', icon: Bot, color: '#A94D3D' },
  { to: '/explore', title: 'Explore Places', desc: 'Discover attractions and places around a destination.', icon: Compass, color: '#A7A18C' },
  { to: '/map', title: 'Maps and Routes', desc: 'Plan multi-stop routes and review distance and directions.', icon: Map, color: '#B95743' },
  { to: '/nearby', title: 'Nearby Places', desc: 'Find useful places around you or a chosen location.', icon: MapPin, color: '#8C3F37' },
  { to: '/hotels', title: 'Stays', desc: 'Explore accommodation options on the map.', icon: Hotel, color: '#D6AD68' },
  { to: '/restaurants', title: 'Food and Restaurants', desc: 'Discover cafes and places to eat near your plan.', icon: Utensils, color: '#B95743' },
  { to: '/budget', title: 'Budget and Expenses', desc: 'Set a spending limit and track every expense.', icon: Wallet, color: '#A94D3D' },
  { to: '/weather', title: 'Weather and Backup Ideas', desc: 'Check the forecast and consider indoor alternatives.', icon: CloudSun, color: '#D6AD68' },
  { to: '/group', title: 'Groups', desc: 'Coordinate plans, vote on options and split shared costs.', icon: Users, color: '#67252A' },
  { to: '/timetable', title: 'Timetable and Planner', desc: 'Organise personal routines, team meetings and group events.', icon: CalendarDays, color: '#A94D3D' },
  { to: '/gems', title: 'Hidden Gems', desc: 'Look for viewpoints, nature spots and lesser-known places.', icon: Gem, color: '#A7A18C' },
  { to: '/safety', title: 'Safety and Essentials', desc: 'Find nearby help and review practical safety guidance.', icon: ShieldCheck, color: '#B95743' },
  { to: '/saved', title: 'Saved Trips', desc: 'Reopen, update and export your saved itineraries.', icon: Bookmark, color: '#67252A' },
  { to: '/packing', title: 'Packing Checklist', desc: 'Create your list and track what is ready to go.', icon: Backpack, color: '#D6AD68' },
];
