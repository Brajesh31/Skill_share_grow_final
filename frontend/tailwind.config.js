/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Add this line if missing
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6B7280",
        accent: "#8B5CF6",
        darkBg: "#1F2937",
        lightBg: "#F9FAFB",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};