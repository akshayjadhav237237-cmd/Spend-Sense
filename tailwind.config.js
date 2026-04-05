/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out both',
        'slide-up': 'slideUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'scale-in': 'scaleIn 200ms ease-out both',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'shake': 'shake 300ms ease-in-out',
        'dot-bounce': 'dotBounce 1.4s ease-in-out infinite',
        'confetti-fall': 'confettiFall 1s ease-out forwards',
      },
    },
  },
  plugins: [],
}
