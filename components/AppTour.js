import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import TourPage1 from './TourPage1';
import TourPage2 from './TourPage2';
import TourPage3 from './TourPage3';
import TourPage4 from './TourPage4';
import Globals from './Globals';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppTourGuide = ({ route, navigation }) => {
    const [step, setStep] = useState(1);
    const { MemberData, Phone } = route.params;
    let tokenid = "";
    let platformOS;

    const getDeviceToken = async () => {
        platformOS = (Platform.OS == "android" ? 1 : 2);
        tokenid = await messaging().getToken();
    };

    const nextStep = () => {
        setStep(step + 1);
    };

    const closeTour = async () => {
        setStep(null);
        if (MemberData) {
            // await postData(MemberData[0].memberId)
            console.log(MemberData[0].memberId);
            console.log('platformOSssssw', platformOS)
            fetch(`${Globals.API_URL}/MemberProfiles/PutDeviceTokenInMobileApp/${MemberData[0].memberId}/${tokenid}/${platformOS}`, {
                method: 'PUT'
            }).then((res) => {
                console.log('tokenId set')
                navigation.navigate('TabNavigation', { MemberData: MemberData, Phone: Phone });
            });
        } else {
            // await postData(MemberData[0].memberId)
            navigation.navigate('RegistrationPage', { Phone: Phone });
        }
    };

    const GotoRegistration = async () => {
        if (MemberData) {
            // let platformOS = (Platform.OS == "android" ? 1 : 2);
            // await postData(MemberData[0].memberId)
            fetch(`${Globals.API_URL}/MemberProfiles/PutDeviceTokenInMobileApp/${MemberData[0].memberId}/${tokenid}/${platformOS}`, {
                method: 'PUT'
            }).then((res) => {
                console.log('tokenId set')
                navigation.navigate('TabNavigation', { MemberData: MemberData, Phone: Phone });
            });
        } else {
            // await postData(MemberData[0].memberId)
            navigation.navigate('RegistrationPage', { Phone: Phone });
        }

    }

    const postData = async (memberId) => {
        let currentDate = (new Date()).toISOString();
        await getDeviceToken();
        let obj = JSON.stringify({
            "uniqueID": "",
            "id": 0,
            "memberId": memberId,
            "createdDate": currentDate,
            "deviceOS": platformOS,
            "appToken": tokenid
        })
        console.log("This is objh",obj);
        fetch(Globals.API_URL + '/MobileAppVisitersLogs/PostMobileAppVisitersLog', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: obj
        })
            .then((response) => {
                console.log('JSON.stringify(res)', JSON.stringify(response));
            })
            .catch((error) => {
                console.log("Error Saving Logs:- ", error)
            })
    }

    const tourSteps = [
        {
            targetComponent: <TourPage1 />,
        },
        {
            targetComponent: <TourPage2 />,
        },
        {
            targetComponent: <TourPage3 />,
        },
        {
            targetComponent: <TourPage4 />,
        }
    ];

    if (step === null) {
        return null;
    }

    return (
        <View style={styles.overlay}>
            <View style={styles.tourPages}>
                {tourSteps[step - 1].targetComponent}
            </View>
            {step !== 4 && <View style={styles.tourBtn}>
                <TouchableOpacity activeOpacity={.7} onPress={closeTour} style={styles.skipButton}>
                    <Text style={{ fontSize: 20, color: '#fff', fontWeight: '700' }}>SKIP</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={.7} onPress={nextStep} style={styles.nextButton}>
                    <Text style={{ fontSize: 20, color: '#fff', fontWeight: '700' }}>NEXT</Text>
                </TouchableOpacity>
            </View>}
            {step == 4 && <View style={styles.tourBtnStart}>
                <TouchableOpacity activeOpacity={.7} onPress={GotoRegistration} style={styles.startButton}>
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