/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#eef2ff', 100:'#e0e7ff', 400:'#818cf8', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca' },
        surface: { 0:'#ffffff', 1:'#f8f9fc', 2:'#f1f3f8', 3:'#e8ebf2' },
        ink: { DEFAULT:'#111827', 2:'#374151', 3:'#6b7280', 4:'#9ca3af', 5:'#d1d5db' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
