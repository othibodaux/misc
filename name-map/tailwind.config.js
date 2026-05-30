/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f1117',
        panel: '#171a23',
        panel2: '#1f232f',
        edge: '#2a2f3d',
        accent: '#4f8ef7',
      },
    },
  },
  plugins: [],
};
