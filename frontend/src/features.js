import { Route, Bot, Compass, Map, MapPin, Hotel, Utensils, Wallet, CloudSun, Users, Gem, ShieldCheck, Bookmark, Backpack } from 'lucide-react';

export const FEATURES = [
  { to: '/plan', title: 'Plan My Entire Trip', desc: 'Answer a few questions and get a day-wise plan.', icon: Route, color: '#5B3FF0', main: true },
  { to: '/assistant', title: 'AI Travel Assistant', desc: 'Ask anything about your trip.', icon: Bot, color: '#2F7BFF' },
  { to: '/explore', title: 'Explore Destinations', desc: 'See attractions around any place.', icon: Compass, color: '#00C2B8' },
  { to: '/map', title: 'Maps and Navigation', desc: 'Routes, distance and directions.', icon: Map, color: '#FF6B4A' },
  { to: '/nearby', title: 'Nearby Places', desc: 'Find what is around you.', icon: MapPin, color: '#5B3FF0' },
  { to: '/hotels', title: 'Hotels and Stays', desc: 'Find places to stay on the map.', icon: Hotel, color: '#2F7BFF' },
  { to: '/restaurants', title: 'Restaurants and Food', desc: 'Cafes and restaurants nearby.', icon: Utensils, color: '#FF6B4A' },
  { to: '/budget', title: 'Budget and Expenses', desc: 'Track what you spend.', icon: Wallet, color: '#00C2B8' },
  { to: '/weather', title: 'Weather Forecast', desc: '7-day forecast and rainy-day ideas.', icon: CloudSun, color: '#FFB020' },
  { to: '/group', title: 'Group Travel', desc: 'Share, vote and split costs.', icon: Users, color: '#5B3FF0' },
  { to: '/gems', title: 'Hidden Gems', desc: 'Viewpoints, waterfalls and quiet spots.', icon: Gem, color: '#00C2B8' },
  { to: '/safety', title: 'Travel Safety', desc: 'Hospitals, police and emergency numbers.', icon: ShieldCheck, color: '#FF6B4A' },
  { to: '/saved', title: 'My Saved Trips', desc: 'Open, edit and download trips.', icon: Bookmark, color: '#2F7BFF' },
  { to: '/packing', title: 'Packing Checklist', desc: 'Never forget the essentials.', icon: Backpack, color: '#FFB020' },
];
