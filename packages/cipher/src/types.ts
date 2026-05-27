export type AlphabetType = 'latin' | 'cyrillic';

export interface Vocabulary {
  alphabet: AlphabetType;
  // each original char maps to one or more substitution chars
  // popular letters have multiple options, others have one
  charMap: Record<string, string[]>;
  // random decoy chars inserted during encryption, stripped during decryption
  nullSymbols: string[];
}
