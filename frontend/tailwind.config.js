/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Oswald', 'Merriweather', 'Kanit', 'Bebas Neue'], // Add Roboto font
      },
    },
  },
  plugins: [],
}
