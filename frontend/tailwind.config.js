/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: {
      ink: '#241719', violet: '#67252A', sky: '#B97868', aqua: '#66877B',
      coral: '#C66A50', sun: '#D6AD68', sand: '#F7F1E8',
      'brand-ink': '#241719', 'brand-wine': '#67252A',
      'brand-clay': '#A94D3D', 'brand-gold': '#D6AD68', 'brand-ivory': '#F7F1E8'
    },
    fontFamily: { display: ['Space Grotesk', 'system-ui', 'sans-serif'], sans: ['Manrope', 'system-ui', 'sans-serif'] },
    boxShadow: {
      glow: '0 12px 42px rgba(103,37,42,.2)',
      'glow-strong': '0 18px 56px rgba(103,37,42,.3)'
    }
  }},
  plugins: [],
};
