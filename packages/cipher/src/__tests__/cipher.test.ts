import { encrypt } from '../encrypt';
import { decrypt as decryptFn } from '../decrypt';
import { generateVocabulary } from '../vocabulary';
import type { Vocabulary } from '../types';
import { seeded } from '../testing/seeded-random';

const fixedVocab: Vocabulary = {
  alphabet: 'latin',
  charMap: {
    h: ['d'],
    e: ['l', '%', 'Ω'],
    l: ['x'],
    o: ['r'],
    w: ['z'],
    r: ['q'],
    d: ['p'],
    ' ': ['·', '_'],
  },
  nullSymbols: ['∑', '¬'],
};

describe('encrypt', () => {
  it('produces output of different content than input', () => {
    const rng = seeded()
    const cipher = encrypt('hello', fixedVocab, rng);
    expect(cipher).not.toBe('hello');
  });

  it('substitutes every known character', () => {
    // with no null symbols, every char should be substituted
    const noNullVocab: Vocabulary = { ...fixedVocab, nullSymbols: [] };
    const rng = seeded()

    const cipher = encrypt('hello', noNullVocab, rng);
    // 'hello' → h→d, e→one of [l,%,Ω], l→x, l→x, o→r
    const validFirstChars = ['d'];
    const validSecondChars = ['l', '%', 'Ω'];
    expect(validFirstChars).toContain(cipher[0]);
    expect(validSecondChars).toContain(cipher[1]);
    expect(cipher[2]).toBe('x');
    expect(cipher[3]).toBe('x');
    expect(cipher[4]).toBe('r');
  });

  it('passes through characters not in the charMap', () => {
    const noNullVocab: Vocabulary = { ...fixedVocab, nullSymbols: [] };
    // '!' is not in charMap — should pass through unchanged
    const rng = seeded()

    const cipher = encrypt('!', noNullVocab, rng);
    expect(cipher).toBe('!');
  });

  it('inserts null symbols into the output', () => {
    // run many times to reduce flakiness (30% chance per char)
    const nullSymbols = fixedVocab.nullSymbols;
    const rng = seeded()

    let foundNull = false;
    for (let i = 0; i < 50; i++) {
      const cipher = encrypt('hello world', fixedVocab, rng);
      if (nullSymbols.some((sym) => cipher.includes(sym))) {
        foundNull = true;
        break;
      }
    }
    expect(foundNull).toBe(true);
  });

  it('produces different output on repeated calls (randomness)', () => {
        const rng = seeded()

    const results = new Set(Array.from({ length: 20 }, () => encrypt('hello', fixedVocab, rng)));
    // with homophones and nulls, not all 20 results should be identical
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('decrypt', () => {
  it('strips null symbols', () => {
    const withNulls = 'dΩx∑xr';
    const result = decryptFn(withNulls, fixedVocab);
    expect(result).not.toContain('∑');
    expect(result).not.toContain('¬');
  });

  it('reverses substitution correctly', () => {
    const noNullVocab: Vocabulary = { ...fixedVocab, nullSymbols: [] };
    // manually encrypted 'hello'
    const cipher = 'dlxxr';
    expect(decryptFn(cipher, noNullVocab)).toBe('hello');
  });

  it('reverses all homophone variants to the same char', () => {
    const noNullVocab: Vocabulary = { ...fixedVocab, nullSymbols: [] };
    // e can encrypt to l, %, or Ω — all should decrypt back to e
    expect(decryptFn('l', noNullVocab)).toBe('e');
    expect(decryptFn('%', noNullVocab)).toBe('e');
    expect(decryptFn('Ω', noNullVocab)).toBe('e');
  });

  it('passes through unknown symbols unchanged', () => {
    const result = decryptFn('!', fixedVocab);
    expect(result).toBe('!');
  });
});

describe('encrypt → decrypt round trip', () => {
  it('recovers original text with fixed vocabulary', () => {
    const original = 'hello world';
        const rng = seeded()

    const cipher = encrypt(original, fixedVocab, rng);
    const recovered = decryptFn(cipher, fixedVocab);
    expect(recovered).toBe(original);
  });

  it('recovers original text with randomly generated vocabulary', () => {
        const rng = seeded()

    const vocab = generateVocabulary('latin', rng);
    const original = 'hello world';
    const cipher = encrypt(original, vocab, rng);
    const recovered = decryptFn(cipher, vocab);
    expect(recovered).toBe(original);
  });

  it('recovers original text in shuffle mode', () => {
        const rng = seeded()

    const vocab = generateVocabulary('latin', rng, 'shuffle');
    const original = 'hello world';
    const cipher = encrypt(original, vocab, rng);
    const recovered = decryptFn(cipher, vocab);
    expect(recovered).toBe(original);
  });

  it('recovers cyrillic text', () => {
        const rng = seeded()

    const vocab = generateVocabulary('cyrillic', rng);
    const original = 'привет мир';
    const cipher = encrypt(original, vocab, rng);
    const recovered = decryptFn(cipher, vocab);
    expect(recovered).toBe(original);
  });

  it('recovers empty string', () => {
        const rng = seeded()

    const cipher = encrypt('', fixedVocab, rng);
    expect(decryptFn(cipher, fixedVocab)).toBe('');
  });
});
