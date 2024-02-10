import { View } from "react-native";
import React,{useEffect} from "react";
import Navigation from "./src/navigation/navigator";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();
import Splash from "./src/screens/splash";
import SplashScreen from 'react-native-splash-screen';

const App = () =>{
  useEffect(()=>{
    setTimeout(() => {
      SplashScreen.hide()
  }, 1000); 
  },[])

  return(
    <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide header for all screens
      }}
    >
        <Stack.Screen name="splash" component={Splash} />
        <Stack.Screen name="Navigation" component={Navigation} />
    </Stack.Navigator>
</NavigationContainer>
  )
}

export default App;