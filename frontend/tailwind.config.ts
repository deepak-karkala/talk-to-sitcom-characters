// frontend/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: { // Optional: if specific shades are needed
        'brand-primary': '#007bff', // Example
        'chat-bg-light': '#f8f9fa',
        'chat-bg-dark': '#1a202c', // A darker gray
        'input-bg-dark': '#2d3748', // A slightly lighter gray for input bar in dark mode
      },
      boxShadow: {
        'soft-lift-up': '0 -6px 18px -4px rgba(0, 0, 0, 0.1), 0 -4px 12px -4px rgba(0, 0, 0, 0.06)',
        // Previous 'up-md' might be removed if not used elsewhere
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
