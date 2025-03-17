import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// Use require for modules without type declarations

import { PALETTE } from '@/theme/colors';

// Import Text component and its types
import Text from '@/components/atoms/Text';

import { bestButtonColor, isLight } from '@/utils/helpers';

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
  style?: TextStyle;
  /**
   * Additional style for the button container
   */
  buttonStyle?: ViewStyle;
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
}

/**
 * A reusable button component that supports different styles
 */
const Button: React.FC<ButtonProps> = ({
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
}) => {
  // Simplified color handling without external helpers
  const buttonStyles = React.useMemo(() => {
    if (bgColor) {
      const backgroundColor = bestButtonColor(bgColor);
      const color = isLight(backgroundColor) ? PALETTE.BLACK : PALETTE.WHITE;

      return {
        backgroundColor,
        color,
      };
    }
    return {
      backgroundColor: undefined,
      color: undefined,
    };
  }, [bgColor]);

  // Button styles based on type
  const buttonStyleByType = React.useMemo(
    () => ({
      main: {
        backgroundColor: PALETTE.BUTTON_MAIN_COLOR,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
      },
      underline: {
        backgroundColor: 'transparent',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: PALETTE.BUTTON_MAIN_COLOR,
        borderRadius: 8,
      },
      icon: {
        backgroundColor: PALETTE.BUTTON_MAIN_COLOR,
        borderRadius: 8,
        flexDirection: 'row',
      },
    }),
    []
  );

  // Text styles based on button type
  const textStyleByType = React.useMemo(
    () => ({
      main: {
        color: PALETTE.WHITE,
        textAlign: 'center',
      },
      underline: {
        color: PALETTE.BUTTON_MAIN_COLOR,
        textDecorationLine: 'underline',
      },
      outline: {
        color: PALETTE.BUTTON_MAIN_COLOR,
        textAlign: 'center',
      },
      icon: {
        color: PALETTE.WHITE,
        textAlign: 'center',
      },
    }),
    []
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
              (type === 'main' ? PALETTE.WHITE : PALETTE.BUTTON_MAIN_COLOR)
            }
            style={styles.activity}
          />
        )}
        {children || (
          <Text
            dotted={dotted}
            style={[
              textStyleByType[type],
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
    <View>
      <TouchableOpacity
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
        testID={testID}>
        {renderButtonContent()}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  activity: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button;
