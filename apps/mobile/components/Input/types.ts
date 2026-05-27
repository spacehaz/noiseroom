import { TextInputProps } from 'react-native';

export interface InputProps extends Pick<TextInputProps, 'keyboardType' | 'returnKeyType' | 'onSubmitEditing' | 'autoCapitalize' | 'autoCorrect'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  label?: string;
  error?: string;
}
