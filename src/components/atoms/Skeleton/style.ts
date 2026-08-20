import type { Theme } from '@/theme';
import { StyleSheet } from 'react-native';

export const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      minHeight: 24,
      minWidth: '100%',
    },
    skeleton: {
      backgroundColor: theme.colors.skeleton,
      borderRadius: theme.radii.xs,
    },
  });
