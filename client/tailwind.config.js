/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primaryColor: '#333',
        secondaryColor: '#555',
        thirdColor: '#888',
        text1: '#222'
      },
      fontFamily: {
        robotoMono: ['Roboto Mono', 'Arial', 'sans-serif']
      },
      boxShadow: {
        shadowHeader: '2px 0px 12px 0px rgba(0, 0, 0, 0.15)'
      },
      animation: {
        'bounce-delayed-1': 'bounce 1s infinite 0.1s',
        'bounce-delayed-2': 'bounce 1s infinite 0.2s'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
