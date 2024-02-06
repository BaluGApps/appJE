import { View } from "react-native";
import Navigation from "./src/navigation/navigator";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();

const App = () =>{
  return(
    <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide header for all screens
      }}
    >
        <Stack.Screen name="Navigation" component={Navigation} />
    </Stack.Navigator>
</NavigationContainer>
  )
}

export default App;