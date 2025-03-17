import React from "react";
import Icon from "react-native-vector-icons/MaterialIcons";

import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";

import { useI18n } from "@/hooks";
import LibraryScreen from "@/screens/LibraryScreen";
import { Paths } from "./paths";

const Tab = createBottomTabNavigator();

const TAB_SCREEN_OPTIONS = {
	drawerPosition: "right",
	headerLeft: () => false,
};

interface HomeIconProps {
	color: string;
	size: number;
  }

const HomeIcon: React.FC<HomeIconProps> = ({ color, size }) => (
	<Icon name="home" color={color} size={size} />
);

const BottomTabNavigation = () => {
	const {translate} = useI18n();

	return (
		<Tab.Navigator screenOptions={TAB_SCREEN_OPTIONS}>
			<Tab.Screen
				component={LibraryScreen}
				name={Paths.LIBRARY_SCREEN}
				options={{
					tabBarLabel: Paths.LIBRARY_SCREEN,
					// tabBarLabel: translate(Paths.LIBRARY_SCREEN),
					tabBarIcon: HomeIcon,
				}}
			/>
		</Tab.Navigator>
	);
};


export default BottomTabNavigation;
