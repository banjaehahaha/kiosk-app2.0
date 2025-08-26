import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#F8D1E7',
          300: '#F8D1E7',
          400: '#F8D1E7',
          500: '#F8D1E7',
          600: '#F8D1E7',
          700: '#F8D1E7',
          800: '#F8D1E7',
          900: '#F8D1E7',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        'd2coding': ['D2Coding', 'monospace'],
        'd2coding-bold': ['D2Coding-Bold', 'monospace'],
        'pretendard': ['Pretendard', 'sans-serif'],
        'pretendard-semibold': ['Pretendard-SemiBold', 'sans-serif'],
        'exmouth': ['Exmouth', 'serif'], // Exmouth 폰트 추가
      },
      screens: {
        'kiosk': '1024px', // 키오스크 해상도에 맞춤
      },
      animation: {
        'bounce-x': 'bounceX 1s infinite',
        'shine': 'shine 2s ease-in-out infinite',
      },
      keyframes: {
        bounceX: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(25px)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%) skewX(-12deg)' },
          '100%': { transform: 'translateX(200%) skewX(-12deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
