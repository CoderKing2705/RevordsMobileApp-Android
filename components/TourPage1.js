import { StyleSheet, Image, Text, View } from 'react-native';

const TourPage1 = () => {


    return (
        <View style={styles.container}>
            <Image source={require('../assets/companylogo.png')} style={styles.companylogo} />
            <Image source={require('../assets/image-1-Mpm.png')} style={styles.img1} />
            <Text style={styles.txt1}>Welcome!</Text>
            <Text style={styles.txt2}>Everything is <Text style={{ color: '#8D5A25' }}>Straight</Text></Text>
            <Text style={styles.txt3}>to the point.</Text>
            <Text style={styles.txt4}>Revords App is an connection between customer and business owners,
                where customer can earn rewards from business owners for their loyalty.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center',
    },
    companylogo: {
        flexShrink: 0,
        width: '55%',
        resizeMode: 'contain',
        marginTop: '-10%',
    },
    img1: {
        flexShrink: 0,
        width: 225,
        height: 225,
        borderRadius: 500,
        marginTop: '-15%',
    },
    txt1: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: '10%',
        color: '#140D05'
    },
    txt2: {
        fontSize: 24,
        fontWeight: '900',
        marginTop: '3%',
        color: '#140D05'
    },
    txt3: {
        fontSize: 24,
        fontWeight: '900',
        color: '#140D05'
    },
    txt4: {
        fontSize: 15,
        fontWeight: '500',
        marginTop: '3%',
        color: '#8C9194',
        textAlign: 'center',
        paddingHorizontal: 40
    }
});

export default TourPage1;