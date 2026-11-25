// KEBAB NIGHTS — menu data: wraps, salad bins, sauce bottles.
// Every wrap is a build order: one warmed pita, a count of meat carves,
// a set of salad items and exactly one sauce line.

export const INGREDIENTS = [
  { id: 'tomato',  name: 'Tomato',  key: '1', color: '#e5484d' },
  { id: 'onion',   name: 'Onion',   key: '2', color: '#e8dff2' },
  { id: 'lettuce', name: 'Lettuce', key: '3', color: '#7bc96f' },
  { id: 'chili',   name: 'Chili',   key: '4', color: '#d13438' },
  { id: 'pickles', name: 'Pickles', key: '5', color: '#4c9a52' },
];

export const SAUCES = [
  { id: 'garlic', name: 'Garlic Sauce', key: '6', color: '#f3ead8' },
  { id: 'hot',    name: 'Ember Chili',  key: '7', color: '#c22f2f' },
  { id: 'tahini', name: 'Tahini',       key: '8', color: '#d9b380' },
];

export const WRAPS = [
  {
    id: 'classic', name: 'Classic Lamb Wrap', price: 14, patience: 75,
    meat: 1, items: ['tomato', 'onion', 'lettuce'], sauce: 'garlic',
    blurb: 'The house standard since the first night market.',
  },
  {
    id: 'ember', name: 'Ember Chili Wrap', price: 16, patience: 70,
    meat: 1, items: ['chili', 'onion', 'pickles'], sauce: 'hot',
    blurb: 'For the ones who ask for extra fire by name.',
  },
  {
    id: 'garden', name: 'Garden Night Wrap', price: 15, patience: 72,
    meat: 1, items: ['lettuce', 'tomato', 'pickles'], sauce: 'tahini',
    blurb: 'Cool greens against the heat of the spit.',
  },
  {
    id: 'double', name: 'Double Carve Special', price: 21, patience: 85,
    meat: 2, items: ['tomato', 'onion'], sauce: 'garlic',
    blurb: 'Two carves off the spit, no shortcuts.',
  },
  {
    id: 'sultan', name: "Sultan's Feast", price: 26, patience: 95,
    meat: 2, items: ['tomato', 'onion', 'lettuce', 'chili', 'pickles'], sauce: 'hot',
    blurb: 'Everything on the counter, rolled tight.',
  },
];

export function ingredientById(id) {
  return INGREDIENTS.find((i) => i.id === id) || null;
}

export function sauceById(id) {
  return SAUCES.find((s) => s.id === id) || null;
}

export function wrapById(id) {
  return WRAPS.find((w) => w.id === id) || null;
}
