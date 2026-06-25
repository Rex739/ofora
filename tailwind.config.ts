import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ofora: {
          green: "#0B5D3B",
          deep: "#063524",
          lime: "#E7F5B8",
          verify: "#20A66A",
          mist: "#EAF5EE",
          canvas: "#FAFCFA",
          ink: "#14231C",
          border: "#E5E9E6",
          muted: "#66756D",
          soft: "#F5F7F6"
        }
      },
      boxShadow: {
        panel: "0 16px 48px rgba(20, 35, 28, 0.08)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
