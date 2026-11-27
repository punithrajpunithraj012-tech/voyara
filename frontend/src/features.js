import { Route, Bot, Compass, Map, MapPin, Hotel, Utensils, Wallet, CloudSun, Users, Gem, ShieldCheck, Bookmark, Backpack } from 'lucide-react';

export const FEATURES = [
  { to: '/plan', title: 'Build an Itinerary', desc: 'Create a day-by-day trip plan, edit every stop and save your journey.', icon: Route, color: '#67252A', main: true },
  { to: '/explore', title: 'Explore Destinations', desc: 'Discover attractions, landmarks and experiences around a destination.', icon: Compass, color: '#A7A18C' },
  { to: '/map', title: 'Maps and Routes', desc: 'Build multi-stop routes, review journey distance and open navigation.', icon: Map, color: '#B95743' },
  { to: '/nearby', title: 'Nearby Essentials', desc: 'Find useful places around you or anywhere on your trip.', icon: MapPin, color: '#8C3F37' },
  { to: '/hotels', title: 'Places to Stay', desc: 'Explore hotels, hostels and guest houses on the map.', icon: Hotel, color: '#D6AD68' },
  { to: '/restaurants', title: 'Food and Cafés', desc: 'Find restaurants, cafés and local food stops near your route.', icon: Utensils, color: '#B95743' },
  { to: '/gems', title: 'Hidden Gems', desc: 'Find viewpoints, nature spots and lesser-known places to explore.', icon: Gem, color: '#A7A18C' },
  { to: '/budget', title: 'Trip Budget', desc: 'Set a travel budget and keep track of your expenses.', icon: Wallet, color: '#A94D3D' },
  { to: '/weather', title: 'Weather and Backup Plans', desc: 'Check the forecast and find indoor alternatives for rainy days.', icon: CloudSun, color: '#D6AD68' },
  { to: '/assistant', title: 'MYRAVO Travel AI', desc: 'Get practical help with destinations, itineraries, packing and travel decisions.', icon: Bot, color: '#A94D3D' },
  { to: '/group', title: 'Travel Together', desc: 'Coordinate a group trip, vote on options and split shared costs.', icon: Users, color: '#67252A' },
  { to: '/safety', title: 'Travel Safety', desc: 'Find nearby help and review practical safety information.', icon: ShieldCheck, color: '#B95743' },
  { to: '/saved', title: 'Saved Trips', desc: 'Reopen, update and export your saved itineraries.', icon: Bookmark, color: '#67252A' },
  { to: '/packing', title: 'Packing Checklist', desc: 'Prepare your essentials and track what is ready to go.', icon: Backpack, color: '#D6AD68' },
];
