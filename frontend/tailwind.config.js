/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: {
      ink: '#151322', violet: '#7657F6', sky: '#A99AFF', aqua: '#42DCC3',
      coral: '#FF729A', sun: '#FFC96B', sand: '#F6F5FB',
      'brand-ink': '#171528', 'brand-wine': '#6E4EF6',
      'brand-clay': '#9B7BFF', 'brand-gold': '#FFC96B', 'brand-ivory': '#F7F6FC'
    },
    fontFamily: { display: ['Space Grotesk', 'system-ui', 'sans-serif'], sans: ['Manrope', 'system-ui', 'sans-serif'] },
    boxShadow: {
      glow: '0 12px 42px rgba(110,78,246,.18)',
      'glow-strong': '0 16px 52px rgba(110,78,246,.28)'
    }
  }},
  plugins: [],
};