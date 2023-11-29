import { NavigationContainer } from "@react-navigation/native";
import GetStarted from "./components/GetStarted";
import VerifyNumber from "./components/VerifyNumber";
import { createStackNavigator } from '@react-navigation/stack';
import GetOtp from "./components/GetOtp";
import AppTour from "./components/AppTour";
import RegistrationPage from "./components/RegistrationPage";
import TabNavigation from "./components/TabNavigation";
import ProfileEdit from "./components/ProfileEdit";
import { useEffect } from "react";
import LandingScreen from "./components/LandingScreen";

import messaging from '@react-native-firebase/messaging';
import BusinessDetailsView from "./components/BusinessDetailsView";
import Location from "./components/Location";
import NotificationTray from "./components/NotificationTray";

export default function App() {

  const Stack = createStackNavigator();
  useEffect(() => {
    getDeviceToken();
  }, []);
  const getDeviceToken = async () => {
    let token = await messaging().getToken();
    console.log(token)
  };
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="LandingScreen" component={LandingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GetStarted" component={GetStarted} options={{ headerShown: false }} />
        <Stack.Screen name="VerifyNumber" component={VerifyNumber} options={{ headerShown: false }} />
        <Stack.Screen name="GetOtp" component={GetOtp} options={{ headerShown: false }} />
        <Stack.Screen name="AppTour" component={AppTour} options={{ headerShown: false }} />
        <Stack.Screen name="RegistrationPage" component={RegistrationPage} options={{ headerShown: false }} />
        <Stack.Screen name="TabNavigation" component={TabNavigation} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileEdit" component={ProfileEdit} options={{ headerShown: false }} />
        <Stack.Screen name="BusinessDetailView" component={BusinessDetailsView} options={{ headerShown: false }} />
        {/* <Stack.Screen name="Locations" component={Location} options={{ headerShown: false }} /> */}
        <Stack.Screen name="NotificationTray" component={NotificationTray} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}