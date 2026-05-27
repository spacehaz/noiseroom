import { useTheme } from 'styled-components/native';
import { InputProps } from './types';
import { Wrapper, StyledInput, Label, ErrorText } from './styles';

export function Input({ value, onChange, placeholder, secureTextEntry, label, error, ...rest }: InputProps) {
  const theme = useTheme();

  return (
    <Wrapper>
      {label && <Label>{label}</Label>}
      <StyledInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        secureTextEntry={secureTextEntry}
        {...rest}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
}
