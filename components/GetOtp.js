import {
  StyleSheet,
  Image,
  Text,
  View,
  ToastAndroid,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { useEffect, useRef, useState } from "react";
import Globals from "./Globals";
import LinearGradient from "react-native-linear-gradient";
import { useErrorHandler } from "./ErrorHandler";
import { check } from "react-native-permissions";

const GetOtp = ({ route, navigation }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const currentVersion = "1.0.10";
  const [isVerified, setIsVerified] = useState(true);
  let { OTP, CustomerExists, Phone } = route.params;
  const [seconds, setSeconds] = useState(60);
  const [isResentDisabled, setResentDisabled] = useState(false);
  const [isNotificationAllowed, setIsNotificationAllowed] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  
  const handleInputChange = async (text, index) => {
    try {
      let newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      setIsVerified(true);

      if (index < 3 && text !== "") {
        refs[index + 1].current.focus();
      }
    } catch (error) {
      await useErrorHandler("(Android): GetOtp > handleInputChange() " + error);
    }
  };

  const handleBackspace = (index) => {
    if (index > 0) {
      refs[index - 1].current.focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === "Backspace" && otp[index] === "") {
      handleBackspace(index);
    }
  };

  const generateRandomNumber = () => {
    const min = 1000;
    const max = 9999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    randomnumber = randomNumber.toString();
    return randomNumber;
  };

  const resendOtp = async () => {
    try {
      const randomOtp = await generateRandomNumber();
      try {
        fetch(
          `${Globals.API_URL}/Mail/SendOTP/${parseFloat(Phone)}/${randomOtp}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        ).then((res) => {
          OTP = randomOtp;
          setResentDisabled(true);
        });
      } catch (error) {
        ToastAndroid.showWithGravityAndOffset(
          "There is some issue! TRY Again after few minutes!",
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50
        );
        await useErrorHandler("(Android) : GetOtp > resendOtp() " + error);
      }
    } catch (error) {
      await useErrorHandler("(Android) : GetOtp > resendOtp() " + error);
    }
  };

  let token = "";
  let platformOS;
  const getDeviceToken = async () => {
    token = await messaging().getToken();
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

  const verifyOtp = async () => {
    try {
      if (otp.join("").length !== 0) {
        if (otp.join("") == OTP) {
          setIsVerified(true);
          setSeconds(0);
          navigation.navigate("AppTour", {
            MemberData: CustomerExists,
            Phone: Phone,
            isNotificationAllowed: isNotificationAllowed,
          });
          console.log("md", MemberData)
        } else {
          setIsVerified(false);
        }
      }
    } catch (error) {
      await useErrorHandler("(Android): GetOtp > verifyOtp() " + error);
    }
  };

  const handleAutoFill = async (event, index) => {
    try {
      if (event.nativeEvent.textContentType === "oneTimeCode") {
        const autoFilledValue = event.nativeEvent.text;
        handleInputChange(autoFilledValue, index);
      }
    } catch (error) {
      await useErrorHandler("(Android): GetOtp > handleAutoFill() " + error);
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
        "(Android): GetOtp > checkNotificationPermission() " + error
      );
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);

    if (seconds === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [seconds]);

  useEffect(() => {
    const controller = new AbortController();
    checkNotificationPermission();
    if (otp.join("").length === 4) {
      verifyOtp();
    }
    if (CustomerExists !== null) {
      setShowMessage(true);
    }
    return () => {
      controller.abort();
    };
  });
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#d9e7ed", "#bfdfed", "#d9e7ed"]}
        style={[styles.gradient]}
      >
        <Text style={styles.welcomeText}>Enter Otp</Text>
        <View style={styles.deviceView}>
          <Image
            source={require("../assets/envelopesimple-8N5.png")}
            style={styles.emaillogo}
          />
        </View>
        <Text style={styles.verifyCodeText}>Verification Code</Text>
        <Text style={styles.verifyText}>
          OTP has been sent to your mobile number.
        </Text>

        <View style={styles.otpContainer}>
          {[0, 1, 2, 3].map((index) => (
            <TextInput
              key={index}
              ref={refs[index]}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              textContentType="oneTimeCode"
              onChangeText={(text) => handleInputChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              value={otp[index]}
              autoComplete="sms-otp"
              onTextInput={(e) => handleAutoFill(e, index)}
            />
          ))}
        </View>
        <View style={{ height: 25 }}>
          {!isVerified && (
            <Text style={{ paddingTop: 4, color: "red" }}>
              Please Enter Correct OTP
            </Text>
          )}
          {otp.join("").length == 0 && (
            <Text style={{ paddingTop: 4, color: "#203139" }}>
              Please Enter the OTP
            </Text>
          )}
        </View>
        {/* <TouchableOpacity activeOpacity={.7} onPress={verifyOtp} style={styles.frame2vJu}>
                    <Text style={styles.getStartednru}>Verify</Text>
                </TouchableOpacity> */}

        <Text style={styles.verifyCodeText1}>Didn't receive the code?</Text>
        {seconds !== 0 && (
          <Text style={styles.timerText}>{`${Math.floor(seconds / 60)}:${(
            seconds % 60
          ).toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          })}`}</Text>
        )}
        {seconds === 0 && !isResentDisabled && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={resendOtp}
            style={styles.resendView}
          >
            <Text style={styles.verifyCodeText2}>Resend</Text>
          </TouchableOpacity>
        )}
        {seconds === 0 && isResentDisabled && (
          <Text style={styles.resentText}>Resent</Text>
        )}

        {showMessage && (
          <Text style={styles.messageText}>
            You already have an account. Enter OTP to sign in.
          </Text>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  messageText: {
    color: 'rgba(214, 20, 20, 0.5)',
    fontSize: 20,
    textAlign: 'center',
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    // marginLeft: 7,
    // paddingLeft: 10,
    alignItems: "center",
  },
  resentText: {
    color: "#a3abaf",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: "5%",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  timerText: {
    borderBottomWidth: 1,
    borderBottomColor: "#252525",
  },
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "#d9e7ed",
    alignItems: "center",
  },
  welcomeText: {
    color: "#3380a3",
    fontSize: 24,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: "5%",
  },
  deviceView: {
    backgroundColor: "#fff",
    width: 150,
    height: 150,
    alignItems: "center",
    padding: "5%",
    borderRadius: 500,
    marginTop: "10%",
    justifyContent: "center",
  },
  emaillogo: {
    width: "60%",
    height: "50%",
    borderRadius: 5,
  },
  verifyCodeText: {
    color: "#140d05",
    fontSize: 24,
    fontWeight: "700",
    marginTop: "5%",
    marginBottom: "5%",
  },
  verifyText: {
    color: "#203139",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: "5%",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  frame2vJu: {
    backgroundColor: "#140d05",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 15,
    width: 150,
    flexDirection: "row",
    marginTop: "5%",
  },
  getStartednru: {
    textAlign: "center",
    lineHeight: 22.5,
    textTransform: "uppercase",
    fontFamily: "SatoshiVariable, SourceSansPro",
    flexShrink: 0,
    fontWeight: "bold",
    fontSize: 18,
    color: "#ffffff",
    flex: 10,
    zIndex: 10,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    alignSelf: "center",
  },
  otpInput: {
    height: 50,
    width: 50,
    borderWidth: 1,
    borderRadius: 5,
    textAlign: "center",
    fontSize: 20,
    backgroundColor: "white",
    borderColor: "#73a5bc",
  },
  verifyCodeText1: {
    color: "#203139",
    fontSize: 17,
    fontWeight: "400",
    marginBottom: "4%",
    textAlign: "center",
    paddingHorizontal: 30,
    marginTop: "5%",
  },
  resendView: {},
  verifyCodeText2: {
    color: "#203139",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: "5%",
    textAlign: "center",
    paddingHorizontal: 30,
    textDecorationLine: "underline",
  },
});

export default GetOtp;
