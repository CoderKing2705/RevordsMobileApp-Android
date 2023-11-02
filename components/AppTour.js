import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TourPage1 from './TourPage1';
import TourPage2 from './TourPage2';
import TourPage3 from './TourPage3';
import TourPage4 from './TourPage4';
import Globals from './Globals';
import messaging from '@react-native-firebase/messaging';

const AppTourGuide = ({ route, navigation }) => {
    const [step, setStep] = useState(1);
    const { MemberData, Phone } = route.params;
    let tokenid = "";

    const getDeviceToken = async () => {
        tokenid = await messaging().getToken();
    };

    const nextStep = () => {
        setStep(step + 1);
    };

    const closeTour = async () => {
        setStep(null);
        if (MemberData) {
            console.log(1)
            await getDeviceToken();
            fetch(`${Globals.API_URL}/MemberProfiles/PutDeviceTokenInMobileApp/${MemberData[0].memberId}/${tokenid}`, {
                method: 'PUT'
            }).then((res) => {
                console.log('tokenId set')
                navigation.navigate('TabNavigation', { MemberData: MemberData, Phone: Phone });
            });
        } else {
            console.log(2)
            navigation.navigate('RegistrationPage', { Phone: Phone });
        }
    };

    const GotoRegistration = async () => {
        if (MemberData) {
            console.log(1)
            await getDeviceToken();
            fetch(`${Globals.API_URL}/MemberProfiles/PutDeviceTokenInMobileApp/${MemberData[0].memberId}/${tokenid}`, {
                method: 'PUT'
            }).then((res) => {
                console.log('tokenId set')
                navigation.navigate('TabNavigation', { MemberData: MemberData, Phone: Phone });
            });
        } else {
            console.log(2)
            navigation.navigate('RegistrationPage', { Phone: Phone });
        }

    }

    const tourSteps = [
        {
            // text: "Welcome to our App!",
            targetComponent: <TourPage1 />,
        },
        {
            // text: "This is a key feature.",
            targetComponent: <TourPage2 />,
        },
        {
            // text: "Here's how to do something important.",
            targetComponent: <TourPage3 />,
        },
        {
            // text: "Here's how to do something important.",
            targetComponent: <TourPage4 />,
        }
        // Add more steps as needed
    ];

    if (step === null) {
        return null; // Tour is closed
    }

    return (
        <View style={styles.overlay}>
            <View style={styles.tourPages}>
                {tourSteps[step - 1].targetComponent}
            </View>
            {step !== 4 && <View style={styles.tourBtn}>
                <TouchableOpacity onPress={closeTour} style={styles.skipButton}>
                    <Text style={{ fontSize: 20, color: '#fff', fontWeight: '700' }}>SKIP</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={nextStep} style={styles.nextButton}>
                    <Text style={{ fontSize: 20, color: '#fff', fontWeight: '700' }}>NEXT</Text>
                </TouchableOpacity>
            </View>}
            {step == 4 && <View style={styles.tourBtnStart}>
                <TouchableOpacity onPress={GotoRegistration} style={styles.startButton}>
                    <Text style={{ fontSize: 20, color: '#fff', fontWeight: '700' }}>LET'S STARTED</Text>
                </TouchableOpacity>
            </View>}
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#d9e7ed',
    },
    tourText: {
        fontSize: 20,
        textAlign: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
        color: '#fff',
    },
    nextButton: {
        backgroundColor: '#fff',
        borderRadius: 5,
        height: '60%',
        width: '35%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#140d05',
    },
    startButton: {
        backgroundColor: '#fff',
        borderRadius: 5,
        height: '60%',
        width: '75%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#140d05',
    },
    skipButton: {
        backgroundColor: '#fff',
        borderRadius: 5,
        height: '60%',
        width: '35%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3380a3',
    },
    // targetComponent1: {
    //     width: 100,
    //     height: 100,
    //     backgroundColor: 'red',
    //     marginBottom: 20,
    // },
    // targetComponent2: {
    //     width: 100,
    //     height: 100,
    //     backgroundColor: 'green',
    //     marginBottom: 20,
    // },
    // targetComponent3: {
    //     width: 100,
    //     height: 100,
    //     backgroundColor: 'blue',
    // },
    tourPages: {
        width: '100%',
        height: '90%'
    },
    tourBtn: {
        width: '100%',
        height: '10%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 50
    },
    tourBtnStart: {
        width: '100%',
        height: '10%',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 50
    },
});

export default AppTourGuide;