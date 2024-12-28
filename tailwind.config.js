/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts,css}'],
  theme: {
    screens: {
      'mobile-s': { 'max': '320px' },
      'mobile-m': { 'max': '375px' },
      'mobile-l': { 'max': '425px' },
      'tablet': { 'max': '768px' },
      'laptop': { 'max': '1024px' },
      'desktop': { 'max': '1440px' },
      'desktop-l': { 'max': '2560px' },
    },
    fontFamily: {
      'lobster': ['Lobster', 'cursive'],
    },
  },
  plugins: [
    // require('daisyui'),
  ],
  // daisyui: {
  //   themes: ["light", "dark"],
  // },
  darkMode: 'selector', // add class="dark" to <html> tag
};
