import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StyleSheet, Image, View } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { SafeAreaView } from 'react-native-safe-area-context';
import Globals from './Globals';

const LandingScreen = ({ navigation }) => {
    const focus = useIsFocused();

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);

        AsyncStorage.getItem('token')
            .then(async value => {
                if (value !== null) {
                    await getMemberData((JSON.parse(value))[0].phone, value);
                } else {
                    setLoading(false);
                    navigation.navigate('GetStarted');
                }
            })
            .catch(error => {
                console.error('Error retrieving data:', error);
            });
    }, [focus]);

    const getMemberData = async (phone, value) => {
        const response = await fetch(
            Globals.API_URL + '/MemberProfiles/GetMemberByPhoneNo/' + phone)
        const json = await response.json();
        AsyncStorage.setItem('token', JSON.stringify(json))
            .then(() => {
                setLoading(false);
                navigation.navigate('TabNavigation', { MemberData: JSON.parse(value) });
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
                        visible={loading}
                        textContent={''}
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