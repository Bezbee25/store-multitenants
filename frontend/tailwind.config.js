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
          secondary: 'var(--color-secondary, #B45309)',
          accent: 'var(--color-accent, #F59E0B)',
          bg: 'var(--color-bg, #0F172A)',
          text: 'var(--color-text, #F8FAFC)',
        }
      },
      fontFamily: {
        heading: 'var(--font-heading, "Space Grotesk", sans-serif)',
        body: 'var(--font-body, "Inter", sans-serif)',
      },
      borderRadius: {
        custom: 'var(--border-radius, 0.75rem)'
      }
    },
  },
  plugins: [],
}
