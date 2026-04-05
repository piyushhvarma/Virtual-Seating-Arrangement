import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                aiml: {
                    brand: "#10B981",
                    "brand-light": "#67E8F9",
                    "brand-dark": "#059669",
                    purple: "#10B981",
                    "purple-light": "#10B981",
                    "purple-dark": "#059669",
                    blue: "#2563EB",
                    "blue-light": "#60A5FA",
                    cyan: "#10B981",
                    surface: "#0F0F1A",
                    card: "#161629",
                    border: "#2A2A45",
                },
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
                mono: ["var(--font-geist-mono)", "monospace"],
            },
            animation: {
                "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                float: "float 6s ease-in-out infinite",
                "gradient-shift": "gradient-shift 4s ease infinite",
                "slide-up": "slide-up 0.5s ease-out",
                shimmer: "shimmer 2s linear infinite",
            },
            keyframes: {
                "pulse-ring": {
                    "0%, 100%": { boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.7)" },
                    "50%": { boxShadow: "0 0 0 12px rgba(16, 185, 129, 0)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                "gradient-shift": {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
                "slide-up": {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
            backdropBlur: {
                xs: "2px",
            },
            boxShadow: {
                glow: "0 0 20px rgba(16, 185, 129, 0.35)",
                "glow-purple": "0 0 20px rgba(16, 185, 129, 0.35)",
                "glow-blue": "0 0 20px rgba(37, 99, 235, 0.35)",
                glass:
                    "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
                card: "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(255,255,255,0.04) inset",
            },
        },
    },
    plugins: [],
};

export default config;
