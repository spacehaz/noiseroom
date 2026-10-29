import {
  generateVocabulary,
  randomSubstitutionLayer,
  randomHomophoneLayer,
  randomSpaceLayer,
  randomNullLayer,
  manualSubstitutionLayer,
  manualHomophoneLayer,
  manualSpaceLayer,
  manualNullLayer,
} from '../vocabulary';
import { seeded } from '../testing/seeded-random';

const LATIN_CHARS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const CYRILLIC_CHARS = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split('');
const LATIN_POPULAR = ['e', 't', 'a', 'o', 'i', 'n', 's', 'h', 'r', 'd', 'l'];
const CYRILLIC_POPULAR = ['о', 'е', 'а', 'и', 'н', 'т', 'с', 'р', 'в', 'л', 'к'];

describe('randomSubstitutionLayer', () => {
  describe('cross mode (default)', () => {
    it('assigns exactly one substitution per latin character', () => {
      const rng = seeded();
      const charMap = randomSubstitutionLayer('latin', rng);
      for (const char of LATIN_CHARS) {
        expect(charMap[char]).toHaveLength(1);
      }
    });

    it('assigns exactly one substitution per cyrillic character', () => {
      const rng = seeded();
      const charMap = randomSubstitutionLayer('cyrillic', rng);
      for (const char of CYRILLIC_CHARS) {
        expect(charMap[char]).toHaveLength(1);
      }
    });

    it('produces no duplicate substitution symbols', () => {
      const rng = seeded();
      const charMap = randomSubstitutionLayer('latin', rng);
      const allSubs = Object.values(charMap).flat();
      const unique = new Set(allSubs);
      expect(unique.size).toBe(allSubs.length);
    });

    it('does not use original latin chars as substitutions', () => {
      const rng = seeded();
      const charMap = randomSubstitutionLayer('latin', rng);
      const allSubs = Object.values(charMap).flat();
      const latinSet = new Set(LATIN_CHARS);
      for (const sub of allSubs) {
        expect(latinSet.has(sub)).toBe(false);
      }
    });

    it('does not use original cyrillic chars as substitutions', () => {
      const rng = seeded();
      const charMap = randomSubstitutionLayer('cyrillic', rng);
      const allSubs = Object.values(charMap).flat();
      const cyrillicSet = new Set(CYRILLIC_CHARS);
      for (const sub of allSubs) {
        expect(cyrillicSet.has(sub)).toBe(false);
      }
    });
  });

  describe('shuffle mode', () => {
    it('maps latin chars to latin chars only', () => {
      const rng = seeded();
      const charMap = randomSubstitutionLayer('latin', rng, 'shuffle');
      const allSubs = Object.values(charMap).flat();
      const latinSet = new Set(LATIN_CHARS);
      for (const sub of allSubs) {
        expect(latinSet.has(sub)).toBe(true);
      }
    });

    it('maps cyrillic chars to cyrillic chars only', () => {
      const rng = seeded();
      const charMap = randomSubstitutionLayer('cyrillic', rng, 'shuffle');
      const allSubs = Object.values(charMap).flat();
      const cyrillicSet = new Set(CYRILLIC_CHARS);
      for (const sub of allSubs) {
        expect(cyrillicSet.has(sub)).toBe(true);
      }
    });

    it('is a derangement — no char maps to itself', () => {
      const rng = seeded();
      const charMap = randomSubstitutionLayer('latin', rng, 'shuffle');
      for (const [char, subs] of Object.entries(charMap)) {
        expect(subs[0]).not.toBe(char);
      }
    });

    it('produces no duplicate substitution symbols', () => {
      const rng = seeded();
      const charMap = randomSubstitutionLayer('latin', rng, 'shuffle');
      const allSubs = Object.values(charMap).flat();
      const unique = new Set(allSubs);
      expect(unique.size).toBe(allSubs.length);
    });
  });
});

describe('randomHomophoneLayer', () => {
  it('adds multiple options to popular latin letters', () => {
    const rng = seeded();
    const base = randomSubstitutionLayer('latin', rng);
    const charMap = randomHomophoneLayer(base, 'latin', rng);
    for (const char of LATIN_POPULAR) {
      expect(charMap[char]!.length).toBeGreaterThan(1);
    }
  });

  it('adds multiple options to popular cyrillic letters', () => {
    const rng = seeded();
    const base = randomSubstitutionLayer('cyrillic', rng);
    const charMap = randomHomophoneLayer(base, 'cyrillic', rng);
    for (const char of CYRILLIC_POPULAR) {
      expect(charMap[char]!.length).toBeGreaterThan(1);
    }
  });

  it('does not introduce duplicate symbols across the whole map', () => {
    const rng = seeded();
    const base = randomSubstitutionLayer('latin', rng);
    const charMap = randomHomophoneLayer(base, 'latin', rng);
    const allSubs = Object.values(charMap).flat();
    const unique = new Set(allSubs);
    expect(unique.size).toBe(allSubs.length);
  });

  it('does not modify non-popular letters', () => {
    const rng = seeded();
    const base = randomSubstitutionLayer('latin', rng);
    const charMap = randomHomophoneLayer(base, 'latin', rng);
    const nonPopular = LATIN_CHARS.filter((c) => !LATIN_POPULAR.includes(c));
    for (const char of nonPopular) {
      expect(charMap[char]).toHaveLength(1);
    }
  });
});

