import { Text } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { initStateAPIState } from '@/services/API';
import { persistor } from '@/store';
import { logout, setisSUAuth } from '@/store/auth';
import { resetDocuments } from '@/store/documentsSlice';
import { resetSubscriptions } from '@/store/subscriptionSlice';
import { useTheme } from '@/theme';
import { CommonActions } from '@react-navigation/native';
import _ from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Pressable, StyleSheet, View } from 'react-native';

interface MenuElementProps {
  title: string;
}

function MenuElement({ title }: MenuElementProps) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  const [Swipe, setSwipe] = useState([]);
  const [Admin, setAdmin] = useState('');
  const activateD = __DEV__
    ? ['SWIPE_UP']
    : ['SWIPE_UP', 'SWIPE_UP', 'SWIPE_UP', 'SWIPE_DOWN', 'SWIPE_DOWN', 'SWIPE_UP', 'SWIPE_UP', 'SWIPE_DOWN'];
  if (_.isEqual(Swipe, activateD)) {
    console.log('Activated');
    setAdmin('Activated');
    dispatch(setisSUAuth(true));
    setSwipe([]);
  }
  // const { t, i18n } = useTranslation();
  // const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);
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
      }),
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
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
