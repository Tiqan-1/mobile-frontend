import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useI18n } from '@/hooks/language/useI18n';
import { Text } from '@/components/atoms/Text';

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

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  label: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 