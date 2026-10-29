import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  padding-top: ${({ theme }) => theme.spacing.lg}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const Body = styled.View`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  padding-bottom: ${({ theme }) => theme.spacing.xl}px;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xl}px;
`;

export const StepIndicator = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const StepDot = styled.Text<{ active: boolean; done: boolean }>`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ theme, active, done }) =>
    active ? theme.colors.accent : done ? theme.colors.muted : theme.colors.border};
`;

export const StepContent = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const Options = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const OptionButton = styled.TouchableOpacity<{ selected?: boolean }>`
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme, selected }) => (selected ? theme.colors.accent : theme.colors.border)};
`;

export const OptionLabel = styled.Text<{ selected?: boolean }>`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.md}px;
  color: ${({ theme, selected }) => (selected ? theme.colors.accent : theme.colors.text)};
`;

export const ReviewRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const ReviewKey = styled.Text`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.muted};
`;

export const ReviewValue = styled.Text`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.accent};
`;

export const Actions = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;
