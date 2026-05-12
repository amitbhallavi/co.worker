/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Professional light theme palette
        'primary': '#0f172a',      // Deep navy blue
        'secondary': '#1e293b',    // Slate
        'accent': '#0ea5e9',       // Sky blue
        'accent-dark': '#0284c7',  // Darker sky blue
        'background': '#ffffff',   // Pure white
        'surface': '#f8fafc',      // Light slate
        'surface-alt': '#f1f5f9',  // Lighter slate
        'text': '#0f172a',         // Primary text
        'text-secondary': '#475569', // Secondary text
        'text-muted': '#64748b',   // Muted text
        'border': '#e2e8f0',       // Light border
        'border-dark': '#cbd5e1',  // Darker border
        'success': '#10b981',      // Green
        'warning': '#f59e0b',      // Amber
        'error': '#ef4444',        // Red
        'info': '#3b82f6',         // Blue
      },
      backgroundColor: {
        'primary-light': '#f0f9ff',
        'success-light': '#ecfdf5',
        'warning-light': '#fffbeb',
        'error-light': '#fef2f2',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.12)',
        'elevated': '0 8px 16px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'brand': '12px',
        'button': '8px',
        'input': '10px',
      },
      spacing: {
        'brand-padding': '1.25rem',
        'brand-gap': '1rem',
      },
    },
  },
  plugins: [],
}
