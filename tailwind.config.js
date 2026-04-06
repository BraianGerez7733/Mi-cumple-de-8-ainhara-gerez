/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blush: '#FCE7F3',
        candy: '#F9A8D4',
        glam: '#EC4899',
        cream: '#FFF9FB',
        gold: '#F5D78E',
        capy: '#B08968',
        ink: '#5B4B5A',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'cursive'],
        body: ['"Nunito"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(236, 72, 153, 0.14)',
        card: '0 14px 34px rgba(91, 75, 90, 0.12)',
        glow: '0 0 0 1px rgba(245, 215, 142, 0.6), 0 18px 50px rgba(236, 72, 153, 0.18)',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top, rgba(245, 215, 142, 0.9), rgba(252, 231, 243, 0) 32%), radial-gradient(circle at 20% 20%, rgba(249, 168, 212, 0.45), rgba(252, 231, 243, 0) 30%), linear-gradient(180deg, #fff9fb 0%, #fce7f3 100%)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(8px, -10px, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        floaty: 'floaty 4.8s ease-in-out infinite',
        twinkle: 'twinkle 2.6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2.8s ease-in-out infinite',
        drift: 'drift 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
