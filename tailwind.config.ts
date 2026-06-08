import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          50: "#f0fdf6",
          100: "#dcfce9",
          200: "#bbf7d4",
          300: "#86efad",
          400: "#4ade7f",
          DEFAULT: "#0f5f3a",
          500: "#0f5f3a",
          600: "#0d4f30",
          700: "#0a3d25",
          800: "#082f1d",
          900: "#062315",
          950: "#03150d",
          foreground: "#ffffff",
        },
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          DEFAULT: "#64748b",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          foreground: "#0f172a",
        },
        accent: {
          50: "#fefff0",
          100: "#fdffd6",
          200: "#f5f7a8",
          300: "#e8ec74",
          400: "#d4da4a",
          DEFAULT: "#c8d44e",
          500: "#bbc63a",
          600: "#a3ad2e",
          700: "#838a24",
          800: "#636820",
          900: "#4a4e1c",
          foreground: "#1a2332",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "slide-hero": {
          "0%, 30%": { opacity: "1" },
          "33%, 97%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-15px) rotate(180deg)" },
        },
        shine: {
          "0%": { transform: "translateX(-100%) translateY(-100%) rotate(45deg)" },
          "100%": { transform: "translateX(100%) translateY(100%) rotate(45deg)" },
        },
        pulse: {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(15, 95, 58, 0.4)" },
          "50%": { transform: "scale(1.05)", boxShadow: "0 0 0 10px rgba(15, 95, 58, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 30s linear infinite",
        "slide-hero": "slide-hero 12s infinite",
        float: "float 3s ease-in-out infinite",
        "float-delayed": "float-delayed 4s ease-in-out infinite",
        "pulse-slow": "pulse 2.5s infinite",
        "shine-once": "shine 1.5s ease-in-out",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        top: "0 -4px 12px -1px rgba(0,0,0,0.05), 0 -2px 8px -1px rgba(0,0,0,0.03)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
