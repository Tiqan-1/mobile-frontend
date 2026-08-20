import { useTheme } from '@/theme';
import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useI18n } from '@/hooks/language/useI18n';
import { Text } from '@/components/atoms/Text';

import { getStyles } from './style';

/**
 * LanguageSwitcher component
 *
 * This component allows users to switch between available languages.
 * The selected language is stored in MMKV storage and will be loaded
 * automatically when the app is restarted.
 */
export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const { toggleLanguage } = useI18n();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const currentLanguage = i18n.language;

  return (
    <View style={styles.container}>
      <Text
        dotted={false}
        style={styles.label}
        type="text"
      >
        Current Language: {currentLanguage.toUpperCase()}
      </Text>
      <TouchableOpacity
        onPress={toggleLanguage}
        style={styles.button}
      >
        <Text
          dotted={false}
          style={styles.buttonText}
          type="text"
        >
          Switch to {currentLanguage === 'en' ? 'Arabic' : 'English'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
