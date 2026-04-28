import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Splash from '../screens/splash';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import TabNavigator from './TabNavigator';
import MockTestScreen from '../screens/MockTestScreen';
import PracticeQuizScreen from '../screens/PracticeQuizScreen';

const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        }),
      }}
      initialRouteName="Splash"
    >
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="MockTestScreen" component={MockTestScreen} />
      <Stack.Screen name="PracticeQuizScreen" component={PracticeQuizScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
