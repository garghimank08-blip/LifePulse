/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#0f172a',
          900: '#0b1120',
          950: '#030712'
        },
        clinical: {
          red: '#ef4444',
          darkred: '#991b1b',
          emerald: '#10b981',
          amber: '#f59e0b',
          blue: '#3b82f6',
          navy: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        heading: ['Manrope', 'sans-serif']
      }
    },
  },
  plugins: [],
}
