import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
  padding: ${({ theme }) => theme.spacing.xl}px;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xl}px;
`;

export const Fields = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Actions = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;
