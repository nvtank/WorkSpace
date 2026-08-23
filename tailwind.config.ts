import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          deep: "var(--primary-deep)",
          press: "var(--primary-press)",
          tint: "var(--primary-tint)",
          foreground: "var(--on-primary)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          mute: "var(--ink-mute)",
        },
        link: {
          DEFAULT: "var(--link-blue)",
          hover: "var(--link-hover)",
        },
        canvas: {
          DEFAULT: "var(--canvas)",
          cream: "var(--canvas-cream)",
          lavender: "var(--canvas-lavender)",
        },
        surface: {
          DEFAULT: "var(--surface-elev)",
          aubergine: "var(--surface-aubergine)",
          elev: "var(--surface-elev)",
        },
        hairline: {
          DEFAULT: "var(--hairline)",
          strong: "var(--hairline-strong)",
        },
        semantic: {
          error: "var(--semantic-error)",
          success: "var(--semantic-success)",
        },
        aubergine: {
          mute: "var(--on-aubergine-mute)",
        },
        category: {
          aubergine: "#4a154b",
          peach: "#F0A875",
          dustyGreen: "#8CA88A",
          lavender: "#9B7EBD",
          sand: "#D9A441",
          dustyBlue: "#6E93B5",
        },
        // shadcn compatibility mapping
        background: "var(--canvas)",
        foreground: "var(--ink)",
        card: {
          DEFAULT: "var(--surface-elev)",
          foreground: "var(--ink)",
        },
        popover: {
          DEFAULT: "var(--surface-elev)",
          foreground: "var(--ink)",
        },
        muted: {
          DEFAULT: "var(--canvas-lavender)",
          foreground: "var(--ink-mute)",
        },
        accent: {
          DEFAULT: "var(--canvas-lavender)",
          foreground: "var(--primary)",
        },
        destructive: {
          DEFAULT: "var(--semantic-error)",
          foreground: "#ffffff",
        },
        border: "var(--hairline)",
        input: "var(--hairline)",
        ring: "var(--primary)",
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        xxl: "48px",
        pill: "90px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      boxShadow: {
        elevation1: "0 5px 20px 0 rgba(0, 0, 0, 0.1)",
        elevation2: "0 0 32px 0 rgba(0, 0, 0, 0.1)",
        elevation3: "0 1px 10px 0 rgba(0, 0, 0, 0.2)",
        elevation4: "inset 0 0 0 1px rgb(97, 31, 105)",
      },
    },
  },
  plugins: [],
};

export default config;
