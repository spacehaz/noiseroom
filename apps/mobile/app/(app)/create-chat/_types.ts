import { AlphabetType, SubstitutionMode } from '@noiseroom/cipher';

export interface WizardConfig {
  name: string;
  alphabet: AlphabetType | null;
  substitution: SubstitutionMode | null;
  manualSubstitutionMap: Record<string, string> | null;
  homophones: boolean;
  space: boolean;
  nullSymbols: boolean;
}
