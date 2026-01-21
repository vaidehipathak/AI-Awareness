import tailwindcssAnimate from 'tailwindcss-animate';
import tailwindcssTypography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        'primary-focus': '#4338CA',
        secondary: '#F59E0B',
      }
    },
  },
  plugins: [
    tailwindcssAnimate,
    tailwindcssTypography,
  ],
}
