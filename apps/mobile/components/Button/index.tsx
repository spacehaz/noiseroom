import { ActivityIndicator } from 'react-native';
import { ButtonProps } from './types';
import { Touchable, Label } from './styles';

export function Button({ title, onClick, variant = 'primary', size = 'md', disabled, loading }: ButtonProps) {
  return (
    <Touchable onPress={onClick} disabled={disabled || loading} variant={variant} size={size}>
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? '#0a0a0a' : '#ff2d78'} />
        : <Label variant={variant} size={size}>{`[ ${title} ]`}</Label>
      }
    </Touchable>
  );
}
