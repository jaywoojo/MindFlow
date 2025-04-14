// tailwind.config.js
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'blob-background': 'blob-bg 15s infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        'blob-bg': {
          '0%, 100%': { 
            transform: 'translateX(0) translateY(0) rotate(0deg)' 
          },
          '50%': { 
            transform: 'translateX(5%) translateY(10%) rotate(10deg)' 
          }
        },
        'blob': {
          '0%, 100%': { 
            transform: 'translateX(0) translateY(0) scale(1)' 
          },
          '33%': { 
            transform: 'translateX(-5%) translateY(10%) scale(1.1)' 
          },
          '66%': { 
            transform: 'translateX(5%) translateY(-10%) scale(0.9)' 
          }
        }
      },
      animation: {
        'blob': 'blob 7s infinite',
        'blob-background': 'blob-bg 15s infinite',
        'blob-delay-2000': 'blob 7s infinite 2s',
        'blob-delay-4000': 'blob 7s infinite 4s'
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
    },
  },
  plugins: [],
}