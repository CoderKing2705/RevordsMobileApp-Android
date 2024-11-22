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
import { TouchableHighlight, TouchableOpacity } from "react-native";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
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

export default function MapViewing() {
  const navigation = useNavigation();
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
  const [loading, setLoading] = useState(true);
  // const [show, setShow] = useState(false);
  const { setRegionWiseBusiness, isFirstLaunch, setIsFirstLaunch } =
    useContext(PageSequenceContext);
  const [region, setRegion] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  async function handleCheckPressed() {
    if (Platform.OS === "android") {
      const checkEnabled = await isLocationEnabled();
      if (!checkEnabled) {
        await handleEnabledPressed();
      } else {
        await getCurrentLocation();
      }
    }
  }

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    const initialize = async () => {
      try {
        // Set loading state if needed
        setLoading(true);

        // Handle app state changes

        // Request location permission
        await requestLocationPermission();

        // Retrieve token and fetch data
        const token = await AsyncStorage.getItem("token");
        if (token !== null) {
          memberID.current = JSON.parse(token)[0].memberId;

          const res = await axios.get(`${baseUrl}/${memberID.current}`);
          businessData.current = res.data;
          setInitialData(res.data);
          setFilteredData(res.data);
          setRegionWiseBusiness(res.data);
        }

        // Initialize map
        await initializeMap();
        setLoading(false);
      } catch (error) {
        await useErrorHandler("(Android): MapView > useEffect() " + error);
      } finally {
        // Optionally set loading state to false
        setLoading(false);
      }
    };

    initialize();

    return () => {
      // Cleanup subscription
      subscription?.remove();
    };
  }, []);

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
      // setShow(false);
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
    await filterLocations(newRegion);
  };

  const getBoundingBox = async (region) => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    return {
      northEast: {
        latitude: latitude + latitudeDelta / 2,
        longitude: longitude + longitudeDelta / 2,
      },
      southWest: {
        latitude: latitude - latitudeDelta / 2,
        longitude: longitude - longitudeDelta / 2,
      },
    };
  };
  const filterItems = async () => {
    const results = await Promise.all(
      initialData.map(async (item) => {
        if (
          item.metaData !== null &&
          item.metaData !== undefined &&
          item.metaData !== ""
        ) {
          // Check if the metaData includes the searchText
          const includesSearchText = item.metaData
            .toLowerCase()
            .includes(searchText.toLowerCase());
          return { ...item, includesSearchText };
        }
        return { ...item, includesSearchText: false }; // If metaData is invalid, set includesSearchText to false
      })
    );

    // Filter items based on the includesSearchText property
    const data = results.filter((item) => item.includesSearchText);

    return data;
  };
  const filterLocations = async (region) => {
    let data;
    if (searchText === "") {
      data = initialData;
    } else {      
      data = await filterItems();
    }

    const boundingBox = await getBoundingBox(region);
    const filtered = await Promise.all(
      data.map(async (location) => {
        // Check if each location is within the bounding box
        const isInRegion = isLocationInRegion(location, boundingBox);
        return isInRegion ? location : null;
      })
    ).then((results) => results.filter((result) => result !== null));
    setRegionWiseBusiness(filtered);
    setFilteredData(filtered);
  };

  const isLocationInRegion = (location, boundingBox) => {
    const { latitude, longitude } = location;
    const { southWest, northEast } = boundingBox;
    // Check latitude range
    const isLatInRange =
      latitude >= southWest.latitude && latitude <= northEast.latitude;

    // Check longitude range considering Date Line
    const isLonInRange =
      southWest.longitude <= northEast.longitude
        ? longitude >= southWest.longitude && longitude <= northEast.longitude
        : longitude >= southWest.longitude || longitude <= northEast.longitude;

    return isLatInRange && isLonInRange;
  };
  const MemoizedMarker = React.memo(
    () => (
      <Marker
        coordinate={initialRegion}
        title="My Location"
        trackViewChanges={false}
      ></Marker>
    ),
    []
  );

  const BusinessMemoizedMarker = React.memo(
    (props) => (
      <Marker
        trackViewChanges={false}
        key={props.business.id}
        coordinate={{
          latitude: parseFloat(props.business.latitude),
          longitude: parseFloat(props.business.longitude),
        }}
      >
        {props.children}
      </Marker>
    ),
    []
  );
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
              onPress={() =>
                navigation.navigate("NotificationTray", { UUID: null })
              }
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
              trackViewChanges={false}
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
              {initialRegion && <MemoizedMarker />}
              {filteredData &&
                filteredData.map(
                  (business, index) =>
                    business.latitude && (
                      <BusinessMemoizedMarker
                        key={business.id}
                        business={business}
                      >
                        <TouchableOpacity>
                          <Image
                            source={{
                              uri: business.mapIconPath,
                            }}
                            style={styles.markerImage}
                            resizeMode="stretch"
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
                      </BusinessMemoizedMarker>
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
              {/* <Text style={styles.modalMessage}>
                We need permission to access your location.
              </Text> */}
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
  markerImage: {
    width: 48,
    height: 48,
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
