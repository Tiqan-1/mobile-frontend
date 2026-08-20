import type { Theme } from '@/theme';
import { StyleSheet } from 'react-native';

export const getStyles = (theme: Theme) =>
  StyleSheet.create({
    shadow: {
      shadowColor: 'rgba(0,0,0,0.4)',
      shadowOffset: {
        width: 1,
        height: 5,
      },
      shadowOpacity: 0.34,
      shadowRadius: 6.27,
      elevation: 10,
    },
    iconClose: {
      marginRight: theme.spacing.sm,
      marginTop: theme.spacing.md,
      height: 40,
    },
    phoneContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.WHITE,
      height: 40,
      borderRadius: theme.radii.sm,
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      alignContent: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    textInput: {
      flex: 7,
      padding: 0,
    },
    placeholder: {
      position: 'absolute',
      top: 10,
      left: theme.spacing.xl,
      color: '#C5C5C5',
    },
    icon: {
      width: 24,
      height: 24,
      color: theme.colors.BUTTON_MAIN_COLOR,
    },
    iconContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: theme.spacing.lg,
    },
    error: {
      flexDirection: 'row',
      width: '100%',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginTop: theme.spacing.xs,
    },
    errorText: {
      color: theme.colors.ERROR,
      maxWidth: '95%',
    },
    iconButton: {
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
  });
