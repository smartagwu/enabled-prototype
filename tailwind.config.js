import plugin from 'tailwindcss/plugin'

// Slate, page and surface colours read CSS variables (defined in src/index.css) so the dark theme and
// high-contrast mode can re-map them without touching every component.
const cssVar = (name) => `rgb(var(--${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        page: cssVar('page'),
        surface: cssVar('surface'),
        slate: {
          50: cssVar('slate-50'),
          100: cssVar('slate-100'),
          200: cssVar('slate-200'),
          300: cssVar('slate-300'),
          400: cssVar('slate-400'),
          500: cssVar('slate-500'),
          600: cssVar('slate-600'),
          700: cssVar('slate-700'),
          800: cssVar('slate-800'),
          900: cssVar('slate-900'),
        },
        brand: {
          50: '#eef4ff',
          100: '#dbe6fe',
          200: '#bfd4fe',
          300: '#93b6fd',
          400: '#608ffa',
          500: '#3b68f5',
          600: '#2547e9',
          700: '#1f37d1',
          800: '#212fa8',
          900: '#202d84',
        },
      },
    },
  },
  plugins: [
    // Variants driven by the display preferences stored as data-* attributes on <html>.
    plugin(({ addVariant }) => {
      addVariant('scaled', 'html:is([data-text-size="125"], [data-text-size="150"]) &')
      addVariant('large', 'html[data-text-size="150"] &')
    }),
  ],
}
