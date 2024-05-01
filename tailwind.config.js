const { addDynamicIconSelectors } = require('@iconify/tailwind');

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        info: ''
      }
    },
  },
  plugins: [
    require('daisyui'),
    addDynamicIconSelectors(),
  ],
};