export const colors = {
  bg: '#0a0a0a',
  surface: '#111111',
  border: '#1f1f1f',
  accent: '#39ff14',
  highlight: '#ff2d78',
  text: '#e0e0e0',
  muted: '#444444',
  error: '#ff2d78',
};

export const font = {
  mono: 'SpaceMono',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
};

export const theme = { colors, font, spacing, fontSize };
export type AppTheme = typeof theme;
