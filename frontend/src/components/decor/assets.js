// ─── UI-kit artwork ──────────────────────────────────────────────────────────
// URLs for every SVG in src/ui-kit/assets, keyed by file name without ".svg".
// The SVGs have their ink baked in; to recolour one, use a CSS mask over a
// token colour (see SocialLinks) — never edit the files.

const byName = (modules) =>
  Object.fromEntries(
    Object.entries(modules).map(([path, url]) => [path.split('/').pop().replace('.svg', ''), url]),
  );

// Options must be an inline literal — Vite ignores a variable here.
export const CATS = byName(import.meta.glob('../../ui-kit/assets/Cats/*.svg', { eager: true, import: 'default' }));
export const DOODLES = byName(import.meta.glob('../../ui-kit/assets/Doodles/*.svg', { eager: true, import: 'default' }));
export const PAWS = byName(import.meta.glob('../../ui-kit/assets/Paws/*.svg', { eager: true, import: 'default' }));
export const SOCIAL = byName(import.meta.glob('../../ui-kit/assets/Social/*.svg', { eager: true, import: 'default' }));
