import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#030507", // Negro Profundo
        surface: "#0a0a0a",    // Gris Técnico
        border: "rgba(255,255,255,0.08)",
        primary: {
          DEFAULT: "#0066ff", // Azul Ferrari
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "rgba(255,255,255,0.5)",
          foreground: "rgba(255,255,255,0.8)",
        },
      },
      backgroundImage: {
        "glass": "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.0) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
