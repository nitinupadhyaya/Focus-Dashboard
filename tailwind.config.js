/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",       // App Router pages
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",     // Optional Pages Router
    "./components/**/*.{js,ts,jsx,tsx,mdx}",// Reusable components
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        serif: ["Merriweather", "ui-serif", "Georgia"],
      },

      // 🎨 Unified Color System
      colors: {
        // Light mode: pastel and calm
        background: "#FAFAFA",
        "bg-2": "#F5F3FF",
        primary: "#4C51BF",        // Indigo
        accent: "#F6AD55",         // Warm amber
        foreground: "#1A202C",     // Text color

        // Dark mode: rich gradient tones
        dark: {
          background: "#000000",   // True black base
          "bg-2": "#0a192f",       // Deep indigo blue
          primary: "#60A5FA",      // Soft blue highlight
          accent: "#FCDAB7",       // Warm peach glow
          foreground: "#E2E8F0",   // Light gray text
        },
      },

      // 🌅 Gradients for backgrounds
      backgroundImage: {
        "light-gradient": "linear-gradient(to bottom right, #ffffff, #f9fafb)",
        "dark-gradient": "linear-gradient(to bottom right, #000000, #0a192f)",
      },

      // 🌬️ Breathing Glow Animation (soft pulsing background)
      keyframes: {
        "breathing-glow": {
          "0%, 100%": {
            background:
              "radial-gradient(circle at 50% 50%, rgba(99, 179, 237, 0.12), transparent 70%)",
            transform: "scale(1)",
            filter: "brightness(1)",
          },
          "50%": {
            background:
              "radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.25), transparent 70%)",
            transform: "scale(1.03)",
            filter: "brightness(1.1)",
          },
        },
      },
      animation: {
        "breathing-glow": "breathing-glow 10s ease-in-out infinite",
      },

      // 🪶 Typography for both themes
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: theme("colors.foreground"),
            a: {
              color: theme("colors.primary"),
              textDecoration: "underline",
            },
            code: {
              backgroundColor: theme("colors.gray.100"),
              padding: "2px 4px",
              borderRadius: "4px",
              fontSize: "0.875em",
            },
            pre: {
              backgroundColor: theme("colors.gray.900"),
              color: theme("colors.gray.100"),
              padding: "1rem",
              borderRadius: "0.5rem",
              overflowX: "auto",
            },
            blockquote: {
              borderLeftColor: theme("colors.primary"),
              color: theme("colors.gray.700"),
            },
          },
        },
        dark: {
          css: {
            color: theme("colors.dark.foreground"),
            a: { color: theme("colors.dark.accent") },
            code: { backgroundColor: theme("colors.dark.bg-2") },
            pre: { backgroundColor: theme("colors.dark.bg-2") },
            blockquote: { borderLeftColor: theme("colors.dark.accent") },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
