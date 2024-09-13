import {
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  ToastAndroid,
} from "react-native";
import { View, Text, Image } from "react-native";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import Globals from "../components/Globals";
import { SafeAreaView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Spinner from "react-native-loading-spinner-overlay";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import * as Progress from "react-native-progress";
import ImageViewer from "react-native-image-zoom-viewer";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { useErrorHandler } from "./ErrorHandler";
import { check } from "react-native-permissions";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
export default function BusinessDetailsView({ route }) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  lang = 0;
  lat = 0;
  const [initialRegion, setInitialRegion] = useState(null);
  const [loading, setLoading] = useState(false);
  const businessDetailsAPI = `${Globals.API_URL}/BusinessProfiles/GetBusinessLocationWiseMemberDetails`;
  const id = route.params.id;
  const [businessDetails, setBusinessDetails] = useState([]);
  const imagePath = businessDetails ? businessDetails.imagePath : null;
  const logoPath = businessDetails ? businessDetails.logoPath : null;
  const galleryImagePath1 = businessDetails
    ? businessDetails.galleryImagePath1
    : null;
  const galleryImagePath2 = businessDetails
    ? businessDetails.galleryImagePath2
    : null;
  const galleryImagePath3 = businessDetails
    ? businessDetails.galleryImagePath3
    : null;
  const galleryImagePath4 = businessDetails
    ? businessDetails.galleryImagePath4
    : null;
  const imageUrl = `${imagePath}`;
  const logoUrl = `${logoPath}`;
  const galleryImagePath1Url = `${galleryImagePath1}`;
  const galleryImagePath2Url = `${galleryImagePath2}`;
  const galleryImagePath3Url = `${galleryImagePath3}`;
  const galleryImagePath4Url = `${galleryImagePath4}`;
  const [buttonClicked, setButtonClicked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const imagesTemp = [
    { url: galleryImagePath1Url, img: galleryImagePath1 },
    { url: galleryImagePath2Url, img: galleryImagePath2 },
    { url: galleryImagePath3Url, img: galleryImagePath3 },
    { url: galleryImagePath4Url, img: galleryImagePath4 },
  ];
  const images = imagesTemp.filter((x) => x.img != null);
  const [isNotificationAllowed, setIsNotificationAllowed] = useState(false);

  async function setMarkers(centerLat, centerLong) {
    setInitialRegion({
      latitude: centerLat,
      longitude: centerLong,
      longitudeDelta: 0.0922 * 2,
      latitudeDelta: 0.0922,
    });
  }

  async function setBusinessDetailsAwait(data) {
    await setBusinessDetails(data);
  }

  const getLocation = (response) => {
    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const toRadian = (n) => (n * Math.PI) / 180;
          let lat2 = response.data[0].latitude;
          let lon2 = response.data[0].longitude;
          let lat1 = latitude;
          let lon1 = longitude;

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
          response.data[0].distance = parseInt(d * 0.621371);

          await setBusinessDetailsAwait(response.data[0]);
          await setMarkers(
            parseFloat(response.data[0].latitude),
            parseFloat(response.data[0].longitude)
          );

          setLoading(false);
        } catch (error) {
          await useErrorHandler(
            "(Android): BusinessDetailsView > getLocation(): " + error
          );
        }
      },
      async (error) => {
        await useErrorHandler(
          "(Android): BusinessDetailsView > getLocation(): " + error
        );
      },
      { enableHighAccuracy: false, timeout: 500 }
    );
  };

  async function LoadData() {
    setLoading(true);

    AsyncStorage.getItem("token")
      .then(async (value) => {
        if (value !== null) {
          await axios({
            method: "GET",
            url: `${businessDetailsAPI}/${id}/${JSON.parse(value)[0].memberId}`,
          })
            .then(async (response) => {
              await getLocation(response);
            })
            .catch(async (error) => {
              await useErrorHandler(
                "(Android): BusinessDetailsView > LoadData() " + error
              );
              setLoading(false);
            });
        }
      })
      .catch(async (error) => {
        await useErrorHandler(
          "(Android): BusinessDetailsView > LoadData(): " + error
        );
        setLoading(false);
      });
  }

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
        "(Android): BusinessDetailsView > checkNotificationPermission(): " +
          error
      );
    }
  };

  const saveProfile = () => {
    if (!buttonClicked) {
      setButtonClicked(true);
      setLoading(true);
      AsyncStorage.getItem("token")
        .then(async (value) => {
          if (value !== null) {
            let currentDate = new Date().toISOString();
            await fetch(
              Globals.API_URL +
                "/MemberProfiles/PostMemberProfileInMobileBySave",
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
                  businessGroupId: businessDetails.businessGroupId,
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
                  businessLocationID: businessDetails.businessId,
                  baseLocationID: businessDetails.businessId,
                }),
              }
            )
              .then(async (res) => {
                ToastAndroid.showWithGravityAndOffset(
                  "Claimed Successfully!",
                  ToastAndroid.LONG,
                  ToastAndroid.BOTTOM,
                  25,
                  50
                );
                await LoadData();
              })
              .catch(async (error) => {
                await useErrorHandler(
                  "(Android): BusinessDetailsView > saveProfile(): " + error
                );
                setLoading(false);
                setButtonClicked(false);
              });
          }
        })
        .catch(async (error) => {
          await useErrorHandler(
            "(Android): BusinessDetailsView > saveProfile(): " + error
          );
          setLoading(false);
          setButtonClicked(false);
        });
    }
  };

  useEffect(() => {
    checkNotificationPermission();
    LoadData();
  }, [isFocused]);

  const handleGalleryImagePress = (index) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  const convertTo12HourFormat = (time24, error) => {
    if (typeof time24 !== "string") {
      useErrorHandler(
        "(Android): BusinessDetailsView > convertTo12HourFormat()" + error
      );
      return null;
    }

    const [hours, minutes] = time24.split(":");

    let hoursNum = parseInt(hours, 10);
    let minutesNum = parseInt(minutes, 10);

    if (isNaN(hoursNum) || isNaN(minutesNum)) {
      useErrorHandler(
        "(Android): BusinessDetailsView > convertTo12HourFormat()" + error
      );
      return null;
    }

    const period = hoursNum >= 12 ? "PM" : "AM";
    hoursNum = hoursNum % 12;
    hoursNum = hoursNum ? hoursNum : 12;
    const time12 = `${hoursNum}:${minutes} ${period}`;

    return time12;
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            width: "97%",
            height: "10%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              width: "15%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../assets/more-button-ved.png")}
              style={styles.setimg1}
            />
          </TouchableOpacity>
          <Text style={styles.welcomeText}>{businessDetails.businessName}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate("NotificationTray", { UUID: null })
            }
            style={{
              width: "15%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../assets/notification-oRK.png")}
              style={styles.setimg2}
            />
          </TouchableOpacity>
        </View>

        <SafeAreaView
          style={{
            paddingTop: "5%",
            height: "90%",
            width: "97%",
            alignItems: "center",
            borderRadius: 50,
          }}
        >
          <ScrollView
            style={{ flex: 1, height: "100%", width: "97%", borderRadius: 50 }}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <>
                <LinearGradient
                  colors={["#b0bec5", "#e1e1e1", "#b0bec5"]}
                  style={[styles.gradient, , { marginTop: 10 }]}
                >
                  <View style={{ width: "100%", height: 200 }}>
                    <ShimmerPlaceholder
                      style={styles.shimmer}
                      shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                    ></ShimmerPlaceholder>
                  </View>
                  <View
                    style={{
                      width: "75%",
                      height: 25,
                      marginTop: 10,
                      marginLeft: 5,
                    }}
                  >
                    <ShimmerPlaceholder
                      style={styles.shimmer}
                      shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                    ></ShimmerPlaceholder>
                  </View>
                  <View
                    style={{
                      width: "35%",
                      height: 15,
                      marginTop: 5,
                      marginLeft: 5,
                    }}
                  >
                    <ShimmerPlaceholder
                      style={styles.shimmer}
                      shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                    ></ShimmerPlaceholder>
                  </View>
                  <View
                    style={{
                      width: "35%",
                      height: 60,
                      marginTop: 15,
                      marginLeft: 5,
                    }}
                  >
                    <ShimmerPlaceholder
                      style={styles.shimmer}
                      shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                    ></ShimmerPlaceholder>
                  </View>
                  <View
                    style={{
                      width: "50%",
                      height: 25,
                      marginTop: 15,
                      marginLeft: 5,
                    }}
                  >
                    <ShimmerPlaceholder
                      style={styles.shimmer}
                      shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                    ></ShimmerPlaceholder>
                  </View>
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      marginLeft: 25,
                    }}
                  >
                    <View style={{ width: 80, height: 80, marginTop: 15 }}>
                      <ShimmerPlaceholder
                        style={styles.shimmer}
                        shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                      ></ShimmerPlaceholder>
                    </View>
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        marginTop: 15,
                        marginLeft: 10,
                      }}
                    >
                      <ShimmerPlaceholder
                        style={styles.shimmer}
                        shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                      ></ShimmerPlaceholder>
                    </View>
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        marginTop: 15,
                        marginLeft: 10,
                      }}
                    >
                      <ShimmerPlaceholder
                        style={styles.shimmer}
                        shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                      ></ShimmerPlaceholder>
                    </View>
                  </View>
                  <View
                    style={{
                      width: "50%",
                      height: 25,
                      marginTop: 15,
                      marginLeft: 5,
                    }}
                  >
                    <ShimmerPlaceholder
                      style={styles.shimmer}
                      shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                    ></ShimmerPlaceholder>
                  </View>
                  <View
                    style={{
                      width: "85%",
                      height: 150,
                      marginTop: 15,
                      marginLeft: 25,
                    }}
                  >
                    <ShimmerPlaceholder
                      style={styles.shimmer}
                      shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                    ></ShimmerPlaceholder>
                  </View>
                  <View
                    style={{
                      width: "50%",
                      height: 25,
                      marginTop: 15,
                      marginLeft: 5,
                    }}
                  >
                    <ShimmerPlaceholder
                      style={styles.shimmer}
                      shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                    ></ShimmerPlaceholder>
                  </View>
                  <View
                    style={{
                      width: "50%",
                      height: 20,
                      marginTop: 15,
                      marginLeft: 25,
                      marginBottom: 10,
                    }}
                  >
                    <ShimmerPlaceholder
                      style={styles.shimmer}
                      shimmerColors={["#f3f3f3", "#e1e1e1", "#f3f3f3"]}
                    ></ShimmerPlaceholder>
                  </View>
                </LinearGradient>
              </>
            ) : (
              <View style={styles.detailView}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.imageBusiness}
                  resizeMode="stretch"
                />
                <Text
                  style={{
                    fontWeight: "800",
                    paddingHorizontal: "3%",
                    fontSize: 18,
                    top: 5,
                  }}
                >
                  {businessDetails.businessName}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color: "#717679",
                      paddingHorizontal: "3%",
                      fontWeight: "700",
                      fontSize: 14,
                      top: 12,
                    }}
                  >
                    {businessDetails.industry}
                  </Text>
                  <Text
                    style={{
                      color: "#73a5bc",
                      paddingHorizontal: "3%",
                      fontWeight: "700",
                      fontSize: 14,
                      top: 12,
                      alignSelf: "flex-end",
                    }}
                  >
                    {" "}
                    {businessDetails.distance} mi{" "}
                  </Text>
                </View>
                {businessDetails.memberString == "Member" && (
                  <Text
                    style={{
                      fontWeight: "800",
                      paddingHorizontal: "3%",
                      fontSize: 14,
                      top: 15,
                      color: "#7d5513",
                    }}
                  >
                    {businessDetails.memberString}
                  </Text>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{ uri: logoUrl }}
                    style={styles.logoBusiness}
                    resizeMode="stretch"
                  />
                </View>
                {(businessDetails.promotionData ||
                  businessDetails.autopilotData) &&
                  (businessDetails.promotionData.length > 0 ||
                    businessDetails.autopilotData.length > 0) && (
                    <View style={{ paddingHorizontal: "3%" }}>
                      <Text style={styles.Promotion}>Promotions</Text>
                      {businessDetails.promotionData &&
                        businessDetails.promotionData.map((promo, index) => (
                          <Fragment key={index}>
                            <View
                              style={{
                                flexDirection: "row",
                                width: "100%",
                                marginTop: 7,
                              }}
                            >
                              <View style={{ width: "65%" }}>
                                {promo.promotionalMessage.toString().length <
                                  25 && (
                                  <Text
                                    style={{
                                      fontWeight: "500",
                                      fontSize: 14,
                                      marginTop: "2%",
                                      paddingHorizontal: "2%",
                                    }}
                                  >
                                    {promo.promotionalMessage}
                                  </Text>
                                )}
                                {promo.promotionalMessage.toString().length >=
                                  25 && (
                                  <Text
                                    onLongPress={() => promo.promotionalMessage}
                                    style={{
                                      fontWeight: "500",
                                      fontSize: 14,
                                      marginTop: "2%",
                                      paddingHorizontal: "2%",
                                    }}
                                  >
                                    {promo.promotionalMessage
                                      .toString()
                                      .substring(0, 25)}
                                    ...
                                  </Text>
                                )}
                              </View>
                              <View
                                style={{
                                  width: "35%",
                                  alignItems: "flex-end",
                                  justifyContent: "center",
                                }}
                              >
                                {promo.expiryDays > 1 && (
                                  <Text
                                    style={{
                                      fontWeight: "500",
                                      fontSize: 12,
                                      marginTop: "2%",
                                      paddingHorizontal: "2%",
                                      borderWidth: 1,
                                      borderColor: "#767676",
                                      paddingHorizontal: 5,
                                      paddingVertical: 3,
                                      color: "#767676",
                                      borderRadius: 5,
                                    }}
                                  >
                                    {promo.expiryDays} days left
                                  </Text>
                                )}
                                {promo.expiryDays == 1 && (
                                  <Text
                                    style={{
                                      fontWeight: "500",
                                      fontSize: 12,
                                      marginTop: "2%",
                                      paddingHorizontal: "2%",
                                      borderWidth: 1,
                                      borderColor: "#767676",
                                      paddingHorizontal: 5,
                                      paddingVertical: 3,
                                      color: "#767676",
                                      borderRadius: 5,
                                    }}
                                  >
                                    Expiring Today
                                  </Text>
                                )}
                              </View>
                            </View>
                          </Fragment>
                        ))}
                    </View>
                  )}

                {businessDetails.autopilotData &&
                  businessDetails.autopilotData.map((auto, index) => (
                    <View style={{ paddingHorizontal: "3%" }} key={index}>
                      <Fragment>
                        <View
                          style={{
                            flexDirection: "row",
                            width: "100%",
                            marginTop: 7,
                          }}
                        >
                          <View style={{ width: "65%" }}>
                            <Text
                              style={{
                                fontWeight: "500",
                                fontSize: 14,
                                marginTop: "2%",
                                paddingHorizontal: "2%",
                              }}
                            >
                              {auto.rewardName}
                            </Text>
                          </View>

                          {auto.campaignName != "Acquirement" && (
                            <View
                              style={{
                                width: "35%",
                                alignItems: "flex-end",
                                justifyContent: "center",
                              }}
                            >
                              {auto.expiryDays > 1 && (
                                <Text
                                  style={{
                                    fontWeight: "500",
                                    fontSize: 12,
                                    marginTop: "2%",
                                    paddingHorizontal: "2%",
                                    borderWidth: 1,
                                    borderColor: "#767676",
                                    paddingHorizontal: 5,
                                    paddingVertical: 3,
                                    color: "#767676",
                                    borderRadius: 5,
                                  }}
                                >
                                  {auto.expiryDays} days left
                                </Text>
                              )}
                              {auto.expiryDays == 1 && (
                                <Text
                                  style={{
                                    fontWeight: "500",
                                    fontSize: 12,
                                    marginTop: "2%",
                                    paddingHorizontal: "2%",
                                    borderWidth: 1,
                                    borderColor: "#767676",
                                    paddingHorizontal: 5,
                                    paddingVertical: 3,
                                    color: "#767676",
                                    borderRadius: 5,
                                  }}
                                >
                                  Expiring Today
                                </Text>
                              )}
                            </View>
                          )}
                          {auto.campaignName == "Acquirement" &&
                            businessDetails.memberString != "Member" && (
                              <View
                                style={{
                                  width: "35%",
                                  alignItems: "flex-end",
                                  justifyContent: "center",
                                }}
                              >
                                <TouchableOpacity
                                  activeOpacity={0.7}
                                  disabled={buttonClicked}
                                  onPress={saveProfile}
                                  style={styles.frame2vJu}
                                >
                                  <Text style={styles.getStartednru}>Save</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          {auto.campaignName == "Acquirement" &&
                            businessDetails.memberString == "Member" && (
                              <View
                                style={{
                                  width: "35%",
                                  alignItems: "flex-end",
                                  justifyContent: "center",
                                }}
                              >
                                <TouchableOpacity
                                  activeOpacity={0.7}
                                  style={styles.frame2vJu1}
                                >
                                  <Text style={styles.getStartednru}>
                                    Saved
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                        </View>
                      </Fragment>
                    </View>
                  ))}

                {businessDetails.rewardData &&
                  businessDetails.rewardData.length > 0 && (
                    <View style={{ paddingHorizontal: "3%" }}>
                      <Text style={styles.loyaltyRewards}>Loyalty Rewards</Text>
                      <Text style={styles.subheading}>
                        Earn{" "}
                        {businessDetails.rewardData[0].claimPointBusinessGroup}{" "}
                        pt for every{" "}
                        {businessDetails.rewardData[0].reclaimHours} hours
                      </Text>
                      {businessDetails.rewardData &&
                        businessDetails.rewardData.map((rewards, index) => (
                          <Fragment key={index}>
                            <Text
                              style={{
                                fontWeight: "600",
                                fontSize: 16,
                                marginTop: "5%",
                                paddingHorizontal: "2%",
                              }}
                            >
                              {rewards.rewardName}
                            </Text>
                            {rewards.currentPoints != null && (
                              <Progress.Bar
                                style={styles.progressBar}
                                progress={
                                  1 -
                                  rewards.pendingToAchiveValue /
                                    rewards.achivableTargetValue
                                }
                                width={250}
                                color="#2ac95d"
                              />
                            )}
                            {rewards.currentPoints != null && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  paddingHorizontal: "2%",
                                  marginTop: "1%",
                                }}
                              >
                                <Text style={{ color: "#717679" }}>
                                  {" "}
                                  {rewards.currentPoints} /{" "}
                                  {rewards.achivableTargetValue} pts
                                </Text>
                                {rewards.pendingToAchiveValue > 0 && (
                                  <Text style={{ color: "#717679" }}>
                                    {rewards.pendingToAchiveValue} pts left
                                  </Text>
                                )}
                                {rewards.pendingToAchiveValue <= 0 && (
                                  <Text style={{ color: "#717679" }}>
                                    Redeem
                                  </Text>
                                )}
                              </View>
                            )}
                          </Fragment>
                        ))}
                    </View>
                  )}
                {(galleryImagePath1 != null ||
                  galleryImagePath2 != null ||
                  galleryImagePath3 != null ||
                  galleryImagePath4 != null) && (
                  <View style={{ paddingHorizontal: 12, marginTop: 5 }}>
                    <Text
                      style={{
                        marginTop: "7%",
                        fontWeight: "700",
                        fontSize: 18,
                      }}
                    >
                      Photos
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          width: 350,
                          height: 100,
                          marginTop: 15,
                        }}
                      >
                        {images.map((image, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleGalleryImagePress(index)}
                          >
                            <Image
                              style={{
                                width: 80,
                                height: 80,
                                borderRadius: 10,
                                marginTop: "2%",
                                marginLeft: "2%",
                              }}
                              source={{ uri: image.url }}
                              resizeMode="stretch"
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
                {businessDetails.businesswiseWorkingDays && (
                  <View style={{ paddingHorizontal: "3%" }}>
                    <Text
                      style={{
                        marginTop: "7%",
                        fontWeight: "700",
                        fontSize: 18,
                      }}
                    >
                      Hours -
                      <Text
                        style={[
                          styles.workingStatusText,
                          { color: businessDetails.workingStatusTextColor },
                        ]}
                      >
                        {" "}
                        {businessDetails.workingStatus}
                      </Text>
                    </Text>
                    {businessDetails.businesswiseWorkingDays &&
                      businessDetails.businesswiseWorkingDays.map(
                        (day, index) => (
                          <Text
                            key={index}
                            style={{
                              marginTop: "1%",
                              fontWeight: "700",
                              color: "#717679",
                              paddingHorizontal: "2%",
                              fontSize: 12,
                            }}
                          >
                            {`${day.dayName}: ${convertTo12HourFormat(
                              day.fromTime
                            )} - ${convertTo12HourFormat(day.toTime)}`}
                          </Text>
                        )
                      )}
                  </View>
                )}
                {businessDetails.adress && (
                  <View style={{ paddingHorizontal: "3%" }}>
                    <Text style={styles.adressHeading}>Address:</Text>
                    <Text
                      style={{
                        color: "#8c9194",
                        fontSize: 14,
                        marginTop: "2%",
                        paddingHorizontal: "2%",
                      }}
                    >
                      {businessDetails.adress}
                    </Text>
                  </View>
                )}
                {businessDetails.adress && (
                  <View style={{ paddingHorizontal: "3%", marginTop: "3%" }}>
                    <View style={styles.mapViewMain}>
                      <MapView
                        style={styles.mapView}
                        provider={PROVIDER_GOOGLE}
                        region={initialRegion}
                        showsMyLocationButton={true}
                        scrollEnabled={false}
                        zoomEnabled={false}
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
                                color: "#c8d6e3",
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
                            tracksViewChanges={false}
                            coordinate={initialRegion}
                            title={businessDetails.businessName}
                          >
                            <Image
                              source={{
                                uri: businessDetails.mapIconPath,
                              }}
                              style={{ width: 48, height: 48 }}
                              resizeMode="stretch"
                            />
                          </Marker>
                        )}
                      </MapView>
                    </View>
                  </View>
                )}
                {businessDetails.phoneNo && (
                  <View style={{ paddingHorizontal: "3%" }}>
                    <Text style={styles.adressHeading}>Phone:</Text>
                    {businessDetails.phoneNo && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                          Platform.OS === "ios"
                            ? Linking.openURL(
                                `telprompt:${businessDetails.phoneNo}`
                              )
                            : Linking.openURL(`tel:${businessDetails.phoneNo}`)
                        }
                      >
                        <Text
                          style={{
                            color: "#1a7da5",
                            fontSize: 14,
                            marginTop: "2%",
                            paddingHorizontal: "2%",
                          }}
                        >
                          {businessDetails.phoneNo.replace(
                            /(\d{3})(\d{3})(\d{4})/,
                            (_, a, b, c) => `(${a}) ${b}-${c}`
                          )}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                {businessDetails.descriptions && (
                  <View style={{ paddingHorizontal: "3%" }}>
                    <Text style={styles.adressHeading}>Description:</Text>
                    <Text
                      style={{
                        color: "#8c9194",
                        fontSize: 14,
                        marginTop: "2%",
                        marginBottom: "3%",
                        paddingHorizontal: "2%",
                      }}
                    >
                      {businessDetails.descriptions}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
      <Modal visible={modalVisible} transparent={true}>
        <ImageViewer
          imageUrls={images}
          index={selectedImageIndex}
          enableImageZoom={true}
          enableSwipeDown={true}
          scrollEnabled={true}
          onCancel={() => setModalVisible(false)}
          onClick={() => setModalVisible(false)}
        />
      </Modal>
      {/* <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <Spinner
                        visible={loading}
                        textContent={''}
                        textStyle={styles.spinnerTextStyle}
                    />
                </View>
            </SafeAreaView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  workingStatusText: {
    fontWeight: "500",
    fontSize: 18,
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  shimmer: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  frame2vJu: {
    backgroundColor: "#3381a3",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 8,
    marginTop: 7,
    width: "98%",
    height: 40,
  },
  frame2vJu1: {
    backgroundColor: "#a3b4be",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 8,
    marginTop: 7,
    width: "98%",
    height: 40,
  },
  getStartednru: {
    textTransform: "uppercase",
    fontFamily: "SatoshiVariable, SourceSansPro",
    flexShrink: 0,
    fontWeight: "bold",
    fontSize: 18,
    color: "#ffffff",
    flex: 10,
    zIndex: 10,
    textAlign: "center",
  },
  progressBar: {
    marginTop: "1%",
    left: 10,
  },
  workingDays: {
    paddingHorizontal: "2%",
  },
  mapViewMain: {
    width: "100%",
    height: 250,
  },
  mapView: {
    width: "100%",
    height: "97%",
  },
  adressHeading: {
    marginTop: "7%",
    fontWeight: "700",
    fontSize: 18,
  },
  subheading: {
    fontWeight: "500",
    fontSize: 12,
    marginTop: "2%",
    marginLeft: "0.5%",
    color: "#717679",
    paddingHorizontal: "2%",
  },
  loyaltyRewards: {
    marginTop: "7%",
    fontWeight: "700",
    fontSize: 18,
  },
  Promotion: {
    marginTop: "12%",
    fontWeight: "700",
    fontSize: 18,
  },
  detailView: {
    backgroundColor: "white",
    height: "100%",
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  logoBusiness: {
    width: 100,
    height: 50,
    top: 20,
    marginHorizontal: "4%",
    borderRadius: 7,
  },
  imageBusiness: {
    width: "100%",
    height: 175,
    position: "relative",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  welcomeText: {
    color: "black",
    fontSize: 18,
    fontWeight: "800",
    marginTop: "13%",
    textAlign: "center",
    width: "70%",
    height: "100%",
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
    marginTop: 15,
    alignSelf: "center",
  },
  setimg2: {
    width: 50,
    height: 50,
    marginTop: 15,
    alignSelf: "center",
  },
});
