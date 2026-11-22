/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ink: '#0B1437', violet: '#5B3FF0', sky: '#2F7BFF', aqua: '#00C2B8', coral: '#FF6B4A', sun: '#FFB020', sand: '#FAF7F2' },
      fontFamily: { display: ['Sora', 'system-ui', 'sans-serif'], sans: ['Figtree', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
