import { Vocabulary } from './types';
import { validateVocabulary } from './validation';

function buildReverseMap(vocab: Vocabulary): Map<string, string> {
  const reverse = new Map<string, string>();

  for (const [original, substitutions] of Object.entries(vocab.charMap)) {
    for (const sub of substitutions) {
      reverse.set(sub, original);
    }
  }

  return reverse;
}

export function decrypt(ciphertext: string, vocab: Vocabulary): string {
  validateVocabulary(vocab);
  const nullSet = new Set(vocab.nullSymbols);
  const reverseMap = buildReverseMap(vocab);

  return Array.from(ciphertext)
    .filter((char) => !nullSet.has(char))
    .map((char) => reverseMap.get(char) ?? char)
    .join('');
}
