import { StyleSheet, Image, Text, View, Alert, ScrollView, Linking, Modal } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useIsFocused } from "@react-navigation/native";
import Globals from './Globals';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useErrorHandler } from './ErrorHandler';

const Profile = ({ route, navigation }) => {
    const focus = useIsFocused();
    const [name, setName] = useState('');
    const [emailId, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [memberProfilePic, setMemberProfilePic] = useState('');
    const [MemberData, setMemberData] = useState([{}]);
    const appVersion = require('../package.json').version;
    const [modalVisible, setModalVisible] = useState(false);

    const images = [
        { url: memberProfilePic }
    ]

    const handleGalleryImagePress = () => {
        setModalVisible(true);
    }

    const createTwoButtonAlert = async () => {

        try {
            Alert.alert('Log Out', 'Do you want to logout?', [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Yes', onPress: async () => {
                        try {
                            fetch(`${Globals.API_URL}/MemberProfiles/PutDeviceTokenInMobileApp/${MemberData[0].memberId}/NULL`, {
                                method: 'PUT'
                            }).then(async (res) => {
                                await AsyncStorage.removeItem('token');
                                navigation.navigate('GetStarted')
                            });
                        } catch (error) {
                            await useErrorHandler("(Android): Profile > createTwoButtonAlert() " + error);
                        }
                    }
                },
            ]);
        } catch (error) {
            await useErrorHandler("(Android): Profile > createTwoButtonAlert() " + error);
        }

    }

    async function setMemData(value) {

        try {
            await setMemberData(value);
            setName(value[0].name);
            setEmail(value[0].emailId);
            let bDay = (value[0].birthDay == '' || value[0].birthDay == null || value[0].birthDay == undefined ||
                value[0].birthMonth == '' || value[0].birthMonth == null || value[0].birthMonth == undefined) ?
                null : value[0].birthDay + ' ' + value[0].birthMonth;
            setBirthDay(bDay);
            setMemberProfilePic(value[0].memberImageFile);
            let numP1 = String(value[0].phone).toString().substring(0, 3);
            let numP2 = String(value[0].phone).toString().substring(3, 6);
            let numP3 = String(value[0].phone).toString().substring(6,);
            setPhone('(' + numP1 + ') ' + numP2 + '-' + numP3);
        } catch (error) {
            await useErrorHandler("(Android): Profile > setMemberData() " + error);
        }

    }
    useEffect(() => {
        const controller = new AbortController();
        AsyncStorage.getItem('token')
            .then(async (value) => {

                if (value !== null) {
                    await setMemData(JSON.parse(value));
                }
            })
            .catch(async error => {
                await useErrorHandler("(Android): Profile > setMemberData() " + error);
            });
            return () => {
                controller.abort();
              };
    }, [focus]);

    return (
        <>
            <View style={styles.container}>
                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', width: '95%', height: '10%', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={styles.welcomeText}>User Profile</Text>
                        <TouchableOpacity activeOpacity={.7} onPress={() => navigation.navigate('ProfileEdit', { MemberData: MemberData })}>
                            <Image source={require('../assets/editImg.png')} style={styles.setimg1} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{
                        width: '95%', marginTop: 15, height: '90%', borderRadius: 23, backgroundColor: 'white',
                    }}>
                        <View style={{
                            width: '100%', height: '95%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white',
                            marginTop: 16, borderRadius: 23, paddingVertical: 15
                        }}>
                            {(memberProfilePic == null || memberProfilePic == '' || memberProfilePic == undefined) &&
                                <Image source={require('../assets/user.png')} style={styles.img1} />}
                            <TouchableOpacity onPress={handleGalleryImagePress}>
                                {(memberProfilePic != null && memberProfilePic != '' && memberProfilePic != undefined) &&
                                    <Image source={{ uri: memberProfilePic }} style={styles.img1} resizeMode='contain' />}
                            </TouchableOpacity>
                            <Text style={styles.welcomeText}>{name}</Text>

                            <View style={{ backgroundColor: '#f2f5f6', width: '95%', marginTop: 16, borderRadius: 23 }}>
                                <View style={{
                                    flexDirection: 'row', width: '90%', alignItems: 'left', justifyContent: 'left',
                                    marginTop: 16, marginLeft: 8
                                }}>
                                    <Image source={require('../assets/auto-group-m9hk.png')} style={styles.iconimg1} />
                                    <Text style={styles.innerDText}>{phone}</Text>
                                </View>
                                <View style={{
                                    flexDirection: 'row', width: '90%', alignItems: 'left', justifyContent: 'left',
                                    marginLeft: 8, paddingVertical: 10
                                }}>
                                    <Image source={require('../assets/auto-group-edy5.png')} style={styles.iconimg1} />
                                    {(emailId != null && emailId != '' && emailId != undefined) && <Text style={styles.innerDText}>{emailId}</Text>}
                                    {(emailId == null || emailId == '' || emailId == undefined) && <Text style={{
                                        color: '#676767',
                                        fontSize: 16,
                                        fontWeight: '700',
                                        marginTop: '2%',
                                        marginLeft: '5%',
                                        width: '80%',
                                    }}>Email</Text>}
                                </View>
                                <View style={{
                                    flexDirection: 'row', width: '90%', alignItems: 'left', justifyContent: 'left',
                                    marginLeft: 8, paddingBottom: 10
                                }}>
                                    <Image source={require('../assets/birthday.png')} style={styles.iconimg1} />
                                    {(birthDay != null && birthDay != '' && birthDay != undefined) && <Text style={styles.innerDText}>{birthDay}</Text>}
                                    {(birthDay == null || birthDay == '' || birthDay == undefined) && <Text style={{
                                        color: '#676767',
                                        fontSize: 16,
                                        fontWeight: '700',
                                        marginTop: '2%',
                                        marginLeft: '5%',
                                        width: '80%',
                                    }}>Birth Date</Text>}

                                </View>
                            </View>

                            <View style={{ backgroundColor: 'white', width: '100%', marginTop: 16, borderRadius: 23 }}>
                                <View style={{
                                    flexDirection: 'row', width: '95%', alignItems: 'left', justifyContent: 'left', marginLeft: 16
                                }}>
                                    <TouchableOpacity activeOpacity={.7}
                                        onPress={() => Linking.openURL('https://revords.com/t&c.html')}
                                        style={{
                                            flexDirection: 'row', alignItems: 'left', justifyContent: 'left',
                                        }}>
                                        <Image source={require('../assets/termsImg.jpeg')} style={styles.iconimg1} />
                                        <Text style={styles.innerDText}>Terms & Conditions</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    flexDirection: 'row', width: '95%', alignItems: 'left', justifyContent: 'left',
                                    marginTop: 16, marginLeft: 16
                                }}>
                                    <TouchableOpacity activeOpacity={.7}
                                        onPress={() => Linking.openURL('https://revords.com/privacy.html')}
                                        style={{
                                            flexDirection: 'row', alignItems: 'left', justifyContent: 'left',
                                        }}>
                                        <Image source={require('../assets/privacyImg.jpeg')} style={styles.iconimg1} />
                                        <Text style={styles.innerDText}>Privacy Policy</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    flexDirection: 'row', width: '95%', alignItems: 'left', justifyContent: 'left',
                                    marginTop: 16, marginLeft: 16
                                }}>
                                    <TouchableOpacity activeOpacity={.7}
                                        onPress={() => Linking.openURL('mailto:info@revords.com')}
                                        style={{
                                            flexDirection: 'row', alignItems: 'left', justifyContent: 'left',
                                        }}>
                                        <Image source={require('../assets/group-6.png')} style={styles.iconimg1} />
                                        <Text style={styles.innerDText}>Contact Us</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    flexDirection: 'row', width: '95%', alignItems: 'left', justifyContent: 'left',
                                    marginLeft: 16, paddingVertical: 16
                                }}>
                                    <TouchableOpacity activeOpacity={.7} onPress={createTwoButtonAlert} style={{
                                        flexDirection: 'row', alignItems: 'left', justifyContent: 'left'
                                    }}>
                                        <Image source={require('../assets/group-9.png')} style={styles.iconimg1} />
                                        <Text style={styles.innerDText}>Logout</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={{ fontWeight: '600', color: '#c2c3c5' }}>App Version: {appVersion}</Text>
                        </View>
                    </ScrollView>

                    <Modal visible={modalVisible} transparent={true}>
                        <ImageViewer
                            imageUrls={images}
                            enableImageZoom={true}
                            enableSwipeDown={true}
                            scrollEnabled={true}
                            onCancel={() => setModalVisible(false)}
                            onClick={() => setModalVisible(false)}
                        />
                    </Modal>
                </View>
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
        borderRadius: 50,
    },
    setimg1: {
        width: 50,
        height: 50,
        marginTop: -16,
        position: 'absolute',
        alignSelf: 'flex-end',
        right: -30,
        borderRadius: 8
    },
    iconimg1: {
        width: 35,
        height: 35,
        borderRadius: 15
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
    }
})

export default Profile;