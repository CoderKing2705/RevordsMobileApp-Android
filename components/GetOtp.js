import { StyleSheet, Image, Text, View, ToastAndroid } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { useEffect, useRef, useState } from 'react';
import Globals from './Globals';
import LinearGradient from 'react-native-linear-gradient';

const GetOtp = ({ route, navigation }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const refs = [useRef(), useRef(), useRef(), useRef()];

    const [isVerified, setIsVerified] = useState(true);
    let { OTP, CustomerExists, Phone } = route.params;
    const [seconds, setSeconds] = useState(60);
    const [isResentDisabled, setResentDisabled] = useState(false);

    const handleInputChange = (text, index) => {
        let newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (index < 3 && text !== '') {
            refs[index + 1].current.focus();
        }
    };

    const handleBackspace = (index) => {
        if (index > 0) {
            refs[index - 1].current.focus();
        }
    };

    const handleKeyPress = (event, index) => {
        if (event.nativeEvent.key === 'Backspace' && otp[index] === '') {
            handleBackspace(index);
        }
    };

    const generateRandomNumber = () => {
        const min = 1000;
        const max = 9999;
        const randomNumber =
            Math.floor(Math.random() * (max - min + 1)) + min;
        randomnumber = randomNumber.toString();
        return randomNumber;
    };

    const resendOtp = async () => {
        const randomOtp = await generateRandomNumber();
        try {
            fetch(`${Globals.API_URL}/Mail/SendOTP/${parseFloat(Phone)}/${randomOtp}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            }).then((res) => {
                OTP = randomOtp;
                setResentDisabled(true);
            });
        } catch (error) {
            ToastAndroid.showWithGravityAndOffset(
                'There is some issue! TRY Again after few minutes!',
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50,
            );
        }
    }

    const verifyOtp = async () => {
        try {
            if (otp.join('').length !== 0) {
                if (otp.join('') == OTP) {
                    setIsVerified(true);
                    setSeconds(0);
                    navigation.navigate('AppTour', { MemberData: CustomerExists, Phone: Phone });
                } else {
                    setIsVerified(false);
                }
            }
        }
        catch (error) {
            console.error('Error storing token:', error);
        }
    }

    const handleAutoFill = (event, index) => {
        if (event.nativeEvent.textContentType === 'oneTimeCode') {
            // Handle autofill event
            const autoFilledValue = event.nativeEvent.text;
            handleInputChange(autoFilledValue, index);
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

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#d9e7ed', '#bfdfed', '#d9e7ed']}
                style={[styles.gradient]}>
                <Text style={styles.welcomeText}>Enter Otp</Text>
                <View style={styles.deviceView}>
                    <Image source={require('../assets/envelopesimple-8N5.png')} style={styles.emaillogo} />
                </View>
                <Text style={styles.verifyCodeText}>Verification Code</Text>
                <Text style={styles.verifyText}>OTP has been sent to your mobile number.</Text>

                <View style={styles.otpContainer}>
                    {[0, 1, 2, 3].map((index) => (
                        <TextInput
                            key={index}
                            ref={refs[index]}
                            style={styles.otpInput}
                            keyboardType="numeric"
                            maxLength={1}
                            // textContentType='oneTimeCode'
                            onChangeText={(text) => handleInputChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            value={otp[index]}
                            autoComplete="sms-otp"
                            onTextInput={(e) => handleAutoFill(e, index)}
                        />
                    ))}
                </View>
                <View style={{ 'height': 25 }}>
                    {!isVerified && <Text style={{ 'paddingTop': 4, 'color': 'red' }}>Please Enter Correct OTP</Text>}
                    {otp.join('').length == 0 && <Text style={{ 'paddingTop': 4, 'color': '#203139' }}>Please Enter the OTP</Text>}
                </View>
                <TouchableOpacity activeOpacity={.7} onPress={verifyOtp} style={styles.frame2vJu}>
                    <Text style={styles.getStartednru}>Verify</Text>
                </TouchableOpacity>

                <Text style={styles.verifyCodeText1}>Didn't receive the code?</Text>
                {seconds !== 0 && <Text style={styles.timerText}>{`${Math.floor(seconds / 60)}:${(seconds % 60).toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                })}`}</Text>}
                {(seconds === 0 && !isResentDisabled) && <TouchableOpacity activeOpacity={.7} onPress={resendOtp} style={styles.resendView}>
                    <Text style={styles.verifyCodeText2}>Resend</Text>
                </TouchableOpacity>}
                {(seconds === 0 && isResentDisabled) && <Text style={styles.resentText}>Resent</Text>}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    gradient: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        // marginLeft: 7,
        // paddingLeft: 10,
        alignItems: 'center',
    },
    resentText: {
        color: '#a3abaf',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: '5%',
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    timerText: {
        borderBottomWidth: 1,
        borderBottomColor: '#252525'
    },
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center'
    },
    welcomeText: {
        color: '#3380a3',
        fontSize: 24,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: '5%'
    },
    deviceView: {
        backgroundColor: '#fff',
        width: 150,
        height: 150,
        alignItems: 'center',
        padding: '5%',
        borderRadius: 500,
        marginTop: '10%',
        justifyContent: 'center',
    },
    emaillogo: {
        width: '60%',
        height: '50%',
        borderRadius: 5
    },
    verifyCodeText: {
        color: '#140d05',
        fontSize: 24,
        fontWeight: '700',
        marginTop: '5%',
        marginBottom: '5%'
    },
    verifyText: {
        color: '#203139',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: '5%',
        textAlign: 'center',
        paddingHorizontal: 30
    },
    frame2vJu: {
        backgroundColor: '#140d05',
        borderRadius: 8,
        alignItems: 'center',
        paddingVertical: 15,
        width: 150,
        flexDirection: 'row',
        marginTop: '5%',
    },
    getStartednru: {
        textAlign: 'center',
        lineHeight: 22.5,
        textTransform: 'uppercase',
        fontFamily: 'SatoshiVariable, SourceSansPro',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: 18,
        color: '#ffffff',
        flex: 10,
        zIndex: 10,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        alignSelf: 'center',
    },
    otpInput: {
        height: 50,
        width: 50,
        borderWidth: 1,
        borderRadius: 5,
        textAlign: 'center',
        fontSize: 20,
        backgroundColor: 'white',
        borderColor: '#73a5bc'
    },
    verifyCodeText1: {
        color: '#203139',
        fontSize: 17,
        fontWeight: '400',
        marginBottom: '4%',
        textAlign: 'center',
        paddingHorizontal: 30,
        marginTop: '10%'
    },
    resendView: {

    },
    verifyCodeText2: {
        color: '#203139',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: '5%',
        textAlign: 'center',
        paddingHorizontal: 30,
        textDecorationLine: 'underline',
    }
})

export default GetOtp;