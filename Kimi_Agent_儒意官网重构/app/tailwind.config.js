/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Confucian palette
        ink: {
          DEFAULT: '#0A0A0A',
          light: '#1A1A1A',
          lighter: '#2C2C2C',
        },
        paper: {
          DEFAULT: '#E8E4DC',
          dark: '#D5CFC6',
        },
        mist: '#F5F2EB',
        stone: '#8A8580',
        cinnabar: {
          DEFAULT: '#8B1A1A',
          light: '#A62D2D',
        },
        gold: '#9C8458',
        // shadcn overrides
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
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
      fontFamily: {
        display: ['"Playfair Display"', 'Times New Roman', 'serif'],
        serif: ['"Noto Serif SC"', 'Songti SC', 'SimSun', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        sm: "0 1px 2px rgba(0,0,0,0.3)",
        md: "0 4px 12px rgba(0,0,0,0.4)",
        lg: "0 8px 30px rgba(0,0,0,0.5)",
        'glow-cinnabar': "0 0 20px rgba(139,26,26,0.3)",
      },
      letterSpacing: {
        'display': '0.02em',
        'heading': '0.03em',
        'body': '0.04em',
        'caption': '0.08em',
        'overline': '0.2em',
      },
      lineHeight: {
        'display': '1.0',
        'heading': '1.2',
        'body': '1.75',
        'caption': '1.5',
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "page-enter": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "page-exit": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(-12px)" },
        },
        "fade-rise": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "ink-wipe": {
          from: { transform: "scaleX(0)", transformOrigin: "left" },
          to: { transform: "scaleX(1)", transformOrigin: "left" },
        },
        "char-reveal": {
          from: { opacity: "0", transform: "translateY(20px) rotateX(-40deg)" },
          to: { opacity: "1", transform: "translateY(0) rotateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "page-enter": "page-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "page-exit": "page-exit 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards",
        "fade-rise": "fade-rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "ink-wipe": "ink-wipe 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "char-reveal": "char-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
