import { StyleSheet } from 'react-native';
import { theme } from '@/theme';
import { ITEM_SIZE } from './_config';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  hint: {
    fontFamily: theme.font.mono,
    fontSize: theme.fontSize.xs,
    color: theme.colors.muted,
    lineHeight: 18,
  },
  grid: {
    position: 'relative',
  },
  greenBox: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinkBox: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderWidth: 1,
    borderColor: theme.colors.highlight,
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxChar: {
    fontFamily: theme.font.mono,
    fontSize: 11,
    color: theme.colors.text,
  },
  actions: {
    gap: 8,
  },
});
