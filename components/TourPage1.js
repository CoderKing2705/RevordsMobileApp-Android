import { StyleSheet, Image, Text, View, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const TourPage1 = () => {


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#d9e7ed', '#bfdfed', '#d9e7ed']}
        style={[styles.gradient]}>
        <Image source={require('../assets/companylogo.png')} style={styles.companylogo} />
        <Image source={require('../assets/image-1-Mpm.png')} style={styles.img1} />
        <Text style={styles.txt1}>Welcome!</Text>
        <Text style={styles.txt2}>Everything is <Text style={{ color: '#8D5A25' }}>Straight</Text></Text>
        <Text style={styles.txt3}>to the points.</Text>
        <Text style={styles.txt4}>Revords App is a digital connection between you and Revords businesses. You can search for local Revords businesses 
        of your choices, visit them and earn the rewards for your loyalty to the businesses you frequently visit.</Text>
      </LinearGradient>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    // marginLeft: 7,
    // paddingLeft: 10,
    alignItems: 'center',
    paddingHorizontal: width * 0.05, // Adjust based on your design
  },
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: '#d9e7ed',
    alignItems: 'center',
    // paddingTop: height * 0.05, // Adjust based on your design
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
    marginTop: height * 0.02, // Adjust based on your design
    color: '#140D05',
  },
  txt2: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: height * 0.01, // Adjust based on your design
    color: '#140D05',
  },
  txt3: {
    fontSize: 24,
    fontWeight: '900',
    color: '#140D05',
  },
  txt4: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: height * 0.01, // Adjust based on your design
    color: '#8C9194',
    textAlign: 'center',
  },
});

export default TourPage1;