import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  PermissionsAndroid,
  SafeAreaView,
  BackHandler,
  Platform,
  AppState,
  Modal,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import {
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
import currentIcon from "../assets/currentlocation.png";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import Geolocation from "@react-native-community/geolocation";
import Globals from "./Globals";
import axios from "axios";
import { isLocationEnabled } from "react-native-android-location-enabler";
import { promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";
import Spinner from "react-native-loading-spinner-overlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useErrorHandler } from "./ErrorHandler";
import PageSequenceContext from "./contexts/PageSequence/PageSequenceContext";

export default function MapViewing({ navigation }) {
  const isFocused = useIsFocused();
  const [filteredData, setFilteredData] = useState("");
  const [initialData, setInitialData] = useState([]);
  const [initialRegion, setInitialRegion] = useState(null);
  const memberID = useRef(0);
  //   const [businessData, setBusinessData] = useState([{}]);
  const businessData = useRef([{}]);
  const [searchText, setSearchText] = useState("");
  const baseUrl =
    Globals.API_URL + "/BusinessProfiles/GetBusinessProfilesForMobile";
  const baseUrlRegionWise =
    Globals.API_URL +
    "/BusinessProfiles/GetBusinessProfilesForMobileRegionWise";
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const {
    regionWiseBusiness,
    setRegionWiseBusiness,
    isFirstLaunch,
    setIsFirstLaunch,
  } = useContext(PageSequenceContext);
  const [region, setRegion] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  async function handleCheckPressed() {
    if (Platform.OS === "android") {
      const checkEnabled = await isLocationEnabled();
      if (!checkEnabled) {
        await handleEnabledPressed();
      }else{
        await getCurrentLocation();

      }
    }
  }

  useEffect(() => {
    setLoading(true);
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    requestLocationPermission();

    AsyncStorage.getItem("token")
      .then(async (value) => {
        if (value !== null) {
          try {
            memberID.current = JSON.parse(value)[0].memberId;
            const res = await axios.get(`${baseUrl}/${memberID.current}`);
            businessData.current = res.data;
            setInitialData(res.data);
            setRegionWiseBusiness(res.data);
            setFilteredData(res.data);
            setLoading(false);
          } catch (error) {
            await useErrorHandler("(Android): MapView > useEffect() " + error);
            setLoading(false);
          }
        }
      })
      .catch(async (error) => {
        setLoading(false);
        await useErrorHandler("(Android): MapView > useEffect() " + error);
      });

    setLoading(false);

    initializeMap();
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    console.log(nextAppState);
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

  const openAppSettings = () => {
    console.log("idjoksnlf");
    const { openSettings } = require("react-native-permissions");
    closeModal();
    openSettings().catch(() => console.warn("Cannot open settings"));
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  async function setMarkers(centerLat, centerLong) {
    setInitialRegion({
      latitude: centerLat,
      longitude: centerLong,
      longitudeDelta: 0.0922 * 2,
      latitudeDelta: 0.0922,
    });
  }

  const initializeMap = async () => {
    try {
      if (isFirstLaunch) {
        setIsFirstLaunch(false);
        await getCurrentLocation();
        currentRegionSetting(setRegion);
      } else {
        // Not first launch: restore last known region
        const savedRegion = await AsyncStorage.getItem("mapRegion");
        if (savedRegion) {
          setRegion(JSON.parse(savedRegion));
          currentRegionSetting(setInitialRegion);
        } else {
          // No saved region: fallback to default
          getCurrentLocation();
        }
      }
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  const currentRegionSetting = (itemSet) => {
    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          itemSet({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            longitudeDelta: 0.0922 * 2,
            latitudeDelta: 0.0922,
          });
        } catch (error) {
          await useErrorHandler(
            "(Android): MapView > currentRegionSetting() " + error
          );
        }
      },
      async (error) => {
        await useErrorHandler(
          "(Android): MapView > currentRegionSetting() " + error
        );
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const getCurrentLocation = async () => {
    try {
      currentRegionSetting(setInitialRegion);
    } catch (error) {
      await useErrorHandler(
        "(Android): MapView > getCurrentLocation() " + error
      );
    }
  };

  async function handleEnabledPressed() {
    try {
      if (Platform.OS === "android") {
        try {
          const enableResult = await promptForEnableLocationIfNeeded();
        } catch (error) {
          if (error instanceof Error) {
            await useErrorHandler(
              "(Android): MapView > handleEnabledPressed() " + error
            );
          }
        }
      }
    } catch (error) {
      await useErrorHandler(
        "(Android): MapView > handleEnabledPressed() " + error
      );
    }
  }

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
        // await getCurrentLocation();
      } else if (permissionStatus === RESULTS.DENIED) {
        const newPermissionStatus = await request(
          Platform.OS === "ios"
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
            : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        );

        if (newPermissionStatus === RESULTS.GRANTED) {
          await handleCheckPressed();
          // await getCurrentLocation();
        } else {
          showModal();
          console.log("Location permission denied");
        }
      } else {
        showModal();
      }
    } catch (error) {
      await useErrorHandler(
        "(Android): MapView > requestLocationPremission() " + error
      );
    }
  };

  const handleInputChange = async (text) => {
    try {
      setShow(false);
      setSearchText(text);
      if (text === "") {
        setFilteredData(businessData.current);
      } else {
        let data = businessData.current.filter((item) => {
          if (
            item.metaData !== null &&
            item.metaData !== undefined &&
            item.metaData !== ""
          ) {
            return item.metaData.toLowerCase().includes(text.toLowerCase());
          }
        });
        setFilteredData(data);
      }
    } catch (error) {
      await useErrorHandler(
        "(Android): MapView > handleInputChange() " + error
      );
    }
  };

  const regionRef = useRef(null);

  const handleRegionChange = async (newRegion) => {
    if (regionRef.current !== region) {
      regionRef.current = region;
      setRegion(region);
    }
    try {
      await AsyncStorage.setItem("mapRegion", JSON.stringify(newRegion));
    } catch (error) {
      console.error("Error saving map region:", error);
    }
    filterLocations(newRegion);
  };

  const getBoundingBox = (region) => {
    return {
      northEast: {
        latitude: region.latitude + region.latitudeDelta / 2,
        longitude: region.longitude + region.longitudeDelta / 2,
      },
      southWest: {
        latitude: region.latitude - region.latitudeDelta / 2,
        longitude: region.longitude - region.longitudeDelta / 2,
      },
    };
  };

  const filterLocations = async (region) => {
    let data;
    if (searchText === "") {
      data = initialData;
    } else {
      data = initialData.filter((item) => {
        if (
          item.metaData !== null &&
          item.metaData !== undefined &&
          item.metaData !== ""
        ) {
          return item.metaData.toLowerCase().includes(searchText.toLowerCase());
        }
      });
    }

    const boundingBox = getBoundingBox(region);

    const filtered = data.filter((location) => {
      return isLocationInRegion(location, boundingBox);
    });

    setRegionWiseBusiness(filtered);
    setFilteredData(filtered);
  };

  const isLocationInRegion = (location, boundingBox) => {
    return (
      location.latitude >= boundingBox.southWest.latitude &&
      location.latitude <= boundingBox.northEast.latitude &&
      location.longitude >= boundingBox.southWest.longitude &&
      location.longitude <= boundingBox.northEast.longitude
    );
  };

  return (
    <>
      <View style={styles.container}>
        <>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              height: 50,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={styles.welcomeText}>Where to go?</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate("NotificationTray")}
            >
              <Image
                source={require("../assets/notification-oRK.png")}
                style={styles.setimg1}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "100%",
              height: 75,
              marginTop: 20,
            }}
          >
            <View
              style={{ width: "82%", paddingHorizontal: "2%", height: "70%" }}
            >
              <TextInput
                style={styles.searchInput}
                placeholder="Search.."
                onChangeText={(text) => handleInputChange(text)}
              />
              <Image
                style={styles.magnifyingGlass}
                source={require("../assets/magnifyingglass-qQV.png")}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Locations")}
              style={{ width: "16%", height: "70%", marginRight: "2%" }}
            >
              <View style={styles.mainMapImage}>
                <Image
                  style={styles.mapImage}
                  source={require("../assets/listImg.png")}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.mapViewMain}>
            <MapView
              onRegionChangeComplete={handleRegionChange}
              style={styles.mapView}
              provider={PROVIDER_GOOGLE}
              region={region}
              showsMyLocationButton={true}
              customMapStyle={[
                {
                  featureType: "transit",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#f8f7f7",
                    },
                  ],
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#c8d6e3", // Blue color
                    },
                  ],
                },
                {
                  featureType: "road",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#000",
                    },
                  ],
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#95c3d6",
                    },
                  ],
                },
                {
                  featureType: "water",
                  elementType: "labels.text.stroke",
                  stylers: [
                    {
                      color: "#000",
                    },
                  ],
                },
              ]}
            >
              {initialRegion && (
                <Marker
                  coordinate={initialRegion}
                  title="My Location"
                  trackViewChanges={false}
                >
                  <Image
                    source={currentIcon}
                    style={{ width: 32, height: 32 }}
                    resizeMode="contain"
                  />
                </Marker>
              )}
              {filteredData &&
                filteredData.map(
                  (business, index) =>
                    business.latitude && (
                      <Marker
                        trackViewChanges={false}
                        key={business.id}
                        coordinate={{
                          latitude: parseFloat(business.latitude),
                          longitude: parseFloat(business.longitude),
                        }}
                      >
                        <TouchableOpacity onPress={() => setShow(true)}>
                          <Image
                            source={{
                              uri: business.mapIconPath,
                            }}
                            style={{ width: 48, height: 48 }}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                        <Callout
                          onPress={() =>
                            navigation.navigate("BusinessDetailView", {
                              id: business.id,
                            })
                          }
                          style={styles.locationbuttoncallout}
                        >
                          <TouchableHighlight style={{ width: 180 }}>
                            <Text style={{ textAlign: "center" }}>
                              {business.businessName}
                            </Text>
                          </TouchableHighlight>
                        </Callout>
                      </Marker>
                    )
                )}
            </MapView>
          </View>
        </>
        <SafeAreaView>
          <View style={styles.container}>
            <Spinner
              visible={loading}
              textContent={""}
              textStyle={styles.spinnerStyle}
            />
          </View>
        </SafeAreaView>

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
      </View>
    </>
  );
}

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
    justifyContent: "center",
    width: "100%",
  },
  button: {
    flex: 1,
    pointerEvents: "auto",
    padding: 10,
    backgroundColor: "#d9e7ed",
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "black",
    fontWeight: "700",
    fontSize: 16,
  },
  setimg1: {
    width: 50,
    height: 50,
    marginTop: -16,
    position: "absolute",
    alignSelf: "flex-end",
    right: -25,
  },
  welcomeText: {
    color: "black",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    width: "80%",
  },
  searchBoxMain: {
    marginLeft: "3%",
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    marginTop: "5%",
  },
  locationbuttoncallout: {
    borderradius: 0,
    opacity: 0.8,
    backgroundcolor: "lightgrey",
  },
  customView: {
    marginLeft: "2%",
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    marginTop: "10%",
  },
  calloutText: {
    marginLeft: "2%",
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    marginTop: "10%",
  },
  searchInput: {
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  mapImage: {
    width: 26,
    height: 24,
  },
  mainMapImage: {
    backgroundColor: "#3380a3",
    borderRadius: 8,
    flexShrink: 0,
    width: "100%",
    padding: 25,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  magnifyingGlass: {
    height: 25,
    resizeMode: "contain",
    backgroundColor: "transparent",
    right: 0,
    top: "20%",
    position: "absolute",
  },
  notificationLbl: {
    width: 49,
    height: 49,
    resizeMode: "contain",
    flex: 1,
    left: "85%",
    position: "absolute",
    top: "2%",
  },
  textWhere: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "900",
    color: "#000000",
    fontFamily: 'Satoshi Variable, "Source Sans Pro"',
    marginTop: "2%",
    top: "2%",
  },
  container: {
    width: "100%",
    height: "100%",
    flex: 0,
    position: "relative",
    backgroundColor: "#d9e7ed",
  },
  mapViewMain: {
    position: "relative",
    flex: 0,
  },
  mapView: {
    width: "100%",
    height: "100%",
  },
});
