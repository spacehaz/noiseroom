import styled from 'styled-components/native';

export const StyledTitle = styled.Text<{ size: 'sm' | 'md' | 'lg' | 'xl' }>`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme, size }) => theme.fontSize[size]}px;
  color: ${({ theme }) => theme.colors.accent};
`;
