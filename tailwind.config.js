import { addDynamicIconSelectors } from '@iconify/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        info: ''
      }
    },
    screens: {
      'mobile-s': { 'max': '320px' },
      'mobile-m': { 'max': '375px' },
      'mobile-l': { 'max': '425px' },
      'tablet': { 'max': '768px' },
      'laptop': { 'max': '1024px' },
      'desktop': { 'max': '1440px' },
      'desktop-l': { 'max': '2560px' },
    },
  },
  plugins: [
    require('daisyui'),
    addDynamicIconSelectors(),
  ],
};