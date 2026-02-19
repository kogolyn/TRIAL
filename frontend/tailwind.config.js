/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    { pattern: /bg-(red|orange|yellow|green|blue|purple|indigo|teal|slate|gray)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-(red|orange|yellow|green|blue|purple|indigo|teal|slate|gray)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-(red|orange|yellow|green|blue|purple|indigo|teal|slate|gray)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-l-(red|orange|yellow|green|blue|purple|indigo|teal|slate|gray)-(100|200|300|400|500|600|700|800)/ },
    { pattern: /ring-(red|orange|yellow|green|blue|purple|indigo|teal|slate|gray)-(100|200|300|400|500)/ },
    "animate-pulse",
    "animate-spin",
    "tabular-nums",
    "border-l-4",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};