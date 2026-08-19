import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

export type KeyboardState = {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
};

/**
 * Standalone keyboard hook. Extracted from ThemeContext so theming and input
 * layout are decoupled. Consumers that need both can call this hook directly
 * or pull `keyboardHeight` from `useTheme()`.
 */
export function useKeyboard(): KeyboardState {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', frames => {
      setKeyboardVisible(true);
      setKeyboardHeight(frames.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return { isKeyboardVisible, keyboardHeight };
}
