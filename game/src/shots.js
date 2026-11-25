// The screenshot scenes behind ?shot=start|play|rush|serve. Each one plays the
// real rules forward from a fresh world for a fixed number of steps, steered
// by a small autopilot that works the first order like a player would — pick,
// chop, cook, plate, serve — so every frame is what a short game really
// looks like, and the same seed always gives the same frame.
import { INGREDIENTS, STATIONS, STEP } from './config.js';
import { EVENT_OVER, EVENT_SERVED } from './world.js';
import { SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const BIN_FOR = {
  tomato: 'binTomato',
  lettuce: 'binLettuce',
  onion: 'binOnion',
  mushroom: 'binMushroom',
  patty: 'binPatty',
  bun: 'binBun',
  pasta: 'binPasta',
  cheese: 'binCheese',
};

function canChop(item) {
  const prep = INGREDIENTS[item.id].prep;
  return item.state === 'raw' && (prep === 'chop' || prep === 'both');
}

function canCook(item) {
  const prep = INGREDIENTS[item.id].prep;
  return item.state === 'raw' && (prep === 'cook' || prep === 'both');
}

/** Multiset difference: the recipe's needs not yet on the plate. */
function missingNeeds(order, plateItems) {
  const rest = plateItems.map((item) => `${item.id}:${item.state}`);
  const missing = [];
  for (const need of order.recipe.needs) {
    const key = `${need.id}:${need.state}`;
    const index = rest.indexOf(key);
    if (index === -1) missing.push(need);
    else rest.splice(index, 1);
  }
  return missing;
}

function plateIsSubset(plateItems, order) {
  return missingNeeds(order, plateItems).length === order.recipe.needs.length - plateItems.length
    && plateItems.length <= order.recipe.needs.length;
}

function createAutopilot(world) {
  const state = world.state;
  let target = null;

  function goTo(point) {
    // The world clears its move target when the chef arrives, so a repeated
    // visit to the same point must set it again: the cached point alone does
    // not mean the chef is still walking there.
    if (!target || target[0] !== point[0] || target[1] !== point[1] || !world.state.moveTarget) {
      target = point;
      world.setMoveTarget(point);
    }
    return { x: 0, y: 0, interact: false };
  }

  function goStation(key) {
    return goTo(STATIONS[key].at);
  }

  return {
    next() {
      if (state.over) return { x: 0, y: 0, interact: false };
      const carrying = state.chef.carrying;
      const plateItem = carrying.find((item) => item.id === 'plate');
      if (plateItem) return goStation('serve');

      // A finished plate goes to the window; a plate no order wants is trashed.
      if (carrying.length === 0 && state.plate.items.length > 0) {
        const complete = state.orders.find(
          (order) => missingNeeds(order, state.plate.items).length === 0,
        );
        if (complete) return goStation('plate');
        const wanted = state.orders.some((order) => plateIsSubset(state.plate.items, order));
        if (!wanted) return goStation('trash');
      }

      // A cooked item waiting on the stove is picked up before anything else.
      const cooked = state.burners.find((burner) => burner.item && burner.item.state === 'cooked');
      if (carrying.length === 0 && cooked) return goStation('stove');

      if (carrying.length > 0) {
        const item = carrying[carrying.length - 1];
        if (item.state === 'burnt') return goStation('trash');
        if (canChop(item)) return goStation('board');
        if (canCook(item)) return goStation('stove');
        const targetOrder = state.orders.find((order) => plateIsSubset(state.plate.items, order)) ?? state.orders[0];
        if (targetOrder) {
          const missing = missingNeeds(targetOrder, state.plate.items);
          if (missing.some((need) => need.id === item.id && need.state === item.state)) return goStation('plate');
        }
        return goStation('trash');
      }

      // Hands empty: fetch the next missing piece of the order being built.
      const targetOrder = state.orders.find((order) => plateIsSubset(state.plate.items, order)) ?? state.orders[0];
      if (!targetOrder) return goTo([640, 380]);
      const missing = missingNeeds(targetOrder, state.plate.items);
      if (missing.length === 0) return goStation('plate');
      return goStation(BIN_FOR[missing[0].id]);
    },
  };
}

/**
 * Set `world` to the named scene (start, play, rush or serve; any other name
 * is start) and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'rush' && name !== 'serve') {
    world.spawnOrder();
    world.spawnOrder();
    for (let index = 0; index < 5 / STEP; index += 1) world.step(STEP, null, true);
    return { screen: SCREEN_TITLE, best: 0 };
  }
  const pilot = createAutopilot(world);
  // Play runs long enough that the second order is mid-assembly on the plate;
  // rush runs into the late day, with three orders and a combo going.
  const limitSeconds = name === 'rush' ? 80 : name === 'serve' ? 120 : 45;
  for (let index = 0; index < limitSeconds / STEP; index += 1) {
    const events = world.step(STEP, pilot.next(), false);
    if (events & EVENT_SERVED && name === 'serve') {
      // A few more frames so the coin popup is on screen.
      for (let extra = 0; extra < 30; extra += 1) world.step(STEP, { x: 0, y: 0, interact: false }, false);
      break;
    }
    if (events & EVENT_OVER) break;
  }
  return { screen: SCREEN_PLAY, best: world.state.score };
}
