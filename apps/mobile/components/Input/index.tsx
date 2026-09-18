import { useTheme } from 'styled-components/native';
import { InputProps } from './types';
import { Wrapper, StyledInput, Label, ErrorText } from './styles';

export function Input({ onChange, label, error, ...rest }: InputProps) {
  const theme = useTheme();

  return (
    <Wrapper>
      {label && <Label>{label}</Label>}
      <StyledInput
        onChangeText={onChange}
        placeholderTextColor={theme.colors.muted}
        {...rest}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
}
