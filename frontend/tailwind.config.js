/** @type {import('tailwindcss').Config} */
// Colours, fonts, radii and shadows all read the Whisker & Brew UI kit's CSS
// variables (src/ui-kit/whisker.css), so `bg-cream` and `.wb-btn` share one source.
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: 'var(--cream)', pressed: 'var(--cream-pressed)' },
        panel: 'var(--panel)',
        olive: {
          DEFAULT: 'var(--olive)',
          strong: 'var(--olive-strong)',
          dark: 'var(--olive-dark)',
          soft: 'var(--olive-soft)',
        },
        charcoal: 'var(--charcoal)',
        muted: 'var(--ink-muted)',
        ginger: { DEFAULT: 'var(--ginger)', ink: 'var(--ginger-ink)', soft: 'var(--ginger-soft)' },
        danger: { DEFAULT: 'var(--danger)', soft: 'var(--danger-soft)' },
        line: 'var(--line)',
        'paw-faint': 'var(--paw-faint)',
        disabled: { DEFAULT: 'var(--disabled)', ink: 'var(--disabled-ink)' },
      },
      fontFamily: {
        display: 'var(--font-display)',
        sans: 'var(--font-body)',
        script: 'var(--font-script)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-pill)',
      },
      boxShadow: { lift: 'var(--shadow-lift)', sheet: 'var(--shadow-sheet)' },
    },
  },
  plugins: [],
};
