/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Sampled from the cover of "My Forgiveness Story" — moss ground,
        // aqua title. brand-600 is the lightest step that clears 4.5:1 on
        // both white and ink-50; brand-500 is decorative / dark-ground only.
        brand: {
          50: '#F0F7F4',
          100: '#DCEDE7',
          200: '#BADCD0',
          300: '#9CD3C4', // aqua — accent on dark
          400: '#6FB49F',
          500: '#4E9683', // 3.49:1 on white — never body text on light
          600: '#3A7566', // buttons, links
          700: '#2F6154',
          800: '#1F463C',
          900: '#17332C', // moss
          950: '#0E211C',
        },
        ink: {
          50: '#F4F2EC', // paper-warm
          100: '#EAE8E1', // paper
          200: '#D5D2C9',
          300: '#B0ADA4',
          400: '#85837B',
          500: '#62615A',
          600: '#4A4944',
          700: '#343732',
          800: '#242926',
          900: '#1C2220',
          950: '#121615', // ink
        },
        // The one mockup colour with no existing token: the "on the way" status.
        // sky-700 is 5.9:1 on ink-50, so it clears AA as pill text.
        sky: {
          100: '#DCE8F0',
          600: '#2F6690',
          700: '#265A7E',
        },
      },
      borderRadius: {
        // Editorial radii. Deliberately additive: existing rounded-lg/xl/2xl
        // usages across the other pages are left untouched.
        edge: '2px',
        card: '3px',
      },
      transitionTimingFunction: {
        ease: 'cubic-bezier(.22,.61,.36,1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
