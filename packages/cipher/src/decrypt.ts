import { Vocabulary } from './types';

function buildReverseMap(vocab: Vocabulary): Record<string, string> {
  const reverse: Record<string, string> = {};

  for (const [original, substitutions] of Object.entries(vocab.charMap)) {
    for (const sub of substitutions) {
      reverse[sub] = original;
    }
  }

  return reverse;
}

export function decrypt(ciphertext: string, vocab: Vocabulary): string {
  const nullSet = new Set(vocab.nullSymbols);
  const reverseMap = buildReverseMap(vocab);

  return ciphertext
    .split('')
    .filter((char) => !nullSet.has(char))
    .map((char) => reverseMap[char] ?? char)
    .join('');
}
