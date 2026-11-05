import { encrypt } from '../encrypt';
import { decrypt } from '../decrypt';
import { generateVocabulary, randomHomophoneLayer, randomSubstitutionLayer } from '../vocabulary';
import { createCryptoRandom } from '../random';
import { VocabularyError } from '../validation';
import type { Vocabulary } from '../types';
import { seeded } from '../testing/seeded-random';

describe('unmapped plaintext that collides with a cipher symbol', () => {
  it('refuses a substitute symbol typed as plain text instead of decoding it as a letter', () => {
    const vocab: Vocabulary = { alphabet: 'latin', charMap: { a: ['!'] }, nullSymbols: [] };
    expect(() => encrypt('a!', vocab, seeded())).toThrow(VocabularyError);
  });

  it('refuses a null symbol typed as plain text instead of stripping it', () => {
    const vocab: Vocabulary = { alphabet: 'latin', charMap: { a: ['1'] }, nullSymbols: ['?'] };
    expect(() => encrypt('what?', vocab, seeded())).toThrow(VocabularyError);
  });

  it('still passes through unmapped characters that are not cipher symbols', () => {
    const vocab: Vocabulary = { alphabet: 'latin', charMap: { a: ['1'] }, nullSymbols: [] };
    expect(decrypt(encrypt('a?', vocab, seeded()), vocab)).toBe('a?');
  });
});

describe('emoji as cipher symbols', () => {
  it('decrypts an emoji substitute back to its letter', () => {
    const vocab: Vocabulary = { alphabet: 'latin', charMap: { a: ['😀'] }, nullSymbols: [] };
    expect(decrypt(encrypt('aa', vocab, seeded()), vocab)).toBe('aa');
  });

  it('strips an emoji null symbol instead of leaving half of it behind', () => {
    const vocab: Vocabulary = { alphabet: 'latin', charMap: { a: ['1'] }, nullSymbols: ['🎉'] };
    for (let seed = 1; seed <= 50; seed++) {
      expect(decrypt(encrypt('aaaa', vocab, seeded(seed)), vocab)).toBe('aaaa');
    }
  });
});

describe('generated vocabularies never corrupt a message silently', () => {
  const MESSAGE = 'call 911 now! ok? #1 (x) 50%';

  it('either round-trips exactly or refuses with VocabularyError', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const vocab = generateVocabulary('latin', seeded(seed));
      try {
        const cipher = encrypt(MESSAGE, vocab, seeded(seed + 1000));
        expect(decrypt(cipher, vocab)).toBe(MESSAGE);
      } catch (err) {
        expect(err).toBeInstanceOf(VocabularyError);
      }
    }
  });

  it('usually succeeds for ordinary text', () => {
    let ok = 0;
    for (let seed = 1; seed <= 200; seed++) {
      const vocab = generateVocabulary('latin', seeded(seed));
      try {
        encrypt(MESSAGE, vocab, seeded(seed + 1000));
        ok++;
      } catch {}
    }
    expect(ok).toBeGreaterThan(150);
  });
});

describe('randomHomophoneLayer', () => {
  it('does not mutate the charMap it is given', () => {
    const base = randomSubstitutionLayer('latin', seeded());
    const snapshot = JSON.stringify(base);
    randomHomophoneLayer(base, 'latin', seeded());
    expect(JSON.stringify(base)).toBe(snapshot);
  });
});

describe('createCryptoRandom', () => {
  it('rejects a bound below 1 instead of returning NaN', () => {
    expect(() => seeded().int(0)).toThrow(RangeError);
  });

  it('rejects a non-integer bound', () => {
    expect(() => seeded().int(2.5)).toThrow(RangeError);
  });

  it('returns values in [0, max)', () => {
    let n = 0;
    const rng = createCryptoRandom((a) => {
      a[0] = n++;
      return a;
    });
    for (let i = 0; i < 20; i++) {
      const v = rng.int(7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
    }
  });
});
