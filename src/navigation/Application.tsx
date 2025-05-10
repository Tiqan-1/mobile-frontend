import { translate } from '@/hooks/language/useI18n';
import { Paths } from '@/navigation/paths';
import type { RootStackParamList } from '@/navigation/types';
import { Example, Login, Startup } from '@/screens';
import AccessibilitySettings from '@/screens/AccessibilitySettings';
import SignUp from '@/screens/auth/signup';
import PDFViewerScreen from '@/screens/PDFViewerScreen/PDFViewer';
import Program from '@/screens/Program';
import Subscription from '@/screens/Subscription';
import { useTheme } from '@/theme';
import typography from '@/theme/typography';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomTabNavigation from './BottomTabNavigation';
import TodayLessons from '@/screens/TodayLessons';

const Stack = createStackNavigator<RootStackParamList>();
const NAVIGATION_OPTIONS = {
  headerShown: false,
  headerTitleStyle: typography['text'],
  headerBackTitle: translate('common:back'),
};

function AuthNavigation() {
  return (
    <Stack.Navigator screenOptions={NAVIGATION_OPTIONS}>
      <Stack.Screen name={Paths.Login} component={Login} />
      <Stack.Screen
        name={Paths.SignUp}
        component={SignUp}
        options={{
          headerShown: true,
          title: translate('auth.sign_up'),
          headerBackAccessibilityLabel: translate('auth.sign_up'),
        }}
      />
    </Stack.Navigator>
  );
}

function ApplicationNavigator() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const navigationTheme = {
    dark: isDark,

    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.gray50,
      card: colors.gray50,
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator key={isDark ? 'dark' : 'light'} screenOptions={NAVIGATION_OPTIONS}>
          <Stack.Screen component={Startup} name={Paths.Startup} />
          <Stack.Screen component={AuthNavigation} name={Paths.Auth} />
          <Stack.Screen component={Example} name={Paths.Example} />
          <Stack.Screen component={Program} name={Paths.Program} />
          <Stack.Screen component={Subscription} name={Paths.Subscription} />
          <Stack.Screen component={TodayLessons} name={Paths.TodayLessons} />
          <Stack.Screen
            component={AccessibilitySettings}
            name={Paths.AccessibilitySettings}
            options={{
              headerShown: true,
              title: 'Accessibility',
            }}
          />
          <Stack.Screen
            name={Paths.PDF}
            component={PDFViewerScreen}
            options={({ route }) => ({
              title: route.params?.title || '',
            })}
          />
          <Stack.Screen component={BottomTabNavigation} name={Paths.TabNav} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
