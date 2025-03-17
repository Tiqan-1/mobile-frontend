import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';

import EyeClose from 'assets/svg/input-eye-close.svg';
import Eye from 'assets/svg/input-eye.svg';
import { Formik } from 'formik';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import * as yup from 'yup';

import { useTheme } from '@/theme';

import Button from '@/components/atoms/Button';
import RadioButton from '@/components/atoms/RadioButton';

import { SmallTitle, Text } from '@/components/atoms/Text';
import TextInput from '@/components/atoms/TextInput';
import { SafeScreen } from '@/components/templates';

import { initStateAPIState, POST } from '@/services/API';

function SignUp({ navigation }: RootScreenProps<Paths.SignUp>) {
  const { fonts } = useTheme();
  const { t } = useTranslation();

  const [apiState, setapiState] = useState<APISTATE>(initStateAPIState);

  const [secure, setsecure] = useState(true);

  const initialValues = {
    name: '',
    email: '',
    gender: 'MALE',
    password: '',
  };

  const SignUpValidationSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    password: yup.string().required('Password is required'),
  });

  const handleSubmit = (values: typeof initialValues) => {
    POST('/api/students/sign-up', values, setapiState);
  };
  return (
    <SafeScreen>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <View style={style.header}>
          <SmallTitle>{t('screen_example.title')}</SmallTitle>
        </View>

        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={SignUpValidationSchema}>
          {({
            handleBlur,
            handleChange,
            values,
            errors,
            touched,
            handleSubmit,
            isValid,
            setFieldValue,
          }) => (
            <>
              <View style={style.inputGroup}>
                <Text>البريد الإلكتروني</Text>
                <TextInput
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  placeholder="أدخل بريدك الإلكتروني"
                  value={values.name}
                  keyboardType="email-address"
                  errors={touched.name ? errors.name : undefined}
                />
              </View>

              <View style={style.inputGroup}>
                <Text>{t('auth.email')}</Text>
                <TextInput
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  placeholder={t('auth.enter_email')}
                  value={values.email}
                  keyboardType="email-address"
                  errors={touched.email ? errors.email : undefined}
                />
              </View>

              <View style={style.inputGroup}>
                <View style={style.genderContainer}>

                  <View style={style.genderRadio}>
                    <RadioButton
                      label="MALE"
                      selected={values.gender === 'MALE'}
                      onPress={() => setFieldValue('gender', 'MALE')}
                    />
                    <RadioButton
                      label="FEMALE"
                      selected={values.gender  === 'FEMALE'}
                      onPress={() => setFieldValue('gender', 'FEMALE')}
                    />
                  </View>
                </View>
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
                  errors={touched.password ? errors.password : undefined}
                />
              </View>

              {apiState.error && (
                <Text style={[fonts.size_16, fonts.red500]}>
                  {t('common:common_error')}
                </Text>
              )}

              <Button
                type="main"
                title={t('auth.sign_up')}
                isLoading={apiState.loading}
                disabled={!isValid || apiState.loading}
                onPress={handleSubmit}
                buttonStyle={{ marginTop: 10 }}
              />
            </>
          )}
        </Formik>

        <View style={style.row}>
          <Text>{t('auth.have_account')}</Text>
          <Button
            type="underline"
            title={t('auth.login')}
            onPress={() => {navigation.navigate(Paths.Login)}}
          />
        </View>
      </View>
    </SafeScreen>
  );
}

export default SignUp;

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
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  genderSwitch: {
    flex: 1,
  },
  genderRadio: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
