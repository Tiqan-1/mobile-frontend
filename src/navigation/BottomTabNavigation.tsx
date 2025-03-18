import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useI18n } from '@/hooks';

import LibraryScreen from '@/screens/LibraryScreen';

import { Paths } from './paths';
import MainScreen from '@/screens/MainScreen';

const Tab = createBottomTabNavigator();

const TAB_SCREEN_OPTIONS = {
  drawerPosition: 'right',
  headerLeft: () => false,
};

interface IconProps {
  color: string;
  size: number;
}

const HomeIcon: React.FC<IconProps> = ({ color, size }) => (
  <Icon name="home" color={color} size={size} />
);

const AccessibilityIcon: React.FC<IconProps> = ({ color, size }) => (
  <Icon name="accessibility" color={color} size={size} />
);

// Placeholder component for the Accessibility tab
const AccessibilityTab = () => {
  const navigation = useNavigation();

  React.useEffect(() => {
    // Navigate to the AccessibilitySettings screen when this tab is selected
    navigation.navigate(Paths.AccessibilitySettings);
  }, [navigation]);

  return null;
};

const BottomTabNavigation = () => {
  const { translate } = useI18n();

  return (
    <Tab.Navigator
      screenOptions={{
        ...TAB_SCREEN_OPTIONS,
        tabBarAccessibilityLabel: 'Bottom navigation tabs',
      }}>
      <Tab.Screen
        component={LibraryScreen}
        name={Paths.Main}
        options={{
          tabBarLabel: Paths.Main,
          // tabBarLabel: translate(Paths.LIBRARY_SCREEN),
          tabBarIcon: HomeIcon,
          tabBarAccessibilityLabel: 'Library tab',
        }}
      />
      <Tab.Screen
        component={AccessibilityTab}
        name="AccessibilityTab"
        options={{
          tabBarLabel: 'Accessibility',
          tabBarIcon: AccessibilityIcon,
          tabBarAccessibilityLabel: 'Accessibility settings tab',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
