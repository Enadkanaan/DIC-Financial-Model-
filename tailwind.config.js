/** @type {import('tailwindcss').Config} */
// Colours follow the State of Qatar Master Brand Guidelines (gba.gco.gov.qa).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F6F4',
        brand: { DEFAULT: '#8A1538', 50: '#F7EDF0', 700: '#6E112D' }, // Al Adaam
        skyline: '#0D4261',
        palm: '#009C80',
        sea: '#4194B3',
        sunrise: '#FDF39E',
        actual: { DEFAULT: '#009C80', 50: '#E0F3EF' },
        projected: { DEFAULT: '#4194B3', 50: '#E5F0F5' },
        positive: { 50: '#E6F5F2', 700: '#00715D' },
        negative: { 50: '#FEF3F2', 700: '#B42318' },
        warning: { 50: '#FFFAEB', 700: '#B54708' },
      },
      boxShadow: { card: '0 1px 2px rgba(16,24,40,0.05)' },
    },
  },
  plugins: [],
};
