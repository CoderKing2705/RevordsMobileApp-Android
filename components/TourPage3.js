import { StyleSheet, Image, Text, View } from 'react-native';

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

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center'
    },
    companylogo: {
        flexShrink: 0,
        width: '55%',
        resizeMode: 'contain',
        marginTop: '-10%'
    },
    img1: {
        flexShrink: 0,
        width: 225,
        height: 225,
        borderRadius: 500,
        marginTop: '-10%'
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
        marginTop: '5%',
        color: '#140D05'
    },
    txt3: {
        fontSize: 24,
        fontWeight: '700',
        color: '#140D05'
    },
    txt4: {
        fontSize: 24,
        fontWeight: '900',
        color: '#140D05'
    },
    txt5: {
        fontSize: 15,
        fontWeight: '500',
        marginTop: '5%',
        color: '#8c9194',
        textAlign: 'center',
        paddingHorizontal: 40
    },    
});

export default TourPage3;