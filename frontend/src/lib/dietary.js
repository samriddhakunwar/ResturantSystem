// ─── Dietary tags ─────────────────────────────────────────────────────────────
// Backend MenuItem.dietary_tags values → the Chip tone and label the kit uses.
// Meaning is always in the word, never in the colour alone.

export const DIETARY = {
  veg:            { label: 'Veg',            tone: 'veg' },
  vegan:          { label: 'Vegan',          tone: 'veg' },
  gluten_free:    { label: 'Gluten-free',    tone: 'neutral' },
  contains_nuts:  { label: 'Contains nuts',  tone: 'allergen' },
  contains_dairy: { label: 'Contains dairy', tone: 'allergen' },
};

export const DIETARY_KEYS = Object.keys(DIETARY);

/** Filter toggles on the QR menu: "No nuts" etc. exclude, the rest include. */
export const DIETARY_FILTERS = [
  { key: 'veg',     label: 'Veg',         test: (tags) => tags.includes('veg') || tags.includes('vegan') },
  { key: 'vegan',   label: 'Vegan',       test: (tags) => tags.includes('vegan') },
  { key: 'gf',      label: 'Gluten-free', test: (tags) => tags.includes('gluten_free') },
  { key: 'nonuts',  label: 'No nuts',     test: (tags) => !tags.includes('contains_nuts') },
  { key: 'nodairy', label: 'No dairy',    test: (tags) => !tags.includes('contains_dairy') },
];
