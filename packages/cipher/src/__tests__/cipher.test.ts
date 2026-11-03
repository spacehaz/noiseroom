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
    const rng = seeded();
    const cipher = encrypt('hello', fixedVocab, rng);
    expect(cipher).not.toBe('hello');
  });

  it('substitutes every known character', () => {
    // with no null symbols, every char should be substituted
    const noNullVocab: Vocabulary = { ...fixedVocab, nullSymbols: [] };
    const rng = seeded();

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
    const rng = seeded();

    const cipher = encrypt('!', noNullVocab, rng);
    expect(cipher).toBe('!');
  });

  it('inserts null symbols into the output', () => {
    // run many times to reduce flakiness (30% chance per char)
    const nullSymbols = fixedVocab.nullSymbols;
    const rng = seeded();

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
    const rng = seeded();

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

describe('lowercasing', () => {
  it('encrypts uppercase latin the same as lowercase', () => {
    const vocab = generateVocabulary('latin', seeded(5));
    expect(encrypt('HELLO', vocab, seeded(9))).toBe(encrypt('hello', vocab, seeded(9)));
  });

  it('encrypts uppercase cyrillic the same as lowercase', () => {
    const vocab = generateVocabulary('cyrillic', seeded(5));
    expect(encrypt('ПРИВЕТ', vocab, seeded(9))).toBe(encrypt('привет', vocab, seeded(9)));
  });

  it('never leaks uppercase letters into the ciphertext', () => {
    const vocab = generateVocabulary('latin', seeded(5));
    const cipher = encrypt('SECRET', vocab, seeded(9));
    expect(cipher).not.toMatch(/[A-Z]/);
  });

  it('decrypts to the lowercased text', () => {
    const vocab = generateVocabulary('latin', seeded(5));
    expect(decryptFn(encrypt('Hello World', vocab, seeded(9)), vocab)).toBe('hello world');
  });
});

describe('emoji and surrogate pairs', () => {
  // matches a high surrogate not followed by a low one, or a low surrogate not preceded by a high one
  const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
  const EMOJI_TEXT = 'hi 😀🎉 👍';
  const SEED_COUNT = 200;

  it('passes an emoji through unchanged when it has no substitution', () => {
    const noNullVocab: Vocabulary = { ...fixedVocab, nullSymbols: [] };
    expect(encrypt('😀', noNullVocab, seeded())).toBe('😀');
  });

  it('never splits a surrogate pair with a null symbol', () => {
    for (let seed = 1; seed <= SEED_COUNT; seed++) {
      const vocab = generateVocabulary('latin', seeded(seed));
      const cipher = encrypt(EMOJI_TEXT, vocab, seeded(seed + 1000));
      expect(LONE_SURROGATE.test(cipher)).toBe(false);
    }
  });

  it('produces ciphertext that is valid unicode', () => {
    for (let seed = 1; seed <= SEED_COUNT; seed++) {
      const vocab = generateVocabulary('latin', seeded(seed));
      const cipher = encrypt(EMOJI_TEXT, vocab, seeded(seed + 1000));
      // encodeURIComponent throws URIError on lone surrogates
      expect(() => encodeURIComponent(cipher)).not.toThrow();
    }
  });

  it('decrypts emoji text back to the original', () => {
    for (let seed = 1; seed <= SEED_COUNT; seed++) {
      const vocab = generateVocabulary('latin', seeded(seed));
      const cipher = encrypt(EMOJI_TEXT, vocab, seeded(seed + 1000));
      expect(decryptFn(cipher, vocab)).toBe(EMOJI_TEXT);
    }
  });
});

describe('encrypt → decrypt round trip', () => {
  it('recovers original text with fixed vocabulary', () => {
    const original = 'hello world';
    const rng = seeded();

    const cipher = encrypt(original, fixedVocab, rng);
    const recovered = decryptFn(cipher, fixedVocab);
    expect(recovered).toBe(original);
  });

  it('recovers original text with randomly generated vocabulary', () => {
    const rng = seeded();

    const vocab = generateVocabulary('latin', rng);
    const original = 'hello world';
    const cipher = encrypt(original, vocab, rng);
    const recovered = decryptFn(cipher, vocab);
    expect(recovered).toBe(original);
  });

  it('recovers original text in shuffle mode', () => {
    const rng = seeded();

    const vocab = generateVocabulary('latin', rng, 'shuffle');
    const original = 'hello world';
    const cipher = encrypt(original, vocab, rng);
    const recovered = decryptFn(cipher, vocab);
    expect(recovered).toBe(original);
  });

  it('recovers cyrillic text', () => {
    const rng = seeded();

    const vocab = generateVocabulary('cyrillic', rng);
    const original = 'привет мир';
    const cipher = encrypt(original, vocab, rng);
    const recovered = decryptFn(cipher, vocab);
    expect(recovered).toBe(original);
  });

  it('recovers empty string', () => {
    const rng = seeded();

    const cipher = encrypt('', fixedVocab, rng);
    expect(decryptFn(cipher, fixedVocab)).toBe('');
  });
});
