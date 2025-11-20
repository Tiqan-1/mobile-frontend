import { handleErrorMessage, handleSuccessMessage } from '@/components/atoms/FlashMessage';
import { Text } from '@/components/atoms/Text';
import { SafeScreen } from '@/components/templates';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { DELETE, initStateAPIState } from '@/services/API';
import { persistor } from '@/store';
import { logout, setisSUAuth } from '@/store/auth';
import { resetDocuments } from '@/store/documentsSlice';
import { resetSubscriptions } from '@/store/subscriptionSlice';
import { useTheme } from '@/theme';
import { CommonActions } from '@react-navigation/native';
import _ from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Button, Pressable, StyleSheet, View } from 'react-native';

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
  const { colors } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAccount = () => {
    Alert.alert(
      'حذف الحساب',
      'هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع بياناتك بشكل نهائي.',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
          isPreferred: true,
        },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await DELETE('/api/students', {});
              handleSuccessMessage('تم حذف الحساب بنجاح');
              await logOut();
            } catch (error) {
              handleErrorMessage(error as object);
              setIsDeleting(false);
            }
          },
        },
      ],
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
        <Button onPress={handleDeleteAccount} title="حذف الحساب" />

        <Button onPress={logOut} title="تسجيل الخروج" />
      </View>
      {isDeleting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.PRIMARY_COLOR} />
        </View>
      )}
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});
