// ─── Menu Mock Data ───────────────────────────────────────────────────────────
// Offline-demo menu (mirrors `python manage.py seed_cat_cafe`). Each category
// has a kit doodle that stands in for missing photos.

export const MENU_CATEGORIES = [
  'Purr-over Coffee',
  'Tea & Mew-lk',
  'Pawstries & Bakes',
  'Meals Fur-real',
  'Cool Cat Drinks',
  'Kitten Treats',
];

export const CATEGORY_META = {
  'Purr-over Coffee':  { doodle: 'steaming-cup' },
  'Tea & Mew-lk':      { doodle: 'leaf' },
  'Pawstries & Bakes': { doodle: 'sparkle' },
  'Meals Fur-real':    { doodle: 'fish-bone' },
  'Cool Cat Drinks':   { doodle: 'dot' },
  'Kitten Treats':     { doodle: 'toy-mouse' },
};

export const doodleFor = (category) => CATEGORY_META[category]?.doodle ?? 'steaming-cup';

let _nextId = 100;
export const getNextId = () => ++_nextId;

const item = (id, category, name, description, price, dietaryTags = [], extra = {}) => ({
  id,
  name,
  description,
  category,
  price,
  available: true,
  image: null,
  dietaryTags,
  isFeatured: false,
  recommendedBy: null,
  ...extra,
});

export const initialMenuData = [
  item(1, 'Purr-over Coffee', 'Catpuccino', 'Double shot, velvety foam and a cocoa paw on top.', 280, ['veg', 'contains_dairy'], { isFeatured: true, recommendedBy: 'Momo' }),
  item(2, 'Purr-over Coffee', 'Black Cat Americano', 'Double espresso topped up with hot water.', 220, ['vegan']),
  item(3, 'Purr-over Coffee', 'Flat Whisker', 'Ristretto with a thin layer of steamed milk.', 300, ['veg', 'contains_dairy']),
  item(4, 'Purr-over Coffee', 'Mew-cha', 'Espresso, dark chocolate and steamed milk.', 330, ['veg', 'contains_dairy']),
  item(5, 'Tea & Mew-lk', 'Purrfect Masala Chiya', 'Milky black tea with ginger, cardamom and clove.', 120, ['veg', 'contains_dairy'], { isFeatured: true, recommendedBy: 'Chiya' }),
  item(6, 'Tea & Mew-lk', 'Meow-cha Latte', 'Ceremonial matcha whisked into steamed milk.', 320, ['veg', 'contains_dairy']),
  item(7, 'Tea & Mew-lk', 'Ilam Tail-tea', 'First-flush Ilam black tea, no milk.', 150, ['vegan', 'gluten_free']),
  item(8, 'Pawstries & Bakes', 'Whisker Waffles', 'Belgian waffle, maple syrup and whipped butter.', 380, ['veg', 'contains_dairy']),
  item(9, 'Pawstries & Bakes', 'Kitten Mitten Cookies', 'Two brown-butter chocolate chip cookies.', 180, ['veg', 'contains_dairy']),
  item(10, 'Pawstries & Bakes', 'Carrot Cake Purrsuasion', 'Spiced carrot cake with cream cheese frosting.', 320, ['veg', 'contains_nuts'], { available: false }),
  item(11, 'Meals Fur-real', 'Tuna Melt Paws', 'Toasted sourdough, tuna, cheddar and pickled onion.', 450, ['contains_dairy']),
  item(12, 'Meals Fur-real', 'Paw-ffle Fries', 'Waffle-cut fries with garlic mayo.', 250, ['veg']),
  item(13, 'Meals Fur-real', 'Chicken Momo Meow-dley', 'Ten steamed chicken momos with tomato achar.', 360),
  item(14, 'Cool Cat Drinks', 'Iced Catpuccino', 'Double shot over ice with cold milk.', 300, ['veg', 'contains_dairy']),
  item(15, 'Cool Cat Drinks', 'Mango Lassi Leap', 'Alphonso mango blended with yoghurt.', 260, ['veg', 'gluten_free']),
  item(16, 'Kitten Treats', 'Mini Mouse Pancakes', 'Three small pancakes with honey and banana.', 280, ['veg', 'contains_dairy']),
  item(17, 'Kitten Treats', 'Babycino', 'Warm frothed milk with cocoa dust. No coffee.', 100, ['veg', 'gluten_free']),
];
