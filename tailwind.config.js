/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4f7f0',
          100: '#e8efe0',
          200: '#d1dfc1',
          300: '#b4c89a',
          400: '#9ab37a',
          500: '#7A9E5A',
          600: '#5A6E3F',
          700: '#485633',
          800: '#363f26',
          900: '#24281a',
        },
        secondary: {
          50: '#fdf6f5',
          100: '#fae8e6',
          200: '#f5d1cd',
          300: '#eab4ac',
          400: '#E8837C',
          500: '#d96b62',
          600: '#c45247',
          700: '#a34239',
          800: '#82362f',
          900: '#612724',
        },
        cream: {
          50: '#FDFCFA',
          100: '#FBF8F1',
          200: '#F7F1E3',
          300: '#F0E8D0',
          400: '#E8DDB8',
          500: '#D4C4A0',
        },
        sage: {
          50: '#f6f8f4',
          100: '#e8efe3',
          200: '#d1dfc7',
          300: '#b4c8a5',
          400: '#9ab87e',
          500: '#7A9E5A',
          600: '#5f7d45',
          700: '#4a6236',
          800: '#3b4c2b',
          900: '#2b381f',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'scale': 'scale 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(3deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(-3deg)' },
        },
        scale: {
          '0%': { transform: 'scale(0.8)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 30px rgba(0, 0, 0, 0.1)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'button-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}