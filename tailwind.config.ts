// tailwind.config.ts
import { Config } from 'tailwindcss';
import daisyui from 'daisyui';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B3D2E',
        secondary: '#1ABC9C',
        accent: '#2E8B57',
        neutral: '#F4F6F6',
        base100: '#FFFFFF',
        info: '#2094f3',
        success: '#009485',
        warning: '#ff9900',
        error: '#ff5724',
      },
      fontFamily: {
        sans: ['HelveticaNowText-Thin', 'sans-serif'],
      },
      backgroundImage: {
        'homepage-main': "url('/public/HomePage-Main.png')",
        'abstract-1': "url('/public/abstract-1.jpg')",
        'abstract-2': "url('/public/abstract-2.jpg')",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#0B3D2E',
          secondary: '#1ABC9C',
          accent: '#2E8B57',
          neutral: '#F4F6F6',
          'base-100': '#FFFFFF',
          info: '#2094f3',
          success: '#009485',
          warning: '#ff9900',
          error: '#ff5724',
        },
      },
    ],
  },
};

export default config;
