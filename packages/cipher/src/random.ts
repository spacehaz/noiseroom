export interface RandomSource {
  // [0, max)
  int(max: number): number;
}

export function createCryptoRandom(getRandomValues: (a: Uint32Array) => Uint32Array): RandomSource {
  const buf = new Uint32Array(1);
  return {
    int(max) {
      if (!Number.isInteger(max) || max < 1) {
        throw new RangeError(`int() needs a positive integer, got ${max}`);
      }
      // наибольшее кратное max, которое помещается в 2^32; всё, что выше, отбрасываем
      const limit = Math.floor(0x1_0000_0000 / max) * max;
      let x: number;
      do {
        getRandomValues(buf);
        x = buf[0]!;
      } while (x >= limit);
      return x % max;
    },
  };
}
