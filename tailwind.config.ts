/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens — see DESIGN.md
        ink: "#15302B", // deep teal-black, primary text & dark surfaces
        paper: "#E9E4D8", // warm stone canvas background
        card: "#F6F2E9", // lighter card surface on the canvas
        amber: "#C8862B", // primary accent — links, buttons, active states
        clay: "#BB4D32", // secondary accent — "hot" / click indicators
        mist: "#CFCABC", // borders, dividers, quiet UI
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
