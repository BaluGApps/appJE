// import {View} from 'react-native';
// import React, {useEffect, useState} from 'react';
// import Navigation from './src/navigation/navigator';
// import {NavigationContainer} from '@react-navigation/native';
// import {createStackNavigator} from '@react-navigation/stack';
// const Stack = createStackNavigator();
// import Splash from './src/screens/splash';
// // import SplashScreen from 'react-native-splash-screen';
// import messaging from '@react-native-firebase/messaging';
// import subscribeToTopics from './src/util/notification';
// import {Provider} from 'react-redux';
// import {store} from './src/util/store';

// const App = () => {
//   const [initialRoute, setInitialRoute] = useState('Splash');

//   useEffect(() => {
//     requestUserPermission();
//     GetDevicetoken();
//     subscribeToTopics(['CBT1andCBT2']);
//   }, []);

//   useEffect(() => {
//     const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
//       console.log(
//         'Notification caused app to open from background state:',
//         remoteMessage.notification,
//       );
//       setInitialRoute(remoteMessage.data.type);
//     });

//     messaging()
//       .getInitialNotification()
//       .then(remoteMessage => {
//         if (remoteMessage) {
//           console.log(
//             'Notification caused app to open from quit state:',
//             remoteMessage.notification.title,
//           );
//           setInitialRoute(remoteMessage.data.type);
//           console.log('type', remoteMessage.data.type);
//         }
//       });

//     return unsubscribe; // Cleanup the subscription on component unmount
//   }, []); // No need to include navigation in the dependency array

//   const GetDevicetoken = async () => {
//     const token = await messaging().getToken();
//     console.log('token', token);
//   };

//   async function requestUserPermission() {
//     const authStatus = await messaging().requestPermission();
//     const enabled =
//       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//     if (enabled) {
//       console.log('Authorization status:', authStatus);
//     }
//   }

//   async function subscribeToTopic(topic) {
//     try {
//       await messaging().subscribeToTopic(topic);
//       console.log(`Subscribed to topic: ${topic}`);
//     } catch (error) {
//       console.error(`Error subscribing to topic ${topic}:`, error);
//     }
//   }

//   // useEffect(()=>{
//   //   setTimeout(() => {
//   //     SplashScreen.hide()
//   // }, 1000);
//   // },[])

//   return (
//     <Provider store={store}>
//       <NavigationContainer>
//         <Stack.Navigator
//           // screenOptions={{
//           //   headerShown: false, // Hide header for all screens
//           // }}
//           // initialRouteName={initialRoute}
//           screenOptions={{
//             headerShown: false,
//             cardStyleInterpolator: ({current: {progress}}) => ({
//               cardStyle: {
//                 opacity: progress.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0, 1],
//                 }),
//               },
//             }),
//           }}>
//           <Stack.Screen name="splash" component={Splash} />
//           <Stack.Screen name="Navigation" component={Navigation} />
//         </Stack.Navigator>
//       </NavigationContainer>
//     </Provider>
//   );
// };

// export default App;

import {View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Navigation from './src/navigation/navigator';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Provider} from 'react-redux';
import {store} from './src/util/store';
import Splash from './src/screens/splash';
import messaging from '@react-native-firebase/messaging';
import subscribeToTopics from './src/util/notification';
import QuestionScreen from './src/screens/QuestionScreen';
import Cbt1 from './src/screens/Cbt1';
import Cbt2 from './src/screens/Cbt2';
import Syllabus from './src/screens/syllabus';
import Quiz from './src/screens/quiz';
import home from './src/screens/Home';

const Stack = createStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState('Splash');

  useEffect(() => {
    requestUserPermission();
    GetDevicetoken();
    subscribeToTopics(['CBT1andCBT2']);
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      setInitialRoute(remoteMessage.data.type);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification.title,
          );
          setInitialRoute(remoteMessage.data.type);
          console.log('type', remoteMessage.data.type);
        }
      });

    return unsubscribe; // Cleanup the subscription on component unmount
  }, []); // No need to include navigation in the dependency array

  const GetDevicetoken = async () => {
    const token = await messaging().getToken();
    console.log('token', token);
  };

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  async function subscribeToTopic(topic) {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
    }
  }

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: ({current: {progress}}) => ({
              cardStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            }),
          }}>
          <Stack.Screen name="splash" component={Splash} />
          {/* <Stack.Screen name="Navigation" component={Navigation} /> */}
          <Stack.Screen name="cbt1" component={Cbt1} />
          <Stack.Screen name="cbt2" component={Cbt2} />
          <Stack.Screen name="syllabus" component={Syllabus} />
          <Stack.Screen name="Quiz" component={Quiz} />
          <Stack.Screen name="Home" component={home} />
          <Stack.Screen
            name="QuestionScreen"
            component={QuestionScreen}
            options={{
              headerShown: true,
              title: 'Quiz Challenge',
              headerStyle: {
                backgroundColor: '#0074E4',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontFamily: 'Poppins',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
