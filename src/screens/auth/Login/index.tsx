import MainLogo from '@/assets/logo/main-logo.svg';
import IconDown from '@/assets/svg/icon-down.svg';
import Button from '@/components/atoms/Button';
import Switch from '@/components/atoms/Switch';
import { SmallTitle, Text } from '@/components/atoms/Text';
import TextInput from '@/components/atoms/TextInput';
import { SafeScreen } from '@/components/templates';
import { useI18n } from '@/hooks';
import { LANG_AR, LANG_EN } from '@/hooks/language/useI18n';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import api, { initStateAPIState, POST } from '@/services/API';
import { login } from '@/store/auth';
import { useTheme } from '@/theme';
import { PALETTE } from '@/theme/colors';
import EyeClose from 'assets/svg/input-eye-close.svg';
import Eye from 'assets/svg/input-eye.svg';
import { Formik } from 'formik';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import * as yup from 'yup';

function onChangeLocale(nextlocale: string) {
  api.setHeader('X-localization', nextlocale);
}

function Login({ navigation, route }: RootScreenProps<Paths.Login>) {
  const { isDark, colors, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const sheet = useRef<ActionSheet>(null);

  const [apiState, setapiState] = useState<APISTATE<unknown>>(initStateAPIState);
  const { changeLanguage } = useI18n();
  const [secure, setsecure] = useState(true);
  const dispatch = useAppDispatch();
  const currentLanguage = i18n.language;

  // Get email from route params if available
  const emailFromParams = route.params?.email || '';

  const changeLang = (index: number) => {
    if (index === 0) {
      changeLanguage(LANG_EN);
      onChangeLocale(LANG_EN);
    } else if (index === 1) {
      changeLanguage(LANG_AR);
      onChangeLocale(LANG_AR);
    }
  };

  const initialValues = { 
    email: emailFromParams || (__DEV__ ? 'm@m.com' : ''), 
    password: __DEV__ ? 'Aa@123123' : '' 
  };
  const loginValidationSchema = yup.object().shape({
    email: yup.string().email(t('auth.email_invalid')).required(t('auth.email_required')),
    password: yup.string().required(t('auth.password_required')),
  });

  const handleSubmit = (vlaues: typeof initialValues) => {
    POST('/api/authentication/login', vlaues, setapiState).then(res => {
      const token = res.accessToken;
      api.setHeader('Authorization', `bearer ${token}`);
      dispatch(login(res));
      navigation.navigate(Paths.TabNav);
    });
  };
  return (
    <SafeScreen isScroll>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          backgroundColor: PALETTE.APP_BACKGROUND,
        }}>
        {/* <Pressable onPress={() => sheet.current?.show?.()} style={style.row}>
          <Text>{currentLanguage}</Text>
          <IconDown />
        </Pressable>
        <Switch
          onValueChange={() => {
            toggleTheme();
          }}
          value={isDark}
        /> */}
        <View style={style.header}>
          <MainLogo />

          <SmallTitle>{t('screen_example.title')}</SmallTitle>
        </View>

        <Formik 
          initialValues={initialValues} 
          onSubmit={handleSubmit} 
          validationSchema={loginValidationSchema}
          enableReinitialize={true}>
          {({ handleBlur, handleChange, values, errors, touched, handleSubmit, isValid }) => (
            <>
              <View style={style.inputGroup}>
                <Text>{t('auth.email')}</Text>
                <TextInput
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  placeholder={t('auth.enter_email')}
                  value={values.email}
                  keyboardType="email-address"
                  errors={touched.email ? [errors.email || ''] : ''}
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
                  errors={touched.password ? [errors.password || ''] : undefined}
                />
              </View>

              {apiState.error && <Text style={{ color: colors.ERROR }}>{apiState.error || t('common_error')}</Text>}

              <Button
                type="underline"
                title={t('auth.forgot_password')}
                disabled={!isValid || apiState.loading}
                buttonStyle={{ alignSelf: 'flex-end' }}
                onPress={() => {
                  navigation.navigate(Paths.ForgotPassword);
                }}
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

      {__DEV__ && (
        <Button
          type="underline"
          title="Fast Login Dev"
          onPress={() => {
            handleSubmit({ email: 'm@m.com', password: 'Aa@123123' });
          }}
        />
      )}

      {/* <Button
        type="underline"
        title={t('common:AccessibilitySettings')}
        onPress={() => {
          navigation.navigate(Paths.AccessibilitySettings);
        }}
      /> */}
      <ActionSheet
        ref={sheet}
        title={t('common:change_language')}
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
