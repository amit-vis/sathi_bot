/** @type {import('tailwindcss').Config} */


const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // BizNest brand colors — className me seedha use karo, e.g. bg-primary, text-muted
      colors: {
        base: "#0E1116",       // background base
        "base-top": "#141826", // gradient top shade
        surface: "#181C24",    // card / input bg
        "surface-2": "#20242E",// halka lift (OTP box)
        line: "#2A2F3A",       // subtle borders
        primary: "#7C5CFC",    // violet accent
        gold: "#D9A54B",       // secondary accent
        whatsapp: "#25D366",   // WhatsApp green
        ink: "#F2F3F5",        // primary text
        muted: "#8B93A1",      // muted text
      },
      // Glow effects — shadow-glow-violet, shadow-glow-green, shadow-glow-white
      boxShadow: {
  "glow-violet": "inset 0 1px 0 rgba(255,255,255,0.9), 0 0 24px rgba(124, 92, 252, 0.55)",
  "glow-green": "inset 0 1px 0 rgba(255,255,255,0.5), 0 0 30px 2px rgba(37,211,102,0.55)",
  "glow-white": "inset 0 1px 0 rgba(255,255,255,0.9), 0 0 22px rgba(255,255,255,0.35)",
},
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
