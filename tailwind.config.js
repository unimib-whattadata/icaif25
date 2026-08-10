/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './js/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif']
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          300: '#7dd3fc',
          500: '#0ea5e9',
          600: '#0369a1',
          700: '#075985',
          800: '#075985',
          900: '#0c4a6e'
        },
        accent: {
          DEFAULT: '#b9470d',
          light: '#fdba74'
        }
      }
    }
  },
  plugins: []
};
