import { StyleSheet, Image, Text, View, Dimensions } from 'react-native';

const TourPage3 = () => {
    return (
        <View style={styles.container}>
            <Image source={require('../assets/companylogo.png')} style={styles.companylogo} />
            <Image source={require('../assets/03TourImage.png')} style={styles.img1} />
            <Text style={styles.txt1}>How App is Working?</Text>
            <Text style={styles.txt2}>How App
                <Text style={{ color: '#8D5A25' }}> Connects</Text>
            </Text>

            <Text style={styles.txt4}>customers to revords?</Text>
            <Text style={styles.txt5}>Revords is a powerful set of service and features built on top of
                React Framework that bring a totally new level of app development agility to mobile dev teams.</Text>
        </View>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d9e7ed',
        alignItems: 'center',
        // paddingTop: height * 0.05, // Adjust based on your design
        paddingHorizontal: width * 0.05, // Adjust based on your design
    },
    companylogo: {
        width: '55%',
        aspectRatio: 1, // Maintain aspect ratio
        resizeMode: 'contain',
        // marginBottom: height * 0.02, // Adjust based on your design
    },
    img1: {
        width: width * 0.4, // 80% of screen width
        height: width * 0.4, // Maintain aspect ratio
        borderRadius: width * 0.4, // Half of the width for circular shape
        // marginBottom: height * 0.02, // Adjust based on your design
    },
    txt1: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: height * 0.05, // Adjust based on your design
        color: '#140D05',
    },
    txt2: {
        fontSize: 24,
        fontWeight: '900',
        marginTop: height * 0.03, // Adjust based on your design
        color: '#140D05',
    },
    txt4: {
        fontSize: 24,
        fontWeight: '900',
        color: '#140D05',
    },
    txt5: {
        fontSize: 15,
        fontWeight: '500',
        marginTop: height * 0.03, // Adjust based on your design
        color: '#8C9194',
        textAlign: 'center',
    },
});

export default TourPage3;