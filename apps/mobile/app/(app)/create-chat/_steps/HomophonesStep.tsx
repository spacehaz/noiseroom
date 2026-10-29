import { Title, Text } from '@/components';
import { StepContent, Options, OptionButton, OptionLabel } from '../_styles';

interface Props {
  value: boolean;
  onNext: (homophones: boolean) => void;
}

const OPTIONS: [boolean, string][] = [
  [true, 'auto'],
  [false, 'skip'],
];

export function HomophonesStep({ value, onNext }: Props) {
  return (
    <StepContent>
      <Title size="lg">// homophones</Title>
      <Text muted size="sm">
        popular letters get multiple substitution options
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
