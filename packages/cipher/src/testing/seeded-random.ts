import { createCryptoRandom } from "../random";

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0; // uint32 in [0, 2^32)
  };
}

export function seededGetRandomValues(seed: number) {
  const next = mulberry32(seed);
  return (arr: Uint32Array): Uint32Array => {
    for (let i = 0; i < arr.length; i++) arr[i] = next();
    return arr;
  };
}

export function seeded(seed = 42) {
  return createCryptoRandom(seededGetRandomValues(seed));
}