import type { PropsWithChildren } from 'react';
import type { SafeAreaViewProps } from 'react-native-safe-area-context';

import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/context/ThemeContext';

import { DefaultError } from '@/components/molecules';
import { ErrorBoundary } from '@/components/organisms';

type Props = PropsWithChildren<
  {
    isError?: boolean;
    onResetError?: () => void;
  } & Omit<SafeAreaViewProps, 'mode'>
>;

function SafeScreen({
  children = undefined,
  isError = false,
  onResetError = undefined,
  style,
  ...props
}: Props) {
  const { isDark, colors } = useTheme();

  return (
    <SafeAreaView
      {...props}
      mode="padding"
      style={[{ flex: 1, backgroundColor: colors.APP_BG }, style]}>
      <StatusBar
        backgroundColor={colors.APP_BG}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <ErrorBoundary onReset={onResetError}>
        {isError ? <DefaultError onReset={onResetError} /> : children}
      </ErrorBoundary>
    </SafeAreaView>
  );
}

export default SafeScreen;
