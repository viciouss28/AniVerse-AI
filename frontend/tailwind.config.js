/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#080910",
          800: "#0B0C14",
          700: "#0E101A",
        },
        surface: {
          900: "#12141F",
          800: "#161824",
          700: "#1B1D29",
          border: "#26293B",
          highlight: "#2E324A",
        },
        brand: {
          purple: "#7C3AED",
          violet: "#8B5CF6",
          lightViolet: "#A855F7",
          cyan: "#22D3EE",
        },
        appText: {
          main: "#F8FAFC",
          muted: "#94A3B8",
          dim: "#64748B",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'purple-cyan-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
        'glow-radial': 'radial-gradient(circle at 50% 30%, rgba(124, 58, 237, 0.15) 0%, rgba(34, 211, 238, 0.05) 45%, transparent 70%)',
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(124, 58, 237, 0.3)',
        'glow-cyan': '0 0 25px -5px rgba(34, 211, 238, 0.3)',
        'glow-button': '0 0 20px 0 rgba(139, 92, 246, 0.4)',
      }
    },
  },
  plugins: [],
}
