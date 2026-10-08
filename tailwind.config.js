/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        citizen: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          brand: '#0d9488',
          sky: '#0284c7'
        },
        admin: {
          sidebar: '#0f172a',
          sidebarHover: '#1e293b',
          primary: '#1e40af',
          accent: '#2563eb',
          lightBg: '#f8fafc'
        },
        institute: {
          sidebar: '#ffffff',
          primary: '#4f46e5',
          accent: '#6366f1',
          violet: '#7c3aed',
          lightBg: '#f5f3ff'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
