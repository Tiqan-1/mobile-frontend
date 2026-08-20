import { useTheme } from '@/theme';
import React from 'react';
import { forwardRef, memo } from 'react';
import type { View } from 'react-native';
import { ActivityIndicator, TouchableOpacity } from 'react-native';

import Text from '@/components/atoms/Text';

import { bestButtonColor, isLight } from '@/utils/helpers';

import { getStyles } from './style';

export type ButtonTypes = 'icon' | 'main' | 'outline' | 'underline';

export interface ButtonProps {
  /**
   * Button type - determines the visual style
   */
  type?: ButtonTypes;
  /**
   * Text to display inside the button
   */
  title?: string;
  /**
   * Text style type from Text component
   */
  textType?: string;
  /**
   * Function to call when button is pressed
   */
  onPress?: () => void;
  /**
   * Additional style for the text
   */
  style?: import('react-native').TextStyle;
  /**
   * Additional style for the button container
   */
  buttonStyle?: import('react-native').ViewStyle;
  /**
   * Whether the text should be dotted
   */
  dotted?: boolean;
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
  /**
   * Custom content to render inside the button
   */
  children?: React.ReactNode;
  /**
   * Whether to show loading indicator
   */
  isLoading?: boolean;
  /**
   * Color of the loading indicator
   */
  loadingColor?: string;
  /**
   * Background color of the button
   */
  bgColor?: string;
  /**
   * Whether to support right-to-left text
   */
  withRTL?: boolean;
  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;
  /**
   * Accessibility hint provides additional context
   */
  accessibilityHint?: string;
  /**
   * Whether the element is currently active or selected
   */
  accessibilityState?: {
    busy?: boolean;
    checked?: 'mixed' | boolean;
    disabled?: boolean;
    expanded?: boolean;
    selected?: boolean;
  };
  /**
   * Tells screen reader the type of element
   */
  accessibilityRole?: 'button' | 'link' | 'none';
}

const Button = forwardRef<View, ButtonProps>((props, ref) => {
  const {
    type = 'main',
    textType = 'text',
    title,
    onPress = () => {},
    style = {},
    buttonStyle = {},
    dotted = false,
    disabled = false,
    testID,
    children,
    isLoading = false,
    loadingColor,
    bgColor,
    withRTL = false,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState,
    accessibilityRole = 'button',
  } = props;

  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const buttonStyles = React.useMemo(() => {
    if (bgColor) {
      const backgroundColor = bestButtonColor(bgColor);
      const color = isLight(backgroundColor) ? theme.colors.BLACK : theme.colors.WHITE;

      return {
        backgroundColor,
        color,
      };
    }
    return {
      backgroundColor: undefined,
      color: undefined,
    };
  }, [bgColor, theme]);

  const buttonStyleByType = React.useMemo(
    () => ({
      main: {
        backgroundColor: theme.colors.BUTTON_MAIN_COLOR,
        borderRadius: theme.radii.sm,
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.xl,
      },
      underline: {
        backgroundColor: 'transparent',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.BUTTON_MAIN_COLOR,
        borderRadius: theme.radii.sm,
      },
      icon: {
        backgroundColor: theme.colors.BUTTON_MAIN_COLOR,
        borderRadius: theme.radii.sm,
        flexDirection: 'row',
      },
    }),
    [theme],
  );

  const textStyleByType = React.useMemo(
    () => ({
      main: {
        color: theme.colors.WHITE,
        textAlign: 'center',
      },
      underline: {
        color: theme.colors.BUTTON_MAIN_COLOR,
        textDecorationLine: 'underline',
      },
      outline: {
        color: theme.colors.BUTTON_MAIN_COLOR,
        textAlign: 'center',
      },
      icon: {
        color: theme.colors.WHITE,
        textAlign: 'center',
      },
    }),
    [theme],
  );

  const handlePress = () => {
    if (!disabled && !isLoading && onPress) {
      onPress();
    }
  };

  const renderButtonContent = () => {
    return (
      <>
        {isLoading && (
          <ActivityIndicator
            color={
              loadingColor ||
              (type === 'main' ? theme.colors.WHITE : theme.colors.BUTTON_MAIN_COLOR)
            }
            style={styles.activity}
          />
        )}
        {children || (
          <Text
            dotted={dotted}
            style={[
              textStyleByType[type] as import('react-native').TextStyle,
              buttonStyles.color && { color: buttonStyles.color },
              style,
            ]}
            // @ts-ignore - Ignoring type issues with Text component
            type={textType}
            withRTL={withRTL}>
            {title}
          </Text>
        )}
      </>
    );
  };

  return (
    <TouchableOpacity
      ref={ref}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled || isLoading}
      onPress={handlePress}
      style={[
        styles.button,
        buttonStyleByType[type],
        buttonStyles.backgroundColor && {
          backgroundColor: buttonStyles.backgroundColor,
        },
        disabled && styles.disabled,
        buttonStyle,
      ]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: disabled || isLoading,
        busy: isLoading,
        ...accessibilityState,
      }}>
      {renderButtonContent()}
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

export default memo(Button);
