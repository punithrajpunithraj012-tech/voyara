/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: {
      ink: '#321719', violet: '#8C3F37', sky: '#B66B4E', aqua: '#A7A18C',
      coral: '#B95743', sun: '#D6AD68', sand: '#F7F2E9',
      'brand-ink': '#321719', 'brand-wine': '#67252A',
      'brand-clay': '#A94D3D', 'brand-gold': '#D6AD68', 'brand-ivory': '#F7F2E9'
    },
    fontFamily: { display: ['Sora', 'system-ui', 'sans-serif'], sans: ['Figtree', 'system-ui', 'sans-serif'] }
  }},
  plugins: [],
};
