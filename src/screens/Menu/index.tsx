import { Text } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { initStateAPIState } from '@/services/API';
import { logout } from '@/store/auth';
import { resetDocuments } from '@/store/documentsSlice';
import { resetSubscriptions } from '@/store/subscriptionSlice';
import { useTheme } from '@/theme';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Pressable, StyleSheet, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { persistor } from '@/store';

interface MenuElementProps {
  title: string;
}

function MenuElement({ title }: MenuElementProps) {
  const { colors } = useTheme();
  // const { t, i18n } = useTranslation();
  // const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);
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
  // const { isDark, colors, toggleTheme } = useTheme();
  // const { t, i18n } = useTranslation();
  // const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);
  const dispatch = useAppDispatch();

  const logOut = async () => {
    // Clear all store data
    dispatch(logout());
    dispatch(resetDocuments());
    dispatch(resetSubscriptions());
    
    // Purge persisted data
    await persistor.purge();
    
    // Reset navigation stack to Auth screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: Paths.Auth }],
      })
    );
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* <MenuElement title={'Home'} />
        <MenuElement title={'About'} />
        <MenuElement title={'Contact'} />
        <MenuElement title={'Settings'} />
        <MenuElement title={'AccessibilitySettings'} /> */}
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
