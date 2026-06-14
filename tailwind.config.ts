import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f5f5f5",
        surface: "#ffffff",
        "card-border": "#e8e8e8",
        green: "#00875a",
        "green-hover": "#006644",
        red: "#dc2626",
        "text-primary": "#111111",
        "text-secondary": "#6b7280",
        "text-muted": "#9ca3af",
      },
      fontFamily: {
        mono: ["var(--font-jetbrains)", "monospace"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      maxWidth: {
        terminal: "1400px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06)",
        modal: "0 20px 60px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
