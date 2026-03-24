import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import ProfileScreen from '../screens/ProfileScreen';
import Home from '../screens/Home';
import PracticeScreen from '../screens/PracticeScreen';
import TestsScreen from '../screens/TestsScreen';
import RevisionScreen from '../screens/RevisionScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Practice') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Tests') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Revision') {
            iconName = focused ? 'refresh-circle' : 'refresh-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0074E4',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: t('home') }} />
      <Tab.Screen name="Practice" component={PracticeScreen} options={{ tabBarLabel: t('practice') }} />
      <Tab.Screen name="Tests" component={TestsScreen} options={{ tabBarLabel: t('tests') }} />
      <Tab.Screen name="Revision" component={RevisionScreen} options={{ tabBarLabel: t('revision') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('profile') }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabNavigator;
