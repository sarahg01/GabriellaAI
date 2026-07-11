/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens — elegant rose / wine / rose-gold palette
        ink: "#3D1B2E", // deep wine-plum, primary text & dark surfaces
        paper: "#FBF1EF", // soft blush-cream canvas background
        card: "#FFFBFA", // near-white blush card surface
        amber: "#B76E79", // rose gold — primary accent, links, buttons, active states
        clay: "#8C3B4E", // deep raspberry — secondary accent, "hot" / click indicators
        mist: "#EAD9DD", // dusty rose — borders, dividers, quiet UI
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
