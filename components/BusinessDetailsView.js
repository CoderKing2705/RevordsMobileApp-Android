import { StyleSheet } from 'react-native'
import { View, Text, Image } from 'react-native'
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Globals from '../components/Globals';
import { SafeAreaView } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { StatusBar } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function BusinessDetailsView({ route }) {
    const navigation = useNavigation();
    const goBackToCardView = () => {
        navigation.navigate("Location")
    };
    const businessDetailsAPI = `${Globals.API_URL}/BusinessProfiles`;
    const businessGroupId = "1";
    const userEarnedRewardsAPI = `http://ho.hitechprojects.co.in:8101/api/RewardConfigs/GetRewardConfigBusinessGroupwiseMemberwise/${businessGroupId}`;
    const id = route.params.id;
    const [businessDetails, setBusinessDetails] = useState([]);
    const [earnerRewards, setEarnedRevards] = useState([]);
    const imagePath = businessDetails ? businessDetails.imagePath : null;
    const logoPath = businessDetails ? businessDetails.logoPath : null;
    const imageUrl = `http://ho.hitechprojects.co.in:8101/WWWROOT/${imagePath}`;
    const logoUrl = `http://ho.hitechprojects.co.in:8101/WWWROOT/${logoPath}`;
    const initialRegion = {
        latitude: businessDetails.latitude,
        longitude: businessDetails.longitude,
        latitudeDelta: 2.0992,
        longitudeDelta: 2.0421
    }
    //const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    // const formattedTimes = {};

    // daysOfWeek.forEach(day => {
    //     const fromTime = new Date(businessDetails.businesswiseWorkingDays[0][`${day.toLowerCase()}FromTime`]);
    //     const toTime = new Date(businessDetails.businesswiseWorkingDays[0][`${day.toLowerCase()}ToTime`]);
    //     const formattedFromTime = `${fromTime.getHours().toString().padStart(2, '0')}:${fromTime.getMinutes().toString().padStart(2, '0')}`;
    //     const formattedToTime = `${toTime.getHours().toString().padStart(2, '0')}:${toTime.getMinutes().toString().padStart(2, '0')}`;

    //     formattedTimes[day] = `${formattedFromTime} - ${formattedToTime}`;
    // })
    useEffect(() => {
        axios({
            method: 'GET',
            url: `${businessDetailsAPI}/${id}`
        }).then((response) => {
            setBusinessDetails(response.data)
            // console.log(businessDetails.adress)
            // console.log(businessDetails.businesswiseWorkingDays)
            // console.log(businessDetails.latitude);
            // console.log(businessDetails.longitude);
            console.log(businessDetails.longitude)
            console.log(businessDetails.latitude)
        }).catch((error) => {
            console.log("Error fetching data:/", error)
        });

        axios({
            method: 'GET',
            url: `${userEarnedRewardsAPI}/2`
        }).then((response) => {
            setEarnedRevards(response.data)
            console.log(response.data)
        }).catch((error) => {
            console.log("Error fetching data", error);
        })

    }, [])


    return (
        <View style={styles.container}>
            <View style={{ marginTop: '1%', flexDirection: 'row', width: '80%', height: '5%', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity onPress={goBackToCardView}>
                    <Image source={require('../assets/more-button-ved.png')} style={styles.setimg1} />
                </TouchableOpacity>
                <Text style={styles.welcomeText}>
                    {businessDetails.businessName}
                </Text>
                <TouchableOpacity>
                    <Image source={require('../assets/more-button-Cam.png')} style={styles.setimg2} />
                </TouchableOpacity>
            </View>
            <SafeAreaView style={{ paddingTop: StatusBar.currentHeight }}>
                <ScrollView style={{ flex: 1 }}>
                    <View style={styles.detailView}>
                        <Image source={{ uri: imageUrl }} style={styles.imageBusiness} />
                        <Text style={{ fontWeight: 700, top: 5 }}> {businessDetails.businessName} </Text>
                        <Text style={{ color: '#717679', fontWeight: 700, top: 18 }}> {businessDetails.industry} </Text>
                        <Image source={{ uri: logoUrl }} style={styles.logoBusiness} />
                        <View>
                            <Text style={styles.loyaltyRewards}> Loyalty Rewards </Text>
                            <Text style={styles.subheading}> Earn 1 pt for every $10 spent </Text>
                            {earnerRewards.map((rewards, index) => (
                                <Text key={index} style={{ fontWeight: '700', fontSize: 15, marginTop: '2%' }}>
                                    {earnerRewards[0].rewardName}
                                </Text>
                            ))}
                        </View>
                        <View style={styles.photosView}>
                            <Text style={{ marginTop: '10%', fontWeight: '900' }}> Photos </Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Image style={{ width: 80, height: 80, borderRadius: 10, marginTop: '2%', marginLeft: '2%' }} source={require('../assets/rectangle-32.png')} />
                                <Image style={{ width: 80, height: 80, borderRadius: 10, marginTop: '2%', marginLeft: '2%' }} source={require('../assets/rectangle-33.png')} />
                                <Image style={{ width: 80, height: 80, borderRadius: 10, marginTop: '2%', marginLeft: '2%' }} source={require('../assets/rectangle-34.png')} />
                            </View>
                        </View>
                        <Text style={{ marginTop: '10%', fontWeight: '900' }}> Hours </Text>
                        {/* <View style={{ color: '#717679', fontWeight: '700' }}>
                            {Object.entries(formattedTimes).map(([day, timeRange]) => (
                                <View key={day}>
                                    <Text>
                                        {day} : {timeRange}
                                    </Text>
                                </View>
                            ))}
                        </View> */}
                        <View>
                            <Text style={styles.adressHeading}> Address: </Text>
                            <Text style={{ color: '#8c9194', fontSize: 16, marginTop: '2%' }}> {businessDetails.adress} </Text>
                        </View>
                    </View>
                    <View style={styles.mapViewMain}>
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            initialRegion={initialRegion}>
                            <Marker
                                coordinate={{
                                    latitude: businessDetails.latitude,
                                    longitude: businessDetails.longitude
                                }} />
                        </MapView>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    mapViewMain: {
        width: 20,
        height: 20
    },
    adressHeading: {
        marginTop: '10%',
        fontWeight: '900'
    },
    subheading: {
        fontWeight: '500',
        fontSize: 12,
        marginTop: '2%',
        marginLeft: '0.5%',
        color: '#717679'
    },
    loyaltyRewards: {
        marginTop: '20%',
        fontWeight: '900'
    },
    detailView: {
        backgroundColor: 'white',
        padding: 10,
        height: 900,
    },
    logoBusiness: {
        width: 50,
        height: 50,
        top: 30,
        right: -5
    },
    imageBusiness: {
        width: 350,
        height: 150,
        position: 'relative',
        borderRadius: 20,
    },
    welcomeText: {
        color: 'black',
        fontSize: 15,
        fontWeight: '900',
        textTransform: 'uppercase',
        textAlign: 'center',
        width: '80%',
        top: 10
    },
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center',
    },
    setimg1: {
        position: 'relative',
        width: 50,
        height: 50,
        right: 15,
        top: 10,
    },
    setimg2: {
        position: 'relative',
        width: 50,
        height: 50,
        right: 40,
        top: 10,
        left: 15
    }
})