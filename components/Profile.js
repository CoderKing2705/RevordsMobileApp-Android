import { StyleSheet, Image, Text, View, Pressable, Button } from 'react-native';
// import { TextInput } from 'react-native-gesture-handler';
import MaskInput from 'react-native-mask-input';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { useRef, useState } from 'react';
import ProfileEdit from './ProfileEdit';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

const Profile = ({ route, navigation }) => {
    const Stack = createNativeStackNavigator();
    const { MemberData } = route.params;

    return (
        <>
            <View style={styles.container}>
                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', width: '95%', height: '10%', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={styles.welcomeText}>User Profile</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ProfileEdit')}>
                            <Image source={require('../assets/more-button.png')} style={styles.setimg1} />
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        width: '95%', height: '90%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white',
                        marginTop: 16, borderRadius: 23
                    }}>
                        <Image source={require('../assets/ellipse-5-bg.png')} style={styles.img1} />
                        <Text style={styles.welcomeText}>{MemberData[0].name}</Text>
                        {/* <Text style={styles.welcomeText}>000</Text> */}

                        <View style={{ backgroundColor: '#f2f5f6', width: '95%', marginTop: 16, borderRadius: 23 }}>
                            <View style={{
                                flexDirection: 'row', width: '90%', alignItems: 'left', justifyContent: 'left',
                                marginTop: 16, marginLeft: 16
                            }}>
                                <Image source={require('../assets/auto-group-m9hk.png')} style={styles.iconimg1} />
                                <Text style={styles.innerDText}>{MemberData[0].phone}</Text>
                                {/* <Text style={styles.innerDText}>000</Text> */}

                            </View>
                            <View style={{
                                flexDirection: 'row', width: '90%', alignItems: 'left', justifyContent: 'left',
                                marginLeft: 16, paddingVertical: 16
                            }}>
                                <Image source={require('../assets/auto-group-edy5.png')} style={styles.iconimg1} />
                                <Text style={styles.innerDText}>{MemberData[0].emailId}</Text>
                                {/* <Text style={styles.innerDText}>000</Text> */}
                            </View>
                        </View>
                        <View style={{ backgroundColor: 'white', width: '100%', marginTop: 16, borderRadius: 23 }}>
                            <View style={{
                                flexDirection: 'row', width: '95%', alignItems: 'left', justifyContent: 'left', marginLeft: 16
                            }}>
                                <Image source={require('../assets/group-6.png')} style={styles.iconimg1} />
                                <Text style={styles.innerDText}>Help Center</Text>
                            </View>
                            <View style={{
                                flexDirection: 'row', width: '95%', alignItems: 'left', justifyContent: 'left',
                                marginTop: 16, marginLeft: 16
                            }}>
                                <Image source={require('../assets/group-7.png')} style={styles.iconimg1} />
                                <Text style={styles.innerDText}>Refer & Earn</Text>
                            </View>
                            <View style={{
                                flexDirection: 'row', width: '95%', alignItems: 'left', justifyContent: 'left',
                                marginTop: 16, marginLeft: 16
                            }}>
                                <Image source={require('../assets/group-8.png')} style={styles.iconimg1} />
                                <Text style={styles.innerDText}>About Revord App</Text>
                            </View>
                            <View style={{
                                flexDirection: 'row', width: '95%', alignItems: 'left', justifyContent: 'left',
                                marginLeft: 16, paddingVertical: 16
                            }}>
                                <Image source={require('../assets/group-9.png')} style={styles.iconimg1} />
                                <Text style={styles.innerDText}>Logout</Text>
                            </View>
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
        right: 0
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
    }
})

export default Profile;