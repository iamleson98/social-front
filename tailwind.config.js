import { addDynamicIconSelectors } from '@iconify/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        info: '',
          'custom-red': '#FF5B5B',
          'custom-black': '#4B5563',
          'custom-gray': '#E5E7EB',
          'custom-gray-f5f5': '#F5F5F5',
          'custom-text-color': '#718096',
          'custom-border-color': '#E1E1E1',
          'custom-blue': '#3182CE',
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