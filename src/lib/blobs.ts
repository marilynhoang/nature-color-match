/** Deterministic pseudo-random generator so the same seed always produces
 * the same organic shape / rotation — keeps a saved palette's look stable
 * across renders instead of reshuffling on every visit. */
function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/** Returns a CSS border-radius string that reads as an organic blob rather
 * than a perfect circle. */
export function blobRadius(seed: string): string {
  const rand = seededRandom(seed);
  const v = () => 40 + Math.round(rand() * 25); // 40-65%
  return `${v()}% ${100 - v()}% ${v()}% ${100 - v()}% / ${v()}% ${v()}% ${100 - v()}% ${100 - v()}%`;
}

/** A small rotation, in degrees, for a "pinned to a board" feel. */
export function cardRotation(seed: string): number {
  const rand = seededRandom(seed + "-rotate");
  return Math.round((rand() - 0.5) * 8); // -4deg to 4deg
}

/** Picks one of a few card-size tiers so the library reads as a wall with
 * hierarchy rather than a uniform grid. */
export function cardSizeTier(seed: string): "sm" | "md" | "lg" {
  const rand = seededRandom(seed + "-size");
  const r = rand();
  if (r < 0.55) return "md";
  if (r < 0.8) return "lg";
  return "sm";
}
