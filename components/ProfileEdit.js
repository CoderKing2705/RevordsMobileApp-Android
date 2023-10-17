import { StyleSheet, Image, Text, View, Pressable, Button } from 'react-native';
// import { TextInput } from 'react-native-gesture-handler';
import MaskInput from 'react-native-mask-input';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { useRef, useState } from 'react';

const ProfileEdit = ({ navigation, route }) => {
    const { MemberData } = route.params;

    const [name, setName] = useState(MemberData[0].name);
    const [emailId, setEmail] = useState(MemberData[0].emailId);
    const [phone, setPhone] = useState(MemberData[0].phone);

    return (
        <>
            <View style={styles.container}>
                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', width: '95%', height: '10%', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => navigation.navigate('Profiles')}>
                            <Image source={require('../assets/more-button-ved.png')} style={styles.setimg1} />
                        </TouchableOpacity>
                        <Text style={styles.welcomeText}>Edit Profile</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ProfileEdit')}>
                            <Image source={require('../assets/notification-swo.png')} style={styles.setimg1} />
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        width: '95%', height: '90%', alignItems: 'center', backgroundColor: 'white',
                        marginTop: 16, borderRadius: 23, paddingVertical: 25
                    }}>
                        <View>
                            <Image source={require('../assets/ellipse-5-bg.png')} style={styles.img1} />
                            <View style={styles.pencilView}>
                                <Image source={require('../assets/pencilsimple.png')} style={styles.pencilImg} />
                            </View>
                        </View>
                        {/* <Text style={styles.welcomeText}>{MemberData[0].name}</Text> */}
                        {/* <Text style={styles.welcomeText}>000</Text> */}

                        <View style={{ backgroundColor: '#f2f5f6', width: '95%', marginTop: 16, borderRadius: 23, padding: 10 }}>
                            <View style={{ marginTop: 5, borderRadius: 23, padding: 5 }}>
                                <Text style={{ fontSize: 18, fontWeight: '600' }}>Name</Text>
                                <TextInput
                                    style={{
                                        height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10,
                                        marginTop: 5, fontSize: 16
                                    }}
                                    onChangeText={() => { setName(inputText) }}
                                    value={name}
                                />
                            </View>
                            <View>
                                <Text style={{ fontSize: 18, fontWeight: '600' }}>Email</Text>
                                <TextInput
                                    style={{
                                        height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10,
                                        marginTop: 5, fontSize: 16
                                    }}
                                    onChangeText={() => { setEmail(inputText) }}
                                    value={emailId}
                                />
                            </View>
                            <View>
                                <Text style={{ fontSize: 18, fontWeight: '600' }}>Phone Number</Text>
                                <TextInput
                                    style={{
                                        height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10,
                                        marginTop: 5, fontSize: 16
                                    }}
                                    // onChangeText={() => { setPhone(inputText)}}
                                    value={phone}
                                    editable={false}
                                />
                            </View>
                            <TouchableOpacity  style={styles.frame2vJu}>
                                <Text style={styles.getStartednru}>Verify</Text>
                            </TouchableOpacity>

                            {/* <View style={{
                                flexDirection: 'row', width: '90%', alignItems: 'left', justifyContent: 'left',
                                marginTop: 16, marginLeft: 16
                            }}>
                                <Image source={require('../assets/auto-group-m9hk.png')} style={styles.iconimg1} />
                                <Text style={styles.innerDText}>{MemberData[0].phone}</Text>
                            </View>
                            <View style={{
                                flexDirection: 'row', width: '90%', alignItems: 'left', justifyContent: 'left',
                                marginLeft: 16, paddingVertical: 16
                            }}>
                                <Image source={require('../assets/auto-group-edy5.png')} style={styles.iconimg1} />
                                <Text style={styles.innerDText}>{MemberData[0].emailId}</Text>
                            </View> */}
                        </View>

                    </View>
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
        height: 40,
        width: 40,
        backgroundColor: '#73a5bc',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 500,
        position: 'absolute',
        right: 0,
        top: '50%'
    },
    pencilImg: {
        height: 25,
        width: 25
    }
})

export default ProfileEdit;