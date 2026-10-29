import { Vocabulary } from './types';
import { RandomSource } from './random';

function pickRandom<T>(
  arr: T[],
  rng: RandomSource
): T {

  return arr[rng.int(arr.length)];
}

function insertNulls(
  text: string,
  nullSymbols: string[],
  rng: RandomSource
): string {
  if (nullSymbols.length === 0) return text;

  const chars = text.split('');
  const result: string[] = [];

  for (const char of chars) {
    result.push(char);
    // ~30% chance to insert a null symbol after each character
    if (rng.int(10) < 3) {
      result.push(pickRandom(nullSymbols, rng));
    }
  }

  return result.join('');
}

export function encrypt(
  plaintext: string,
  vocab: Vocabulary,
  rng: RandomSource

): string {
  const substituted = plaintext
    .split('')
    .map((char) => {
      const options = vocab.charMap[char];
      // characters not in the map are passed through as-is
      if (!options || options.length === 0) return char;
      return pickRandom(options, rng);
    })
    .join('');

  return insertNulls(substituted, vocab.nullSymbols, rng);
}
