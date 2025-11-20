import Button from '@/components/atoms/Button';
import RadioButton from '@/components/atoms/RadioButton';
import { ExSmallText, SmallTitle, Text } from '@/components/atoms/Text';
import TextInput from '@/components/atoms/TextInput';
import { SafeScreen } from '@/components/templates';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { initStateAPIState, POST } from '@/services/API';
import { useTheme } from '@/theme';
import EyeClose from 'assets/svg/input-eye-close.svg';
import Eye from 'assets/svg/input-eye.svg';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, View } from 'react-native';
import * as yup from 'yup';

function SignUp({ navigation }: RootScreenProps<Paths.SignUp>) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [apiState, setapiState] = useState<APISTATE<unknown>>(initStateAPIState);

  const [secure, setsecure] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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
      .matches(/\w*[a-z]\w*/, 'كلمة المرور يجب أن تحتوي علي حرف صغير')
      .matches(/\w*[A-Z]\w*/, 'كلمة المرور يجب أن تحتوي علي حرف كبير')
      .matches(/\d/, 'كلمة المرور يجب أن تحتوي علي رقم')
      .matches(/[ !"#$%&()*+,.:;<=>@^_{}\-]/, 'كلمة المرور يجب أن تحتوي علي حرف خاص')
      .min(8, ({ min }) => `كلمة المرور يجب أن تحتوي علي  ${min} حروف`)
      .required('كلمة المرور مطلوبة'),
  });

  const handleSubmit = (values: typeof initialValues) => {
    POST('/api/students/sign-up', values, setapiState).then(res => {
      // Show success modal with email instead of navigating directly
      setRegisteredEmail(values.email);
      setShowSuccessModal(true);
    });
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    navigation.navigate(Paths.Login, { email: registeredEmail });
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
                  errors={errors.email ? errors.email : undefined}
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
                  errors={errors.password ? errors.password : undefined}
                />
              </View>

              {apiState.error && <ExSmallText style={{ color: colors.ERROR }}>{apiState.error || t('common_error')}</ExSmallText>}

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

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}>
        <View style={style.modalOverlay}>
          <View style={[style.modalContent, { backgroundColor: colors.SURFACE }]}>
            <SmallTitle style={{ marginBottom: 16, textAlign: 'center' }}>
              تحقق من بريدك الإلكتروني
            </SmallTitle>
            <Text style={{ marginBottom: 8, textAlign: 'center' }}>
              يرجى التحقق من بريدك الإلكتروني وتأكيد حسابك قبل تسجيل الدخول.
            </Text>
            <Text style={{ marginBottom: 16, textAlign: 'center', fontWeight: 'bold', color: colors.PRIMARY_COLOR }}>
              {registeredEmail}
            </Text>
            <Button
              type="main"
              title={t('auth.login')}
              onPress={handleGoToLogin}
              buttonStyle={{ marginTop: 10 }}
            />
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
});
