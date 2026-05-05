/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#050d1a', light: '#0a1a2e', lighter: '#122240' },
        gold:    { DEFAULT: '#c9a84c', light: '#e0c068', dark: '#a08030', burnished: '#b08d36' },
        emerald: { DEFAULT: '#00c896', light: '#33d4a8', dark: '#009975' },
        parchment: { DEFAULT: '#fdfdfb', dark: '#f5f0e0' },
      },
      fontFamily: {
        arabic:  ['"Amiri"', 'serif'],
        heading: ['"Poppins"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
