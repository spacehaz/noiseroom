import { Vocabulary } from './types';

export class VocabularyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VocabularyError';
  }
}

// a symbol is exactly one code point, so an emoji counts as one symbol
export function assertSingleSymbol(value: string, label: string): void {
  if (value.length === 0) {
    throw new VocabularyError(`${label} must not be empty`);
  }
  if (Array.from(value).length !== 1) {
    throw new VocabularyError(`${label} must be exactly one symbol, got "${value}"`);
  }
}

// checks the relations between symbols, which the individual layers cannot see:
// every symbol is used for at most one plaintext char, and null symbols never
// overlap with substitutes (decrypt strips nulls before mapping symbols back)
export function validateVocabulary(vocab: Vocabulary): void {
  const usedBy = new Map<string, string>(); // substitute -> plaintext char it stands for

  for (const [char, subs] of Object.entries(vocab.charMap)) {
    assertSingleSymbol(char, `plaintext key "${char}"`);
    for (const sub of subs) {
      assertSingleSymbol(sub, `substitute for "${char}"`);
      const other = usedBy.get(sub);
      if (other === char) {
        throw new VocabularyError(`symbol "${sub}" appears more than once for "${char}"`);
      }
      if (other !== undefined) {
        throw new VocabularyError(`symbol "${sub}" is used for both "${other}" and "${char}"`);
      }
      usedBy.set(sub, char);
    }
  }

  const nullSeen = new Set<string>();
  for (const sym of vocab.nullSymbols) {
    assertSingleSymbol(sym, 'null symbol');
    if (nullSeen.has(sym)) {
      throw new VocabularyError(`null symbol "${sym}" is listed more than once`);
    }
    const owner = usedBy.get(sym);
    if (owner !== undefined) {
      throw new VocabularyError(`null symbol "${sym}" is also a substitute for "${owner}"`);
    }
    nullSeen.add(sym);
  }
}
