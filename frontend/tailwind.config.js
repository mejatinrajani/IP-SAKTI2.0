/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f4fa',
          100: '#d9e4f5',
          200: '#b3c9ea',
          300: '#7aa1d4',
          400: '#4a78bc',
          500: '#2a58a0',
          600: '#1e4080',
          700: '#163060',
          800: '#0f2248',
          900: '#0a1830',
          950: '#060f1e',
        },
        saffron: {
          50:  '#fff8ed',
          100: '#ffeece',
          200: '#ffd99d',
          300: '#ffbd61',
          400: '#ff9a2d',
          500: '#e07b0a',
          600: '#c46005',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        serif: ['"Georgia"', 'serif'],
      },
    },
  },
  plugins: [],
}
