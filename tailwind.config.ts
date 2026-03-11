import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'ring-glow': 'ring-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'ring-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(129, 140, 248, 0.2)' },
          '50%': { boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
