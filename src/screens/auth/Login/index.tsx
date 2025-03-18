import type { RootScreenProps } from '@/navigation/types';

import EyeClose from 'assets/svg/input-eye-close.svg';
import Eye from 'assets/svg/input-eye.svg';
import { Formik } from 'formik';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import * as yup from 'yup';

import { useTheme } from '@/theme';
import { PALETTE } from '@/theme/colors';
import { useI18n } from '@/hooks';
import { LANG_AR, LANG_EN } from '@/hooks/language/useI18n';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';

import Button from '@/components/atoms/Button';
import Switch from '@/components/atoms/Switch';
import { SmallTitle, Text } from '@/components/atoms/Text';
import TextInput from '@/components/atoms/TextInput';
import { SafeScreen } from '@/components/templates';

import MainLogo from '@/assets/logo/main-logo.svg';
import IconDown from '@/assets/svg/icon-down.svg';
import api, { initStateAPIState, POST } from '@/services/API';
import { login } from '@/store/auth';

function onChangeLocale(nextlocale: string) {
  api.setHeader('X-localization', nextlocale);
}

function Login({ navigation }: RootScreenProps<Paths.Login>) {
  const { fonts, isDark, colors, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const sheet = useRef(null);

  const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);
  const { translate, changeLanguage } = useI18n();
  const [secure, setsecure] = useState(true);
  const dispatch = useAppDispatch();
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

  const loginValidationSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Name is required'),
    password: yup.string().required('Password is required'),
  });

  const handleSubmit = (vlaues) => {
    POST('/api/authentication/login', vlaues, setapiState).then((res) => {
      dispatch(login(res));
      navigation.navigate(Paths.Main);
    });
  };
  return (
    <SafeScreen>
      <View
        style={{
          flex: 1,
          paddingHorizontal: '20',
          backgroundColor: PALETTE.APP_BACKGROUND,
        }}>
        <Pressable
          onPress={() => {
            sheet.current?.show();
          }}
          style={style.row}>
          <Text>{currentLanguage}</Text>
          <IconDown />
        </Pressable>
        <Switch
          onValueChange={() => {
            toggleTheme();
          }}
          value={isDark}
        />
        <View style={style.header}>
          <MainLogo />

          <SmallTitle>{t('screen_example.title')}</SmallTitle>
        </View>

        <Formik
          initialValues={{ email: '', password: '' }}
          onSubmit={handleSubmit}
          validationSchema={loginValidationSchema}>
          {({
            handleBlur,
            handleChange,
            values,
            errors,
            touched,
            handleSubmit,
            isValid,
          }) => (
            <>
              <View style={style.inputGroup}>
                <Text>{t('auth.email')}</Text>
                <TextInput
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  placeholder={t('auth.enter_email')}
                  value={values.email}
                  keyboardType="email-address"
                  errors={touched.email ? [errors.email] : undefined}
                />
              </View>
              <View style={style.inputGroup}>
                <Text>{t('auth.password')}</Text>
                <TextInput
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={secure}
                  placeholder={t('auth.enter_password')}
                  value={values.password}
                  Icon={secure ? Eye : EyeClose}
                  onPressIcon={() => setsecure(!secure)}
                  errors={touched.password ? [errors.password] : undefined}
                />
              </View>

              {apiState.error && (
                <Text style={[fonts.size_16, fonts.red500]}>
                  {t('common_error')}
                </Text>
              )}

              <Button
                type="underline"
                title={t('auth.forgot_password')}
                disabled={!isValid || apiState.loading}
                buttonStyle={{ alignSelf: 'flex-end' }}
                onPress={() => {}}
              />

              <Button
                type="main"
                title={t('auth.login')}
                isLoading={apiState.loading}
                disabled={!isValid || apiState.loading}
                onPress={handleSubmit}
              />
            </>
          )}
        </Formik>

        <View style={style.row}>
          <Text>{t('auth.dont_have_account')}</Text>
          <Button
            type="underline"
            title={t('auth.sign_up')}
            onPress={() => {
              navigation.navigate(Paths.SignUp);
            }}
          />
        </View>
      </View>

      <Button
        type="underline"
        title={t('auth.sign_up')}
        onPress={() => {
          navigation.navigate(Paths.AccessibilitySettings);
        }}
      />
      <ActionSheet
        ref={sheet}
        title={t('change_language')}
        options={['English', 'عربي', 'Hide']}
        cancelButtonIndex={2}
        destructiveButtonIndex={-1}
        onPress={(index: number) => {
          changeLang(index);
        }}
      />
    </SafeScreen>
  );
}

export default Login;

const style = StyleSheet.create({
  header: {
    alignItems: 'center',
    width: '100%',
    marginTop: 100,
    justifyContent: 'center',
  },
  inputGroup: {
    marginTop: 10,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    marginTop: 10,
  },
});
