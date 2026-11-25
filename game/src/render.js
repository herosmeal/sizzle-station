// Every pixel of the game, drawn with canvas paths: the kitchen, the chef,
// the food, the order tickets and the screens. The renderer only reads the
// world state; it never changes it.
import { INGREDIENTS, ORDER_SECONDS, STATIONS, VIEW } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function text(ctx, value, x, y, font, color, align) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align ?? 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** One ingredient as a little picture, `s` its half-size. */
export function drawIngredient(ctx, id, state, x, y, s) {
  const ingredient = INGREDIENTS[id];
  ctx.save();
  ctx.translate(x, y);
  if (state === 'burnt') {
    ctx.fillStyle = '#2b2b2b';
    ellipse(ctx, 0, 0, s, s * 0.8);
    ctx.fill();
    ctx.fillStyle = '#4a4a4a';
    ellipse(ctx, -s * 0.25, -s * 0.2, s * 0.3, s * 0.25);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (state === 'chopped') {
    ctx.fillStyle = ingredient.chopColor;
    for (const [ox, oy, r] of [[-0.45, 0.15, 0.42], [0.4, 0.3, 0.38], [0.05, -0.45, 0.4]]) {
      ellipse(ctx, ox * s, oy * s, r * s, r * s * 0.85);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ellipse(ctx, -s * 0.45, -s * 0.05, s * 0.14, s * 0.1);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (id === 'tomato') {
    ctx.fillStyle = ingredient.color;
    ellipse(ctx, 0, s * 0.08, s, s * 0.92);
    ctx.fill();
    ctx.fillStyle = '#3f9e4d';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.55);
    ctx.lineTo(-s * 0.5, -s * 0.95);
    ctx.lineTo(-s * 0.15, -s * 0.6);
    ctx.lineTo(0, -s * 1.05);
    ctx.lineTo(s * 0.15, -s * 0.6);
    ctx.lineTo(s * 0.5, -s * 0.95);
    ctx.lineTo(0, -s * 0.55);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = ingredient.color;
    ellipse(ctx, 0, 0, s, s * 0.9);
    ctx.fill();
    ctx.strokeStyle = '#3f7d4f';
    ctx.lineWidth = Math.max(1, s * 0.12);
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.55, 0.15, Math.PI - 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.3, 0.3, Math.PI - 0.3);
    ctx.stroke();
  } else if (id === 'onion') {
    ctx.fillStyle = '#e8d5f2';
    ellipse(ctx, 0, 0, s, s * 0.92);
    ctx.fill();
    ctx.strokeStyle = ingredient.color;
    ctx.lineWidth = Math.max(1, s * 0.1);
    for (const r of [0.75, 0.5, 0.28]) {
      ctx.beginPath();
      ctx.arc(0, 0, s * r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#7fb069';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.lineTo(-s * 0.18, -s * 1.25);
    ctx.lineTo(s * 0.18, -s * 1.25);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'mushroom') {
    ctx.fillStyle = '#f3e6cf';
    ctx.fillRect(-s * 0.35, -s * 0.1, s * 0.7, s * 0.9);
    ctx.fillStyle = ingredient.color;
    ctx.beginPath();
    ctx.arc(0, -s * 0.05, s * 0.95, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f7ead2';
    for (const [ox, oy] of [[-0.45, -0.45], [0.1, -0.7], [0.5, -0.35]]) {
      ellipse(ctx, ox * s, oy * s, s * 0.14, s * 0.1);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = ingredient.color;
    roundRect(ctx, -s, -s * 0.62, s * 2, s * 1.24, s * 0.5);
    ctx.fill();
    ctx.fillStyle = '#5d3620';
    roundRect(ctx, -s * 0.8, -s * 0.3, s * 1.6, s * 0.2, s * 0.1);
    ctx.fill();
    roundRect(ctx, -s * 0.6, s * 0.12, s * 1.2, s * 0.16, s * 0.08);
    ctx.fill();
  } else if (id === 'bun') {
    ctx.fillStyle = ingredient.color;
    ctx.beginPath();
    ctx.arc(0, s * 0.25, s * 0.95, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f7ead2';
    for (const [ox, oy] of [[-0.5, -0.35], [0, -0.55], [0.5, -0.35], [-0.2, -0.15], [0.25, -0.2]]) {
      ellipse(ctx, ox * s, oy * s, s * 0.11, s * 0.08);
      ctx.fill();
    }
    ctx.fillStyle = '#d99a3d';
    ctx.fillRect(-s, s * 0.25, s * 2, s * 0.28);
  } else if (id === 'pasta') {
    ctx.strokeStyle = ingredient.color;
    ctx.lineWidth = Math.max(1.5, s * 0.16);
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.9, i * s * 0.45);
      ctx.bezierCurveTo(-s * 0.4, (i - 0.5) * s * 0.5, s * 0.4, (i + 0.5) * s * 0.5, s * 0.9, i * s * 0.45);
      ctx.stroke();
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = ingredient.color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.9, s * 0.7);
    ctx.lineTo(s * 0.9, s * 0.7);
    ctx.lineTo(0, -s * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e0a92e';
    for (const [ox, oy] of [[-0.25, 0.3], [0.3, 0.35], [0.05, -0.15]]) {
      ellipse(ctx, ox * s, oy * s, s * 0.13, s * 0.13);
      ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ellipse(ctx, -s * 0.35, -s * 0.4, s * 0.3, s * 0.18);
  ctx.fill();
  if (state === 'cooked') {
    ctx.fillStyle = 'rgba(120,60,0,0.22)';
    ellipse(ctx, 0, 0, s, s * 0.9);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = Math.max(1, s * 0.08);
    ctx.beginPath();
    ctx.arc(0, -s * 0.2, s * 0.5, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlate(ctx, items, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#e9e9e9';
  ellipse(ctx, 0, 0, 46, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, 0, -2, 40, 13);
  ctx.fill();
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineWidth = 1.5;
  ellipse(ctx, 0, -2, 40, 13);
  ctx.stroke();
  items.forEach((item, index) => {
    const angle = -0.5 + index * 0.5;
    drawIngredient(ctx, item.id, item.state, Math.cos(angle) * 20 - 8, -6 + Math.sin(angle) * 6, 13);
  });
  ctx.restore();
}

function drawChef(ctx, chef, time) {
  const bob = chef.moving ? Math.sin(time * 14) * 2 : Math.sin(time * 3) * 0.8;
  ctx.save();
  ctx.translate(chef.x, chef.y + bob * 0.3);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ellipse(ctx, 0, 18, 20, 7);
  ctx.fill();
  // Body: white coat, red scarf, apron.
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, -16, -6, 32, 26, 10);
  ctx.fill();
  ctx.fillStyle = '#e4572e';
  ctx.fillRect(-16, -6, 32, 7);
  ctx.fillStyle = '#f7f3ea';
  roundRect(ctx, -11, 2, 22, 18, 6);
  ctx.fill();
  // Head and hat.
  ctx.fillStyle = '#f2c89b';
  ellipse(ctx, 0, -16, 12, 11);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, -7, -27, 8, 7);
  ctx.fill();
  ellipse(ctx, 7, -27, 8, 7);
  ctx.fill();
  ellipse(ctx, 0, -29, 10, 7);
  ctx.fill();
  ctx.fillRect(-11, -26, 22, 5);
  // Face.
  ctx.fillStyle = '#2b2b2b';
  ellipse(ctx, -4.5, -16, 1.6, 2.2);
  ctx.fill();
  ellipse(ctx, 4.5, -16, 1.6, 2.2);
  ctx.fill();
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, -12, 4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // Carried items float above the hat.
  chef.carrying.forEach((item, index) => {
    const cx = (index - (chef.carrying.length - 1) / 2) * 30;
    const cy = -46 - Math.sin(time * 4 + index) * 2;
    if (item.id === 'plate') {
      drawPlate(ctx, item.items, cx, cy, 0.62);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ellipse(ctx, cx, cy, 15, 15);
      ctx.fill();
      drawIngredient(ctx, item.id, item.state, cx, cy, 11);
    }
  });
  // Chopping: a knife bobs over the board-side hand.
  if (chef.busy && chef.busy.kind === 'chop') {
    const progress = chef.busy.t / chef.busy.dur;
    const lift = Math.abs(Math.sin(progress * Math.PI * 6)) * -10;
    ctx.save();
    ctx.translate(16, -8 + lift);
    ctx.rotate(-0.5);
    ctx.fillStyle = '#adb5bd';
    ctx.fillRect(0, 0, 16, 4);
    ctx.fillStyle = '#5c3d24';
    ctx.fillRect(-8, 0, 8, 4);
    ctx.restore();
    ctx.strokeStyle = '#2f9e44';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -40, 16, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStation(ctx, station, state, time) {
  const { x, y, w, h } = station;
  ctx.save();
  if (station.kind === 'bin') {
    ctx.fillStyle = '#8a5a2b';
    roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 10);
    ctx.fill();
    ctx.fillStyle = '#c98f4e';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.fillStyle = '#a9743f';
    roundRect(ctx, x, y, w, 14, 8);
    ctx.fill();
    const item = station.item;
    drawIngredient(ctx, item, 'raw', x + w / 2 - 22, y + h / 2 + 6, 15);
    drawIngredient(ctx, item, 'raw', x + w / 2 + 20, y + h / 2 + 2, 15);
    drawIngredient(ctx, item, 'raw', x + w / 2, y + h / 2 - 12, 13);
    ctx.fillStyle = '#fff8e7';
    roundRect(ctx, x + 8, y + h - 24, w - 16, 18, 6);
    ctx.fill();
    text(ctx, station.label, x + w / 2, y + h - 15, 'bold 11px system-ui, sans-serif', '#5b3a1e', 'center');
  } else if (station.kind === 'board') {
    ctx.fillStyle = '#8a5a2b';
    roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 10);
    ctx.fill();
    ctx.fillStyle = '#e8c795';
    roundRect(ctx, x + 8, y + 10, w - 16, h - 20, 8);
    ctx.fill();
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + h / 2);
    ctx.lineTo(x + w - 14, y + h / 2);
    ctx.stroke();
    // The knife rests on the board.
    ctx.save();
    ctx.translate(x + w / 2, y + 26);
    ctx.rotate(0.25);
    ctx.fillStyle = '#adb5bd';
    ctx.fillRect(0, -3, 34, 6);
    ctx.fillStyle = '#5c3d24';
    ctx.fillRect(-16, -3, 16, 6);
    ctx.restore();
    text(ctx, 'CHOP', x + w / 2, y + h - 14, 'bold 12px system-ui, sans-serif', '#7a5230', 'center');
  } else if (station.kind === 'stove') {
    ctx.fillStyle = '#3c3f46';
    roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 10);
    ctx.fill();
    ctx.fillStyle = '#54575f';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    state.burners.forEach((burner, index) => {
      const bx = x + w / 2;
      const by = y + 44 + index * 78;
      ctx.fillStyle = '#22242a';
      ellipse(ctx, bx, by, 40, 15);
      ctx.fill();
      ctx.strokeStyle = '#868e96';
      ctx.lineWidth = 2;
      ellipse(ctx, bx, by, 40, 15);
      ctx.stroke();
      if (burner.item) {
        const flicker = Math.sin(time * 13 + index * 2.4) * 3;
        ctx.fillStyle = '#ff922b';
        ctx.beginPath();
        ctx.moveTo(bx - 18, by + 6);
        ctx.quadraticCurveTo(bx - 8, by - 26 - flicker, bx, by - 12 - flicker);
        ctx.quadraticCurveTo(bx + 8, by - 26 - flicker, bx + 18, by + 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffd43b';
        ctx.beginPath();
        ctx.moveTo(bx - 10, by + 6);
        ctx.quadraticCurveTo(bx - 4, by - 14 - flicker, bx, by - 6 - flicker);
        ctx.quadraticCurveTo(bx + 4, by - 14 - flicker, bx + 10, by + 6);
        ctx.closePath();
        ctx.fill();
        drawIngredient(ctx, burner.item.id, burner.item.state, bx, by - 12, 13);
        const progress = Math.min(1, burner.t / 3);
        ctx.strokeStyle = burner.item.state === 'burnt' ? '#e4572e' : '#2f9e44';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(bx, by - 12, 22, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.stroke();
      }
    });
    text(ctx, 'STOVE', x + w / 2, y + h - 12, 'bold 12px system-ui, sans-serif', '#dee2e6', 'center');
  } else if (station.kind === 'plate') {
    ctx.fillStyle = '#8a5a2b';
    roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 10);
    ctx.fill();
    ctx.fillStyle = '#d9b380';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    if (state.plate.items.length > 0) {
      drawPlate(ctx, state.plate.items, x + w / 2, y + h / 2 + 4, 1);
    } else {
      ctx.strokeStyle = 'rgba(91,58,30,0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ellipse(ctx, x + w / 2, y + h / 2 + 4, 46, 16);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'PLATE DISHES HERE', x + w / 2, y + 16, 'bold 12px system-ui, sans-serif', '#7a5230', 'center');
    }
  } else if (station.kind === 'serve') {
    ctx.fillStyle = '#8a5a2b';
    roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 10);
    ctx.fill();
    ctx.fillStyle = '#f8f9fa';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    // Striped awning.
    for (let i = 0; i < 6; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? '#e4572e' : '#ffffff';
      ctx.fillRect(x + 6 + i * ((w - 12) / 6), y + 6, (w - 12) / 6, 20);
    }
    ctx.fillStyle = '#343a40';
    roundRect(ctx, x + w / 2 - 14, y + 34, 28, 18, 6);
    ctx.fill();
    ctx.fillStyle = '#ffd43b';
    ellipse(ctx, x + w / 2, y + 32, 10, 5);
    ctx.fill();
    text(ctx, 'SERVE', x + w / 2, y + h - 14, 'bold 14px system-ui, sans-serif', '#e4572e', 'center');
  } else if (station.kind === 'trash') {
    ctx.fillStyle = '#495057';
    roundRect(ctx, x + 18, y + 8, w - 36, h - 16, 8);
    ctx.fill();
    ctx.fillStyle = '#343a40';
    roundRect(ctx, x + 12, y + 2, w - 24, 12, 6);
    ctx.fill();
    text(ctx, 'TRASH', x + w / 2, y + h - 14, 'bold 12px system-ui, sans-serif', '#dee2e6', 'center');
  }
  ctx.restore();
}

function drawTicket(ctx, order, x, y, w, h, time) {
  const recipe = order.recipe;
  const urgent = order.t < 10;
  const pulse = urgent ? 0.75 + Math.sin(time * 8) * 0.25 : 1;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#fffdf5';
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = urgent ? '#e4572e' : '#d9b380';
  ctx.lineWidth = urgent ? 3 : 2;
  roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();
  ctx.fillStyle = urgent ? '#e4572e' : '#5b3a1e';
  roundRect(ctx, x, y, w, 22, 8);
  ctx.fill();
  ctx.fillRect(x, y + 14, w, 8);
  text(ctx, `#${order.id} ${recipe.name}`, x + 8, y + 11, 'bold 12px system-ui, sans-serif', '#ffffff');
  recipe.needs.forEach((need, index) => {
    const ix = x + 20 + index * 42;
    drawIngredient(ctx, need.id, need.state, ix, y + 40, 13);
  });
  const fraction = Math.max(0, order.t / ORDER_SECONDS);
  ctx.fillStyle = '#e9ecef';
  roundRect(ctx, x + 8, y + h - 10, w - 16, 6, 3);
  ctx.fill();
  ctx.fillStyle = fraction > 0.5 ? '#2f9e44' : fraction > 0.25 ? '#f08c00' : '#e4572e';
  roundRect(ctx, x + 8, y + h - 10, (w - 16) * fraction, 6, 3);
  ctx.fill();
  text(ctx, `${Math.ceil(order.t)}s`, x + w - 8, y + 40, 'bold 13px system-ui, sans-serif', urgent ? '#e4572e' : '#495057', 'right');
  ctx.restore();
}

function drawHeart(ctx, x, y, filled, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 10, s / 10);
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.bezierCurveTo(-11, -2, -7, -10, 0, -4);
  ctx.bezierCurveTo(7, -10, 11, -2, 0, 8);
  ctx.closePath();
  ctx.fillStyle = filled ? '#e4572e' : '#adb5bd';
  ctx.fill();
  ctx.restore();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    scale = Math.min(canvas.width / VIEW.width, canvas.height / VIEW.height);
    offsetX = (canvas.width - VIEW.width * scale) / 2;
    offsetY = (canvas.height - VIEW.height * scale) / 2;
  }

  function toWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x: (x - offsetX) / scale, y: (y - offsetY) / scale };
  }

  function draw(state, screen, best, time) {
    resize();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#2b2118';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    if (state.shake > 0) {
      ctx.translate(Math.sin(time * 47) * state.shake * 18, Math.cos(time * 39) * state.shake * 12);
    }

    // Floor: warm checker tiles with a darker wall band at the top.
    for (let ty = 0; ty < 14; ty += 1) {
      for (let tx = 0; tx < 32; tx += 1) {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? '#f0dcb4' : '#e6cda0';
        ctx.fillRect(tx * 40, 76 + ty * 46, 40, 46);
      }
    }
    ctx.fillStyle = '#b85c38';
    ctx.fillRect(0, 76, VIEW.width, 8);
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let tx = 0; tx < 32; tx += 1) {
      if (tx % 2 === 0) ctx.fillRect(tx * 40, 76, 2, 644);
    }

    for (const station of Object.values(STATIONS)) drawStation(ctx, station, state, time);

    // Steam rising from burners that hold food.
    for (const particle of state.particles) {
      ctx.globalAlpha = Math.max(0, 1 - particle.t / particle.life) * 0.55;
      ctx.fillStyle = particle.color;
      ellipse(ctx, particle.x, particle.y, particle.size, particle.size);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    drawChef(ctx, state.chef, time);

    // Score popups float up and fade.
    for (const popupItem of state.popups) {
      const progress = popupItem.t / popupItem.life;
      ctx.globalAlpha = 1 - progress;
      text(ctx, popupItem.text, popupItem.x, popupItem.y - progress * 36, 'bold 20px system-ui, sans-serif', popupItem.color, 'center');
    }
    ctx.globalAlpha = 1;

    drawHud(ctx, state, time);

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(228,87,46,${state.flash * 0.22})`;
      ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    }

    if (screen === SCREEN_TITLE) drawTitle(ctx, best);
    else if (screen === SCREEN_PAUSED) drawCenterCard(ctx, 'Paused', 'Press P or click to keep cooking.', null);
    else if (screen === SCREEN_OVER) drawOver(ctx, state, best);
  }

  function drawHud(ctx, state, time) {
    ctx.fillStyle = '#5b3a1e';
    ctx.fillRect(0, 0, VIEW.width, 76);
    ctx.fillStyle = '#7a5230';
    ctx.fillRect(0, 72, VIEW.width, 4);
    text(ctx, 'SIZZLE STATION', 20, 22, 'bold 22px system-ui, sans-serif', '#ffe8b3');
    text(ctx, 'WASD move · E use · click a station to walk there', 20, 48, '12px system-ui, sans-serif', '#e8c795');

    // Order tickets, centred.
    const ticketW = 196;
    const gap = 10;
    const totalW = 3 * ticketW + 2 * gap;
    const startX = (VIEW.width - totalW) / 2 - 40;
    for (let i = 0; i < 3; i += 1) {
      const order = state.orders[i];
      if (order) drawTicket(ctx, order, startX + i * (ticketW + gap), 8, ticketW, 60, time);
      else {
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        roundRect(ctx, startX + i * (ticketW + gap), 8, ticketW, 60, 8);
        ctx.fill();
        text(ctx, 'No order yet', startX + i * (ticketW + gap) + ticketW / 2, 38, '12px system-ui, sans-serif', 'rgba(255,255,255,0.6)', 'center');
      }
    }

    // Right: coins, score, day timer, hearts, combo.
    const rightX = VIEW.width - 20;
    ctx.fillStyle = '#ffd43b';
    ellipse(ctx, rightX - 62, 20, 9, 9);
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ellipse(ctx, rightX - 62, 20, 9, 9);
    ctx.stroke();
    text(ctx, '$', rightX - 62, 20, 'bold 12px system-ui, sans-serif', '#8a6d00', 'center');
    text(ctx, `${state.coins}`, rightX - 46, 20, 'bold 18px system-ui, sans-serif', '#ffd43b', 'left');
    text(ctx, `Score ${state.score}`, rightX, 46, 'bold 14px system-ui, sans-serif', '#ffffff', 'right');
    const dayFraction = Math.max(0, state.timeLeft / 150);
    ctx.fillStyle = '#3d2712';
    roundRect(ctx, rightX - 260, 58, 130, 10, 5);
    ctx.fill();
    ctx.fillStyle = dayFraction > 0.3 ? '#ffd43b' : '#e4572e';
    roundRect(ctx, rightX - 260, 58, 130 * dayFraction, 10, 5);
    ctx.fill();
    text(ctx, `${Math.ceil(state.timeLeft)}s`, rightX - 120, 63, 'bold 12px system-ui, sans-serif', '#ffe8b3', 'right');
    for (let i = 0; i < 3; i += 1) drawHeart(ctx, rightX - 100 + i * 24, 63, i < state.hearts, 11);
    if (state.combo >= 2) {
      ctx.fillStyle = '#f08c00';
      roundRect(ctx, rightX - 300, 8, 84, 24, 12);
      ctx.fill();
      text(ctx, `COMBO x${state.combo}`, rightX - 258, 20, 'bold 12px system-ui, sans-serif', '#ffffff', 'center');
    }
  }

  function drawCenterCard(ctx, title, body, extra) {
    ctx.fillStyle = 'rgba(20,12,6,0.55)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = '#fff8e7';
    roundRect(ctx, VIEW.width / 2 - 280, 220, 560, 260, 18);
    ctx.fill();
    ctx.strokeStyle = '#d9b380';
    ctx.lineWidth = 3;
    roundRect(ctx, VIEW.width / 2 - 280, 220, 560, 260, 18);
    ctx.stroke();
    text(ctx, title, VIEW.width / 2, 280, 'bold 40px system-ui, sans-serif', '#5b3a1e', 'center');
    text(ctx, body, VIEW.width / 2, 330, '16px system-ui, sans-serif', '#495057', 'center');
    if (extra) text(ctx, extra, VIEW.width / 2, 370, 'bold 18px system-ui, sans-serif', '#2f9e44', 'center');
  }

  function drawTitle(ctx, best) {
    ctx.fillStyle = 'rgba(20,12,6,0.45)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = '#fff8e7';
    roundRect(ctx, VIEW.width / 2 - 320, 150, 640, 380, 20);
    ctx.fill();
    ctx.strokeStyle = '#d9b380';
    ctx.lineWidth = 3;
    roundRect(ctx, VIEW.width / 2 - 320, 150, 640, 380, 20);
    ctx.stroke();
    text(ctx, 'SIZZLE STATION', VIEW.width / 2, 215, 'bold 46px system-ui, sans-serif', '#e4572e', 'center');
    text(ctx, 'One tiny kitchen. One busy day. Every order on time.', VIEW.width / 2, 260, '17px system-ui, sans-serif', '#495057', 'center');
    const lines = [
      'Pick ingredients from the bins on the left and top.',
      'Chop at the board, cook on the stove — watch it burn!',
      'Plate the dish on the counter, serve it at the window.',
      'Orders expire: three strikes and the day is over.',
    ];
    lines.forEach((line, index) => {
      text(ctx, line, VIEW.width / 2, 305 + index * 28, '15px system-ui, sans-serif', '#343a40', 'center');
    });
    text(ctx, 'WASD / arrows to walk · E to use · click a station to walk there', VIEW.width / 2, 440, 'bold 14px system-ui, sans-serif', '#5b3a1e', 'center');
    text(ctx, 'Press Space or click to start', VIEW.width / 2, 480, 'bold 18px system-ui, sans-serif', '#2f9e44', 'center');
    if (best > 0) text(ctx, `Best score: ${best}`, VIEW.width / 2, 510, '14px system-ui, sans-serif', '#868e96', 'center');
  }

  function drawOver(ctx, state, best) {
    const lines = [
      `Dishes served: ${state.served}`,
      `Best combo: x${state.bestCombo}`,
      `Coins earned: $${state.coins}`,
    ];
    ctx.fillStyle = 'rgba(20,12,6,0.55)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = '#fff8e7';
    roundRect(ctx, VIEW.width / 2 - 280, 190, 560, 320, 18);
    ctx.fill();
    ctx.strokeStyle = '#d9b380';
    ctx.lineWidth = 3;
    roundRect(ctx, VIEW.width / 2 - 280, 190, 560, 320, 18);
    ctx.stroke();
    text(ctx, 'Day over!', VIEW.width / 2, 250, 'bold 40px system-ui, sans-serif', '#5b3a1e', 'center');
    text(ctx, `Score: ${state.score}`, VIEW.width / 2, 300, 'bold 26px system-ui, sans-serif', '#e4572e', 'center');
    lines.forEach((line, index) => {
      text(ctx, line, VIEW.width / 2, 340 + index * 28, '16px system-ui, sans-serif', '#495057', 'center');
    });
    if (state.score >= best && state.score > 0) text(ctx, 'New best score!', VIEW.width / 2, 440, 'bold 16px system-ui, sans-serif', '#2f9e44', 'center');
    else if (best > 0) text(ctx, `Best score: ${best}`, VIEW.width / 2, 440, '14px system-ui, sans-serif', '#868e96', 'center');
    text(ctx, 'Press Space to cook another day', VIEW.width / 2, 480, 'bold 16px system-ui, sans-serif', '#2f9e44', 'center');
  }

  return { draw, resize, toWorld };
}
