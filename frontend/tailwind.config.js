/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: 'var(--color-primary, #EA580C)',
          secondary: 'var(--color-secondary, #C2410C)',
          accent: 'var(--color-accent, #F59E0B)',
        }
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        custom: 'var(--border-radius, 0.75rem)'
      }
    },
  },
  plugins: [],
}
