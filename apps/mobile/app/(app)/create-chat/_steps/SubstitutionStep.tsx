import { SubstitutionMode } from '@noiseroom/cipher';
import { Title, Text } from '@/components';
import { StepContent, Options, OptionButton, OptionLabel } from '../_styles';

interface Props {
  value: SubstitutionMode | null;
  onNext: (substitution: SubstitutionMode | null) => void;
}

const OPTIONS: [SubstitutionMode | null, string][] = [
  ['cross', 'auto (cross alphabet)'],
  ['shuffle', 'auto (shuffle same alphabet)'],
  [null, 'skip'],
];

export function SubstitutionStep({ value, onNext }: Props) {
  return (
    <StepContent>
      <Title size="lg">// substitution</Title>
      <Text muted size="sm">each letter maps to a different symbol</Text>
      <Options>
        {OPTIONS.map(([v, label]) => (
          <OptionButton key={label} selected={value === v} onPress={() => onNext(v)}>
            <OptionLabel selected={value === v}>{`> ${label}`}</OptionLabel>
          </OptionButton>
        ))}
      </Options>
    </StepContent>
  );
}
