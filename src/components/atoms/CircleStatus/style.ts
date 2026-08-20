import type { Theme } from '@/theme';
import { StyleSheet } from 'react-native';

export const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      margin: theme.spacing.sm,
      width: 15,
      height: 15,
      borderRadius: theme.radii.sm,
      padding: theme.spacing.xs,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderStyle: 'dashed',
    },
    inner: {
      width: 8,
      height: 8,
      borderRadius: theme.radii.full,
      padding: theme.spacing.xs,
    },
  });
