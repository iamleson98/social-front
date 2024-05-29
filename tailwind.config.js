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
          'custom-orange': '#FF7715CC',
          'f3f4f6': '#F3F4F6',
          'ffc9cf': '#FFC9CF',
          'b40e24': '#B40E24',
          'ffaace': '#FFAACE',
          '78035e': '#78035E',
          'ffc48d': '#FFC48D',
          '68046a': '#68046A',
          'fff599': '#FFF599',
          '1475ab': '#1475AB',
          'ef4444': '#EF4444',
          'fee2e2': '#FEE2E2',
          '3b82f6': '#3B82F6',
          'eff6ff': '#EFF6FF',
          'FF7715CC': '#FF7715CC',

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
    fontFamily: {
      'lobster': ['Lobster', 'cursive'],
    },
  },
  plugins: [
    require('daisyui'),
    addDynamicIconSelectors(),
  ],
};