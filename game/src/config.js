// Every number and name the kitchen runs on: the room, the stations, the
// ingredients, the recipes, the timers and the scoring. Nothing here is read
// from anywhere else, so the game is the same on any machine.
export const STEP = 1 / 60;
export const VIEW = { width: 1280, height: 720 };
export const DAY_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_HANDS = 2;
export const MAX_ORDERS = 3;
export const PLATE_SLOTS = 3;

// The floor the chef walks on: the stations ring it, the middle stays open.
// The HUD strip takes y 0..76; the top bins sit just under it.
export const FLOOR = { x: 140, y: 164, width: 1000, height: 432 };

// Stations are rectangles the chef cannot walk through. `at` is the point the
// chef walks to in order to use one; `reach` is how close that point must be.
export const STATIONS = {
  binTomato: { kind: 'bin', item: 'tomato', label: 'Tomato', x: 16, y: 180, w: 112, h: 84, at: [150, 222], reach: 46 },
  binLettuce: { kind: 'bin', item: 'lettuce', label: 'Lettuce', x: 16, y: 280, w: 112, h: 84, at: [150, 322], reach: 46 },
  binOnion: { kind: 'bin', item: 'onion', label: 'Onion', x: 16, y: 380, w: 112, h: 84, at: [150, 422], reach: 46 },
  binMushroom: { kind: 'bin', item: 'mushroom', label: 'Mushroom', x: 16, y: 480, w: 112, h: 84, at: [150, 522], reach: 46 },
  binPatty: { kind: 'bin', item: 'patty', label: 'Patty', x: 420, y: 84, w: 112, h: 64, at: [476, 172], reach: 46 },
  binBun: { kind: 'bin', item: 'bun', label: 'Bun', x: 548, y: 84, w: 112, h: 64, at: [604, 172], reach: 46 },
  binPasta: { kind: 'bin', item: 'pasta', label: 'Pasta', x: 676, y: 84, w: 112, h: 64, at: [732, 172], reach: 46 },
  binCheese: { kind: 'bin', item: 'cheese', label: 'Cheese', x: 804, y: 84, w: 112, h: 64, at: [860, 172], reach: 46 },
  board: { kind: 'board', label: 'Chopping board', x: 1152, y: 180, w: 112, h: 120, at: [1130, 240], reach: 48 },
  stove: { kind: 'stove', label: 'Stove', x: 1152, y: 340, w: 112, h: 180, at: [1130, 430], reach: 48 },
  plate: { kind: 'plate', label: 'Plating counter', x: 420, y: 604, w: 440, h: 84, at: [640, 580], reach: 48 },
  serve: { kind: 'serve', label: 'Serve window', x: 940, y: 604, w: 300, h: 84, at: [1090, 580], reach: 48 },
  trash: { kind: 'trash', label: 'Trash', x: 16, y: 604, w: 112, h: 84, at: [150, 580], reach: 46 },
};

// What each ingredient is and what it becomes. `prep` is the step that turns
// the raw item into a servable one; `needs` is the station kind that does it.
export const INGREDIENTS = {
  tomato: { name: 'Tomato', prep: 'chop', color: '#e4572e', chopColor: '#ef6f4a' },
  lettuce: { name: 'Lettuce', prep: 'chop', color: '#5da271', chopColor: '#7cbf8f' },
  onion: { name: 'Onion', prep: 'chop', color: '#b388c7', chopColor: '#cdb3dd' },
  mushroom: { name: 'Mushroom', prep: 'both', color: '#a9713f', chopColor: '#c08a52' },
  patty: { name: 'Patty', prep: 'cook', color: '#7a4a2b', chopColor: '#8f5a34' },
  bun: { name: 'Bun', prep: 'none', color: '#e8b25f', chopColor: '#e8b25f' },
  pasta: { name: 'Pasta', prep: 'cook', color: '#f2c94c', chopColor: '#e8b93a' },
  cheese: { name: 'Cheese', prep: 'none', color: '#f7d154', chopColor: '#f7d154' },
};

// A servable component is an ingredient in its finished state: 'chopped',
// 'cooked', or 'plain' for items that need no prep. `label` is what the
// order ticket shows.
export function componentLabel(component) {
  const ingredient = INGREDIENTS[component.id];
  if (component.state === 'chopped') return `Chopped ${ingredient.name}`;
  if (component.state === 'cooked') return `Cooked ${ingredient.name}`;
  if (component.state === 'burnt') return `Burnt ${ingredient.name}`;
  return ingredient.name;
}

export function finishedState(id) {
  const prep = INGREDIENTS[id].prep;
  if (prep === 'chop') return 'chopped';
  if (prep === 'cook') return 'cooked';
  return 'plain';
}

export const RECIPES = [
  {
    id: 'salad',
    name: 'Garden Salad',
    price: 12,
    needs: [
      { id: 'tomato', state: 'chopped' },
      { id: 'lettuce', state: 'chopped' },
    ],
  },
  {
    id: 'burger',
    name: 'Classic Burger',
    price: 18,
    needs: [
      { id: 'bun', state: 'plain' },
      { id: 'patty', state: 'cooked' },
      { id: 'lettuce', state: 'chopped' },
    ],
  },
  {
    id: 'pasta',
    name: 'Tomato Pasta',
    price: 16,
    needs: [
      { id: 'pasta', state: 'cooked' },
      { id: 'tomato', state: 'chopped' },
    ],
  },
  {
    id: 'melt',
    name: 'Mushroom Melt',
    price: 15,
    needs: [
      { id: 'bun', state: 'plain' },
      { id: 'mushroom', state: 'cooked' },
      { id: 'cheese', state: 'plain' },
    ],
  },
  {
    id: 'skillet',
    name: 'Garden Skillet',
    price: 17,
    needs: [
      { id: 'onion', state: 'chopped' },
      { id: 'mushroom', state: 'chopped' },
      { id: 'cheese', state: 'plain' },
    ],
  },
];

export const CHOP_SECONDS = 1.4;
export const COOK_SECONDS = 3.0;
export const BURN_SECONDS = 7.0;
export const ORDER_SECONDS = 50;
export const ORDER_SPAWN_SECONDS = 14;
export const CHEF_SPEED = 250;
export const CHEF_RADIUS = 20;

export const BEST_KEY = 'sizzle-station-best';
export const LIVES = MAX_HEARTS;
