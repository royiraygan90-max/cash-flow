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
        "bg-primary":      "#0d1014",
        "bg-secondary":    "#11151b",
        "bg-tertiary":     "#161b22",
        "bg-card":         "#1b2230",
        "bg-bar":          "#0b0e12",
        "card-border":     "#20272f",
        income:            "#34e0a1",
        "income-bg":       "#101a16",
        "income-border":   "#1c3329",
        expense:           "#ff6b6b",
        "expense-light":   "#ff8f8f",
        "expense-bg":      "#1c1316",
        "expense-border":  "#3a2226",
        "accent-purple":   "#a78bfa",
        "accent-pink":     "#f472b6",
        "accent-blue":     "#52b9ff",
        "accent-orange":   "#ffb454",
        "accent-indigo":   "#818cf8",
        "text-primary":    "#f2f5f8",
        "text-secondary":  "#cdd5de",
        "text-muted":      "#9aa6b4",
        "text-disabled":   "#6b7785",
        "text-faint":      "#5c6776",
      },
      fontFamily: {
        sans: ["Rubik", "sans-serif"],
      },
      maxWidth: {
        terminal: "1400px",
      },
      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,0.3)",
        modal: "0 20px 60px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
