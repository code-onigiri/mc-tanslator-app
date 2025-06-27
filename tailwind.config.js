module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#2563eb",
          "secondary": "#fbbf24",
          "accent": "#10b981",
          "neutral": "#374151",
          "base-100": "#f3f4f6",
          "info": "#0ea5e9",
          "success": "#22c55e",
          "warning": "#f59e42",
          "error": "#ef4444",
          "rounded-box": "1rem",
          "rounded-btn": "0.5rem",
          "fontFamily": "Inter, sans-serif"
        },
      },
      "light",
      "dark",
    ],
  },
};
