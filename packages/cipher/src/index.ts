export { encrypt } from './encrypt';
export { decrypt } from './decrypt';
export {
  generateVocabulary,
  randomSubstitutionLayer,
  type SubstitutionMode,
  randomHomophoneLayer,
  randomSpaceLayer,
  randomNullLayer,
  manualSubstitutionLayer,
  manualHomophoneLayer,
  manualSpaceLayer,
  manualNullLayer,
} from './vocabulary';
export type { Vocabulary, AlphabetType } from './types';
