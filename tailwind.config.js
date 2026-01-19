// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          0: "#d3c9ee",
          1: "#b6a6e3",
          2: "#9881d8",
          3: "#8165cf",
          4: "#6a4bc6",
          5: "#6046bf",
        },
        red: "#ff6f6e",
        blue: "#4b6fff",
        green: "#96b58f",
        purple: "#ab86c8",
        gray: "#686868",
        disable: "#c0c0c0",
      },
      borderRadius: {
        base: "0.4rem",
        btn: "0.4rem",
      },
      boxShadow: {
        body: "0 0 1.2rem rgb(0 0 0 / 10%)",
      },
    },
  },
  plugins: [],
}
