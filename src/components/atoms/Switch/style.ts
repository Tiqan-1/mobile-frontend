import type { Theme } from '@/theme';
import { StyleSheet } from 'react-native';

export const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
    },
    label: {
      marginRight: theme.spacing.sm,
    },
  });
