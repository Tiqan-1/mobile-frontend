import type { MMKV } from 'react-native-mmkv';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Keyboard, useColorScheme } from 'react-native';


import { PALETTEDARK, PALETTELIGHT, usePALETTE } from '../colors';

type ThemeColors = typeof PALETTEDARK | typeof PALETTELIGHT;

type ThemeContextType = {
  colors: ThemeColors;
  isDark: boolean;
  isKeyboardVisible: boolean;
  keyboardHeight: number;
  PALETTE: ThemeColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  storage: MMKV;
}> = ({ children, storage }) => {
  const systemColorScheme = useColorScheme();
  const { PALETTE, toLight, toDark } = usePALETTE();
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = storage.getString('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return systemColorScheme === 'dark';
  });

  useEffect(() => {
    storage.set('theme', isDark ? 'dark' : 'light');
  }, [isDark, storage]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    if (isDark) {
      toLight();
    } else {
      toDark();
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (frames) => {
        setKeyboardVisible(true); // or some other action
        setKeyboardHeight(frames.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const colors = isDark ? PALETTEDARK : PALETTELIGHT;

  return (
    <ThemeContext.Provider
      value={{
        colors,
        isDark,
        toggleTheme,
        PALETTE,
        isKeyboardVisible,
        keyboardHeight,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
