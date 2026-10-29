import { RandomSource } from './random';
import { AlphabetType, Vocabulary } from './types';

const LATIN_CHARS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const CYRILLIC_CHARS = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split('');
const DIGITS = '0123456789'.split('');
const SPECIAL = '!@#$%^&*-+=[]{}|:\'",<>/?`·•‡§¶©®Ω†∆λΦΘΣΠΓΛξζημνρστυφχψω'.split('');

const LATIN_POPULAR = ['e', 't', 'a', 'o', 'i', 'n', 's', 'h', 'r', 'd', 'l'];
const CYRILLIC_POPULAR = ['о', 'е', 'а', 'и', 'н', 'т', 'с', 'р', 'в', 'л', 'к'];

export type SubstitutionMode = 'cross' | 'shuffle';

function shuffle<T>(arr: T[], rng: RandomSource): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

// keeps shuffling until no char maps to itself (derangement)
function derange(chars: string[], rng: RandomSource): string[] {
  let result: string[];
  do {
    result = shuffle(chars, rng);
  } while (chars.some((c, i) => c === result[i]));
  return result;
}

function availablePool(alphabet: AlphabetType, exclude: Set<string>, rng: RandomSource): string[] {
  const base = alphabet === 'latin' ? CYRILLIC_CHARS : LATIN_CHARS;
  return shuffle([...base, ...DIGITS, ...SPECIAL].filter((c) => !exclude.has(c)), rng);
}

function usedSymbols(alphabet: AlphabetType, charMap: Record<string, string[]>): Set<string> {
  const original = alphabet === 'latin' ? LATIN_CHARS : CYRILLIC_CHARS;
  const used = new Set<string>(original);
  for (const subs of Object.values(charMap)) {
    for (const s of subs) used.add(s);
  }
  return used;
}

// Layer 1: assigns one random substitution to each alphabet character.
// mode 'cross'   — substitutions come from the other alphabet + digits + symbols (default)
// mode 'shuffle' — substitutions are a derangement of the same alphabet (z → w, w → k, ...)
export function randomSubstitutionLayer(
  alphabet: AlphabetType,
  rng: RandomSource,
  mode: SubstitutionMode = 'cross',
): Record<string, string[]> {
  const originalChars = alphabet === 'latin' ? LATIN_CHARS : CYRILLIC_CHARS;
  const charMap: Record<string, string[]> = {};

  if (mode === 'shuffle') {
    const deranged = derange(originalChars, rng);
    originalChars.forEach((char, i) => {
      charMap[char] = [deranged[i]!];
    });
  } else {
    const pool = availablePool(alphabet, new Set(originalChars), rng);
    originalChars.forEach((char, i) => {
      charMap[char] = [pool[i]!];
    });
  }

  return charMap;
}

// Layer 1 manual: you provide the full char → symbol map
export function manualSubstitutionLayer(map: Record<string, string>): Record<string, string[]> {
  const charMap: Record<string, string[]> = {};
  for (const [char, sub] of Object.entries(map)) {
    charMap[char] = [sub];
  }
  return charMap;
}

// Layer 2: adds 2-3 extra substitution options to popular letters
export function randomHomophoneLayer(
  charMap: Record<string, string[]>,
  alphabet: AlphabetType,
  rng: RandomSource
): Record<string, string[]> {
  const popular = alphabet === 'latin' ? LATIN_POPULAR : CYRILLIC_POPULAR;
  const pool = availablePool(alphabet, usedSymbols(alphabet, charMap), rng);
  const result = { ...charMap };
  let poolIndex = 0;

  for (const char of popular) {
    if (!result[char]) continue;
    const count = rng.int(2) + 2; // 2 or 3 extras
    for (let i = 0; i < count && poolIndex < pool.length; i++) {
      result[char]!.push(pool[poolIndex++]!);
    }
  }

  return result;
}

// Layer 2 manual: you provide extra options to merge into existing charMap
export function manualHomophoneLayer(
  charMap: Record<string, string[]>,
  extras: Record<string, string[]>,
): Record<string, string[]> {
  const result = { ...charMap };
  for (const [char, extra] of Object.entries(extras)) {
    result[char] = result[char] ? [...result[char]!, ...extra] : extra;
  }
  return result;
}

// Layer 3: assigns 2-3 random symbols for the space character
export function randomSpaceLayer(
  charMap: Record<string, string[]>,
  alphabet: AlphabetType,
  rng: RandomSource
): Record<string, string[]> {
  const pool = availablePool(alphabet, usedSymbols(alphabet, charMap), rng);
  const count =  rng.int(2) + 2; // 2 or 3 options
  return { ...charMap, ' ': pool.slice(0, count) };
}

// Layer 3 manual: you provide the space substitution options
export function manualSpaceLayer(
  charMap: Record<string, string[]>,
  options: string[],
): Record<string, string[]> {
  return { ...charMap, ' ': options };
}

// Layer 4: picks 3-5 random decoy symbols not used anywhere else
export function randomNullLayer(
  charMap: Record<string, string[]>,
  alphabet: AlphabetType,
  rng: RandomSource
): string[] {
  const pool = availablePool(alphabet, usedSymbols(alphabet, charMap), rng);
  const count = rng.int(3) + 3; // 3 to 5
  return pool.slice(0, count);
}

// Layer 4 manual: you provide the null symbols
export function manualNullLayer(symbols: string[]): string[] {
  return symbols;
}

// Generates a full vocabulary by calling all random layer generators
export function generateVocabulary(
  alphabet: AlphabetType,
  rng: RandomSource,
  mode: SubstitutionMode = 'cross',
): Vocabulary {
  let charMap = randomSubstitutionLayer(alphabet, rng, mode);
  charMap = randomHomophoneLayer(charMap, alphabet, rng);
  charMap = randomSpaceLayer(charMap, alphabet, rng);
  const nullSymbols = randomNullLayer(charMap, alphabet, rng);

  return { alphabet, charMap, nullSymbols };
}
