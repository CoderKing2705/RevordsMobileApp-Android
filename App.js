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
import NotificationTray from "./components/NotificationTray";
import Globals from "./components/Globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, TextInput } from "react-native";
import Geolocation from '@react-native-community/geolocation';
import { isLocationEnabled } from 'react-native-android-location-enabler';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import { Text } from "react-native";
import { useErrorHandler } from "./components/ErrorHandler";


export default function App() {
  const Stack = createStackNavigator();
  let long = 0;
  let lat = 0;

  useEffect(() => {
    getDeviceToken();
    AsyncStorage.getItem('token')
      .then(async (value) => {
        if (value !== null) {
          await handleCheckPressed((JSON.parse(value))[0].memberId);
        }
      })
  }, []);
  let token = "";
  let platformOS;
  const getDeviceToken = async () => {
    token = await messaging().getToken();
  };

  const postData = async (memberId) => {
    try {
      let currentDate = (new Date()).toISOString();
      platformOS = (Platform.OS == "android" ? 1 : 2);
      await getDeviceToken();

      await fetch(Globals.API_URL + '/MobileAppVisitersLogs/PostMobileAppVisitersLog', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "uniqueID": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "id": 0,
          "memberId": memberId,
          "createdDate": currentDate,
          "deviceOS": platformOS,
          "appToken": token,
          "longitude": long,
          "latitude": lat
        })
      })
        .then((response) => {
          console.log('JSON.stringify(res)', JSON.stringify(response));
        })
        .catch(async (error) => {
          await useErrorHandler("(Android): App > postData(): " + error);
          console.log("Error Saving Logs:- ", error)
        })
    } catch (error) {
      await useErrorHandler("(Android): App > postData(): " + error);
    }

  }

  async function handleCheckPressed(memberId) {

    try {
      if (Platform.OS === 'android') {
        const checkEnabled = await isLocationEnabled();

        if (!checkEnabled) {
          await handleEnabledPressed(memberId);
        }
        else {
          await getCurrentLocation(memberId);
        }
      }
    } catch (error) {
      await useErrorHandler("(Android): App > handleCheckPressed(): " + error);
    }

  }

  async function handleEnabledPressed(memberId) {
    if (Platform.OS === 'android') {
      try {
        const enableResult = await promptForEnableLocationIfNeeded();
        if (enableResult == 'enabled') {
          await getCurrentLocation(memberId);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }
  }

  async function setLangandLat(latitude, longitude, memberID) {
    long = longitude,
      lat = latitude

    await postData(memberID);
  }

  const getCurrentLocation = async (memberId) => {
    try {
      Geolocation.getCurrentPosition(
        async (position) => {
          await setLangandLat(position.coords.latitude, position.coords.longitude, memberId);

        },
        error => {
          console.error('Error getting current location: ', error);
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    } catch (error) {
      await useErrorHandler("(Android): App > getCurrentLocation(): " + error);
    }

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
        <Stack.Screen name="NotificationTray" component={NotificationTray} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;