describe('randomSpaceLayer', () => {
  const rng = seeded();
  it('adds space with at least 2 options', () => {
    const base = randomSubstitutionLayer('latin', rng);
    const charMap = randomSpaceLayer(base, 'latin', rng);
    expect(charMap[' ']).toBeDefined();
    expect(charMap[' ']!.length).toBeGreaterThanOrEqual(2);
  });

  it('does not use symbols already in the map', () => {
    const rng = seeded();
    const base = randomSubstitutionLayer('latin', rng);
    const charMap = randomSpaceLayer(base, 'latin', rng);
    const nonSpaceSubs = new Set(
      Object.entries(charMap)
        .filter(([key]) => key !== ' ')
        .flatMap(([, subs]) => subs),
    );
    for (const spaceSub of charMap[' ']!) {
      expect(nonSpaceSubs.has(spaceSub)).toBe(false);
    }
  });
});

describe('randomNullLayer', () => {
  it('returns between 3 and 5 symbols', () => {
    const rng = seeded();
    const charMap = randomSubstitutionLayer('latin', rng);
    const nullSymbols = randomNullLayer(charMap, 'latin', rng);
    expect(nullSymbols.length).toBeGreaterThanOrEqual(3);
    expect(nullSymbols.length).toBeLessThanOrEqual(5);
  });

  it('does not overlap with any substitution symbol', () => {
    const rng = seeded();
    const charMap = randomSubstitutionLayer('latin', rng);
    const nullSymbols = randomNullLayer(charMap, 'latin', rng);
    const allSubs = new Set(Object.values(charMap).flat());
    for (const sym of nullSymbols) {
      expect(allSubs.has(sym)).toBe(false);
    }
  });
});

describe('manualSubstitutionLayer', () => {
  it('wraps each substitution in a single-element array', () => {
    const charMap = manualSubstitutionLayer({ a: '1', b: '2', c: '3' });
    expect(charMap['a']).toEqual(['1']);
    expect(charMap['b']).toEqual(['2']);
    expect(charMap['c']).toEqual(['3']);
  });
});

describe('manualHomophoneLayer', () => {
  it('merges extra options into existing char entry', () => {
    const base = manualSubstitutionLayer({ e: 'x' });
    const charMap = manualHomophoneLayer(base, { e: ['y', 'z'] });
    expect(charMap['e']).toEqual(['x', 'y', 'z']);
  });

  it('adds a new char not present in base map', () => {
    const base = manualSubstitutionLayer({ e: 'x' });
    const charMap = manualHomophoneLayer(base, { t: ['1', '2'] });
    expect(charMap['t']).toEqual(['1', '2']);
  });

  it('does not mutate the original charMap', () => {
    const base = manualSubstitutionLayer({ e: 'x' });
    manualHomophoneLayer(base, { e: ['y'] });
    expect(base['e']).toEqual(['x']);
  });
});

describe('manualSpaceLayer', () => {
  it('sets space options in the charMap', () => {
    const base = manualSubstitutionLayer({ a: '1' });
    const charMap = manualSpaceLayer(base, ['·', '_', '~']);
    expect(charMap[' ']).toEqual(['·', '_', '~']);
  });

  it('does not mutate the original charMap', () => {
    const base = manualSubstitutionLayer({ a: '1' });
    manualSpaceLayer(base, ['·']);
    expect(base[' ']).toBeUndefined();
  });
});

describe('manualNullLayer', () => {
  it('returns the provided symbols as-is', () => {
    const symbols = ['∑', '¬', '§'];
    expect(manualNullLayer(symbols)).toEqual(symbols);
  });
});

describe('generateVocabulary', () => {
  it('covers all latin chars in charMap', () => {
    const rng = seeded();
    const vocab = generateVocabulary('latin', rng);
    for (const char of LATIN_CHARS) {
      expect(vocab.charMap[char]).toBeDefined();
    }
  });

  it('covers all cyrillic chars in charMap', () => {
    const rng = seeded();
    const vocab = generateVocabulary('cyrillic', rng);
    for (const char of CYRILLIC_CHARS) {
      expect(vocab.charMap[char]).toBeDefined();
    }
  });

  it('includes space in charMap', () => {
    const rng = seeded();
    const vocab = generateVocabulary('latin', rng);
    expect(vocab.charMap[' ']).toBeDefined();
  });

  it('has null symbols with no overlap with charMap substitutions', () => {
    const rng = seeded();
    const vocab = generateVocabulary('latin', rng);
    const allSubs = new Set(Object.values(vocab.charMap).flat());
    for (const sym of vocab.nullSymbols) {
      expect(allSubs.has(sym)).toBe(false);
    }
  });

  it('sets the correct alphabet field', () => {
    const rng = seeded();
    expect(generateVocabulary('latin', rng).alphabet).toBe('latin');
    expect(generateVocabulary('cyrillic', rng).alphabet).toBe('cyrillic');
  });

  it('works in shuffle mode with no char mapping to itself', () => {
    const rng = seeded();
    const vocab = generateVocabulary('latin', rng, 'shuffle');
    for (const [char, subs] of Object.entries(vocab.charMap)) {
      if (char !== ' ') expect(subs[0]).not.toBe(char);
    }
  });
});
