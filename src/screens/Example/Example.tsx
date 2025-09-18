import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';
import { useI18n } from '@/hooks';

import { AssetByVariant, IconByVariant, Skeleton } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';

function Example() {
  const { t } = useTranslation();
  const { toggleLanguage } = useI18n();
  const { colors, toggleTheme, isDark } = useTheme();
  const [currentId, setCurrentId] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert(t('screen_example.hello_user', { name: `User ${currentId}` }));
    } catch {
      Alert.alert('Error', 'Failed to fetch user');
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeTheme = () => {
    toggleTheme();
  };

  return (
    <SafeScreen>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.circle} />
          <View style={styles.imageContainer}>
            <AssetByVariant
              path={'tom'}
              resizeMode={'contain'}
              style={styles.image}
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.textSection}>
            <Text style={[styles.title, { color: colors.TEXT }]}>
              {t('screen_example.title')}
            </Text>
            <Text style={[styles.description, { color: colors.TEXT }]}>
              {t('screen_example.description')}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Skeleton
              height={64}
              loading={isLoading}
              style={styles.skeletonButton}
              width={64}
            >
              <TouchableOpacity
                onPress={() => {
                  setCurrentId(Math.ceil(Math.random() * 9 + 1));
                  fetchUser();
                }}
                style={[styles.button, { backgroundColor: colors.BUTTON_MAIN_COLOR }]}
                testID="fetch-user-button"
              >
                <IconByVariant path={'send'} stroke={colors.WHITE} />
              </TouchableOpacity>
            </Skeleton>

            <TouchableOpacity
              onPress={onChangeTheme}
              style={[styles.button, { backgroundColor: colors.BUTTON_MAIN_COLOR }]}
              testID="change-theme-button"
            >
              <IconByVariant path={'theme'} stroke={colors.WHITE} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleLanguage}
              style={[styles.button, { backgroundColor: colors.BUTTON_MAIN_COLOR }]}
              testID="change-language-button"
            >
              <IconByVariant path={'language'} stroke={colors.WHITE} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    position: 'relative',
  },
  circle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#f3f4f6',
  },
  imageContainer: {
    position: 'absolute',
    paddingTop: 80,
  },
  image: {
    height: 300,
    width: 300,
  },
  content: {
    paddingHorizontal: 32,
    marginTop: 40,
  },
  textSection: {
    marginTop: 40,
  },
  title: {
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonButton: {
    borderRadius: 32,
  },
});

export default Example;
