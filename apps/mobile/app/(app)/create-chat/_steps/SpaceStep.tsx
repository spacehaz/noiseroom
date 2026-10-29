import { Title, Text } from '@/components';
import { StepContent, Options, OptionButton, OptionLabel } from '../_styles';

interface Props {
  value: boolean;
  onNext: (space: boolean) => void;
}

const OPTIONS: [boolean, string][] = [
  [true, 'auto'],
  [false, 'skip'],
];

export function SpaceStep({ value, onNext }: Props) {
  return (
    <StepContent>
      <Title size="lg">// space replacement</Title>
      <Text muted size="sm">
        spaces are replaced with random symbol combos
      </Text>
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
