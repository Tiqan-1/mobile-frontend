import type { RootStackParamList } from '@/navigation/types';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';

import { Example, Login, Startup } from '@/screens';
import SignUp from '@/screens/auth/signup';

// import BottomTabNavigation from './BottomTabNavigation';

const Stack = createStackNavigator<RootStackParamList>();
const NAVIGATION_OPTIONS = {
  headerShown: false,
};
function AuthNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Paths.Login} component={Login} />
      <Stack.Screen name={Paths.SignUp} component={SignUp} />
    </Stack.Navigator>
  );
}

function ApplicationNavigator() {
  const { navigationTheme, variant } = useTheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator key={variant} screenOptions={{ headerShown: false }}>
          <Stack.Screen
            component={Startup}
            name={Paths.Startup}
            options={NAVIGATION_OPTIONS}
          />
          <Stack.Screen
            component={AuthNavigation}
            name={Paths.Auth}
            options={NAVIGATION_OPTIONS}
          />
          <Stack.Screen
            component={Example}
            name={Paths.Example}
            options={NAVIGATION_OPTIONS}
          />

          {/* <Stack.Screen
            component={BottomTabNavigation}
            name={Paths.Main}
            options={NAVIGATION_OPTIONS}
          /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
