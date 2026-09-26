/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#080C14",
        surface: "#0F172A",
        surfaceBorder: "#1E293B",
        primary: {
          DEFAULT: "#10B981",
          hover: "#059669",
          muted: "rgba(16, 185, 129, 0.1)"
        },
        cyber: {
          blue: "#38BDF8",
          amber: "#F59E0B",
          rose: "#F43F5E",
          violet: "#A855F7"
        }
      }
    }
  },
  plugins: []
};
