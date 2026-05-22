/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#26303D",
          light: "#E1DEDE",
          yellow: "#FFC700",
          orange: "#FF6D1D",
          bg: "#F8FAFC", // Дуже світлий сіро-блакитний для фону сторінок
        },
      },
    },
  },
  plugins: [],
};
