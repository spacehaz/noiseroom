import { useState } from 'react';
import { AlphabetType, SubstitutionMode } from '@noiseroom/cipher';
import { Title, Text } from '@/components';
import { StepContent, Options, OptionButton, OptionLabel } from '../_styles';
import { ManualSubstitutionEditor } from './ManualSubstitutionEditor';

type StepOption = SubstitutionMode | 'manual' | null;

const OPTIONS: [StepOption, string][] = [
  ['cross', 'auto (cross alphabet)'],
  ['shuffle', 'auto (shuffle same alphabet)'],
  ['manual', 'manual (drag to assign)'],
  [null, 'skip'],
];

interface Props {
  value: SubstitutionMode | null;
  alphabet: AlphabetType;
  onNext: (substitution: SubstitutionMode | null, manualMap?: Record<string, string>) => void;
}

export function SubstitutionStep({ value, alphabet, onNext }: Props) {
  const [showManual, setShowManual] = useState(false);

  if (showManual) {
    return (
      <ManualSubstitutionEditor
        alphabet={alphabet}
        onComplete={(map) => onNext(null, map)}
        onCancel={() => setShowManual(false)}
      />
    );
  }

  return (
    <StepContent>
      <Title size="lg">// substitution</Title>
      <Text muted size="sm">
        each letter maps to a different symbol
      </Text>
      <Options>
        {OPTIONS.map(([v, label]) => (
          <OptionButton
            key={label}
            selected={v !== 'manual' && value === v}
            onPress={() =>
              v === 'manual' ? setShowManual(true) : onNext(v as SubstitutionMode | null)
            }
          >
            <OptionLabel selected={v !== 'manual' && value === v}>{`> ${label}`}</OptionLabel>
          </OptionButton>
        ))}
      </Options>
    </StepContent>
  );
}
