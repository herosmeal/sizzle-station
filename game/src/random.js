// A tiny seeded random generator (mulberry32) so the game, its orders and its
// screenshot scenes are the same every run for the same seed.
export function createRandom(seed) {
  let a = seed >>> 0;
  function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    /** Integer in [0, n). */
    int(n) {
      return Math.floor(next() * n);
    },
    /** Float in [min, max). */
    range(min, max) {
      return min + next() * (max - min);
    },
    /** Pick one entry of an array. */
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },
  };
}
