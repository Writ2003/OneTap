/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./pages/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/components/ui/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
        animation: {
          scroll: 'scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite',
        },
        keyframes: {
          scroll: {
            to: {
              transform: 'translate(calc(-50% - 0.5rem))',
            },
          },
        },
      },
    },
  plugins: [],
}

