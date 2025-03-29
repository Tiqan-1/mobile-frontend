import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';

import { Text } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';

import { initStateAPIState } from '@/services/API';
import { logout } from '@/store/auth';


interface MenuElementProps {
  title: string;
}


function MenuElement({ title }: MenuElementProps) {
  const { isDark, colors, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);
  const dispatch = useAppDispatch();
  return (
    <View
      style={{
        width: '100%',
        backgroundColor: colors.SURFACE,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginVertical: 5,
      }}>
      <Pressable>
        <Text>{title}</Text>
      </Pressable>
    </View>
  );
}

function Menu({ navigation }: RootScreenProps<Paths.Menu>) {
  const { isDark, colors, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);
  const dispatch = useAppDispatch();


  const logOut = () => {
    dispatch(logout());

    navigation.navigate(Paths.Auth);
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <MenuElement title={'Home'} />
        <MenuElement title={'About'} />
        <MenuElement title={'Contact'} />
        <MenuElement title={'Settings'} />
        <MenuElement title={'AccessibilitySettings'} />
        <Button onPress={logOut} title="Logout" />

      </View>
    </SafeScreen>
  );
}
export default Menu;
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
