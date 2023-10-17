// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useEffect } from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const GetStarted = ({ navigation }) => {
    // useEffect(() => {
    //     AsyncStorage.getItem('token')
    //         .then(value => {
    //             if (value !== null) {
    //                 console.log(value)
    //                 navigation.navigate('TabNavigation', {MemberData: JSON.parse(value)});
    //             } else {
    //                 console.log('Value does not exist');
    //             }
    //         })
    //         .catch(error => {
    //             console.error('Error retrieving data:', error);
    //         });
    // }, []);
    return (
        <View style={styles.container}>
            <Image source={require('../assets/companylogo.png')} style={styles.companylogo} />
            <Image source={require('../assets/vector-Ypq.png')} style={styles.vectorP61} />
            <TouchableOpacity onPress={() => { navigation.navigate('VerifyNumber') }} style={styles.frame2vJu}>
                <Text style={styles.getStartednru}>Get Started</Text>
                <Image source={require('../assets/arrowcircleright-R8m.png')} style={styles.arrowcirclerightTy3} />
            </TouchableOpacity>
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

export default GetStarted;