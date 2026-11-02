/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fafafa',
        foreground: '#171717',
        primary: {
          DEFAULT: '#171717',
          hover: '#333333',
        },
        secondary: {
          DEFAULT: '#737373',
        },
        accent: {
          DEFAULT: '#525252',
          hover: '#171717',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#ebebeb',
          300: '#e5e5e5',
          400: '#a8a8a8',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      boxShadow: {
        '2xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'subtle': '0 0 0 1px #00000014, 0px 2px 2px #0000000a',
        'subtle-hover': '0 0 0 1px #00000020, 0px 4px 6px #0000000f',
        'modal': '0 0 0 1px #00000014, 0px 8px 16px -4px #0000000a, 0px 24px 32px -8px #0000000f',
      },
      borderRadius: {
        'pill': '100px',
      }
    },
  },
  plugins: [],
}
