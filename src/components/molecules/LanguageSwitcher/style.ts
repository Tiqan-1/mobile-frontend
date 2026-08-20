import type { Theme } from '@/theme';
import { StyleSheet } from 'react-native';

export const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.xl,
      alignItems: 'center',
    },
    label: {
      marginBottom: theme.spacing.xl,
    },
    button: {
      backgroundColor: theme.colors.INFO,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xxl,
      borderRadius: theme.radii.sm,
    },
    buttonText: {
      color: theme.colors.WHITE,
      fontWeight: 'bold',
    },
  });
