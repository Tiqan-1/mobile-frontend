import type { Theme } from '@/theme';
import { StyleSheet } from 'react-native';

export const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.gray200,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    radioSelected: {
      borderColor: theme.colors.BUTTON_MAIN_COLOR,
    },
    inner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.BUTTON_MAIN_COLOR,
    },
    label: {},
    disabledText: {
      color: theme.colors.gray200,
    },
  });
