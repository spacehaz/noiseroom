import { AlphabetType, SubstitutionMode } from '@noiseroom/cipher';

export interface WizardConfig {
  name: string;
  alphabet: AlphabetType | null;
  substitution: SubstitutionMode | null;
  homophones: boolean;
  space: boolean;
  nullSymbols: boolean;
}
