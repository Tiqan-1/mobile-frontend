import { AccessibilityInfo } from 'react-native';

/**
 * Announces a message to screen readers
 * @param message The message to announce
 */
export const announceToScreenReader = (message: string): void => {
  AccessibilityInfo.announceForAccessibility(message);
};

/**
 * Creates accessibility props for a component
 * @param label The accessibility label
 * @param hint Additional context for the user
 * @param role The role of the element
 * @param state The state of the element
 * @returns Object with accessibility props
 */
export const createAccessibilityProps = (
  label?: string,
  hint?: string,
  role?: 'button' | 'header' | 'image' | 'link' | 'none' | 'search' | 'text',
  state?: {
    busy?: boolean;
    checked?: boolean;
    disabled?: boolean;
    expanded?: boolean;
    selected?: boolean;
  }
) => {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
    accessibilityState: state,
  };
};

/**
 * Creates accessibility props for an image
 * @param description Description of the image
 * @returns Object with accessibility props for an image
 */
export const createImageAccessibilityProps = (description: string) => {
  return createAccessibilityProps(
    description,
    undefined,
    'image'
  );
};

/**
 * Creates accessibility props for a button
 * @param label Button label
 * @param hint Additional context
 * @param disabled Whether the button is disabled
 * @returns Object with accessibility props for a button
 */
export const createButtonAccessibilityProps = (
  label: string,
  hint?: string,
  disabled?: boolean
) => {
  return createAccessibilityProps(
    label,
    hint,
    'button',
    { disabled }
  );
};

/**
 * Creates accessibility props for a header
 * @param title Header title
 * @returns Object with accessibility props for a header
 */
export const createHeaderAccessibilityProps = (title: string) => {
  return createAccessibilityProps(
    title,
    undefined,
    'header'
  );
};

/**
 * Checks if a screen reader is currently enabled
 * @returns Promise that resolves to a boolean
 */
export const isScreenReaderEnabled = (): Promise<boolean> => {
  return AccessibilityInfo.isScreenReaderEnabled();
}; 