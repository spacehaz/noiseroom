import { AlphabetType } from '@noiseroom/cipher';
import { WithSpringConfig } from 'react-native-reanimated';

export const ITEM_SIZE = 34;
export const GAP = 4;
export const STEP = ITEM_SIZE + GAP;
export const SPRING: WithSpringConfig = { damping: 20, stiffness: 200 };

const LATIN_CHARS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const CYRILLIC_CHARS = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split('');
const DIGITS = '0123456789'.split('');
const SYMBOLS = '!@#$%^&*-+=[]{}|:\'",<>/?'.split('');

export function buildCharSet(alphabet: AlphabetType): string[] {
  return [...(alphabet === 'latin' ? LATIN_CHARS : CYRILLIC_CHARS), ...DIGITS, ...SYMBOLS];
}
