import { AlphabetType } from '@noiseroom/cipher';
import { SharedValue } from 'react-native-reanimated';

export interface DraggableItemProps {
  itemIndex: number;
  char: string;
  cols: number;
  totalItems: number;
  sharedOrder: SharedValue<number[]>;
  activeItemIdx: SharedValue<number>;
}

export interface ManualSubstitutionEditorProps {
  alphabet: AlphabetType;
  onComplete: (map: Record<string, string>) => void;
  onCancel: () => void;
}
