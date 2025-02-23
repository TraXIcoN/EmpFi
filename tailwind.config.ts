import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        garamond: ["EB Garamond", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "wave-slow": "wave 8s ease-in-out infinite",
        "wave-medium": "wave 6s ease-in-out infinite",
        "wave-fast": "wave 4s ease-in-out infinite",
      },
      keyframes: {
        wave: {
          "0%, 100%": {
            transform: "translateX(-50%) translateY(-50%) rotate(0deg)",
          },
          "50%": {
            transform: "translateX(50%) translateY(-50%) rotate(180deg)",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
