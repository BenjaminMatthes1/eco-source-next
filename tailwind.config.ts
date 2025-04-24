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
        // Each "family" name matches your @font-face definitions
        helveticaThin: ['HelveticaNowText-Thin', 'sans-serif'],
        helveticaThinItalic: ['HelveticaNowText-ThinItalic', 'sans-serif'],
        helveticaRegular: ['HelveticaNowText-Regular', 'sans-serif'],
        helveticaBold: ['HelveticaNowText-Bold', 'sans-serif'],
        helveticaLight: ['Helvetica-light', 'sans-serif'],
        geistMono: ['GeistMonoVF', 'monospace'],
        // Reddit Sans
        redditRegular: ['RedditSans-Regular', 'sans-serif'],
        redditItalic: ['RedditSans-Italic', 'sans-serif'],
        redditLight: ['RedditSans-Light', 'sans-serif'],
        redditLightItalic: ['RedditSans-LightItalic', 'sans-serif'],
        redditSemiBold: ['RedditSans-SemiBold', 'sans-serif'],
        redditSemiBoldItalic: ['RedditSans-SemiBoldItalic', 'sans-serif'],
        redditBold: ['RedditSans-Bold', 'sans-serif'],
        redditBoldItalic: ['RedditSans-BoldItalic', 'sans-serif'],
        redditExtraBold: ['RedditSans-ExtraBold', 'sans-serif'],
        redditExtraBoldItalic: ['RedditSans-ExtraBoldItalic', 'sans-serif'],
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
          base100: '#FFFFFF',
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
