import Student from '@/assets/svg-app/student.svg';
import { useI18n } from '@/hooks';
import LibraryScreen from '@/screens/LibraryScreen';
import MainScreen from '@/screens/MainScreen';
import Menu from '@/screens/Menu';
import Programs from '@/screens/Programs';
import TodayLessons from '@/screens/TodayLessons';
import { PALETTE } from '@/theme/colors';
import typography, { fonts } from '@/theme/typography';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import Book from 'assets/svg-app/book.svg';
import Bookm from 'assets/svg-app/bookm.svg';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Paths } from './paths';

const Tab = createBottomTabNavigator();

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
  const { t, i18n } = useTranslation();

  const TAB_SCREEN_OPTIONS = {
    drawerPosition: 'right',
    headerLeft: () => false,
    headerShown: false,
    headerTitleStyle: {
      ...typography['extraSmallText'],
      fontFamily: fonts.regular.fontFamily,
    },
    headerBackTitle: translate('back'),
    labelStyle: {
      ...typography['extraSmallText'],
      fontFamily: fonts.regular.fontFamily,
    },
    tabBarLabelStyle: {
      ...typography['superSmallText'],
      fontFamily: fonts.regular.fontFamily,
    },
    tabBarInactiveTintColor: PALETTE.BLACK,
    tabBarActiveTintColor: PALETTE.PRIMARY_COLOR,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        ...TAB_SCREEN_OPTIONS,
        tabBarAccessibilityLabel: 'Bottom navigation tabs',
        tabBarLabelStyle: {
          ...typography['superSmallText'],
          fontFamily: fonts.regular.fontFamily,
        },
      }}>
      <Tab.Screen
        component={MainScreen}
        name={Paths.Main}
        options={{
          tabBarLabel: t('navigation.Main'),
          tabBarIcon: ({ focused, color, size }) => <Bookm fill={color} width={size} height={size} />,
          tabBarAccessibilityLabel: 'Main tab',
        }}
      />
      <Tab.Screen
        component={TodayLessons}
        name={Paths.TodayLessons}
        options={{
          tabBarLabel: t('navigation.TodayLessons'),
          tabBarIcon: ({ focused, color, size }) => <Book fill={color} height={size} width={size} />,
          tabBarAccessibilityLabel: 'TodayLessons tab',
          title: t('navigation.TodayLessons'),
        }}
      />
      <Tab.Screen
        component={Programs}
        name={Paths.Programs}
        options={{
          tabBarLabel: t('navigation.Programs'),
          tabBarIcon: ({ focused, color, size }) => <Book fill={color} height={size} width={size} />,
          tabBarAccessibilityLabel: 'Library tab',
          title: t('navigation.Programs'),
        }}
      />
      {/* <Tab.Screen
        component={LibraryScreen}
        name={Paths.LIBRARY_SCREEN}
        options={{
          tabBarLabel: Paths.LIBRARY_SCREEN,
          // tabBarLabel: translate(Paths.LIBRARY_SCREEN),
          tabBarIcon:  ({ color, size }) => <Icon name="home" color={color} size={size} />,
          tabBarAccessibilityLabel: 'Library tab',
        }}
      /> */}
      {/* <Tab.Screen
        component={AccessibilityTab}
        name="AccessibilityTab"
        options={{
          tabBarLabel: 'Accessibility',
          tabBarIcon: AccessibilityIcon,
          tabBarAccessibilityLabel: 'Accessibility settings tab',
        }}
      /> */}
      <Tab.Screen
        component={Menu}
        name={Paths.Menu}
        options={{
          tabBarLabel: t('القائمة'),
          tabBarIcon: ({ color, size }) => <Student style={{ color: color }} fill={color} height={size} width={size} />,
          tabBarAccessibilityLabel: 'Menu tab',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
