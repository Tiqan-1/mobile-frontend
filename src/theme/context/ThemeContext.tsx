import type { MMKV } from 'react-native-mmkv';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { PALETTEDARK, PALETTELIGHT, usePALETTE } from '../colors';

type ThemeColors = typeof PALETTEDARK | typeof PALETTELIGHT;

type ThemeContextType = {
  colors: ThemeColors;
  isDark: boolean;
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

  const colors = isDark ? PALETTEDARK : PALETTELIGHT;


  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme, PALETTE }}>
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
