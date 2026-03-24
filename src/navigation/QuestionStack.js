import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import QuestionScreen from '../screens/QuestionScreen';

const Stack = createStackNavigator();

const QuestionStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0074E4',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontFamily: 'Poppins',
        },
      }}>
      <Stack.Screen
        name="QuestionScreen"
        component={QuestionScreen}
        options={{title: 'Question'}}
      />
    </Stack.Navigator>
  );
};

export default QuestionStack;
