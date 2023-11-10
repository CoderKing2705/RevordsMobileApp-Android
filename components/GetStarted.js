// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { StyleSheet, Image, Text, View, BackHandler } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

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
            <Image source={require('../assets/companylogo.png')} style={styles.companylogo} />
            <Image source={require('../assets/vector-Ypq.png')} style={styles.vectorP61} />
            <View style={{width: '100%', alignItems: 'center'}}>
                <TouchableOpacity activeOpacity={.7} onPress={() => { navigation.navigate('VerifyNumber') }} style={styles.frame2vJu}>
                    <Text style={styles.getStartednru}>Get Started</Text>
                    <Image source={require('../assets/arrowcircleright-R8m.png')} style={styles.arrowcirclerightTy3} />
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: 15,
        width: '65%',
        flexDirection: 'row',    
    },
    getStartednru: {
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
    arrowcirclerightTy3: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
        flexShrink: 0,
        marginRight: 20,
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

export default GetStarted;