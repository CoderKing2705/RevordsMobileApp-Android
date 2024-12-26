import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  View,
  Modal,
  Text,
  Platform,
  Linking,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { SafeAreaView } from "react-native-safe-area-context";
import Globals from "./Globals";
import { useErrorHandler } from "./ErrorHandler";
import axios from "axios";
import messaging from "@react-native-firebase/messaging";

const LandingScreen = () => {
  const focus = useIsFocused();
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const handleNotificationOpenedApp = useCallback(
    async (remoteMessage) => {
      try {
        if (remoteMessage?.data) {
          const uuid = remoteMessage.data.UUID;
          const token = await AsyncStorage.getItem("token");
          const uuidNotification = await AsyncStorage.getItem("uuidNotification");          
          if (uuid == uuidNotification) {
            if (token) {
              const phoneNo = JSON.parse(token)[0].phone;
              await getMemberData(phoneNo, token);
            }
          } else {
            if (token) {
              const phoneNo = JSON.parse(token)[0].phone;
              const response = await axios.get(
                `${Globals.API_URL}/MemberProfiles/GetMemberByPhoneNo/${phoneNo}`
              );
              const json = response.data;
              await AsyncStorage.setItem("token", JSON.stringify(json));
              await AsyncStorage.removeItem("uuidNotification");
              await AsyncStorage.setItem("uuidNotification", uuid);
              setLoading(false);
              navigation.navigate("NotificationTray", { UUID: uuid });
            }
          }
        } else {
          // Handle case where remoteMessage.data is null or undefined
          const token = await AsyncStorage.getItem("token");
          if (token) {
            const phoneNo = JSON.parse(token)[0].phone;
            await getMemberData(phoneNo, token);
          }
        }
      } catch (error) {
        await useErrorHandler(
          "(Android): LandingScreen > handleNotificationOpenedApp() " + error
        );
      }
    },
    [navigation]
  );

  useEffect(() => {
    const unsubscribeOnNotificationOpenedApp =
      messaging().onNotificationOpenedApp(handleNotificationOpenedApp);

    const checkInitialNotification = async () => {
      try {
        const remoteMessage = await messaging().getInitialNotification();
        if (remoteMessage) {
          await handleNotificationOpenedApp(remoteMessage);
        } else {
          const token = await AsyncStorage.getItem("token");
          if (token) {
            const phoneNo = JSON.parse(token)[0].phone;
            await getMemberData(phoneNo, token);
          } else {
            setLoading(false);
            navigation.navigate("GetStarted");
          }
        }
      } catch (error) {
        await useErrorHandler(
          "(Android): LandingScreen > checkInitialNotification() " + error
        );
      }
    };

    checkInitialNotification();

    // Cleanup function to unsubscribe from notifications
    return () => {
      if (unsubscribeOnNotificationOpenedApp) {
        unsubscribeOnNotificationOpenedApp();
      }
    };
  }, [handleNotificationOpenedApp, navigation]);
  
  const getMemberData = async (phone, value) => {
    try {
      const response = await fetch(
        Globals.API_URL + "/MemberProfiles/GetMemberByPhoneNo/" + phone,
        {
          method: "GET",
        }
      );
      const json = await response.json();
      AsyncStorage.setItem("token", JSON.stringify(json))
        .then(() => {
          // setTimeout(() => {
          setLoading(false);
          navigation.navigate("TabNavigation", {
            MemberData: JSON.parse(value),
          });
          // }, 2500);
        })
        .catch(async (error) => {
          await useErrorHandler(
            "(Android): LandingScreen > getMemberData()" + error
          );
        });
    } catch (error) {
      await useErrorHandler(
        "(Android): LandingScreen > getMemberData()" + error
      );
    }
  };
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/companylogo.png")}
        style={styles.companylogo}
      />
      <Image
        source={require("../assets/vector-Ypq.png")}
        style={styles.vectorP61}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Spinner
            visible={loading}
            textContent={""}
            textStyle={styles.spinnerTextStyle}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "#d9e7ed",
    alignItems: "center",
  },
  companylogo: {
    flexShrink: 0,
    width: "70%",
    resizeMode: "contain",
  },
  frame2vJu: {
    top: 403,
    backgroundColor: "#140d05",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 25,
    width: 200,
    flexDirection: "row",
  },
  getStartednru: {
    lineHeight: 22.5,
    textTransform: "uppercase",
    fontFamily: "SatoshiVariable, SourceSansPro",
    flexShrink: 0,
    fontWeight: "bold",
    fontSize: 18,
    color: "#ffffff",
    margin: "0 29 1 0",
    flex: 10,
    zIndex: 10,
  },
  arrowcirclerightTy3: {
    height: 20,
    width: 20,
    resizeMode: "contain",
    flexShrink: 0,
    marginLeft: 10,
  },
  vectorP61: {
    width: 650,
    height: 527,
    position: "absolute",
    left: 20,
    top: 170,
    resizeMode: "contain",
  },
});

export default LandingScreen;
