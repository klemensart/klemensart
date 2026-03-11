/* ─── Ana Tab Navigasyonu (3 tab) ─── */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../config/theme";

import MapScreen from "../screens/map/MapScreen";
import ExploreStack from "./ExploreStack";
import ProfileScreen from "../screens/profile/ProfileScreen";

export type MainTabParamList = {
  Harita: undefined;
  Kesfet: undefined;
  Profil: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.icon, focused && styles.iconActive]}>{icon}</Text>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Harita"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.coral,
        tabBarInactiveTintColor: COLORS.warm,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Harita"
        component={MapScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🗺️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Kesfet"
        component={ExploreStack}
        options={{
          tabBarLabel: "Keşfet",
          tabBarIcon: ({ focused }) => <TabIcon icon="🔍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    height: 85,
    paddingTop: 8,
    paddingBottom: 28,
  },
  tabLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "600",
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 22,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
});
