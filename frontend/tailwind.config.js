/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3ABEF9',
        primaryHover: '#1EA7E1',
        darkBg: '#0B1220',
        bgLight: '#F9FAFB',
        textMain: '#111827',
        textSub: '#6B7280',
        textMuted: '#9CA3AF',
        textOnDark: '#E5E7EB',
        textMutedDark: '#94A3B8',
        borderLight: '#E5E7EB',
        borderDark: '#1F2937',
        focusRing: '#3ABEF9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
