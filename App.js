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

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {store} from './src/util/store';
import messaging from '@react-native-firebase/messaging';
import subscribeToTopics from './src/util/notification';
import MainNavigator from './src/navigation/MainNavigator';
import {ThemeProvider} from './src/util/theme';

const App = () => {
  useEffect(() => {
    requestUserPermission();
    GetDevicetoken();
    subscribeToTopics(['CBT1andCBT2']);
  }, []);

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

  return (
    <Provider store={store}>
      <ThemeProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
