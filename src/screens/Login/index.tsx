import type { RootScreenProps } from '@/navigation/types';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import ActionSheet from 'react-native-actionsheet';

import { useTheme } from '@/theme';
import { useI18n } from '@/hooks';
import { LANG_AR, LANG_EN } from '@/hooks/language/useI18n';
import { Paths } from '@/navigation/paths';

import { AssetByVariant } from '@/components/atoms';
import { SmallText } from '@/components/atoms/Text';
import { LanguageSwitcher } from '@/components/molecules';
import { SafeScreen } from '@/components/templates';

import IconDown from '@/assets/svg/icon-down.svg';
import api, { initStateAPIState } from '@/utils/API';

function onChangeLocale(nextlocale: string) {
  api.setHeader('X-localization', nextlocale);
}

function Login({ navigation }: RootScreenProps<Paths.Login>) {
  const { fonts, gutters, layout } = useTheme();
  const { t, i18n } = useTranslation();
  const sheet = useRef(null);

  const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);
  const { toggleLanguage, changeLanguage } = useI18n();
  const currentLanguage = i18n.language;

  const changeLang = (index) => {
    if (index === 0) {
      changeLanguage(LANG_EN);
      onChangeLocale(LANG_EN);
    } else if (index === 1) {
      changeLanguage(LANG_AR);
      onChangeLocale(LANG_AR);
    }
  };

  return (
    <SafeScreen>
      <View
        style={[
          layout.flex_1,
          layout.col,
          layout.itemsCenter,
          layout.justifyCenter,
        ]}>
        <Pressable onPress={() => {sheet.current?.show()}}>
          <IconDown/>
          <Text>{currentLanguage}</Text>
        </Pressable>
        <Text style={[fonts.size_40, fonts.gray800, fonts.bold]}>
          {t('screen_example.title')}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: 50, height: 50, backgroundColor: 'red' }} />
          <View style={{ width: 50, height: 50, backgroundColor: 'blue' }} />
        </View>
        {apiState.loading && (
          <ActivityIndicator size="large" style={[gutters.marginVertical_24]} />
        )}
        {apiState.error && (
          <Text style={[fonts.size_16, fonts.red500]}>{t('common_error')}</Text>
        )}
      </View>

      <ActionSheet
        ref={sheet}
        title={t('cahngelang')}
        options={['English', 'عربي', 'Hide']}
        cancelButtonIndex={2}
        destructiveButtonIndex={-1}
        onPress={(index) => {
          changeLang(index);
        }}
      />
    </SafeScreen>
  );
}

export default Login;
