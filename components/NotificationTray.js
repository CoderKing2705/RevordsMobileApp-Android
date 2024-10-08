import { ToastAndroid, TouchableOpacity } from "react-native";
import { View, Text, StyleSheet, Image, Modal } from "react-native";
import { Card, Title } from "react-native-paper";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from "react-native-loading-spinner-overlay";
import Globals from "./Globals";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment/moment";
import { useErrorHandler } from "./ErrorHandler";

const NotificationTray = ({ route }) => {
  let { UUID } = route.params;
  const focus = useIsFocused();
  const [userData, setUserData] = useState("");
  const baseUrl =
    Globals.API_URL + "/MembersWishLists/GetMobileNotificationTray";
  const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
  const [notificationData, setNotificationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const setIsPromoModalVisibleData = async (promotion) => {
    setIsPromoModalVisible(true);
    setNotificationData(promotion);
  };

  const openPromoModal = async (promotion) => {
    setLoading(true);
    await setIsPromoModalVisibleData(promotion);
    setLoading(false);
  };

  const closePromoModal = () => {
    setLoading(true);
    setIsPromoModalVisible(false);
    setLoading(false);
  };

  const claimData = async (type, ID) => {
    try {
      await axios({
        method: "GET",
        url: `${Globals.API_URL}/Promotions/GetRewardsByActivityTypeAndIDInMobile/${type}/${ID}`,
      })
        .then(async (response) => {
          ToastAndroid.showWithGravityAndOffset(
            "Claimed Successfully!",
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
          );
          setIsPromoModalVisible(false);
        })
        .catch(async (error) => {
          await useErrorHandler(
            "(Android): NotificationTray > claimData() " + error
          );
          setLoading(false);
        });
    } catch (error) {
      await useErrorHandler(
        "(Android): NotificationTray > claimData() " + error
      );
    }
  };

  const closePromoRedeemModal = async (type, ID) => {
    setLoading(true);
    await claimData(type, ID);
    if (UUID) {
      UUID = null;
    }
    await getData();
    setLoading(false);
  };

  const ToastForClaimed = () => {
    ToastAndroid.showWithGravityAndOffset(
      `You've already Claimed!`,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50
    );
  };
  const ToastForExpired = () => {
    ToastAndroid.showWithGravityAndOffset(
      `Promotion is Expired!`,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50
    );
  };
  const ToastForRedeemed = () => {
    ToastAndroid.showWithGravityAndOffset(
      `You have Redeemed!`,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50
    );
  };

  const getData = async () => {
    try {
      AsyncStorage.getItem("token").then(async (value) => {
        setLoading(true);
        if (value !== null) {
          const res = await axios.get(
            `${baseUrl}/${JSON.parse(value)[0].memberId}`
          );
          setUserData(res.data);
          if (UUID) {
            if (res.data.filter((x) => x.uuid == UUID)) {
              let popupdata = res.data.filter((x) => x.uuid == UUID)[0];
              if (popupdata) {
                openPromoModal(popupdata);
              }
            }
          }
          setLoading(false);
        }
      });
    } catch (error) {
      await useErrorHandler("(Android): NotificationTray > getData() " + error);
    }
  };

  const GoBack = () => {
    AsyncStorage.getItem("token").then(async (value) => {
      if (value !== null) {
        navigation.navigate("TabNavigation", {
          MemberData: JSON.parse(value),
        });
      }
    });
  };

  useEffect(() => {
    const controller = new AbortController();
    if (focus) {
      getData();
    }
    return () => {
      closePromoModal();
      controller.abort();
    };
  }, [focus, UUID]);
  return (
    <>
      <View style={styles.container}>
        <View
          style={[
            {
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            },
            isPromoModalVisible
              ? { backgroundColor: "rgba(0,0,0,0.5)", opacity: 0.4 }
              : "",
          ]}
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
            <TouchableOpacity activeOpacity={0.7} onPress={GoBack}>
              <Image
                source={require("../assets/more-button-ved.png")}
                style={styles.setimg1}
              />
            </TouchableOpacity>
            <Text style={styles.welcomeText}>Notifications</Text>
          </View>

          <View
            style={[
              { width: "97%", height: "90%", marginTop: "5%" },
              isPromoModalVisible ? { opacity: 0.4 } : "",
            ]}
          >
            {userData == "" && !loading && (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  style={{
                    width: "70%",
                    height: "40%",
                    borderRadius: 15,
                    opacity: 0.8,
                    marginBottom: "40%",
                  }}
                  source={require("../assets/NodataImg.png")}
                />
              </View>
            )}
            <View
              style={[
                styles.store,
                isPromoModalVisible ? { opacity: 0.4 } : "",
              ]}
            >
              <FlatList
                showsVerticalScrollIndicator={false}
                data={userData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity
                      style={{ paddingVertical: 10 }}
                      activeOpacity={0.9}
                      onPress={() => openPromoModal(item)}
                    >
                      <Card
                        style={[
                          styles.card,
                          isPromoModalVisible ? { opacity: 0.4 } : "",
                        ]}
                      >
                        <Card.Content
                          style={[
                            styles.cardContent,
                            isPromoModalVisible ? { opacity: 0.4 } : "",
                          ]}
                        >
                          <View
                            style={{
                              width: "20%",
                              alignItems: "center",
                              alignSelf: "center",
                            }}
                          >
                            <Image
                              source={{
                                uri: `${item.businessGroupImage}`,
                              }}
                              style={[styles.giftIcon]}
                              resizeMode="stretch"
                            />
                          </View>
                          <View style={{ width: "80%", height: "100%" }}>
                            <Title
                              style={{
                                fontSize: 16,
                                fontWeight: "800",
                                color: "#3380a3",
                              }}
                            >
                              {item.message}
                            </Title>
                            <View style={{ flexDirection: "row" }}>
                              {item.sentAgo > 1 && (
                                <Text
                                  style={{
                                    color: "#717679",
                                    fontSize: 12,
                                    fontWeight: "400",
                                  }}
                                >
                                  {item.sentAgo} Days ago
                                </Text>
                              )}
                              {item.sentAgo == 1 && (
                                <Text
                                  style={{
                                    color: "#717679",
                                    fontSize: 12,
                                    fontWeight: "400",
                                  }}
                                >
                                  {item.sentAgo} Day ago
                                </Text>
                              )}
                              {item.sentAgo == 0 && (
                                <Text
                                  style={{
                                    color: "#717679",
                                    fontSize: 12,
                                    fontWeight: "400",
                                  }}
                                >
                                  Today
                                </Text>
                              )}
                              {item.expiryDays > 1 && (
                                <Text
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    fontSize: 12,
                                    fontWeight: "500",
                                    color: "#921c1c",
                                  }}
                                >
                                  Expires in {item.expiryDays} Days
                                </Text>
                              )}
                              {item.expiryDays == 1 && (
                                <Text
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    fontSize: 12,
                                    fontWeight: "500",
                                    color: "#921c1c",
                                  }}
                                >
                                  Expiring Today
                                </Text>
                              )}
                              {item.expiryDays <= 0 && (
                                <Text
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    color: "#b0afaf",
                                    fontSize: 12,
                                    fontWeight: "400",
                                  }}
                                >
                                  Expired
                                </Text>
                              )}
                            </View>
                          </View>
                        </Card.Content>
                      </Card>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </View>

        <Modal
          animationType={"slide"}
          transparent={true}
          visible={isPromoModalVisible}
          onRequestClose={() => {
            console.log("Modal has been closed.");
          }}
        >
          <View
            style={{
              height: "100%",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={styles.modal}>
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  height: 50,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={{
                    uri: `${notificationData.businessGroupImage}`,
                  }}
                  style={styles.logoBusinessInModal}
                  resizeMode="stretch"
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={closePromoModal}
                  style={styles.cancelImgContainer}
                >
                  <Image
                    source={require("../assets/cancelImg.png")}
                    style={styles.cancelImg}
                  />
                </TouchableOpacity>
              </View>

              {/* for business group name */}
              <Text style={styles.modalbusinessName}>
                {notificationData.sentFrom}
              </Text>

              {/* for message */}
              {notificationData.type != 3 && (
                <Text style={styles.modalPromoMsg}>
                  DEAL : {notificationData.message}
                </Text>
              )}
              {notificationData.type == 3 && (
                <Text style={styles.modalPromoMsg}>
                  {notificationData.message}
                </Text>
              )}

              {/* for offer start and end date */}
              {notificationData.type != 3 && (
                <Text style={styles.modaltext}>
                  <Text style={{ fontWeight: "700" }}>Offer Start Date </Text>-{" "}
                  {moment(notificationData.offerStartDate).format("MM/DD/YYYY")}
                </Text>
              )}
              {notificationData.type != 3 && (
                <Text style={styles.modaltext}>
                  <Text style={{ fontWeight: "700" }}>Offer End Date </Text>-{" "}
                  {moment(notificationData.offerEndDate).format("MM/DD/YYYY")}
                </Text>
              )}

              {/* for expiry days */}
              {notificationData.expiryDays > 1 &&
                notificationData.type != 3 && (
                  <Text style={styles.modaltext}>
                    <Text style={{ fontWeight: "700" }}>Expires in - </Text>
                    {notificationData.expiryDays} days
                  </Text>
                )}
              {notificationData.expiryDays == 1 &&
                notificationData.type != 3 && (
                  <Text style={styles.modaltext}>
                    <Text style={{ fontWeight: "700" }}>Expiring Today</Text>
                  </Text>
                )}
              {notificationData.expiryDays <= 0 &&
                notificationData.type != 3 && (
                  <Text style={styles.modaltext}>
                    <Text style={{ fontWeight: "600", color: "#b0afaf" }}>
                      Expired
                    </Text>
                  </Text>
                )}
              {notificationData.offerEndDate && notificationData.type == 3 && (
                <Text style={[styles.modaltext, { textAlign: "center" }]}>
                  <Text style={{ fontWeight: "700" }}>Expire Date:</Text>
                  {moment(notificationData.offerEndDate).format("MM/DD/YYYY")}
                </Text>
              )}

              {/* for image */}
              {notificationData.filePath != "" &&
                notificationData.filePath != null && (
                  <Image
                    style={styles.avatarImg}
                    source={{
                      uri: notificationData.filePath,
                    }}
                    resizeMode="stretch"
                  ></Image>
                )}

              {/* for redeem location */}
              {notificationData.type != 3 && (
                <Text style={styles.modaltext}>
                  Redeemable at -
                  <Text style={{ fontWeight: "700" }}>
                    {" "}
                    {notificationData.redeemableAt}
                  </Text>
                </Text>
              )}

              {notificationData.isSpinWheel && (
                <Text style={styles.modaltext}>
                  Spin the wheel and get rewards at store
                </Text>
              )}

              {/* for claim button */}
              {notificationData.isClaimed == false &&
                notificationData.expiryDays >= 1 &&
                notificationData.isRedeemed == false &&
                notificationData.type != 3 &&
                notificationData.type == 1 && (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() =>
                      closePromoRedeemModal("promo", notificationData.id)
                    }
                    style={styles.frame2vJu1ModalClaim}
                  >
                    <Text style={styles.getStartednru1}>Claim</Text>
                  </TouchableOpacity>
                )}
              {notificationData.isClaimed == false &&
                notificationData.expiryDays >= 1 &&
                notificationData.isRedeemed == false &&
                notificationData.type != 3 &&
                notificationData.type == 2 && (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() =>
                      closePromoRedeemModal("ap", notificationData.id)
                    }
                    style={styles.frame2vJu1ModalClaim}
                  >
                    <Text style={styles.getStartednru1}>Claim</Text>
                  </TouchableOpacity>
                )}

              {notificationData.isClaimed == true &&
                notificationData.isRedeemed == false &&
                notificationData.type != 3 && (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.frame2vJu1ModalBack}
                    onPress={ToastForClaimed}
                  >
                    <Text style={styles.getStartednru1}>Claimed</Text>
                  </TouchableOpacity>
                )}
              {notificationData.isClaimed == false &&
                notificationData.expiryDays <= 0 &&
                notificationData.isRedeemed == false &&
                notificationData.type != 3 && (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.frame2vJu1ModalBack}
                    onPress={ToastForExpired}
                  >
                    <Text style={styles.getStartednru1}>Expired</Text>
                  </TouchableOpacity>
                )}
              {notificationData.isRedeemed == true &&
                notificationData.type != 3 && (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.frame2vJu1ModalBack}
                    onPress={ToastForRedeemed}
                  >
                    <Text style={styles.getStartednru1}>Redeemed</Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        </Modal>

        <SafeAreaView>
          <View style={styles.container}>
            <Spinner
              visible={loading}
              textContent={""}
              textStyle={styles.spinnerStyle}
            />
          </View>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  frame2vJu1ModalBack: {
    backgroundColor: "#969696",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "60%",
    height: 35,
    marginVertical: 15,
    alignSelf: "center",
  },
  getStartednru1: {
    lineHeight: 22.5,
    fontFamily: "SatoshiVariable, SourceSansPro",
    flexShrink: 0,
    fontWeight: "bold",
    fontSize: 14,
    color: "#ffffff",
    flex: 10,
    zIndex: 10,
    textAlign: "center",
    textAlignVertical: "center",
  },
  frame2vJu1ModalClaim: {
    backgroundColor: "#7d5513",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "60%",
    height: 35,
    marginVertical: 15,
    alignSelf: "center",
  },
  avatarImg: {
    height: 150,
    width: 150,
    marginVertical: 7,
    alignSelf: "center",
    borderRadius: 15,
  },
  modalbusinessName: {
    fontWeight: "800",
    fontSize: 18,
    color: "#325b6f",
    textAlign: "center",
    marginTop: 15,
    borderBottomColor: "black",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "black",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 5,
  },
  modalPromoMsg: {
    fontWeight: "600",
    fontSize: 15,
    color: "#ad466b",
    paddingHorizontal: 10,
    marginTop: 20,
    textAlign: "center",
    marginBottom: 10,
  },
  cancelImg: {
    width: 25,
    height: 25,
    marginTop: 5,
    marginEnd: 5,
  },
  cancelImgContainer: {
    alignSelf: "flex-end",
    position: "absolute",
    right: 0,
    height: 50,
    justifyContent: "flex-start",
  },
  logoBusinessInModal: {
    height: 50,
    width: 125,
    marginTop: 10,
    marginLeft: 10,
    alignSelf: "center",
    borderRadius: 7,
  },
  modal: {
    alignSelf: "center",
    backgroundColor: "#fff",
    width: "85%",
    position: "relative",
    borderRadius: 15,
    padding: 5,
  },
  modaltext: {
    color: "#3f2949",
    marginTop: 5,
    paddingHorizontal: 10,
  },
  giftIcon: {
    width: "100%",
    height: 50,
    left: -5,
    // top: '17%',
  },
  cardContent: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
    height: "auto",
  },
  cardCover: {
    height: "70%",
    width: "100%",
  },
  card: {
    width: "98%",
    flexDirection: "row",
    alignSelf: "center",
    borderRadius: 10,
  },
  store: {
    width: "95%",
    height: "95%",
    flexShrink: 0,
    marginTop: "2%",
    alignSelf: "center",
    marginBottom: "20%",
    borderRadius: 15,
  },
  mapImage: {
    width: 26,
    height: 24,
    objectFit: "contain",
  },
  mainMapImage: {
    padding: 15,
    paddingHorizontal: 23,
    paddingBottom: 15,
    paddingLeft: 24,
    height: "100%",
    backgroundColor: "#3380a3",
    borderRadius: 8,
    flexShrink: 0,
    marginRight: "2%",
  },
  magnifyingGlass: {
    height: 26.028,
    resizeMode: "contain",
    backgroundColor: "transparent",
    marginLeft: "45%",
    position: "absolute",
  },
  searchInput: {
    width: "50%",
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
    right: -20,
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
    marginTop: "5%",
    textAlign: "center",
    width: "80%",
  },
});

export default NotificationTray;
