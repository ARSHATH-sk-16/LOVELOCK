/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        romantic: {
          pink: '#FF69B4',
          rose: '#FF1493',
          crimson: '#DC143C',
          blush: '#FFB6C1',
          lavender: '#E6E6FA',
          pearl: '#F8F6FF',
        },
        night: {
          dark: '#0a0e27',
          medium: '#1a1f3a',
          light: '#2a3f5f',
          star: '#FFFACD',
        },
        glow: {
          warm: '#ff6b6b',
          soft: '#ffd93d',
          gentle: '#ffb347',
        }
      },
      fontFamily: {
        romantic: ['Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { opacity: 0.8 },
          '100%': { opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}