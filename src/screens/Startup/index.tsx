import type { RootScreenProps } from '@/navigation/types';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';

import { SafeScreen } from '@/components/templates';

import MainLogo from '@/assets/logo/main-logo.svg';
import { GET, initStateAPIState } from '@/utils/API';

function Startup({ navigation }: RootScreenProps<Paths.Startup>) {
  const { fonts, gutters, layout } = useTheme();
  const { t } = useTranslation();
  const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);

  const auth = useAppSelector((store) => store.auth);

  useEffect(() => {
    GET('/app', setapiState).then(() => {
      if (auth.isAuth) {
      } else {
        navigation.reset({
          index: 0,
          routes: [
            { name: Paths.Auth },
          ],
        });
      }
    });
  }, []);

  return (
    <SafeScreen>
      <View
        style={[
          layout.flex_1,
          layout.col,
          layout.itemsCenter,
          layout.justifyCenter,
        ]}>
        <MainLogo />
        {apiState.loading && (
          <ActivityIndicator size="large" style={[gutters.marginVertical_24]} />
        )}
        {apiState.error && (
          <Text style={[fonts.size_16, fonts.red500]}>{t('common_error')}</Text>
        )}
      </View>
    </SafeScreen>
  );
}

export default Startup;
