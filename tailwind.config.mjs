/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#fa4a15ff',
        secondary: '#1E3A8A',
        accent: '#000000',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1.5rem',
          md: '3rem',
          lg: '4rem',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
