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
        // Пастельная палитра в стиле Смешариков
        pastel: {
          blue: "#b8e0f0",
          pink: "#ffd6e8",
          yellow: "#fff4b8",
          green: "#d4f4dd",
          purple: "#e8d5ff",
          orange: "#ffe4c4",
          peach: "#ffe8d6",
        },
        accent: {
          blue: "#7ec8e3",
          pink: "#ff9ec5",
          yellow: "#ffd93d",
          green: "#95e1a3",
        },
        background: "#fef7f0",
        foreground: "#4a4a4a",
      },
      borderRadius: {
        // Большие скругления для стиля Смешариков
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "4xl": "3rem",
      },
      boxShadow: {
        // Мягкие тени
        "soft": "0 4px 16px rgba(0, 0, 0, 0.06)",
        "soft-lg": "0 8px 24px rgba(0, 0, 0, 0.08)",
        "soft-xl": "0 12px 32px rgba(0, 0, 0, 0.12)",
      },
      fontFamily: {
        sans: ["'Baloo 2'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

