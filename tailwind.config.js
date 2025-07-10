/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
  // tailwind.config.js
  module.exports = {
    theme: {
      fontFamily: {
-       sans: [
-         'var(--font-geist-sans)',
-         'ui-sans-serif',
-         'system-ui',
-         'sans-serif',
-         'Apple Color Emoji',
-         'Segoe UI Emoji',
-         'Segoe UI Symbol',
-         'Noto Color Emoji'
-       ],
+       sans: ['var(--font-sans)'],
      },
      // …other theme settings
    },
    // …other config
  }
    },
  },
  plugins: [],
}
