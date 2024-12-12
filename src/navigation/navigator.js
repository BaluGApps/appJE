import React from 'react';
import {View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Cbt1 from '../screens/Cbt1';
import Cbt2 from '../screens/Cbt2';
import Syllabus from '../screens/syllabus';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import quiz from '../screens/quiz';
import QuestionStack from './QuestionStack';
import Quiz from '../screens/quiz';

const Tab = createBottomTabNavigator();

const Navigation = () => {
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator
        initialRouteName="Cbt1"
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let MaterialCommunityIcon;

            if (route.name === 'CBT 1') {
              MaterialCommunityIcon = focused ? 'laptop' : 'laptop-off';
            } else if (route.name === 'CBT 2') {
              MaterialCommunityIcon = focused ? 'laptop' : 'laptop-off';
            } else if (route.name === 'Syllabus') {
              MaterialCommunityIcon = focused ? 'bookshelf' : 'bookshelf';
            } else if (route.name === 'Quiz') {
              MaterialCommunityIcon = focused ? 'bookshelf' : 'bookshelf';
            }

            return (
              <MaterialCommunityIcons
                name={MaterialCommunityIcon}
                size={wp('5%')} // Use responsive size
                color={'#0074E4'}
              />
            );
          },
          tabBarLabelStyle: {
            fontSize: wp('3.5%'), // Use responsive font size
            fontWeight: 'bold',
            color: '#333',
            width: wp('40%'), // Use responsive width
            marginHorizontal: wp('10%'), // Use responsive margin
          },
          tabStyle: {height: hp('8%')}, // Use responsive height
          labelStyle: {fontSize: wp('4.5%')}, // Use responsive font size
          headerStyle: {
            backgroundColor: '#0074E4',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'Poppins',
          },
          headerTitleAlign: 'center',
        })}>
        <Tab.Screen name="CBT 1" component={Cbt1} />
        <Tab.Screen name="CBT 2" component={Cbt2} />
        <Tab.Screen name="Quiz" component={Quiz} />
        <Tab.Screen name="Syllabus" component={Syllabus} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
