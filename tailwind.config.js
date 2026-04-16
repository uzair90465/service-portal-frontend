/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        navy: {
          900: '#0B1120',
          800: '#0F172A',
          700: '#1E293B',
          600: '#253347',
          500: '#334155',
        },
        accent: {
          DEFAULT: '#38BDF8',
          hover: '#0EA5E9',
          muted: '#0369A1',
        }
      }
    },
  },
  plugins: [],
}