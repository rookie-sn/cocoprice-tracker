/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        tamil: ['"Mukta Malar"', '"Noto Sans Tamil"', 'sans-serif'],
        sans: ['"Mukta Malar"', '"Noto Sans Tamil"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        coco: {
          50: '#fbf8f5',
          100: '#f6f0eb',
          200: '#eddcd0',
          300: '#dfc2ad',
          400: '#cda184',
          500: '#ba8060',
          600: '#a3674b',
          700: '#834f3c',
          800: '#6d4234',
          900: '#58362c',
          950: '#321c16',
        },
        agri: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'card': '0 10px 30px -5px rgba(26, 46, 33, 0.06), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        'modal': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
