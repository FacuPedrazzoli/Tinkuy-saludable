import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7f2',
          100: '#dcebdf',
          200: '#bbd7c1',
          300: '#8fbda0',
          400: '#6b9E7A', // primary-light
          500: '#4A7C59', // PRIMARY - verde musgo profundo
          600: '#3A6347', // primary-dark
          700: '#2f4f3a',
          800: '#28402f',
          900: '#223526',
          950: '#121d14',
        },
        secondary: {
          50: '#f7f3f1',
          100: '#ede5df',
          200: '#dccbc0',
          300: '#c7ac9b',
          400: '#8B6355', // SECONDARY - tierra cálida
          500: '#7a5549',
          600: '#6b4a40',
          700: '#5a3d35',
          800: '#4b332e',
          900: '#3f2c29',
          950: '#211613',
        },
        accent: {
          50: '#fbf7f2',
          100: '#f5ece0',
          200: '#ead8c2',
          300: '#debfa0',
          400: '#C4956A', // ACCENT - dorado natural
          500: '#b8835c',
          600: '#a6734d',
          700: '#8c5f40',
          800: '#734e37',
          900: '#5e412f',
          950: '#31211a',
        },
        cream: {
          50: '#FAFAF7', // background-alt
          100: '#F5F0E8', // background
          200: '#ebe4d9',
          300: '#ddd2c3',
          400: '#c9b9a6',
          500: '#b19e89',
          600: '#9d866e',
          700: '#816d5a',
          800: '#6a5a4b',
          900: '#574c3f',
          950: '#2e2620',
        },
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'elevated': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
        'focus': '0 0 0 3px rgba(74, 124, 89, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale': 'scale 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'floatY 6s ease-in-out infinite',
        'float-slow': 'floatY 9s ease-in-out infinite',
        'sway': 'sway 7s ease-in-out infinite',
        'spin-slow': 'spin 40s linear infinite',
        'draw': 'draw 2.4s ease-out forwards',
        'leaf-in': 'leafIn 0.8s ease-out backwards',
      },
      keyframes: {
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2.5deg)' },
          '50%': { transform: 'rotate(2.5deg)' },
        },
        draw: {
          '0%': { strokeDashoffset: '1' },
          '100%': { strokeDashoffset: '0' },
        },
        leafIn: {
          '0%': { opacity: '0', transform: 'scale(0.4)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

export default config