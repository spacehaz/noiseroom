import { TitleProps } from './types';
import { StyledTitle } from './styles';

export function Title({ children, size = 'xl' }: TitleProps) {
  return <StyledTitle size={size}>{children}</StyledTitle>;
}
