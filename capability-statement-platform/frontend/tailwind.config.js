/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Wong Partnership Brand Colors
        primary: {
          50: '#e8f3f4',
          100: '#d1e7e9',
          200: '#a3cfd3',
          300: '#75b7bd',
          400: '#479fa7',
          500: '#296067', // Deep teal - Primary brand color
          600: '#245458',
          700: '#1f484a',
          800: '#1a3c3d',
          900: '#15302f',
          950: '#0d1f1f',
        },
        accent: {
          50: '#f0f7f7',
          100: '#e1efef',
          200: '#c3dfdf',
          300: '#a5cfcf',
          400: '#87bfbf',
          500: '#69999D', // Muted aqua - Secondary accent
          600: '#5e8a8d',
          700: '#537a7d',
          800: '#486b6d',
          900: '#3d5b5d',
          950: '#2d4345',
        },
        slate: {
          50: '#f6f6f7',
          100: '#ededee',
          200: '#dbdcdd',
          300: '#c0c1c3',
          400: '#a0a1a4', // Cool grey - Neutral surfaces
          500: '#54585B', // Charcoal slate - Primary text
          600: '#4a4e50',
          700: '#404345',
          800: '#36393a',
          900: '#2c2e2f',
          950: '#1a1b1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-sm': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '500' }],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
