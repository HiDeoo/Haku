const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/pages/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}', './src/styles/**/*.css'],
  theme: {
    // We cannot extend the default theme to add a smaller breakpoint as they need to be sorted from smallest to largest
    // in order to work as expected with a min-width breakpoint system
    screens: {
      xs: '481px',
      ...defaultTheme.screens,
    },
    extend: {
      animation: {
        'bounce-in': 'bounceIn 300ms cubic-bezier(0.55, 1.15, 0.35, 1.15)',
        'bounce-out': 'bounceOut 250ms cubic-bezier(0.55, 1.15, 0.35, 1.15)',
        dash: 'dash 1.5s ease-in-out infinite',
        'drop-in': 'dropIn 250ms ease-out',
        'drop-out': 'dropOut 200ms ease-in',
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-out': 'fadeOut 200ms ease-in',
        'spin-slow': 'spin 2s linear infinite',
        'scale-in': 'scaleIn 250ms ease-out',
        'scale-out': 'scaleOut 150ms ease-in',
        'slide-in': 'slideIn 250ms ease-out',
        'slide-out': 'slideOut 200ms ease-in',
        'swipe-in': 'swipeIn 250ms ease-out',
        'swipe-out': 'swipeOut 200ms ease-in',
      },
      keyframes: {
        bounceIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.5)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        bounceOut: {
          '0%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '100%': {
            opacity: '0',
            transform: 'scale(0.5)',
          },
        },
        dash: {
          '0%': {
            'stroke-dasharray': '1, 150',
            'stroke-dashoffset': '0',
          },
          '50%': {
            'stroke-dasharray': '90, 150',
            'stroke-dashoffset': '-35',
          },
          '100%': {
            'stroke-dasharray': '90, 150',
            'stroke-dashoffset': '-124',
          },
        },
        dropIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-50%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0%)',
          },
        },
        dropOut: {
          '0%': {
            opacity: '1',
            transform: 'translateY(0%)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(-50%)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        fadeOut: {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.8)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        scaleOut: {
          '0%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '100%': {
            opacity: '0',
            transform: 'scale(0.8)',
          },
        },
        slideIn: {
          '0%': {
            opacity: '0',
            transform: 'scaleY(0)',
          },
          '100%': {
            opacity: '1',
            transform: 'scaleY(1)',
          },
        },
        slideOut: {
          '0%': {
            opacity: '1',
            transform: 'scaleY(1)',
          },
          '100%': {
            opacity: '0',
            transform: 'scaleY(0)',
          },
        },
        swipeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateX(100%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        swipeOut: {
          '0%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(100%)',
          },
        },
      },
      screens: {
        'input-hover': { raw: '(hover: hover)' },
        pwa: { raw: '(display-mode: standalone)' },
      },
    },
  },
  plugins: [],
}
