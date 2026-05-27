import { AlphabetType } from '@noiseroom/cipher';
import { Title, Text } from '@/components';
import { StepContent, Options, OptionButton, OptionLabel } from '../_styles';

interface Props {
  value: AlphabetType | null;
  onNext: (alphabet: AlphabetType) => void;
}

const OPTIONS: AlphabetType[] = ['latin', 'cyrillic'];

export function AlphabetStep({ value, onNext }: Props) {
  return (
    <StepContent>
      <Title size="lg">// alphabet</Title>
      <Text muted size="sm">choose the base alphabet for your cipher</Text>
      <Options>
        {OPTIONS.map((a) => (
          <OptionButton key={a} selected={value === a} onPress={() => onNext(a)}>
            <OptionLabel selected={value === a}>{`> ${a}`}</OptionLabel>
          </OptionButton>
        ))}
      </Options>
    </StepContent>
  );
}
