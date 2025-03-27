/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3f51b5',
        'primary-dark': '#303f9f',
        secondary: '#4caf50',
        danger: '#f44336',
        warning: '#ffc107',
        success: '#4caf50',
        gray: {
          light: '#f5f7fa',
          medium: '#e0e0e0',
          dark: '#757575'
        }
      }
    },
  },
  plugins: [],
}
