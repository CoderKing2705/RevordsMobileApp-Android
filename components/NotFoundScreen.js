import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const NotFoundScreen = ({ route, navigation }) => {
    // const { Phone } = route.params;

    const navigateToActualScreen = () => {
        navigation.navigate("GetStarted");
    }
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#d9e7ed', '#a5becb', '#d9e7ed']}
                style={styles.gradient}>
                <Image source={require('../assets/companylogo.png')} style={styles.companylogo} />
                <Text style={styles.messageAlert}>
                    Could not find an account with the Phone number you entered.
                </Text>
                <Text style={styles.messageInfo}>
                    Click "OK" to go back and use another phone number or create new account.
                </Text>
                <TouchableOpacity activeOpacity={0.7} onPress={navigateToActualScreen} style={styles.frame2vOk}>
                    <Text style={styles.okText}>OK</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
}
const styles = StyleSheet.create({
    messageAlert: {
        fontSize: 20,
        marginBottom: 20,
        color: 'rgb(255, 0, 0)',
        width: "90%"
    },
    messageInfo: {
        fontSize: 20,
        marginBottom: 20,
        fontWeight: '700',
        top: '7%',
        width: '90%'
    },
    frame2vOk: {
        backgroundColor: '#140d05',
        borderRadius: 12,
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        width: '40%',
        flexDirection: 'row',
        marginTop: '40%'
    },
    gradient: {
        height: '100%',
        width: '100%',
        alignItems: 'center'
    },
    okText: {
        textTransform: 'uppercase',
        fontFamily: 'SatoshiVariable, SourceSansPro',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
        flex: 10,
        zIndex: 10,
        width: '100%'
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
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
});

export default NotFoundScreen;