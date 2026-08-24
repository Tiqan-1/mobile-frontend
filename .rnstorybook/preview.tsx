import type { Decorator, Preview } from '@storybook/react-native';
import { useState } from 'react';
import { I18nManager, Pressable, StyleSheet, View } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { ThemeProvider, useTheme } from '@/theme';

// Side-effect import — initializes i18next exactly like src/App.tsx does
// (there is no I18nextProvider in this app; react-i18next falls back to the
// default global instance once it's been init()'d). Also forces RTL at the
// native I18nManager level for the default 'ar' language, same as the app.
import '@/translations';

// Storybook's own theme toggle must not read/write the real app's persisted
// `theme` key (@/store's `storage`) — isolated MMKV instance instead.
const storybookStorage = createMMKV({ id: 'storybook-preview-theme' });

type Direction = 'ltr' | 'rtl';

function ToggleBar({ direction, onToggleDirection }: { direction: Direction; onToggleDirection: () => void }) {
  // ThemeProvider is above this in the tree, so useTheme() is safe here.
  const { isDark, toggleTheme } = useTheme();

  return (
    <View style={styles.toggleBar}>
      <Pressable onPress={toggleTheme} style={styles.toggleButton}>
        <Text style={styles.toggleLabel}>{isDark ? '🌙 Dark' : '☀️ Light'}</Text>
      </Pressable>
      <Pressable onPress={onToggleDirection} style={styles.toggleButton}>
        <Text style={styles.toggleLabel}>{direction === 'rtl' ? 'RTL ↔' : 'LTR ↔'}</Text>
      </Pressable>
    </View>
  );
}

// Global decorator — every story renders inside the real app ThemeProvider
// (light/dark toggle) and a direction toggle (RTL/LTR), plus SafeAreaProvider
// so components that read insets don't crash. See CLAUDE.md §5: `enableDark`
// is currently hardcoded false in src/utils/constants.ts, so the dark toggle
// here renders without crashing but is a visual no-op until T2f flips it —
// that gate lives outside T2c's Files in scope. The direction toggle uses
// Yoga's per-subtree `direction` style rather than I18nManager.forceRTL
// (which needs an app restart), so it takes effect immediately.
const withThemeAndDirection: Decorator = Story => {
  const [direction, setDirection] = useState<Direction>(I18nManager.isRTL ? 'rtl' : 'ltr');

  return (
    <SafeAreaProvider>
      <ThemeProvider storage={storybookStorage}>
        <ToggleBar direction={direction} onToggleDirection={() => setDirection(d => (d === 'rtl' ? 'ltr' : 'rtl'))} />
        <View style={[styles.stage, { direction }]}>
          <Story />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    padding: 16,
  },
  toggleBar: {
    backgroundColor: '#00000014',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toggleLabel: {
    fontWeight: '600',
  },
});

const preview: Preview = {
  decorators: [withThemeAndDirection],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
