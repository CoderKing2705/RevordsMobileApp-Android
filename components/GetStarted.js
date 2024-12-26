import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { StyleSheet, Image, Text, View, BackHandler, TouchableHighlight } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';

const GetStarted = ({ navigation }) => {

    const backPressed = () => {
        BackHandler.exitApp();
        navigation.navigate('LandingScreen');
    };

    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener('hardwareBackPress', backPressed);
            return () => {
                BackHandler.removeEventListener('hardwareBackPress', backPressed);
            };
        }, []));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#d9e7ed', '#a5becb', '#d9e7ed']}
                style={styles.gradient}>
                <Text style={styles.welcomeText}>Welcome To</Text>
                <Image source={require('../assets/companylogo.png')} style={styles.companylogo} />
                <View style={styles.rectangleOne}>
                    {/* <Image source={require('../assets/bullet-point.png')} style={styles.arrowcirclerightTy3} /> */}
                    <Text style={styles.textOne}>Find nearby businesses</Text>
                </View>
                <View style={styles.rectangleTwo}>
                    {/* <Image source={require('../assets/bullet-point.png')} style={styles.arrowcirclerightTy3} /> */}
                    <Text style={styles.textOne}>Earn points on your visits</Text>
                </View>
                <View style={styles.rectangleThree}>
                    {/* <Image source={require('../assets/bullet-point.png')} style={styles.arrowcirclerightTy3} /> */}
                    <Text style={styles.textOne}>Redeem points into rewards</Text>
                </View>
                <View style={styles.rectangleFour}>
                    {/* <Image source={require('../assets/bullet-point.png')} style={styles.arrowcirclerightTy3} /> */}
                    <Text style={styles.textOne}>Receive Exclusive offers</Text>
                </View>
                <View style={{ width: '100%', alignItems: 'center', position: 'absolute', bottom: '5%' }}>
                    <TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('TermsAndCondition') }} style={styles.frame2vJuCreate}>
                        <Text style={styles.createAccountText}>Create Account</Text>
                    </TouchableOpacity>
                    <TouchableHighlight underlayColor="#5DADE2" onPress={() => { navigation.navigate('VerifyNumber') }} style={styles.frame2vJuSignin}>
                        <Text style={styles.signInText}>Sign In</Text>
                    </TouchableHighlight>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    textOne: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '500',
        textAlign: 'center',
    },
    rectangleOne: {
        backgroundColor: '#5DADE2',
        paddingVertical: 15,
        paddingHorizontal: 45,
        borderRadius: 5,
        bottom: 35,
        borderWidth: 2,
        flexDirection: 'row'
    },
    rectangleTwo: {
        backgroundColor: '#5DADE2',
        paddingVertical: 15,
        paddingHorizontal: 38,
        borderRadius: 5,
        marginTop: 10,
        borderWidth: 2,
        flexDirection: 'row'
    },
    rectangleThree: {
        backgroundColor: '#5DADE2',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 5,
        marginTop: 40,
        borderWidth: 2,
        flexDirection: 'row'
    },
    rectangleFour: {
        backgroundColor: '#5DADE2',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginTop: 40,
        borderWidth: 2,
        flexDirection: 'row'
    },
    gradient: {
        height: '100%',
        width: '100%',
        alignItems: 'center'
    },
    container: {
        height: '100%',
        width: '100%',
        alignItems: 'center'
    },
    companylogo: {
        bottom: '5%',
        width: '70%',
        resizeMode: 'contain',
    },
    frame2vJuCreate: {
        backgroundColor: '#140d05',
        borderRadius: 12,
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        width: '65%',
        flexDirection: 'row',
        marginTop: 10
    },
    frame2vJuSignin: {
        borderWidth: 1,
        borderRadius: 12,
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        width: '65%',
        flexDirection: 'row',
        marginTop: 10
    },
    createAccountText: {
        textTransform: 'uppercase',
        fontFamily: 'SatoshiVariable, SourceSansPro',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: 16,
        color: '#ffffff',
        textAlign: 'center',
        flex: 10,
        zIndex: 10,
        width: '100%'
    },
    signInText: {
        textTransform: 'uppercase',
        fontFamily: 'SatoshiVariable, SourceSansPro',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: 17,
        color: 'black',
        textAlign: 'center',
        flex: 10,
        zIndex: 10,
        width: '100%'
    },
    arrowcirclerightTy3: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
        flexShrink: 0,
        right: 10,
        top: 5
        // marginRight: 20,
    },
    vectorP61: {
        width: 650,
        height: 527,
        position: 'absolute',
        left: 20,
        top: 170,
        resizeMode: 'contain'
    },
    welcomeText: {
        color: "#3380a3",
        fontSize: 24,
        fontWeight: "700",
        textTransform: "uppercase",
        marginTop: "5%",
    },
});

export default GetStarted;