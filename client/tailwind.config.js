/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Navy Dark Mode Tokens
        navy: {
          950: '#0B1020', // Dark Primary Background
          900: '#111729', // Dark Surface (Cards)
          850: '#161D31', // Dark Surface Secondary
          800: '#252D42', // Dark Border
        },
        // Primary Blue Tokens
        brand: {
          50: '#EFF5FF', // Subtle Light Blue Surface
          100: '#DBEAFE',
          400: '#6EA8FF', // Bright Blue
          500: '#4F8FEF', // Primary Blue
          600: '#4F8FEF', // Primary Blue
          700: '#3D7FE5', // Primary Blue Hover
        },
        // Warm Amber / Accent Tokens
        amber: {
          50: '#FFF7ED',
          100: '#FEF3C7',
          400: '#F2A93B', // Warm Amber
          500: '#F2A93B', // Warm Amber
          600: '#E39A2E', // Amber Hover
          700: '#C2410C',
        },
        // Text & Surface Tokens
        slate: {
          50: '#F5F7FB', // Light Background
          100: '#F1F5F9',
          200: '#DCE2EC', // Light Border
          300: '#CBD5E1',
          400: '#9AA6BC', // Dark Mode Muted Text
          500: '#64748B', // Muted Text
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#172033', // Primary Text & Deep Navy Accent
        },
        success: '#36B37E',
        danger: '#E05252',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'button': '8px',
        'input': '8px',
        'card': '14px',
        'section': '16px',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(15, 23, 42, 0.05)',
        'elevated': '0 4px 14px rgba(15, 23, 42, 0.08)',
      }
    },
  },
  plugins: [],
}
