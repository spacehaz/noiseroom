import {
  manualSubstitutionLayer,
  manualHomophoneLayer,
  manualSpaceLayer,
  manualNullLayer,
  generateVocabulary,
} from '../vocabulary';
import { encrypt } from '../encrypt';
import { decrypt } from '../decrypt';
import { validateVocabulary, VocabularyError } from '../validation';
import type { Vocabulary } from '../types';
import { seeded } from '../testing/seeded-random';

const validVocab: Vocabulary = {
  alphabet: 'latin',
  charMap: { a: ['1'], b: ['2', '3'], ' ': ['·'] },
  nullSymbols: ['∑'],
};

describe('manualSubstitutionLayer input checks', () => {
  it('rejects a multi-character substitute', () => {
    expect(() => manualSubstitutionLayer({ a: 'xy' })).toThrow(VocabularyError);
  });

  it('rejects an empty substitute', () => {
    expect(() => manualSubstitutionLayer({ a: '' })).toThrow(/must not be empty/);
  });

  it('rejects a multi-character plaintext key', () => {
    expect(() => manualSubstitutionLayer({ ab: 'x' })).toThrow(VocabularyError);
  });

  it('accepts a single emoji as a substitute', () => {
    expect(manualSubstitutionLayer({ a: '😀' })).toEqual({ a: ['😀'] });
  });
});

describe('manualHomophoneLayer input checks', () => {
  it('rejects a multi-character extra', () => {
    const base = manualSubstitutionLayer({ e: 'x' });
    expect(() => manualHomophoneLayer(base, { e: ['yz'] })).toThrow(VocabularyError);
  });

  it('rejects an empty extra', () => {
    const base = manualSubstitutionLayer({ e: 'x' });
    expect(() => manualHomophoneLayer(base, { e: [''] })).toThrow(VocabularyError);
  });
});

describe('manualSpaceLayer input checks', () => {
  it('rejects a multi-character option', () => {
    expect(() => manualSpaceLayer({}, ['··'])).toThrow(VocabularyError);
  });

  it('rejects an empty option', () => {
    expect(() => manualSpaceLayer({}, [''])).toThrow(VocabularyError);
  });
});

describe('manualNullLayer input checks', () => {
  it('rejects a multi-character null symbol', () => {
    expect(() => manualNullLayer(['∑∑'])).toThrow(VocabularyError);
  });

  it('rejects an empty null symbol', () => {
    expect(() => manualNullLayer([''])).toThrow(VocabularyError);
  });
});

describe('validateVocabulary', () => {
  it('accepts a valid vocabulary', () => {
    expect(() => validateVocabulary(validVocab)).not.toThrow();
  });

  it('rejects the same substitute used for two plaintext chars', () => {
    const vocab: Vocabulary = { ...validVocab, charMap: { a: ['1'], b: ['1'] } };
    expect(() => validateVocabulary(vocab)).toThrow(/used for both "a" and "b"/);
  });

  it('rejects the same substitute listed twice for one plaintext char', () => {
    const vocab: Vocabulary = { ...validVocab, charMap: { a: ['1', '1'] } };
    expect(() => validateVocabulary(vocab)).toThrow(/more than once for "a"/);
  });

  it('rejects a null symbol that is also a substitute', () => {
    const vocab: Vocabulary = { ...validVocab, nullSymbols: ['2'] };
    expect(() => validateVocabulary(vocab)).toThrow(/also a substitute for "b"/);
  });

  it('rejects a null symbol listed twice', () => {
    const vocab: Vocabulary = { ...validVocab, nullSymbols: ['∑', '∑'] };
    expect(() => validateVocabulary(vocab)).toThrow(/listed more than once/);
  });

  it('rejects a multi-character substitute built without the layer checks', () => {
    const vocab: Vocabulary = { ...validVocab, charMap: { a: ['xy'] } };
    expect(() => validateVocabulary(vocab)).toThrow(VocabularyError);
  });

  it('accepts generated vocabularies for many seeds', () => {
    for (let seed = 1; seed <= 100; seed++) {
      for (const alphabet of ['latin', 'cyrillic'] as const) {
        expect(() => validateVocabulary(generateVocabulary(alphabet, seeded(seed)))).not.toThrow();
      }
    }
  });
});

describe('encrypt and decrypt reject invalid vocabularies', () => {
  const bad: Vocabulary = { ...validVocab, nullSymbols: ['2'] };

  it('encrypt throws instead of producing unreadable output', () => {
    expect(() => encrypt('ab', bad, seeded())).toThrow(VocabularyError);
  });

  it('decrypt throws instead of silently dropping symbols', () => {
    expect(() => decrypt('2a', bad)).toThrow(VocabularyError);
  });
});
