/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#F7FAF7',   // Background very light green/white
          100: '#E8F5EE',
          200: '#C7E7D6',
          300: '#94D2B3',
          400: '#54B787',
          500: '#22A06B',  // Fresh green (Secondary)
          600: '#1B8255',
          700: '#176B45',  // Deep forest green (Primary)
          800: '#135738',
          900: '#0F442C',
          950: '#09271A',
        },
        forest: {
          DEFAULT: '#176B45',
          dark: '#114F33',
          light: '#1E8557',
        },
        fresh: {
          DEFAULT: '#22A06B',
          dark: '#1B8255',
          light: '#34BA80',
        },
        earth: {
          50: '#faf8f5',
          100: '#f4ede4',
          200: '#e8dbca',
          300: '#d7c2a7',
          400: '#c2a381',
          500: '#b08a63',
          600: '#9b7352',
          700: '#7c5942',
          800: '#674a39',
          900: '#553d31',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(23, 107, 69, 0.08), 0 8px 10px -6px rgba(23, 107, 69, 0.04)',
      }
    },
  },
  plugins: [],
}
