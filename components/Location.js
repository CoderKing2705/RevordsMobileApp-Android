import {
  Alert,
  AppState,
  BackHandler,
  Modal,
  PermissionsAndroid,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import { View, Text, StyleSheet, Image } from "react-native";
import { Card, Title } from "react-native-paper";
import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from "react-native-loading-spinner-overlay";
import Globals from "./Globals";
import Geolocation from "@react-native-community/geolocation";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { isLocationEnabled } from "react-native-android-location-enabler";
import { promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from "react-native-animatable";
import LinearGradient from "react-native-linear-gradient";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { ScrollView } from "react-native-gesture-handler";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { useErrorHandler } from "./ErrorHandler";
import PageSequenceContext from "./contexts/PageSequence/PageSequenceContext";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const Location = ({ navigation }) => {
  const focus = useIsFocused();
  const [filteredData, setFilteredData] = useState("");
  lang = 0;
  lat = 0;
  const [loadingData, setLoadingData] = useState(true);
  const [userData, setUserData] = useState("");
  const { regionWiseBusiness } =
    useContext(PageSequenceContext);

  const baseUrl =
    Globals.API_URL + "/BusinessProfiles/GetBusinessProfilesForMobile";
  const pulse = {
    0: {
      scale: 1,
    },
    0.5: {
      scale: 1.3,
    },
    1: {
      scale: 1,
    },
  };
  const [isNotificationAllowed, setIsNotificationAllowed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const backPressed = () => {
    BackHandler.exitApp();
    navigation.navigate("LandingScreen");
  };

  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener("hardwareBackPress", backPressed);
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", backPressed);
      };
    }, [])
  );

  async function handleCheckPressed() {
    try {
      if (Platform.OS === "android") {
        const checkEnabled = await isLocationEnabled();

        if (!checkEnabled) {
          await handleEnabledPressed();
        } else {
          await getData();
        }
      }
    } catch (error) {
      await useErrorHandler(
        "(Android): Location > handleCheckPresses() " + error
      );
    }
  }

  async function handleEnabledPressed() {
    if (Platform.OS === "android") {
      try {
        const enableResult = await promptForEnableLocationIfNeeded();
        await getData();
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }
  }

  async function setLangandLat(latitude, longitude) {
    (lang = longitude), (lat = latitude);
  }

  NavigateToBusinessDetails = (item) => {
    navigation.navigate("BusinessDetailView", { id: item });
  };

  const getData = async () => {
    setLoadingData(true);

    try {
      AsyncStorage.getItem("token")
        .then(async (value) => {
          if (value !== null) {
            await axios({
              method: "GET",
              url: `${baseUrl}/${JSON.parse(value)[0].memberId}`,
            })
              .then(async (response) => {
                if (regionWiseBusiness != null) {
                  response = regionWiseBusiness;
                } else {
                  response = response.data;
                }
                await Geolocation.getCurrentPosition(
                  async (position) => {
                    try {
                      const { latitude, longitude } = position.coords;

                      await setLangandLat(latitude, longitude);
                      await response.map((data1, index) => {
                        const toRadian = (n) => (n * Math.PI) / 180;
                        let lat2 = data1.latitude;
                        let lon2 = data1.longitude;
                        let lat1 = lat;
                        let lon1 = lang;

                        let R = 6371; // km
                        let x1 = lat2 - lat1;
                        let dLat = toRadian(x1);
                        let x2 = lon2 - lon1;
                        let dLon = toRadian(x2);
                        let a =
                          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                          Math.cos(toRadian(lat1)) *
                            Math.cos(toRadian(lat2)) *
                            Math.sin(dLon / 2) *
                            Math.sin(dLon / 2);
                        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        let d = R * c;
                        data1.distance = parseInt(d * 0.621371);
                      });

                      response = response.sort((a, b) => {
                        return a.distance - b.distance;
                      });
                      await setUserData(response);
                      await setFilteredData(response);
                      setLoadingData(false);
                    } catch (error) {
                      await useErrorHandler(
                        "(Android): Location > getData() " + error
                      );
                    }
                  },
                  async (error) => {
                    await useErrorHandler(
                      "(Android): Location > getData() " + error
                    );
                    setLoadingData(false);
                  },
                  { enableHighAccuracy: false, timeout: 5000 }
                );
              })
              .catch(async (error) => {
                await useErrorHandler(
                  "(Android): Location > getData() " + error
                );
              });
          }
        })
        .catch(async (error) => {
          await useErrorHandler("(Android): Location > getData() " + error);
        });
    } catch (error) {
      await useErrorHandler("(Android): Location > getData() " + error);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    // handleCheckPressed();
    checkNotificationPermission();
    requestLocationPermission();

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
      controller.abort();
    };
  }, [regionWiseBusiness]);

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === "active") {
      // The app has come to the foreground
      checkLocationPermissionFrequently();
    }
    // setAppState(nextAppState);
  };

  const checkLocationPermissionFrequently = async () => {
    const permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    const result = await check(permission);

    if (result === RESULTS.GRANTED) {
      console.log("Location permission granted");
      await handleCheckPressed();
    } else {
      // If permission is blocked, show a dialog to open settings
      showLocationPermissionAlert();
    }
  };

  const showLocationPermissionAlert = () => {
    showModal();
  };

  const requestLocationPermission = async () => {
    try {
      let permissionStatus;

      if (Platform.OS === "ios") {
        permissionStatus = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      } else if (Platform.OS === "android") {
        permissionStatus = await check(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        );
      }

      if (permissionStatus === RESULTS.GRANTED) {
        await handleCheckPressed();
      } else if (permissionStatus === RESULTS.DENIED) {
        const newPermissionStatus = await request(
          Platform.OS === "ios"
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
            : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        );

        if (newPermissionStatus === RESULTS.GRANTED) {
          await handleCheckPressed();
        } else {
          showModal();
          console.log("Location permission denied");
        }
      } else {
        showModal();
        console.log("Location permission denied");
      }
    } catch (error) {
      await useErrorHandler(
        "(Android): Location > requestLocationPermission() " + error
      );
    }
  };

  const openAppSettings = () => {
    const { openSettings } = require("react-native-permissions");
    closeModal();
    openSettings().catch(() => console.warn("Cannot open settings"));
  };

  const handleInputChange = async (text) => {
    try {
      if (text === "") {
        setFilteredData(userData);
      } else {
        let data = userData.filter((item) => {
          if (item.metaData && typeof item.metaData === "string") {
            return item.metaData.toLowerCase().includes(text.toLowerCase());
          }
          return false; // Explicitly return false if the condition is not met
        });
        setFilteredData(data);
      }
    } catch (error) {
      await useErrorHandler(
        "(Android): Location > handleInputChange() " + error
      );
    }
  };

  const checkNotificationPermission = async () => {
    try {
      const RESULTS = await check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      switch (RESULTS) {
        case "granted":
          setIsNotificationAllowed(true);
          break;
        case "denied":
          setIsNotificationAllowed(false);
          break;
        case "blocked":
          setIsNotificationAllowed(false);
          break;
        case "unavailable":
          setIsNotificationAllowed(false);
          break;
        default:
          setIsNotificationAllowed(false);
          break;
      }
    } catch (error) {
      await useErrorHandler(
        "(Android): Location > checkNotificationPermission() " + error
      );
    }
  };

  const likeProfile = async (business) => {
    try {
      AsyncStorage.getItem("token")
        .then(async (value) => {
          if (value !== null) {
            await filteredData.map((data1, index) => {
              if (business.id == data1.id) {
                data1.isLiked = true;
              }
            });
            let currentDate = new Date().toISOString();
            await fetch(
              Globals.API_URL + "/MembersWishLists/PostMemberWishlistInMobile",
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  uniqueId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                  id: 0,
                  memberId: JSON.parse(value)[0].memberId,
                  notes: null,
                  badgeId: 1,
                  tagId: null,
                  businessGroupId: business.businessGroupID,
                  lastVisitDate: null,
                  lifeTimePoints: 0,
                  lifeTimeVisits: 0,
                  smsoptIn: false,
                  emailOptIn:
                    JSON.parse(value)[0].emailId == "" ||
                    JSON.parse(value)[0].emailId == null ||
                    JSON.parse(value)[0].emailId == undefined
                      ? false
                      : true,
                  notificationOptIn: isNotificationAllowed,
                  isHighroller: false,
                  isFreePlayer: false,
                  currentPoints: 0,
                  sourceId: 14,
                  stateId: 3,
                  isActive: true,
                  createdBy: JSON.parse(value)[0].memberId,
                  createdDate: currentDate,
                  lastModifiedBy: JSON.parse(value)[0].memberId,
                  lastModifiedDate: currentDate,
                  businessLocationID: business.id,
                  baseLocationID: business.id,
                }),
              }
            )
              .then(async (res) => {
                ToastAndroid.showWithGravityAndOffset(
                  "Liked!",
                  ToastAndroid.LONG,
                  ToastAndroid.BOTTOM,
                  25,
                  50
                );
                await handleCheckPressed();
              })
              .catch(async (error) => {
                await useErrorHandler(
                  "(Android): Location > likeProfile() " + error
                );
                await filteredData.map((data1, index) => {
                  if (business.id == data1.id) {
                    data1.isLiked = false;
                  }
                });
                // setLoadingData(false);
              });
          } else {
            console.log("not available");
          }
        })
        .catch(async (error) => {
          await useErrorHandler("(Android): Location > likeProfile() " + error);
          // setLoadingData(false);
        });
    } catch (error) {
      await useErrorHandler("(Android): Location > likeProfile() " + error);
    }
  };

  const EmptyElement = (
    <Text style={styles.noDataText}>
      To find Revords Businesses, set the map view accordingly!{" "}
    </Text>
  );

  const showModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "97%",
              height: 50,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={styles.welcomeText}>Where to go?</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("NotificationTray", { UUID: null })}
            >
              <Image
                source={require("../assets/notification-oRK.png")}
                style={styles.setimg1}
              />
            </TouchableOpacity>
          </View>

          <View style={{ width: "97%", height: "90%", marginTop: 10 }}>
            <View style={styles.searchBoxMain}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search.."
                onChangeText={(text) => handleInputChange(text)}
              />
              <Image
                style={styles.magnifyingGlass}
                source={require("../assets/magnifyingglass-qQV.png")}
              />
              <TouchableOpacity
                style={{ width: "16%", marginRight: "2%" }}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("MapViewing")}
              >
                <View style={styles.mainMapImage}>
                  <Image
                    style={styles.mapImage}
                    source={require("../assets/mapImg.png")}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.store}>
              {loadingData ? (
                <>
                  <SafeAreaView style={styles.scrollContainer}>
                    <ScrollView
                      style={{
                        flex: 1,
                        height: "100%",
                        width: "100%",
                        borderRadius: 50,
                      }}
                      showsVerticalScrollIndicator={false}
                    >
                      <LinearGradient
                        colors={["#b0bec5", "#e1e1e1", "#b0bec5"]}
                        style={[styles.gradient, { marginTop: 10 }]}
                      >
                        <View style={{ width: "100%", height: 220 }}>
                          <ShimmerPlaceholder
                            style={styles.shimmer}
                            shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                          ></ShimmerPlaceholder>
                        </View>

                        <View
                          style={{
                            width: "100%",
                            height: 80,
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <View
                            style={{
                              width: "40%",
                              height: "90%",
                              marginLeft: 2,
                            }}
                          >
                            <ShimmerPlaceholder
                              style={styles.shimmer}
                              shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                            ></ShimmerPlaceholder>
                          </View>
                          <View
                            style={{
                              width: "55%",
                              height: "90%",
                              marginLeft: 10,
                              justifyContent: "center",
                            }}
                          >
                            <View style={{ width: "85%", height: "35%" }}>
                              <ShimmerPlaceholder
                                style={styles.shimmer}
                                shimmerColors={[
                                  "#f3f3f3",
                                  "#e1e1e1",
                                  "#f3f3f3",
                                ]}
                              ></ShimmerPlaceholder>
                            </View>
                            <View
                              style={{
                                width: "60%",
                                height: "25%",
                                marginTop: 10,
                              }}
                            >
                              <ShimmerPlaceholder
                                style={styles.shimmer}
                                shimmerColors={[
                                  "#f3f3f3",
                                  "#e1e1e1",
                                  "#f3f3f3",
                                ]}
                              ></ShimmerPlaceholder>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>

                      <LinearGradient
                        colors={["#b0bec5", "#e1e1e1", "#b0bec5"]}
                        style={[styles.gradient, { marginTop: 10 }]}
                      >
                        <View style={{ width: "100%", height: 220 }}>
                          <ShimmerPlaceholder
                            style={styles.shimmer}
                            shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                          ></ShimmerPlaceholder>
                        </View>

                        <View
                          style={{
                            width: "100%",
                            height: 80,
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <View
                            style={{
                              width: "40%",
                              height: "90%",
                              marginLeft: 2,
                            }}
                          >
                            <ShimmerPlaceholder
                              style={styles.shimmer}
                              shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                            ></ShimmerPlaceholder>
                          </View>
                          <View
                            style={{
                              width: "55%",
                              height: "90%",
                              marginLeft: 10,
                              justifyContent: "center",
                            }}
                          >
                            <View style={{ width: "85%", height: "35%" }}>
                              <ShimmerPlaceholder
                                style={styles.shimmer}
                                shimmerColors={[
                                  "#f3f3f3",
                                  "#e1e1e1",
                                  "#f3f3f3",
                                ]}
                              ></ShimmerPlaceholder>
                            </View>
                            <View
                              style={{
                                width: "60%",
                                height: "25%",
                                marginTop: 10,
                              }}
                            >
                              <ShimmerPlaceholder
                                style={styles.shimmer}
                                shimmerColors={[
                                  "#f3f3f3",
                                  "#e1e1e1",
                                  "#f3f3f3",
                                ]}
                              ></ShimmerPlaceholder>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </ScrollView>
                  </SafeAreaView>
                </>
              ) : (
                <FlatList
                  ListEmptyComponent={EmptyElement}
                  showsVerticalScrollIndicator={false}
                  data={filteredData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => {
                    return (
                      <Card
                        style={styles.card}
                        onPress={() => this.NavigateToBusinessDetails(item.id)}
                      >
                        <Card.Cover
                          source={{ uri: item.imagePath }}
                          style={styles.cardCover}
                          resizeMode="contain"
                        />

                        <Card.Content style={styles.cardContent}>
                          <View
                            style={{
                              width: "30%",
                              height: "100%",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Image
                              style={styles.avatarImg}
                              source={{ uri: item.logoPath }}
                              resizeMode="stretch"
                            ></Image>
                          </View>
                          <View style={{ width: "70%", height: "100%" }}>
                            <Title
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              style={{
                                fontSize: 16,
                                fontWeight: "800",
                                color: "#3b3939",
                              }}
                            >
                              {" "}
                              {item.businessName}
                            </Title>
                            {/* {(item.businessName).toString().length >= 22 && <Title numberOfLines={1} ellipsizeMode="tail" style={{ fontSize: 16, fontWeight: '800', color: '#3b3939' }}> {(item.businessName).toString().substring(0, 22)}...</Title>} */}
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              style={{ color: "#717679", fontWeight: "500" }}
                            >
                              {" "}
                              {item.industry}{" "}
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                width: "85%",
                                justifyContent: "space-between",
                              }}
                            >
                              <Text style={styles.milesText}>
                                {" "}
                                {item.distance} mi{" "}
                              </Text>
                              {item.isLiked == false && (
                                <TouchableOpacity
                                  activeOpacity={0.7}
                                  onPress={() => likeProfile(item)}
                                >
                                  <Animatable.Image
                                    animation={pulse}
                                    easing="ease-in-out"
                                    iterationCount="infinite"
                                    style={{
                                      width: 25,
                                      height: 25,
                                      left: "41%",
                                      position: "absolute",
                                    }}
                                    source={require("../assets/likeOutline.png")}
                                  />
                                </TouchableOpacity>
                              )}
                              {item.isLiked == true && (
                                <TouchableOpacity activeOpacity={0.7}>
                                  <Image
                                    source={require("../assets/likeFill.png")}
                                    style={{
                                      width: 25,
                                      height: 25,
                                      left: "41%",
                                      position: "absolute",
                                    }}
                                  ></Image>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        </Card.Content>
                      </Card>
                    );
                  }}
                />
              )}
            </View>
          </View>
        </View>

        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Image
                source={require("../assets/Applogo.png")}
                style={styles.modalAppLogo}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../assets/navigation.png")}
                  style={{
                    width: 20,
                    height: 20,
                    marginRight: 2,
                    marginBottom: 8,
                  }}
                />
                <Text style={styles.modalTitle}>
                  Location Permission Required
                </Text>
              </View>
              <Text style={styles.modalMessage}>
                We need permission to access your location.
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={openAppSettings}
                >
                  <Text style={styles.buttonText}>Tap to go to settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* <SafeAreaView>
                    <View style={styles.container}>
                        <Spinner
                            visible={loadingData}
                            textContent={''}
                            textStyle={styles.spinnerStyle} />
                    </View>
                </SafeAreaView> */}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  modalAppLogo: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
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
    width: "100%",
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
  shimmer: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  scrollContainer: {
    paddingTop: "5%",
    height: "100%",
    width: "100%",
    alignItems: "center",
    borderRadius: 50,
  },
  gradient: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    // marginLeft: 7,
    // paddingLeft: 10
    // justifyContent: 'center',
  },
  cardContent: {
    marginHorizontal: "2%",
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    height: "30%",
  },
  avatarImg: {
    height: "60%",
    width: "100%",
    left: -7,
    borderRadius: 7,
  },
  cardCover: {
    height: "70%",
    width: "100%",
  },
  card: {
    marginBottom: 10,
    height: 300,
    width: "100%",
  },
  store: {
    width: "97%",
    flexShrink: 0,
    marginTop: "2%",
    alignSelf: "center",
    height: "90%",
  },
  mapImage: {
    width: 26,
    height: 24,
    objectFit: "contain",
  },
  mainMapImage: {
    padding: 15,
    backgroundColor: "#3380a3",
    borderRadius: 8,
    flexShrink: 0,
    width: "100%",
    alignItems: "center",
  },
  magnifyingGlass: {
    height: 26.028,
    resizeMode: "contain",
    backgroundColor: "transparent",
    marginLeft: "50%",
    position: "absolute",
  },
  searchInput: {
    width: "50%",
    height: 50,
    padding: 13.97,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    flex: 1,
    marginRight: "2%",
  },
  searchBoxMain: {
    marginLeft: "2%",
    flexDirection: "row",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    height: 50,
    marginTop: 10,
  },
  notificationLbl: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    flex: 0,
    marginTop: "1%",
    left: "190%",
  },
  textWhere: {
    marginLeft: "2%",
    fontSize: 23,
    fontWeight: "900",
    color: "#000000",
    fontFamily: 'Satoshi Variable, "Source Sans Pro"',
  },
  header: {
    margin: "2%",
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    marginLeft: "15%",
  },
  grpSearch: {
    padding: "0rem 0.8rem 1.6rem 0.7rem",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flex: 0,
    flexDirection: "row",
  },
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "#d9e7ed",
    alignItems: "center",
  },
  setimg1: {
    width: 50,
    height: 50,
    marginTop: -16,
    position: "absolute",
    alignSelf: "flex-end",
    right: -27,
  },
  milesText: {
    color: "#73a5bc",
    fontSize: 14,
    fontWeight: "700",
  },
  welcomeText: {
    color: "black",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    width: "80%",
  },
  noDataText: {
    color: "gray",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 200,
    // width: "80%",
  },
});

export default Location;
