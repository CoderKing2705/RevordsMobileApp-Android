import { NavigationContainer } from "@react-navigation/native";
import GetStarted from "./components/GetStarted";
import VerifyNumber from "./components/VerifyNumber";
import { createStackNavigator } from "@react-navigation/stack";
import GetOtp from "./components/GetOtp";
import AppTour from "./components/AppTour";
import RegistrationPage from "./components/RegistrationPage";
import TabNavigation from "./components/TabNavigation";
import ProfileEdit from "./components/ProfileEdit";
import React, { useEffect, useRef, useState } from "react";
import LandingScreen from "./components/LandingScreen";
import messaging from "@react-native-firebase/messaging";
import BusinessDetailsView from "./components/BusinessDetailsView";
import NotificationTray from "./components/NotificationTray";
import Globals from "./components/Globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AppState,
  Button,
  Image,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import { isLocationEnabled } from "react-native-android-location-enabler";
import { promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";
import { Text } from "react-native";
import { useErrorHandler } from "./components/ErrorHandler";
import axios from "axios";
import { check } from "react-native-permissions";
import { setUpInterceptor } from "./components/interceptor";
import PageSequenceContext from "./components/contexts/PageSequence/PageSequenceContext";
import LogoutHandler from "./components/LogoutHandler";

export const navigationRef = React.createRef();
export default function App() {
  const Stack = createStackNavigator();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const currentVersion = require("./package.json").version;
  const isNotificationAllowed = useRef(false);
  let long = 0;
  let lat = 0;
  const [pageSequenceData, setPageSequenceData] = useState({});
  const [regionWiseBusiness, setRegionWiseBusiness] = useState(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isUpdateRequired, setIsUpdateRequired] = useState(true);
  useEffect(() => {
    setUpInterceptor();
    getDeviceToken();
    AsyncStorage.getItem("token").then(async (value) => {
      if (value !== null) {
        await handleCheckPressed(JSON.parse(value)[0].memberId);
      }
    });
    checkVersion();
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
  }, []);

  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'active') {
        try {
          const shouldNavigate = await AsyncStorage.getItem('shouldNavigateToLanding');
          if (shouldNavigate === 'true') {
            await AsyncStorage.removeItem('shouldNavigateToLanding');
            navigationRef.current?.navigate('LandingScreen');
          }
        } catch (error) {
          console.error('Failed to check navigation flag', error);
        }
      }
      appState.current = nextAppState;
    };

    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === "active") {
      // The app has come to the foreground
      checkVersion();
    }
    // setAppState(nextAppState);
  };

  const checkVersion = async () => {
    const osID = Platform.OS === "android" ? 1 : 2;

    const getCurrentVersion = await axios
      .get(
        Globals.API_URL + `/DashBoard/GetLatestCustomerMobileAppVersion/${osID}`
      )
      .catch(async (error) => {
        await useErrorHandler("App > checkVersion(): " + error);
      });

    let data;
    switch (getCurrentVersion.data.mobileFirstTab) {
      case 1:
        data = {
          mobileFirstTab: "Location",
          mobileFirstLocationPage: getmobileFirstLocationPage(
            getCurrentVersion.data.mobileFirstLocationPage
          ),
        };
        setPageSequenceData(data);
        break;
      case 2:
        data = {
          mobileFirstTab: "Favorites",
          mobileFirstLocationPage: getmobileFirstLocationPage(
            getCurrentVersion.data.mobileFirstLocationPage
          ),
        };
        setPageSequenceData(data);
        break;
      case 3:
        data = {
          mobileFirstTab: "Profile",
          mobileFirstLocationPage: getmobileFirstLocationPage(
            getCurrentVersion.data.mobileFirstLocationPage
          ),
        };
        setPageSequenceData(data);
        break;
      default:
        data = {
          mobileFirstTab: "Location",
          mobileFirstLocationPage: getmobileFirstLocationPage(
            getCurrentVersion.data.mobileFirstLocationPage
          ),
        };
        setPageSequenceData(data);
        break;
    }

    if (getCurrentVersion.data.appVersion !== currentVersion) {
      
      setIsUpdateRequired(getCurrentVersion.data.isAppUpdateRequired);
      setIsModalVisible(true);
    }
  };

  const getmobileFirstLocationPage = (item) => {
    switch (item) {
      case 1:
        return "Locations";
      case 2:
        return "MapViewing";
      default:
        return "Locations";
    }
  };

  const openStores = () => {
    const url =
      Platform.OS === "android"
        ? "https://play.google.com/store/apps/details?id=com.revordsMobile.app&pcampaignid=web_share"
        : "https://apps.apple.com/in/app/revords/id6474188184";

    Linking.openURL(url).catch(async (error) => {
      await useErrorHandler("(Android): AppJS > openStores(): " + error);
    });

    setIsModalVisible(false);
  };

  let token = "";
  let platformOS;
  const getDeviceToken = async () => {
    token = await messaging().getToken();
  };

  const checkNotificationPermission = async () => {
    try {
      const RESULTS = await check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      switch (RESULTS) {
        case "granted":
          isNotificationAllowed.current = true;
          break;
        case "denied":
          isNotificationAllowed.current = false;
          break;
        case "blocked":
          isNotificationAllowed.current = false;
          break;
        case "unavailable":
          isNotificationAllowed.current = false;
          break;
        default:
          isNotificationAllowed.current = false;
          break;
      }
    } catch (error) {
      await useErrorHandler(
        "(Android): AppJS > checkNotificationPermission(): " + error
      );
    }
  };

  const postData = async (memberId) => {
    try {
      let currentDate = new Date().toISOString();
      platformOS = Platform.OS == "android" ? 1 : 2;
      await getDeviceToken();
      await checkNotificationPermission();
      await fetch(
        Globals.API_URL + "/MobileAppVisitersLogs/PostMobileAppVisitersLog",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uniqueID: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            id: 0,
            memberId: memberId,
            createdDate: currentDate,
            deviceOS: platformOS,
            appToken: token,
            longitude: long,
            latitude: lat,
            appVersion: currentVersion,
          }),
        }
      )
        .then(async (response) => {
          await axios.put(
            `${Globals.API_URL}/MemberProfiles/PutDeviceTokenInMobileApp/${memberId}/${token}/${platformOS}/${isNotificationAllowed.current}`
          );
        })
        .catch(async (error) => {
          await useErrorHandler("(Android): App > postData(): " + error);
        });
    } catch (error) {
      await useErrorHandler("(Android): App > postData(): " + error);
    }
  };

  async function handleCheckPressed(memberId) {
    try {
      if (Platform.OS === "android") {
        const checkEnabled = await isLocationEnabled();

        if (!checkEnabled) {
          await handleEnabledPressed(memberId);
        } else {
          await getCurrentLocation(memberId);
        }
      }
    } catch (error) {
      await useErrorHandler("(Android): App > handleCheckPressed(): " + error);
    }
  }

  async function handleEnabledPressed(memberId) {
    if (Platform.OS === "android") {
      try {
        const enableResult = await promptForEnableLocationIfNeeded();
        if (enableResult == "enabled") {
          await getCurrentLocation(memberId);
        }
      } catch (error) {
        if (error instanceof Error) {
        }
      }
    }
  }

  async function setLangandLat(latitude, longitude, memberID) {
    (long = longitude), (lat = latitude);

    await postData(memberID);
  }

  const getCurrentLocation = async (memberId) => {
    try {
      Geolocation.getCurrentPosition(
        async (position) => {
          await setLangandLat(
            position.coords.latitude,
            position.coords.longitude,
            memberId
          );
        },
        (error) => {
          console.error("Error getting current location: ", error);
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    } catch (error) {
      await useErrorHandler("(Android): App > getCurrentLocation(): " + error);
    }
  };

  return (
    <PageSequenceContext.Provider
      value={{
        pageSequenceData,
        regionWiseBusiness,
        setRegionWiseBusiness,
        isFirstLaunch,
        setIsFirstLaunch,
      }}
    >
      <NavigationContainer>
        <LogoutHandler />
        <Stack.Navigator>
          <Stack.Screen
            name="LandingScreen"
            component={LandingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GetStarted"
            component={GetStarted}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VerifyNumber"
            component={VerifyNumber}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GetOtp"
            component={GetOtp}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AppTour"
            component={AppTour}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RegistrationPage"
            component={RegistrationPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TabNavigation"
            component={TabNavigation}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProfileEdit"
            component={ProfileEdit}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BusinessDetailView"
            component={BusinessDetailsView}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NotificationTray"
            component={NotificationTray}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
          focusable={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Image
                source={require("./assets/Applogo.png")}
                style={styles.modalAppLogo}
              />
              {/* <Text
                style={{
                  fontSize: 20,
                  marginBottom: 20,
                  fontWeight: "bold",
                }}
              >
                App Update Required!
              </Text>
              <Text style={{ textAlign: "center" }}>
                {" "}
                We have launched new and improved version. Please update the app
                for better experience.{" "}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 20,
                }}
              >
                {isUpdateRequired == true && (
                  <View style={{ marginRight: 15 }}>
                    <Button
                      title="Cancel"
                      onPress={() => setIsModalVisible(false)}
                    />
                  </View>
                )}
                <View style={{ marginRight: 5 }}>
                  <Button title="Update" onPress={openStores} />
                </View>
              </View> */}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {/* <Image
                  source={require("../assets/navigation.png")}
                  style={{
                    width: 20,
                    height: 20,
                    marginRight: 2,
                    marginBottom: 8,
                  }}
                /> */}
                <Text style={styles.modalTitle}>App Update Required!</Text>
              </View>
              <Text style={styles.modalMessage}>
                We have launched new and improved version. Please update the app
                for better experience.
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {isUpdateRequired == false && (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => setIsModalVisible(false)}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.button} onPress={openStores}>
                    <Text style={styles.buttonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </NavigationContainer>
    </PageSequenceContext.Provider>
  );
}

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

const styles = {
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
  },
  button: {
    flex: 1,
    padding: 10,
    backgroundColor: "#7d5513",
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  modalAppLogo: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 310,
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
};
