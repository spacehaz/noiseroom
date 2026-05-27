import styled from 'styled-components/native';

export const StyledText = styled.Text<{ muted: boolean; error: boolean; size: 'xs' | 'sm' | 'md' }>`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme, size }) => theme.fontSize[size]}px;
  color: ${({ theme, muted, error }) =>
    error ? theme.colors.error : muted ? theme.colors.muted : theme.colors.text};
`;
