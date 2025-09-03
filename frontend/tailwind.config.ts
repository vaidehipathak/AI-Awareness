import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // A more professional indigo color palette
        primary: '#4F46E5', // indigo-600
        'primary-focus': '#4338CA', // indigo-700
        secondary: '#F59E0B', // amber-500
      }
    },
  },
  plugins: [],
} satisfies Config
