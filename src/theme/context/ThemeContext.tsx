import React, { createContext, useContext, useMemo, useState } from 'react';
import type { MMKV } from 'react-native-mmkv';
import { PALETTEDARK, PALETTELIGHT } from '@/theme/tokens/colors';
import { spacing } from '@/theme/tokens/spacing';
import { radii } from '@/theme/tokens/radii';
import { getShadows } from '@/theme/tokens/shadows';
import { getTypographyStyles } from '@/theme/tokens/typography';
import { enableDark } from '@/utils/constants';
import { isRTL } from '@/utils/constants';
import { useKeyboard } from '@/theme/useKeyboard';

type Palette = typeof PALETTEDARK | typeof PALETTELIGHT;

export type ThemeContextType = {
  colors: Palette;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: ReturnType<typeof getShadows>;
  typography: ReturnType<typeof getTypographyStyles>;
  isDark: boolean;
  isRTL: boolean;
  PALETTE: Palette;
  toggleTheme: () => void;
  keyboardHeight: number;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  storage: MMKV;
}> = ({ children, storage }) => {
  const { keyboardHeight } = useKeyboard();

  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = storage.getString('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return false;
  });

  // Fallback: if no saved theme and system preference is unavailable, default to light
  const resolvedIsDark = isDark ?? false;

  React.useEffect(() => {
    storage.set('theme', resolvedIsDark ? 'dark' : 'light');
  }, [resolvedIsDark, storage]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const colors: Palette = enableDark && resolvedIsDark ? PALETTEDARK : PALETTELIGHT;

  // Memoize the entire theme value so consumers get a stable reference across
  // renders where nothing relevant has changed.
  const themeValue = useMemo<ThemeContextType>(
    () => ({
      colors,
      spacing,
      radii,
      shadows: getShadows(colors),
      typography: getTypographyStyles(colors),
      isDark: resolvedIsDark,
      isRTL,
      PALETTE: colors,
      toggleTheme,
      keyboardHeight,
    }),
    [colors, resolvedIsDark, keyboardHeight],
  );

  return (
    <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
