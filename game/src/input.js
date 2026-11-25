// Keyboard and mouse: WASD or arrows to walk, E or Space to use the nearest
// station, click a station to walk there and use it, click the floor to walk
// there. Enter starts the game; P pauses; M mutes.
import { FLOOR, STATIONS } from './config.js';

const STATION_LIST = Object.entries(STATIONS).map(([key, value]) => ({ key, ...value }));

export function createInput(canvas, world, toWorld) {
  const keys = new Set();
  let interactPressed = false;
  let confirmPressed = false;
  let pausePressed = false;
  let mutePressed = false;

  function onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
    if (key === 'e' || key === ' ') interactPressed = true;
    if (key === 'enter') confirmPressed = true;
    if (key === 'p' || key === 'escape') pausePressed = true;
    if (key === 'm') mutePressed = true;
    keys.add(key);
  }

  function onKeyUp(event) {
    keys.delete(event.key.toLowerCase());
  }

  function onPointerDown(event) {
    const point = toWorld(event.clientX, event.clientY);
    if (!point) return;
    // A click on a station walks the chef to its use point and uses it there;
    // a click on the open floor just walks there.
    let target = null;
    for (const station of STATION_LIST) {
      if (point.x >= station.x && point.x <= station.x + station.w && point.y >= station.y && point.y <= station.y + station.h) {
        target = station.at;
        break;
      }
    }
    if (!target) {
      const x = Math.max(FLOOR.x + 24, Math.min(FLOOR.x + FLOOR.width - 24, point.x));
      const y = Math.max(FLOOR.y + 24, Math.min(FLOOR.y + FLOOR.height - 24, point.y));
      target = [x, y];
    }
    world.setMoveTarget(target);
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointerDown);

  return {
    /** The movement and interaction for this frame; edge flags are consumed. */
    read() {
      let x = 0;
      let y = 0;
      if (keys.has('a') || keys.has('arrowleft')) x -= 1;
      if (keys.has('d') || keys.has('arrowright')) x += 1;
      if (keys.has('w') || keys.has('arrowup')) y -= 1;
      if (keys.has('s') || keys.has('arrowdown')) y += 1;
      if (x !== 0 || y !== 0) world.clearMoveTarget();
      const result = {
        x,
        y,
        interact: interactPressed,
        confirm: confirmPressed,
        pause: pausePressed,
        mute: mutePressed,
      };
      interactPressed = false;
      confirmPressed = false;
      pausePressed = false;
      mutePressed = false;
      return result;
    },
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointerdown', onPointerDown);
    },
  };
}
