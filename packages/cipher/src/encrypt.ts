import { Vocabulary } from './types';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function insertNulls(text: string, nullSymbols: string[]): string {
  if (nullSymbols.length === 0) return text;

  const chars = text.split('');
  const result: string[] = [];

  for (const char of chars) {
    result.push(char);
    // ~30% chance to insert a null symbol after each character
    if (Math.random() < 0.3) {
      result.push(pickRandom(nullSymbols));
    }
  }

  return result.join('');
}

export function encrypt(plaintext: string, vocab: Vocabulary): string {
  const substituted = plaintext
    .split('')
    .map((char) => {
      const options = vocab.charMap[char];
      // characters not in the map are passed through as-is
      if (!options || options.length === 0) return char;
      return pickRandom(options);
    })
    .join('');

  return insertNulls(substituted, vocab.nullSymbols);
}
