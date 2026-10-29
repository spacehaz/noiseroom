import { Title, Text } from '@/components';
import { StepContent, Options, OptionButton, OptionLabel } from '../_styles';

interface Props {
  value: boolean;
  onNext: (nullSymbols: boolean) => void;
}

const OPTIONS: [boolean, string][] = [
  [true, 'auto'],
  [false, 'skip'],
];

export function NullSymbolsStep({ value, onNext }: Props) {
  return (
    <StepContent>
      <Title size="lg">// null symbols</Title>
      <Text muted size="sm">
        random decoy characters inserted into ciphertext
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
