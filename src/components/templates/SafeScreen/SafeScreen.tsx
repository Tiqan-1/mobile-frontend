import { DefaultError } from '@/components/molecules';
import { ErrorBoundary } from '@/components/organisms';
import { useTheme } from '@/theme/context/ThemeContext';
import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import type { SafeAreaViewProps } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = PropsWithChildren<
  {
    isError?: boolean;
    isScroll?: boolean;
    onResetError?: () => void;
  } & Omit<SafeAreaViewProps, 'mode'>
>;

function SafeScreen({ children = undefined, isError = false, onResetError = undefined, style, isScroll = false, ...props }: Props) {
  const { isDark, colors } = useTheme();
  return isScroll ? (
    <SafeAreaView {...props} mode="padding" style={[{ flex: 1, backgroundColor: colors.APP_BACKGROUND }, style]}>
      <StatusBar backgroundColor={colors.APP_BACKGROUND} barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ErrorBoundary onReset={onResetError}>
        {isError ? (
          <DefaultError onReset={onResetError} />
        ) : (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </ErrorBoundary>
    </SafeAreaView>
  ) : (
    <SafeAreaView {...props} mode="padding" style={[{ flex: 1, backgroundColor: colors.APP_BACKGROUND }, style]}>
      <StatusBar backgroundColor={colors.APP_BACKGROUND} barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ErrorBoundary onReset={onResetError}>{isError ? <DefaultError onReset={onResetError} /> : children}</ErrorBoundary>
    </SafeAreaView>
  );
}

export default SafeScreen;
