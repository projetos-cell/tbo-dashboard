import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tbo: {
          orange: {
            50:  "#fff4ec",
            100: "#ffe5cc",
            200: "#ffc999",
            300: "#ffad66",
            400: "#ff9133",
            500: "#ff6200", // TBO primary orange
            600: "#cc4e00",
            700: "#993b00",
            800: "#662700",
            900: "#331400",
            950: "#1a0a00",
            DEFAULT: "#ff6200",
          },
          black: "#0a0a0a",
          white: "#fafafa",
        },
      },
    },
  },
  plugins: [],
};

export default config;
