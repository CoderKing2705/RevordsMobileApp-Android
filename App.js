import { NavigationContainer } from "@react-navigation/native";
import GetStarted from "./components/GetStarted";
import VerifyNumber from "./components/VerifyNumber";
import { createStackNavigator } from '@react-navigation/stack';
import GetOtp from "./components/GetOtp";
import AppTour from "./components/AppTour";
import RegistrationPage from "./components/RegistrationPage";
import TabNavigation from "./components/TabNavigation";
import ProfileEdit from "./components/ProfileEdit";
import { useEffect, useState } from "react";
import LandingScreen from "./components/LandingScreen";
import messaging from '@react-native-firebase/messaging';
import BusinessDetailsView from "./components/BusinessDetailsView";
import Location from "./components/Location";
import NotificationTray from "./components/NotificationTray";
import Globals from "./components/Globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";


export default function App() {
  const Stack = createStackNavigator();
  useEffect(() => {
    getDeviceToken();
    AsyncStorage.getItem('token')
      .then(async (value) => {
        if (value !== null) {
          await postData((JSON.parse(value))[0].memberId);
          console.log(JSON.parse(value)[0].memberId);
        }
      })
  }, []);
  let token = "";
  let platformOS;
  const getDeviceToken = async () => {
    token = await messaging().getToken();
    console.log(token)
  };

  const postData = async (memberId) => {
    let currentDate = (new Date()).toISOString();
    platformOS = (Platform.OS == "android" ? 1 : 2);
    await getDeviceToken();
    let obj = JSON.stringify({
      "uniqueID": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "id": 0,
      "memberId": memberId,
      "createdDate": currentDate,
      "deviceOS": platformOS,
      "appToken": token
    })
    console.log(obj);
    fetch(Globals.API_URL + '/MobileAppVisitersLogs/PostMobileAppVisitersLog', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: obj
    })
      .then((response) => {
        console.log('JSON.stringify(res)', JSON.stringify(response));
      })
      .catch((error) => {
        console.log("Error Saving Logs:- ", error)
      })
  }

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