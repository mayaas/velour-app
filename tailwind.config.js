/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0c0a0d',
          2: '#111018',
          3: '#181520',
          4: '#1f1b28',
        },
        rose: {
          DEFAULT: '#c9a07a',
          light: '#e8c9a8',
          dim: '#7a5c42',
          muted: '#3d2e22',
        },
        gold: {
          DEFAULT: '#b8965a',
          light: '#d4b07a',
        },
        velour: {
          text: '#f0e8dc',
          dim: '#8a7d70',
          muted: '#4a4240',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}


