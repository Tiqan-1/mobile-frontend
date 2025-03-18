import { useRef, useCallback } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';

/**
 * Hook to manage accessibility focus
 * @returns Object with methods to manage accessibility focus
 */
export const useAccessibilityFocus = () => {
  const ref = useRef<any>(null);

  /**
   * Set focus to the referenced element
   */
  const setFocus = useCallback(() => {
    if (ref.current) {
      const reactTag = findNodeHandle(ref.current);
      if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }
  }, []);

  /**
   * Announce a message to screen readers
   * @param message The message to announce
   */
  const announce = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  /**
   * Check if screen reader is enabled
   * @returns Promise that resolves to a boolean
   */
  const isScreenReaderEnabled = useCallback(() => {
    return AccessibilityInfo.isScreenReaderEnabled();
  }, []);

  return {
    ref,
    setFocus,
    announce,
    isScreenReaderEnabled,
  };
}; 