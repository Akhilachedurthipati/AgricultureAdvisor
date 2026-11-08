/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Required Design Palette
        forest: {
          DEFAULT: '#123D2A', // Deep forest green
          deep: '#123D2A',
          rich: '#246B45',    // Rich agricultural green
          dark: '#0B261A',
          surface: '#1A4D35',
          light: '#2D7D52',
        },
        agri: {
          50: '#F7F7F0',      // Warm ivory background
          100: '#EBECE1',
          200: '#D7DBC5',
          300: '#B6D957',     // Fresh lime accent
          400: '#4E9868',
          500: '#246B45',     // Rich agricultural green
          600: '#1D5939',
          700: '#123D2A',     // Deep forest green
          800: '#0E2E20',
          900: '#091F15',
          950: '#05120C',
        },
        lime: {
          accent: '#B6D957',
          light: '#CBE67B',
          dark: '#9BBF40',
        },
        ivory: {
          DEFAULT: '#F7F7F0',
          50: '#FCFCF9',
          100: '#F7F7F0',
          200: '#EBECE1',
          300: '#D7DBC5',
        },
        charcoal: {
          DEFAULT: '#202923', // Dark charcoal text
          dark: '#141A16',
          light: '#35433A',
          muted: '#5F6E65',
          subtle: '#8C9B92',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(18, 61, 42, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'premium': '0 4px 20px -2px rgba(18, 61, 42, 0.06), 0 2px 6px -1px rgba(18, 61, 42, 0.03)',
        'hover': '0 12px 30px -4px rgba(18, 61, 42, 0.12), 0 4px 12px -2px rgba(18, 61, 42, 0.05)',
        'card': '0 1px 3px 0 rgba(18, 61, 42, 0.05), 0 1px 2px -1px rgba(18, 61, 42, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(18, 61, 42, 0.08), 0 8px 10px -6px rgba(18, 61, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
