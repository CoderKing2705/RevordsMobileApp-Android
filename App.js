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
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import { isLocationEnabled } from 'react-native-android-location-enabler';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';


export default function App() {
  const Stack = createStackNavigator();
  const [initialRegion, setInitialRegion] = useState(null);
  let long;
  let lat;
  useEffect(() => {
    getDeviceToken();
    AsyncStorage.getItem('token')
      .then(async (value) => {
        if (value !== null) {
          console.log("This is valuep:- ", value)
          requestLocationPermission();
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
  async function setLangandLat(latitude, longitude) {
    long = longitude,
    lat = latitude
  }
  async function setMarkers(centerLat, centerLong) {
    setInitialRegion({
      latitude: centerLat,
      longitude: centerLong,
      longitudeDelta: (0.0922 * 2),
      latitudeDelta: 0.0922
    });
  }
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
      "appToken": token,
      "longitude": long,
      "latitude": lat
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

  async function handleCheckPressed() {
    if (Platform.OS === 'android') {
      const checkEnabled = await isLocationEnabled();
      if (!checkEnabled) {
        await handleEnabledPressed();
        // await getCurrentLocation();
      }
    }
  }
  async function handleEnabledPressed() {
    if (Platform.OS === 'android') {
      try {
        const enableResult = await promptForEnableLocationIfNeeded();
        // if (enableResult) {
        // await getCurrentLocation();
        // }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }
  }
  const getCurrentLocation = async () => {
    Geolocation.getCurrentPosition(
      async position => {
        await setLangandLat(position.coords.latitude, position.coords.longitude);
        longitude = position.coords.longitude;
        latitude = position.coords.latitude;
        await setMarkers(position.coords.latitude, position.coords.longitude);
        // You can now use the latitude and longitude in your app
      },
      error => {
        console.error('Error getting current location: ', error);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const requestLocationPermission = async () => {
    try {
      let permissionStatus;

      if (Platform.OS === 'ios') {
        permissionStatus = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      } else if (Platform.OS === 'android') {
        permissionStatus = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }

      if (permissionStatus === RESULTS.GRANTED) {
        await handleCheckPressed();
        await getCurrentLocation();
        // You can now access the location
      } else if (permissionStatus === RESULTS.DENIED) {
        const newPermissionStatus = await request(
          Platform.OS === 'ios'
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
            : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        );

        if (newPermissionStatus === RESULTS.GRANTED) {
          await handleCheckPressed();
          await getCurrentLocation();
          console.log('Location permission granted');
          // You can now access the location
        } else {
          console.log('Location permission denied');
        }
      }
    } catch (error) {
      console.error('Error checking/requesting location permission: ', error);
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
        {/* <Stack.Screen name="Locations" component={Location} options={{ headerShown: false }} /> */}
        <Stack.Screen name="NotificationTray" component={NotificationTray} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}