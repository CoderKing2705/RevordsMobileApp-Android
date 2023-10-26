import { StyleSheet, Image, Text, View, ScrollView, ToastAndroid } from 'react-native';
// import { TextInput } from 'react-native-gesture-handler';
import MaskInput from 'react-native-mask-input';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from "react-native";
import { StatusBar } from "react-native";
import Globals from '../components/Globals';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';

const ProfileEdit = ({ navigation, route }) => {
    // const { MemberData } = route.params;

    const [MemberData, setMemberData] = useState([{}]);
    const [name, setName] = useState('');
    const [emailId, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [formatPhone, setFormatPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [isValid, setIsValid] = useState(true);

    const validateEmail = (email) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    async function setMemData(value) {
        await setMemberData(value);
        setName(value[0].name);
        setEmail(value[0].emailId);
        let numP1 = String(value[0].phone).toString().substring(0, 3);
        let numP2 = String(value[0].phone).toString().substring(3, 6);
        let numP3 = String(value[0].phone).toString().substring(6,);
        setFormatPhone('(' + numP1 + ') ' + numP2 + '-' + numP3);
        setPhone(String(value[0].phone));
    }
    useEffect(() => {
        AsyncStorage.getItem('token')
            .then(async (value) => {
                if (value !== null) {
                    await setMemData(JSON.parse(value));
                    console.log(value);
                }
            })
            .catch(error => {
                console.error('Error retrieving dataa:', error);
            });

    }, []);

    const Save = () => {
        const isValidEmail = validateEmail(emailId);
        setIsValid(isValidEmail);
        if (isValidEmail) {
            setLoading(true);
            const apiUrl = Globals.API_URL + '/MemberProfiles/PutMemberInMobileApp';
            let currentDate = (new Date()).toISOString();

            const requestBody = {
                id: MemberData[0].memberId,
                memberName: name,
                emailID: emailId,
                lastModifiedBy: MemberData[0].memberId,
                lastModifiedDate: currentDate,
            };

            axios.put(apiUrl, requestBody)
                .then(async (response) => {
                    await getMemberData();
                    setLoading(false);
                    ToastAndroid.showWithGravityAndOffset(
                        'Updated Successfully!',
                        ToastAndroid.LONG,
                        ToastAndroid.BOTTOM,
                        25,
                        50,
                    );
                    navigation.navigate('Profiles');
                })
                .catch(error => console.error(error));
        }
    }

    const getMemberData = async () => {
        const response = await fetch(
            Globals.API_URL + '/MemberProfiles/GetMemberByPhoneNo/' + phone)
        const json = await response.json();
        AsyncStorage.setItem('token', JSON.stringify(json))
            .then(() => {
                console.log('Data saved successfully!');
            })
            .catch(error => {
                console.error('Error saving data:', error);
            });
    }
    return (
        <>
            <View style={styles.container}>
                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <View style={{ flexDirection: 'row', width: '95%', height: '10%', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => navigation.navigate('Profiles')}>
                            <Image source={require('../assets/more-button-ved.png')} style={styles.setimg1} />
                        </TouchableOpacity>
                        <Text style={styles.welcomeText}>Edit Profile</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ProfileEdit')}>
                            <Image source={require('../assets/notification-swo.png')} style={styles.setimg1} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{
                        flex: 1, width: '95%', marginTop: 30, height: '90%', borderRadius: 23, backgroundColor: 'white',
                    }}>
                        <View style={{ width: '100%', height: '95%', alignItems: 'center', justifyContent: 'center', borderRadius: 23 }}>
                            <View style={{
                                width: '95%', height: '95%', alignItems: 'center',
                                marginTop: 16, borderRadius: 23, paddingVertical: 25,
                            }}>
                                <View>
                                    <Image source={require('../assets/ellipse-5-bg.png')} style={styles.img1} />
                                    <View style={styles.pencilView}>
                                        <Image source={require('../assets/pencilsimple.png')} style={styles.pencilImg} />
                                    </View>
                                </View>

                                <View style={{ width: '95%', marginTop: 16, borderRadius: 23, padding: 10, alignItems: 'center' }}>
                                    <View style={{ marginTop: 5, borderRadius: 23, padding: 5, width: '100%' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '700', paddingLeft: 5 }}>Name</Text>
                                        <TextInput
                                            style={{
                                                height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10,
                                                marginTop: 5, fontSize: 16, borderRadius: 10, backgroundColor: '#e6edf1', fontWeight: '600'
                                            }}
                                            onChangeText={(inputText) => { setName(inputText) }}
                                            value={name}
                                        />
                                    </View>
                                    <View style={{ borderRadius: 23, padding: 5, width: '100%' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '700', paddingLeft: 5 }}>Email</Text>
                                        <TextInput
                                            style={{
                                                height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10,
                                                marginTop: 5, fontSize: 16, borderRadius: 10, backgroundColor: '#e6edf1', fontWeight: '600'
                                            }}
                                            onChangeText={(inputText) => { setEmail(inputText) }}
                                            value={emailId}
                                        />
                                        {!isValid && <Text style={{ color: 'red' }}>Invalid Email Address</Text>}
                                    </View>
                                    <View style={{ borderRadius: 23, padding: 5, width: '100%' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '700', paddingLeft: 5 }}>Phone Number</Text>
                                        <TextInput
                                            style={{
                                                height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10,
                                                marginTop: 5, fontSize: 16, borderRadius: 10, backgroundColor: '#e1e5e8', fontWeight: '600'
                                            }}
                                            value={formatPhone}
                                            editable={false}
                                        />
                                    </View>

                                    <TouchableOpacity onPress={Save} style={styles.frame2vJu}>
                                        <Text style={styles.getStartednru}>Save</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>
                    </ScrollView>

                </View>
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
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center',
    },
    img1: {
        width: 100,
        height: 100,
        borderRadius: 83,
        marginTop: -15,
    },
    setimg1: {
        width: 50,
        height: 50,
        marginTop: -16,
        position: 'absolute',
        alignSelf: 'flex-end',
        right: -20
    },
    iconimg1: {
        width: 35,
        height: 35
    },
    welcomeText: {
        color: 'black',
        fontSize: 18,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginTop: '5%',
        textAlign: 'center',
        width: '80%'
    },
    innerDText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '700',
        marginTop: '2%',
        marginLeft: '5%',
        width: '80%',

    },
    settingImg: {
        width: 50,
        height: 50,
        // position: 'absolute',
        // right: '3%',
        // top: '13%',
        // borderRadius: 10,
        // zIndex: 1,
        // flex: 1
    },
    editContainer: {
        width: 16,
        height: 16,
        backgroundColor: '#203139',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        // left: '0%',
        // top: '7%',
    },
    pencilView: {
        height: 35,
        width: 35,
        backgroundColor: '#73a5bc',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 500,
        position: 'absolute',
        right: 0,
        top: '50%'
    },
    pencilImg: {
        height: 20,
        width: 20
    },
    frame2vJu: {
        // top: 403,
        backgroundColor: '#140d05',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 25,
        width: '40%',
        height: 50
        // flexDirection: 'row',
    },
    getStartednru: {
        lineHeight: 22.5,
        textTransform: 'uppercase',
        fontFamily: 'SatoshiVariable, SourceSansPro',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: 18,
        color: '#ffffff',
        flex: 10,
        zIndex: 10,
        textAlign: 'center',
    },
})

export default ProfileEdit;