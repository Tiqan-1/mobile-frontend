import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';

import Button from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';

import { GET, initStateAPIState, POST } from '@/services/API';
import { logout } from '@/store/auth';

function MainScreen({ navigation }: RootScreenProps<Paths.MainScreen>) {
  const { isDark, colors, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);
  const dispatch = useAppDispatch();
  useEffect(() => {
    GET('/api/subjects/all', {}, setapiState);
  }, []);

  const logOut = () => {
    dispatch(logout());

    navigation.navigate(Paths.Auth);
  };
  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text>MainScreen</Text>
      </View>

      <Button onPress={logOut} title="Logout" />
    </SafeScreen>
  );
}

export default MainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
