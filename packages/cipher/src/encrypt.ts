import { Vocabulary } from './types';
import { RandomSource } from './random';
import { validateVocabulary, VocabularyError } from './validation';

function pickRandom<T>(arr: T[], rng: RandomSource): T {
  return arr[rng.int(arr.length)];
}

function insertNulls(text: string, nullSymbols: string[], rng: RandomSource): string {
  if (nullSymbols.length === 0) return text;

  const result: string[] = [];

  for (const char of Array.from(text)) {
    result.push(char);
    // ~30% chance to insert a null symbol after each character
    if (rng.int(10) < 3) {
      result.push(pickRandom(nullSymbols, rng));
    }
  }

  return result.join('');
}

export function encrypt(plaintext: string, vocab: Vocabulary, rng: RandomSource): string {
  validateVocabulary(vocab);
  const cipherSymbols = new Set([
    ...Object.values(vocab.charMap).flat(),
    ...vocab.nullSymbols,
  ]);
  // all text is lowercased before encryption, so case never reaches the ciphertext
  const substituted = Array.from(plaintext.toLowerCase())
    .map((char) => {
      const options = vocab.charMap[char];
      if (options && options.length > 0) return pickRandom(options, rng);
      if (cipherSymbols.has(char)) {
        throw new VocabularyError(`"${char}" cannot be sent in this chat: it is used as a cipher symbol`);
      }
      return char;
    })
    .join('');

  return insertNulls(substituted, vocab.nullSymbols, rng);
}
