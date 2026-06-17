import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ayronex: {
          bg: "#09090b",
          panel: "#18181b",
          panelSoft: "#27272a",
          accent: "#f59e0b"
        }
      }
    }
  },
  plugins: []
};

export default config;
