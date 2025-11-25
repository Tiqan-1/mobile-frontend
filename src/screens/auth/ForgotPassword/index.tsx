import MainLogo from '@/assets/logo/main-logo.svg';
import Button from '@/components/atoms/Button';
import { SmallTitle, Text } from '@/components/atoms/Text';
import TextInput from '@/components/atoms/TextInput';
import { SafeScreen } from '@/components/templates';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { GET, initStateAPIState, POST } from '@/services/API';
import { useTheme } from '@/theme';
import { PALETTE } from '@/theme/colors';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import * as yup from 'yup';

function ForgotPassword({ navigation }: RootScreenProps<Paths.ForgotPassword>) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [apiState, setapiState] = useState<APISTATE<unknown>>(initStateAPIState);
  const [successMessage, setSuccessMessage] = useState('');

  const initialValues = { email: __DEV__ ? 'm@m.com' : '' };
  const forgotPasswordValidationSchema = yup.object().shape({
    email: yup.string().email(t('auth.email_invalid')).required(t('auth.email_required')),
  });

  const handleSubmit = (values: typeof initialValues) => {
    setSuccessMessage('');
    GET(`/api/authentication/forgot-password/${values.email}`, {}, setapiState).then(res => {
      setSuccessMessage(t('auth.reset_link_sent'));
      // Navigate back to login after a delay
      setTimeout(() => {
        navigation.navigate(Paths.Login);
      }, 2000);
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
        <View style={style.header}>
          <MainLogo />
          <SmallTitle>{t('screen_example.title')}</SmallTitle>
        </View>

        <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={forgotPasswordValidationSchema}>
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

              {apiState.error && <Text style={{ color: colors.ERROR }}>{apiState.error || t('common_error')}</Text>}
              {successMessage && <Text style={{ color: PALETTE.SUCCESS }}>{successMessage}</Text>}

              <Button
                type="main"
                title={t('auth.send_reset_link')}
                isLoading={apiState.loading}
                disabled={!isValid || apiState.loading}
                onPress={handleSubmit}
                buttonStyle={{ marginTop: 10 }}
              />
            </>
          )}
        </Formik>

        <View style={style.row}>
          <Text>{t('auth.remember_password')}</Text>
          <Button
            type="underline"
            title={t('auth.back_to_login')}
            onPress={() => {
              navigation.navigate(Paths.Login);
            }}
          />
        </View>
      </View>
    </SafeScreen>
  );
}

export default ForgotPassword;

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

