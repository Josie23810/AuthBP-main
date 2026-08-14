/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1A1A1A',
        'neon-red': '#FF4D4D',
        'neon-blue': '#40C4FF',
        'gold-accent': '#FFD700',
      },
    },
  },
  plugins: [],
};