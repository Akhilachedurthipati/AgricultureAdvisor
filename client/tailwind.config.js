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
          50: '#f2fbf4',
          100: '#e1f6e7',
          200: '#c3ecd0',
          300: '#94dbae',
          400: '#5dc085',
          500: '#2e9e60', // Primary Green
          600: '#23844f',
          700: '#1e6840',
          800: '#1b5336',
          900: '#18452e',
          950: '#0a2618',
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
      }
    },
  },
  plugins: [],
}

