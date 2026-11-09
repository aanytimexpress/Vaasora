import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F8F6F1',   // primary background
        sand: '#EEEAE2',    // secondary background
        card: '#FFFFFF',
        ink: '#25231F',     // primary text + footer
        stone: '#777168',   // secondary text
        bronze: '#9B8060',  // accent
        line: '#E6E1D8',    // borders
      },
      fontFamily: {
        sans: ['var(--font-hind)', 'var(--font-inter)', 'sans-serif'],
        'bn-serif': ['var(--font-bn-serif)', 'var(--font-hind)', 'serif'],
        display: ['var(--font-display)', 'var(--font-bn-serif)', 'serif'],
        ui: ['var(--font-inter)', 'var(--font-hind)', 'sans-serif'],
      },
      borderRadius: { DEFAULT: '2px', sm: '2px', md: '4px' },
      maxWidth: { site: '1320px' },
      letterSpacing: { brand: '0.32em' },
    },
  },
  plugins: [],
};
export default config;
