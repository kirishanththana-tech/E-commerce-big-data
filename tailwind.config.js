/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#dbe5ff',
          200: '#bccdff',
          300: '#8da9ff',
          400: '#5a7eff',
          500: '#3558f7',
          600: '#1d3aee',
          700: '#172dc7',
          800: '#1728a0',
          900: '#0f1b6e',
          950: '#0a1130',
        },
        accent: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 27, 48, 0.08), 0 1px 2px -1px rgba(15, 27, 48, 0.08)',
        'card-hover': '0 10px 25px -5px rgba(15, 27, 48, 0.12), 0 8px 10px -6px rgba(15, 27, 48, 0.08)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'spin-slow': 'spin-slow 1.5s linear infinite',
      },
    },
  },
  plugins: [],
};
