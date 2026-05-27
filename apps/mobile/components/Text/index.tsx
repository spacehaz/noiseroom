import { TextProps } from './types';
import { StyledText } from './styles';

export function Text({ children, muted = false, error = false, size = 'md' }: TextProps) {
  return <StyledText muted={muted} error={error} size={size}>{children}</StyledText>;
}
