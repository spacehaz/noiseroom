import styled from 'styled-components/native';

export const Touchable = styled.TouchableOpacity<{ variant: 'primary' | 'secondary'; size: 'sm' | 'md' }>`
  padding-vertical: ${({ theme, size }) => size === 'sm' ? theme.spacing.xs : theme.spacing.sm}px;
  padding-horizontal: ${({ theme, size }) => size === 'sm' ? theme.spacing.sm : theme.spacing.md}px;
  background-color: ${({ theme, variant }) =>
    variant === 'primary' ? theme.colors.accent : 'transparent'};
  border-width: ${({ variant }) => (variant === 'secondary' ? '1px' : '0px')};
  border-color: ${({ theme }) => theme.colors.highlight};
  align-self: flex-start;
`;

export const Label = styled.Text<{ variant: 'primary' | 'secondary'; size: 'sm' | 'md' }>`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme, size }) => size === 'sm' ? theme.fontSize.xs : theme.fontSize.md}px;
  color: ${({ theme, variant }) =>
    variant === 'primary' ? theme.colors.bg : theme.colors.highlight};
`;
