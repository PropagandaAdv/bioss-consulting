import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#005291",
        accent: "#88BC19",
        neutral: "#586571",
        surface: "#F4F6F8",
        white: "#FFFFFF",
        // Testo su fondo verde: il blu primary sul verde arriva a 3,5:1, questo a oltre 7:1.
        ink: "#0B2239",
      },
      fontFamily: { sans: ["var(--font-montserrat)", "system-ui", "sans-serif"] },
      boxShadow: {
        soft: "0 30px 80px -30px rgba(0, 82, 145, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
