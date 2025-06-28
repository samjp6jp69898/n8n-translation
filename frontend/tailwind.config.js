/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['PingFang TC', 'Microsoft JhengHei', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#ff6d00',
          dark: '#e56200',
        },
        success: {
          DEFAULT: '#2ecc71',
          dark: '#27ae60',
        },
        warning: {
          DEFAULT: '#e67e22',
          dark: '#d35400',
        },
        error: {
          DEFAULT: '#e74c3c',
        },
      },
    },
  },
  plugins: [typography],
}
