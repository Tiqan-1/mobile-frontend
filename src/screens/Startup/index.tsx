import type { RootScreenProps } from '@/navigation/types';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import { useAppSelector } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';

import { SafeScreen } from '@/components/templates';

import MainLogo from '@/assets/logo/main-logo.svg';
import { GET, initStateAPIState } from '@/services/API';

function Startup({ navigation }: RootScreenProps<Paths.Startup>) {
  // const { fonts, gutters, layout } = useTheme();
  const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);

  const auth = useAppSelector((store) => store.auth);

  useEffect(() => {
    GET('/app', setapiState).then(() => {
      if (auth.isAuth) {
        navigation.reset({
          index: 0,
          routes: [{ name: Paths.Main }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: Paths.Auth }],
        });
      }
    });
  }, []);

  return (
    <SafeScreen>
      <View
        style={{
          flex: 1,
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <MainLogo />
        {apiState.loading && (
          <ActivityIndicator size="large" style={{ marginVertical: 24 }} />
        )}
      </View>
    </SafeScreen>
  );
}

export default Startup;
