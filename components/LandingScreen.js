import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Spinner from 'react-native-loading-spinner-overlay';
import { SafeAreaView } from 'react-native-safe-area-context';
import Globals from './Globals';
import messaging from '@react-native-firebase/messaging';

const LandingScreen = ({ navigation }) => {
    const focus = useIsFocused();

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);

        AsyncStorage.getItem('token')
            .then(async value => {
                if (value !== null) {
                    console.log("This is for value does exist:-", value);
                    console.log('token exist', (JSON.parse(value))[0].phone)
                    await getMemberData((JSON.parse(value))[0].phone, value);
                    // await postData((JSON.parse(value))[0].memberId);
                    console.log((JSON.parse(value))[0].memberId);   
                } else {
                    console.log("This is for value does not exist:-", value);
                    console.log('Value does not exist');
                    setLoading(false);
                    navigation.navigate('GetStarted');
                }
            })
            .catch(error => {
                console.error('Error retrieving data:', error);
            });
    }, [focus]);


    // const postData = async (memberId) => {
    //     let currentDate = (new Date()).toISOString();
    //     let token = await messaging().getToken();
    //     let platformOS = Platform.OS;
    //     fetch(Globals.API_URL + '/MobileAppVisitersLogs/PostMobileAppVisitersLog', {
    //         method: 'POST',
    //         headers: {
    //             Accept: 'application/json',
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             "uniqueID": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //             "id": 0,
    //             "memberId":memberId,
    //             "createdDate": currentDate,
    //             "deviceOS": platformOS,
    //             "appToken": token
    //         }),
    //     })
    //         .then((response) => {
    //             console.log('JSON.stringify(res)', JSON.stringify(response));
    //         })
    //         .catch((error) => {
    //             console.log("Error Saving Logs:- ", error)
    //         })
    // }
    const getMemberData = async (phone, value) => {
        const response = await fetch(
            Globals.API_URL + '/MemberProfiles/GetMemberByPhoneNo/' + phone)
        const json = await response.json();
        AsyncStorage.setItem('token', JSON.stringify(json))
            .then(() => {
                console.log('Data saved successfully!');
                setTimeout(() => {
                    setLoading(false);
                    navigation.navigate('TabNavigation', { MemberData: JSON.parse(value) });
                }, 2500);
            })
            .catch(error => {
                console.error('Error saving data:', error);
            });
    }
    return (
        <View style={styles.container}>
            <Image source={require('../assets/companylogo.png')} style={styles.companylogo} />
            <Image source={require('../assets/vector-Ypq.png')} style={styles.vectorP61} />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <Spinner
                        //visibility of Overlay Loading Spinner
                        visible={loading}
                        //Text with the Spinner
                        textContent={''}
                        //Text style of the Spinner Text
                        textStyle={styles.spinnerTextStyle}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center'
    },
    companylogo: {
        flexShrink: 0,
        width: '70%',
        resizeMode: 'contain',
    },
    frame2vJu: {
        top: 403,
        backgroundColor: '#140d05',
        borderRadius: 8,
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 25,
        width: 200,
        flexDirection: 'row',
    },
    getStartednru: {
        lineHeight: 22.5,
        textTransform: 'uppercase',
        fontFamily: 'SatoshiVariable, SourceSansPro',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: 18,
        color: '#ffffff',
        margin: '0 29 1 0',
        flex: 10,
        zIndex: 10,
    },
    arrowcirclerightTy3: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
        flexShrink: 0,
        marginLeft: 10
    },
    vectorP61: {
        width: 650,
        height: 527,
        position: 'absolute',
        left: 20,
        top: 170,
        resizeMode: 'contain'
    },
});

export default LandingScreen;