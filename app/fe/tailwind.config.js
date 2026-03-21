/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors (As per Section 2.1 in Plan)
        skyBlue: "#4DA8FF",
        sunshineYellow: "#FFD234",
        coralRed: "#FF6B6B",

        // Backgrounds
        snowWhite: "#F8FAFC",
        softCream: "#FFF9ED",
        deepNavy: "#0F172A",

        // Secondary / Accents
        mintGreen: "#34D399",
        lavenderPurple: "#A78BFA",
        warmOrange: "#FB923C",

        // Rarity Colors
        rarity: {
          common: "#94A3B8",
          uncommon: "#22C55E",
          rare: "#3B82F6",
          epic: "#A855F7",
          legendary: "#F59E0B",
        },

        // Language specific
        lang: {
          vi: "#0F172A", // Navy
          en: "#3B82F6", // Blue
          zh: "#22C55E", // Green
        }
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        sans: ["'Be Vietnam Pro'", "Outfit", "system-ui", "sans-serif"],
        playful: ["Nunito", "sans-serif"],
      },
      borderRadius: {
        'button': '16px',
        'card': '24px',
      },
      boxShadow: {
        'level-1': '0 1px 3px rgba(0,0,0,0.08)',
        'level-2': '0 4px 12px rgba(0,0,0,0.1)',
        'level-3': '0 8px 24px rgba(0,0,0,0.15)',
        'rarity-glow': '0 0 25px currentColor', // Dynamic glow
      }
    },
  },
  plugins: [],
}
