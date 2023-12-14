import { StyleSheet, Image, Text, View, ScrollView, ToastAndroid, PermissionsAndroid, Alert, PanResponder, Modal, TouchableWithoutFeedback, Pressable } from 'react-native';
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
// import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { useIsFocused } from '@react-navigation/native';

const ProfileEdit = ({ navigation, route }) => {
    const focus = useIsFocused();
    const [MemberData, setMemberData] = useState([{}]);
    const [name, setName] = useState('');
    const [emailId, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [formatPhone, setFormatPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [isValid, setIsValid] = useState(true);

    const [memberProfilePic, setMemberProfilePic] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageRes, setImageRes] = useState(null);
    const [optionModalVisible, setOptionModalVisible] = useState(false);

    const validateEmail = (email) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    async function setMemData(value) {
        await setMemberData(value);
        setName(value[0].name);
        setEmail(value[0].emailId);
        let bDay = (value[0].birthDay == '' || value[0].birthDay == null || value[0].birthDay == undefined ||
        value[0].birthMonth == '' || value[0].birthMonth == null || value[0].birthMonth == undefined) ?
        null : value[0].birthDay + ' ' + value[0].birthMonth;
        setBirthDate(bDay);
        setMemberProfilePic(value[0].memberImageFile);
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
    }, [focus]);

    const Save = () => {
        if (emailId !== null && emailId !== undefined && emailId !== '') {
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
                        if (selectedImage) {
                            await uploadImage(imageRes);
                        }
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
        } else {
            setLoading(true);
            const apiUrl = Globals.API_URL + '/MemberProfiles/PutMemberInMobileApp';
            let currentDate = (new Date()).toISOString();

            const requestBody = {
                id: MemberData[0].memberId,
                memberName: name,
                emailID: null,
                lastModifiedBy: MemberData[0].memberId,
                lastModifiedDate: currentDate,
            };

            axios.put(apiUrl, requestBody)
                .then(async (response) => {
                    if (selectedImage) {
                        await uploadImage(imageRes);
                    }
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

    const requestCameraPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const result = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA
                );

                if (result === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Camera permission granted after request');
                    const options = {
                        mediaType: 'photo',
                        includeBase64: false,
                        maxHeight: 2000,
                        maxWidth: 2000,
                    };

                    launchImageLibrary(options, (response) => {
                        if (response.didCancel) {
                            console.log('User cancelled image picker');
                        } else if (response.error) {
                            console.log('Image picker error: ', response.error);
                        } else {
                            let imageUri = response.uri || response.assets?.[0]?.uri;
                            setMemberProfilePic(null);
                            setSelectedImage(imageUri);
                            setImageRes(response);
                            console.log(imageUri)
                            console.log('response', response)
                            console.log(MemberData[0].memberId)
                        }
                        setOptionModalVisible(false);
                    });
                } else {
                    console.log('Camera permission denied after request');
                    setOptionModalVisible(false);
                }
            } else {
                const result = await request(PERMISSIONS.IOS.CAMERA);

                if (result === RESULTS.GRANTED) {
                    console.log('Camera permission granted after request');
                } else {
                    console.log('Camera permission denied after request');
                }
            }
        } catch (error) {
            console.error('Error requesting camera permission:', error);
        }
    };

    const openImagePicker = async (option) => {
        try {
            if (Platform.OS === 'android') {
                const result = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.CAMERA
                );

                if (result) {
                    console.log('Camera permission is granted');

                    setOptionModalVisible(false);
                    const options = {
                        mediaType: 'photo',
                        includeBase64: false,
                        maxHeight: 2000,
                        maxWidth: 2000,
                    };
                    const launchCallback = (response) => {
                        if (response.didCancel) {
                            console.log('User cancelled image picker');
                        } else if (response.error) {
                            console.log('ImagePicker Error: ', response.error);
                        } else {
                            let imageUri = response.uri || response.assets?.[0]?.uri;
                            setMemberProfilePic(null);
                            setSelectedImage(imageUri);
                            setImageRes(response);
                            console.log(imageUri)
                            console.log('response', response)
                            console.log(MemberData[0].memberId)
                        }
                    };

                    if (option === 'library') {
                        console.log('library')
                        launchImageLibrary(options, launchCallback);
                    } else if (option === 'camera') {
                        launchCamera(options, launchCallback);
                    }
                    // launchImageLibrary(options, (response) => {
                    //     if (response.didCancel) {
                    //         console.log('User cancelled image picker');
                    //     } else if (response.error) {
                    //         console.log('Image picker error: ', response.error);
                    //     } else {
                    //         let imageUri = response.uri || response.assets?.[0]?.uri;
                    //         setMemberProfilePic(null);
                    //         setSelectedImage(imageUri);
                    //         setImageRes(response);
                    //         console.log(imageUri)
                    //         console.log('response', response)
                    //         console.log(MemberData[0].memberId)
                    //     }
                    // });
                } else {
                    console.log('Camera permission is not granted');
                    requestCameraPermission();
                }
            } else {
                const result = await check(PERMISSIONS.IOS.CAMERA);

                if (result === RESULTS.GRANTED) {
                    console.log('Camera permission is granted');
                } else {
                    console.log('Camera permission is not granted');
                    requestCameraPermission();
                }
            }
        } catch (error) {
            console.error('Error checking camera permission:', error);
        }
    };

    const uploadImage = async (response) => {
        const formData = new FormData();
        formData.append('file', {
            uri: response.uri || response.assets?.[0]?.uri,
            type: response.type || response.assets?.[0]?.type,
            name: response.fileName || response.assets?.[0]?.fileName,
        });
        console.log(formData);
        try {
            const response = await axios.post(Globals.API_URL + `/MemberProfiles/UpdateMemberImageInMobileApp/${MemberData[0].memberId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Handle the response from the server if needed
            console.log('Image upload success', response.data);
        } catch (error) {
            // Handle errors
            console.error('Image upload failed', error);
        }
    };

    return (
        <>
            <View style={styles.container}>
                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <View style={{ flexDirection: 'row', width: '95%', height: '10%', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity activeOpacity={.7} onPress={() => navigation.navigate('Profiles')}>
                            <Image source={require('../assets/more-button-ved.png')} style={styles.setimg1} />
                        </TouchableOpacity>
                        <Text style={styles.welcomeText}>Edit Profile</Text>
                        <TouchableOpacity activeOpacity={.7} onPress={() => navigation.navigate('NotificationTray')}>
                            <Image source={require('../assets/notification-swo.png')} style={styles.setimg1} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{
                        flex: 1, width: '95%', marginTop: 30, height: '90%', borderRadius: 23, backgroundColor: 'white',
                    }}>
                        <View style={{ width: '100%', height: '95%', alignItems: 'center', justifyContent: 'center', borderRadius: 23 }}>
                            <View style={{
                                width: '95%', height: '95%', alignItems: 'center',
                                marginTop: 16, borderRadius: 23, paddingVertical: 25,
                            }}>
                                <View>
                                    {(!memberProfilePic && !selectedImage) && <Image source={require('../assets/defaultUser1.png')} style={styles.img1} />}
                                    {memberProfilePic && <Image source={{ uri: memberProfilePic }} style={styles.img1} />}
                                    {selectedImage && <Image source={{ uri: selectedImage }} style={styles.img1} />}

                                    <View style={styles.pencilView}>
                                        <TouchableOpacity onPress={() => setOptionModalVisible(true)}>
                                            <Image source={require('../assets/pencilsimple.png')} style={styles.pencilImg} />
                                        </TouchableOpacity>
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
                                    <View style={{ borderRadius: 23, padding: 5, width: '100%' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '700', paddingLeft: 5 }}>Birth Date</Text>
                                        <TextInput
                                            style={{
                                                height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10,
                                                marginTop: 5, fontSize: 16, borderRadius: 10, backgroundColor: '#e1e5e8', fontWeight: '600'
                                            }}
                                            value={(birthDate == '' || birthDate == null ||  birthDate == undefined) ? 'No BirthDate Given' : birthDate}
                                            editable={false}
                                        />
                                    </View>

                                    <TouchableOpacity activeOpacity={.7} onPress={Save} style={styles.frame2vJu}>
                                        <Text style={styles.getStartednru}>Save</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>
                    </ScrollView>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={optionModalVisible}
                        onRequestClose={() => setOptionModalVisible(false)}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableWithoutFeedback onPress={() => setOptionModalVisible(false)}>
                                <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
                            </TouchableWithoutFeedback>
                            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: 300 }}>
                                <TouchableWithoutFeedback style={{ flex: 1 }}>
                                    <Pressable style={{ zIndex: 1000 }} onPress={() => openImagePicker('library')}>
                                        <Text style={{ fontSize: 18, marginBottom: 10 }}>Choose from Library</Text>
                                    </Pressable>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback>
                                    <Pressable onPress={() => openImagePicker('camera')}>
                                        <Text style={{ fontSize: 18 }}>Take Photo</Text>
                                    </Pressable>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                    </Modal>

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
        right: -25
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
    },
    editContainer: {
        width: 16,
        height: 16,
        backgroundColor: '#203139',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
    },
    pencilView: {
        height: 40,
        width: 40,
        backgroundColor: '#73a5bc',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 500,
        position: 'absolute',
        right: -5,
        top: '60%'
    },
    pencilImg: {
        height: 22,
        width: 22
    },
    frame2vJu: {
        backgroundColor: '#140d05',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 25,
        width: '40%',
        height: 50
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