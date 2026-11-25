// The kitchen itself: the chef, the stations, the orders and the day. One fixed
// step (1/60 s) advances everything, so the same inputs always give the same
// game. The renderer only paints this state; it never changes it.
import {
  BURN_SECONDS,
  CHEF_RADIUS,
  CHEF_SPEED,
  CHOP_SECONDS,
  COOK_SECONDS,
  DAY_SECONDS,
  FLOOR,
  INGREDIENTS,
  MAX_HANDS,
  MAX_HEARTS,
  MAX_ORDERS,
  ORDER_SECONDS,
  ORDER_SPAWN_SECONDS,
  PLATE_SLOTS,
  RECIPES,
  STATIONS,
  STEP,
} from './config.js';

export const EVENT_SERVED = 1;
export const EVENT_WRONG = 2;
export const EVENT_EXPIRED = 4;
export const EVENT_OVER = 8;

const STATION_LIST = Object.entries(STATIONS).map(([key, value]) => ({ key, ...value }));

function circleHitsRect(x, y, radius, rect) {
  const nearestX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - nearestX;
  const dy = y - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

function moveCircle(state, dx, dy) {
  const chef = state.chef;
  let nextX = chef.x + dx;
  let nextY = chef.y + dy;
  nextX = Math.max(FLOOR.x + CHEF_RADIUS, Math.min(FLOOR.x + FLOOR.width - CHEF_RADIUS, nextX));
  nextY = Math.max(FLOOR.y + CHEF_RADIUS, Math.min(FLOOR.y + FLOOR.height - CHEF_RADIUS, nextY));
  // Axis-separated: slide along a station instead of sticking to its corner.
  if (!STATION_LIST.some((station) => circleHitsRect(nextX, chef.y, CHEF_RADIUS - 2, station))) chef.x = nextX;
  if (!STATION_LIST.some((station) => circleHitsRect(chef.x, nextY, CHEF_RADIUS - 2, station))) chef.y = nextY;
}

function sameComponents(a, b) {
  if (a.length !== b.length) return false;
  const rest = b.map((item) => `${item.id}:${item.state}`);
  for (const item of a) {
    const key = `${item.id}:${item.state}`;
    const index = rest.indexOf(key);
    if (index === -1) return false;
    rest.splice(index, 1);
  }
  return true;
}

export function createWorld(random) {
  const state = {
    random,
    time: 0,
    timeLeft: DAY_SECONDS,
    hearts: MAX_HEARTS,
    score: 0,
    coins: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    chef: { x: 640, y: 380, dirX: 0, dirY: 1, moving: false, carrying: [], busy: null },
    burners: [
      { item: null, t: 0 },
      { item: null, t: 0 },
    ],
    plate: { items: [] },
    orders: [],
    spawnT: 6,
    orderSeq: 0,
    popups: [],
    particles: [],
    over: false,
    flash: 0,
    shake: 0,
    moveTarget: null,
  };

  function popup(x, y, text, color) {
    state.popups.push({ x, y, text, color, t: 0, life: 1.4 });
  }

  function steam(x, y, count, color) {
    for (let i = 0; i < count; i += 1) {
      state.particles.push({
        x: x + random.range(-8, 8),
        y: y + random.range(-4, 4),
        vx: random.range(-6, 6),
        vy: random.range(-26, -14),
        t: 0,
        life: random.range(0.5, 0.9),
        color: color ?? '#ffffff',
        size: random.range(3, 7),
      });
    }
  }

  function sparkle(x, y, color) {
    for (let i = 0; i < 10; i += 1) {
      state.particles.push({
        x,
        y,
        vx: random.range(-70, 70),
        vy: random.range(-90, -20),
        t: 0,
        life: random.range(0.4, 0.8),
        color: color ?? '#ffd94d',
        size: random.range(2, 5),
      });
    }
  }

  function spawnOrder() {
    if (state.orders.length >= MAX_ORDERS) return;
    const recipe = random.pick(RECIPES);
    state.orders.push({ id: state.orderSeq + 1, recipe, t: ORDER_SECONDS });
    state.orderSeq += 1;
    const ramp = Math.max(0.62, 1 - (state.time / DAY_SECONDS) * 0.38);
    state.spawnT = ORDER_SPAWN_SECONDS * ramp * random.range(0.9, 1.1);
  }

  function nearestStation() {
    let best = null;
    let bestDistance = Infinity;
    for (const station of STATION_LIST) {
      const dx = state.chef.x - station.at[0];
      const dy = state.chef.y - station.at[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= station.reach + 16 && distance < bestDistance) {
        best = station;
        bestDistance = distance;
      }
    }
    return best;
  }

  function canChop(item) {
    const prep = INGREDIENTS[item.id].prep;
    return item.state === 'raw' && (prep === 'chop' || prep === 'both');
  }

  function canCook(item) {
    const prep = INGREDIENTS[item.id].prep;
    return item.state === 'raw' && (prep === 'cook' || prep === 'both');
  }

  function finishBusy() {
    const busy = state.chef.busy;
    if (!busy) return;
    if (busy.kind === 'chop') {
      busy.item.state = 'chopped';
      steam(state.chef.x, state.chef.y - 30, 6, '#cfe8c0');
    }
    state.chef.busy = null;
  }

  function servePlate(plateItem) {
    const plateItems = plateItem.items;
    const match = state.orders.find((order) => sameComponents(plateItems, order.recipe.needs));
    if (!match) {
      state.combo = 0;
      state.score = Math.max(0, state.score - 10);
      state.shake = 0.35;
      popup(state.chef.x, state.chef.y - 56, 'Wrong order!', '#e4572e');
      return EVENT_WRONG;
    }
    const tip = Math.round(6 * (match.t / ORDER_SECONDS));
    const earned = match.recipe.price + tip;
    state.coins += earned;
    state.score += earned * 10 + state.combo * 5;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.served += 1;
    state.orders.splice(state.orders.indexOf(match), 1);
    popup(1090, 580, `+$${earned}`, '#2f9e44');
    if (state.combo >= 2) popup(state.chef.x, state.chef.y - 56, `Combo x${state.combo}!`, '#f08c00');
    sparkle(1090, 580, '#ffd94d');
    return EVENT_SERVED;
  }

  function interact() {
    const chef = state.chef;
    if (chef.busy) return 0;
    const station = nearestStation();
    if (!station) return 0;
    const carrying = chef.carrying;

    if (station.kind === 'bin') {
      if (carrying.length >= MAX_HANDS) {
        popup(chef.x, chef.y - 56, 'Hands full!', '#868e96');
        return 0;
      }
      carrying.push({ id: station.item, state: 'raw' });
      return 0;
    }

    if (station.kind === 'board') {
      const item = carrying.find(canChop);
      if (!item) {
        popup(chef.x, chef.y - 56, 'Nothing to chop', '#868e96');
        return 0;
      }
      chef.busy = { kind: 'chop', t: 0, dur: CHOP_SECONDS, item };
      return 0;
    }

    if (station.kind === 'stove') {
      const done = state.burners.find((burner) => burner.item && burner.item.state !== 'raw');
      const rawIndex = carrying.findIndex(canCook);
      if (done && carrying.length < MAX_HANDS) {
        carrying.push(done.item);
        done.item = null;
        done.t = 0;
        return 0;
      }
      const free = state.burners.find((burner) => burner.item === null);
      if (rawIndex !== -1 && free) {
        free.item = carrying.splice(rawIndex, 1)[0];
        free.t = 0;
        steam(STATIONS.stove.x + 56, STATIONS.stove.y + 40, 5);
        return 0;
      }
      if (!done && rawIndex === -1) popup(chef.x, chef.y - 56, 'Nothing to cook', '#868e96');
      return 0;
    }

    if (station.kind === 'plate') {
      const plateItem = carrying.find((item) => item.id === 'plate');
      if (plateItem) {
        if (state.plate.items.length > 0) return 0;
        state.plate.items = plateItem.items;
        carrying.splice(carrying.indexOf(plateItem), 1);
        return 0;
      }
      if (carrying.length > 0 && carrying.length < MAX_HANDS && state.plate.items.length < PLATE_SLOTS) {
        state.plate.items.push(carrying.pop());
        return 0;
      }
      if (carrying.length === 0 && state.plate.items.length > 0) {
        carrying.push({ id: 'plate', items: state.plate.items });
        state.plate.items = [];
        return 0;
      }
      return 0;
    }

    if (station.kind === 'serve') {
      const plateIndex = carrying.findIndex((item) => item.id === 'plate');
      if (plateIndex === -1) {
        popup(chef.x, chef.y - 56, 'Bring a plated dish', '#868e96');
        return 0;
      }
      const plateItem = carrying.splice(plateIndex, 1)[0];
      return servePlate(plateItem);
    }

    if (station.kind === 'trash') {
      if (carrying.length > 0) carrying.length = 0;
      else if (state.plate.items.length > 0) state.plate.items = [];
      return 0;
    }
    return 0;
  }

  function reset() {
    state.time = 0;
    state.timeLeft = DAY_SECONDS;
    state.hearts = MAX_HEARTS;
    state.score = 0;
    state.coins = 0;
    state.served = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.chef.x = 640;
    state.chef.y = 380;
    state.chef.dirX = 0;
    state.chef.dirY = 1;
    state.chef.moving = false;
    state.chef.carrying = [];
    state.chef.busy = null;
    state.burners = [
      { item: null, t: 0 },
      { item: null, t: 0 },
    ];
    state.plate.items = [];
    state.orders = [];
    state.spawnT = 6;
    state.orderSeq = 0;
    state.popups = [];
    state.particles = [];
    state.over = false;
    state.flash = 0;
    state.shake = 0;
    state.moveTarget = null;
  }

  function step(dt, input, demo) {
    let events = 0;
    // Ambient animation always runs: steam, popups, the red flash fading.
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const p = state.particles[i];
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.t >= p.life) state.particles.splice(i, 1);
    }
    for (let i = state.popups.length - 1; i >= 0; i -= 1) {
      const p = state.popups[i];
      p.t += dt;
      if (p.t >= p.life) state.popups.splice(i, 1);
    }
    if (state.flash > 0) state.flash = Math.max(0, state.flash - dt);
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
    if (state.over) return events;
    if (demo) return events;

    state.time += dt;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.over = true;
      return events | EVENT_OVER;
    }

    state.spawnT -= dt;
    if (state.spawnT <= 0) spawnOrder();

    for (let i = state.orders.length - 1; i >= 0; i -= 1) {
      const order = state.orders[i];
      order.t -= dt;
      if (order.t <= 0) {
        state.orders.splice(i, 1);
        state.hearts -= 1;
        state.combo = 0;
        state.score = Math.max(0, state.score - 30);
        state.flash = 0.6;
        popup(640, 300, 'Order expired! -30', '#e4572e');
        events |= EVENT_EXPIRED;
        if (state.hearts <= 0) {
          state.over = true;
          events |= EVENT_OVER;
        }
      }
    }

    // Burners cook on their own: raw -> cooked -> burnt.
    for (const burner of state.burners) {
      if (!burner.item) continue;
      burner.t += dt;
      if (burner.item.state === 'raw' && burner.t >= COOK_SECONDS) {
        burner.item.state = 'cooked';
        steam(STATIONS.stove.x + 56, STATIONS.stove.y + 40, 8);
      } else if (burner.item.state === 'cooked' && burner.t >= BURN_SECONDS) {
        burner.item.state = 'burnt';
        steam(STATIONS.stove.x + 56, STATIONS.stove.y + 40, 8, '#868e96');
      }
    }

    const chef = state.chef;
    if (chef.busy) {
      chef.busy.t += dt;
      if (chef.busy.t >= chef.busy.dur) finishBusy();
      chef.moving = false;
    } else {
      let dx = 0;
      let dy = 0;
      if (state.moveTarget) {
        const tx = state.moveTarget[0] - chef.x;
        const ty = state.moveTarget[1] - chef.y;
        const distance = Math.sqrt(tx * tx + ty * ty);
        if (distance < 14) {
          state.moveTarget = null;
          events |= interact();
        } else {
          dx = tx / distance;
          dy = ty / distance;
        }
      } else if (input) {
        dx = input.x || 0;
        dy = input.y || 0;
      }
      if (dx !== 0 || dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
        chef.dirX = dx;
        chef.dirY = dy;
        chef.moving = true;
        moveCircle(state, dx * CHEF_SPEED * dt, dy * CHEF_SPEED * dt);
      } else {
        chef.moving = false;
      }
      if (input && input.interact) events |= interact();
    }
    return events;
  }

  return {
    state,
    reset,
    step,
    interact,
    nearestStation,
    spawnOrder,
    setMoveTarget(point) {
      state.moveTarget = point;
    },
    clearMoveTarget() {
      state.moveTarget = null;
    },
  };
}

export { STEP };
