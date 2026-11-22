import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pin = (color, text = '') => L.divIcon({ className: '', html: `<div class="vy-pin" style="background:${esc(color)}"><span>${esc(text)}</span></div>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });

// Leaflet + OpenStreetMap tiles. markers: [{lat, lon, label, sub, color, text}], route: [[lat, lon], ...]
export default function MapView({ markers = [], route = null, className = 'h-80' }) {
  const el = useRef(null), map = useRef(null), layer = useRef(null);

  useEffect(() => {
    map.current = L.map(el.current, { scrollWheelZoom: false }).setView([20.59, 78.96], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    setTimeout(() => map.current && map.current.invalidateSize(), 0);
    return () => { map.current.remove(); map.current = null; };
  }, []);

  const key = JSON.stringify([markers, route ? route.length : 0]);
  useEffect(() => {
    if (!map.current) return;
    layer.current.clearLayers();
    const pts = [];
    markers.forEach((m) => {
      L.marker([m.lat, m.lon], { icon: pin(m.color || '#5B3FF0', m.text) })
        .bindPopup(`<b>${esc(m.label)}</b>${m.sub ? '<br>' + esc(m.sub) : ''}`).addTo(layer.current);
      pts.push([m.lat, m.lon]);
    });
    if (route?.length) { L.polyline(route, { color: '#5B3FF0', weight: 5, opacity: 0.85 }).addTo(layer.current); pts.push(...route); }
    if (pts.length > 1) map.current.fitBounds(pts, { padding: [30, 30] });
    else if (pts.length === 1) map.current.setView(pts[0], 13);
  }, [key]); // eslint-disable-line

  return <div ref={el} className={`w-full ${className}`} aria-label="Map" />;
}
