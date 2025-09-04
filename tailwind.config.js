/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: 'hsl(197 93% 50%)',
        primary: 'hsl(204 70% 53%)',
        secondary: 'hsl(54 75% 50%)',
        'bg-primary': 'hsl(204 84% 97%)',
        'neutral-100': 'hsl(210 40% 98%)',
        'neutral-200': 'hsl(210 40% 95%)',
        'neutral-800': 'hsl(210 40% 15%)',
        'neutral-900': 'hsl(210 40% 10%)',
        'surface-primary': 'hsl(0 0% 100%)',
      },
      borderRadius: {
        'lg': '16px',
        'md': '10px',
        'sm': '6px',
        'xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 16px hsla(0, 0%, 0%, 0.08)',
        'raised': '0 8px 24px hsla(0, 0%, 0%, 0.12)',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'xxl': '24px',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.25, 0.1, 0.25, 1.0)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.25, 0.1, 0.25, 1.0)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}