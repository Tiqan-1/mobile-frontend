import type { Theme } from '@/theme';
import { StyleSheet } from 'react-native';

export const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
    },
    activity: {
      marginRight: theme.spacing.sm,
    },
    disabled: {
      opacity: 0.6,
    },
  });
