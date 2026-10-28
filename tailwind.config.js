/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F8FAFC',
          dark: '#F1F5F9',
          subtle: '#F8FAFC',
          white: '#FFFFFF',
          banner: '#F4F7FE',
        },
        ink: {
          DEFAULT: '#1E293B',
          muted: '#64748B',
          faint: '#94A3B8',
        },
        brand: {
          DEFAULT: '#1D63FF',
          blue: '#1D63FF',
          'blue-hover': '#1550D6',
          'blue-light': '#EBF2FF',
          orange: '#1D63FF',
          'orange-hover': '#1550D6',
          'orange-light': '#EBF2FF',
          green: '#22C55E',
          'green-track': '#DCFCE7',
          coral: '#FF6B6B',
        },
        pastel: {
          blue: {
            bg: '#EAF2FF',
            accent: '#CFE2FF',
            text: '#1D63FF',
          },
          yellow: {
            bg: '#FFFBEB',
            accent: '#FEF0C7',
            text: '#D97706',
          },
          green: {
            bg: '#ECFDF3',
            accent: '#D1FADF',
            text: '#059669',
          },
          pink: {
            bg: '#FFF1F2',
            accent: '#FFE4E6',
            text: '#E11D48',
          },
          purple: {
            bg: '#F3E8FF',
            accent: '#E9D5FF',
            text: '#7C3AED',
          },
        },
        grid: {
          border: '#E2E8F0',
          line: '#EDF2F7',
        }
      },
      fontFamily: {
        tech: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        code: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'brutal': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'brutal-lg': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'brutal-orange': '0 4px 12px -2px rgba(29, 99, 255, 0.2)',
        'donut': '0 10px 25px -5px rgba(29, 99, 255, 0.15)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.03)',
      }
    },
  },
  plugins: [],
}
