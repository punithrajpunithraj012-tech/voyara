import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pin = (color, text = '') => L.divIcon({
  className: '',
  html: `<div class="vy-pin" style="background:${esc(color)}"><span>${esc(text)}</span></div>`,
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -29]
});

// Leaflet + OpenStreetMap tiles. markers: [{lat, lon, label, sub, color, text}], route: [[lat, lon], ...]
export default function MapView({ markers = [], route = null, className = 'h-80' }) {
  const el = useRef(null), map = useRef(null), layer = useRef(null);
  const dataKey = JSON.stringify({ markers, route });

  useEffect(() => {
    if (!el.current) return undefined;
    const instance = L.map(el.current, { scrollWheelZoom: false, zoomControl: true }).setView([20.59, 78.96], 5);
    map.current = instance;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(instance);
    layer.current = L.layerGroup().addTo(instance);

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => instance.invalidateSize({ pan: false }))
      : null;
    resizeObserver?.observe(el.current);
    const frame = requestAnimationFrame(() => instance.invalidateSize({ pan: false }));

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      instance.remove();
      if (map.current === instance) map.current = null;
      layer.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !layer.current) return;
    layer.current.clearLayers();
    const points = [];
    markers.forEach((marker) => {
      if (!Number.isFinite(Number(marker.lat)) || !Number.isFinite(Number(marker.lon))) return;
      const point = [Number(marker.lat), Number(marker.lon)];
      L.marker(point, { icon: pin(marker.color || '#67252A', marker.text || '') })
        .bindPopup(`<strong>${esc(marker.label || 'Travel stop')}</strong>${marker.sub ? '<br>' + esc(marker.sub) : ''}`)
        .addTo(layer.current);
      points.push(point);
    });
    if (route?.length) {
      L.polyline(route, { color: '#67252A', weight: 6, opacity: .9, lineCap: 'round', lineJoin: 'round' }).addTo(layer.current);
      points.push(...route);
    }
    if (points.length > 1) map.current.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 14 });
    else if (points.length === 1) map.current.setView(points[0], 13);
  }, [dataKey]);

  return <div ref={el} className={`w-full ${className}`} role="img" aria-label="Interactive travel map showing destinations and route" />;
}
