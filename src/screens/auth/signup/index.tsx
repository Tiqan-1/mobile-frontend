import Button from '@/components/atoms/Button';
import RadioButton from '@/components/atoms/RadioButton';
import { SmallTitle, Text } from '@/components/atoms/Text';
import TextInput from '@/components/atoms/TextInput';
import { SafeScreen } from '@/components/templates';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import api, { initStateAPIState, POST } from '@/services/API';
import { login } from '@/store/auth';
import { useTheme } from '@/theme';
import EyeClose from 'assets/svg/input-eye-close.svg';
import Eye from 'assets/svg/input-eye.svg';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import * as yup from 'yup';

function SignUp({ navigation }: RootScreenProps<Paths.SignUp>) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [apiState, setapiState] = useState<APISTATE<unknown>>(initStateAPIState);

  const [secure, setsecure] = useState(true);
  const dispatch = useAppDispatch();

  const initialValues = {
    name: '',
    email: '',
    gender: 'male',
    password: '',
  };

  const SignUpValidationSchema = yup.object().shape({
    name: yup.string().required(t('auth.email_invalid')),
    email: yup.string().email(t('auth.email_invalid')).required(t('auth.email_required')),
    password: yup
      .string()
      .matches(/\w*[a-z]\w*/, 'Password must have a small letter')
      .matches(/\w*[A-Z]\w*/, 'Password must have a capital letter')
      .matches(/\d/, 'Password must have a number')
      .matches(/[!@#$%^&*()\-_"=+{}; :,<.>]/, 'Password must have a special character')
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required('Password is required'),
  });

  const handleSubmit = (values: typeof initialValues) => {
    POST('/api/students/sign-up', values, setapiState).then(res => {
      const token = res.accessToken;
      api.setHeader('Authorization', `bearer ${token}`);
      dispatch(login(res));
      navigation.navigate(Paths.TabNav);
    });
  };
  return (
    <SafeScreen isScroll>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <View style={style.header}>
          <SmallTitle>{t('screen_example.title')}</SmallTitle>
        </View>

        <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={SignUpValidationSchema}>
          {({ handleBlur, handleChange, values, errors, touched, handleSubmit, isValid, setFieldValue }) => (
            <>
              <View style={style.inputGroup}>
                <Text>{t('auth.name')}</Text>
                <TextInput
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  placeholder={t('auth.enter_name')}
                  value={values.name}
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
                    <RadioButton label="male" selected={values.gender === 'male'} onPress={() => setFieldValue('gender', 'male')} />
                    <RadioButton label="female" selected={values.gender === 'female'} onPress={() => setFieldValue('gender', 'female')} />
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

              {apiState.error && <Text style={{ color: colors.ERROR }}>{t('common_error')}</Text>}

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
            onPress={() => {
              navigation.navigate(Paths.Login);
            }}
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
