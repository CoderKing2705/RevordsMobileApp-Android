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
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, CalloutSubview } from 'react-native-maps';
import currentIcon from '../assets/casinoIcon.png';
import Geolocation from '@react-native-community/geolocation';

export default function BusinessDetailsView({ route }) {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    lang = 0;
    lat = 0;
    const [initialRegion, setInitialRegion] = useState(null);
    memberID = 0;
    const [loading, setLoading] = useState(false);
    const goBackToCardView = () => {
        navigation.navigate("Locations")
    };
    const businessDetailsAPI = `${Globals.API_URL}/BusinessProfiles`;
    const businessGroupId = "1";
    const userEarnedRewardsAPI = Globals.API_URL + `/RewardConfigs/GetRewardConfigBusinessGroupwiseMemberwise/${businessGroupId}`;
    const id = route.params.id;
    const [businessDetails, setBusinessDetails] = useState([]);
    const [earnerRewards, setEarnedRevards] = useState([]);
    const imagePath = businessDetails ? businessDetails.imagePath : null;
    const logoPath = businessDetails ? businessDetails.logoPath : null;
    const imageUrl = Globals.Root_URL + `${imagePath}`;
    const logoUrl = Globals.Root_URL + `${logoPath}`;
    const wdays = Globals.API_URL + '/BusinessProfiles/GetBusinesswiseWorkingDaysForMobile';
    const [workingDays, setWorkingDays] = useState([{}]);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [error, setError] = useState(null);
    const [MemberData, setMemberData] = useState([{}]);
    
    async function setMarkers(centerLat, centerLong) {
        console.log('cenbeffsdaf');
        console.log(centerLat);
        setInitialRegion({
            latitude: centerLat,
            longitude: centerLong,
            longitudeDelta: (0.0922 * 2),
            latitudeDelta: 0.0922
        });
    }

    async function setBusinessDetailsAwait(data) {
        await setBusinessDetails(data);
    }
    async function setworkingDaysAwait(data) {
        await setWorkingDays(data);
    }

    async function setMemData(value) {
        await setMemberData(value);
    }
    async function setEarnedRevardsData(value) {
        await setEarnedRevards(value);
    }
    async function LoadData() {
        setLoading(true);

        AsyncStorage.getItem('token')
            .then(async (value) => {
                if (value !== null) {
                    memberID = (JSON.parse(value))[0].memberId;
                    axios({
                        method: 'GET',
                        url: `${userEarnedRewardsAPI}/${memberID}`
                    }).then(async (response) => {
                        await setEarnedRevardsData(response.data)

                    }).catch((error) => {
                        console.log("Error fetching data", error);
                        setLoading(false);
                    });
                    await setMemData(JSON.parse(value));

                } else {
                    console.log('not available')
                }
            })
            .catch(error => {
                console.error('Error retrieving dataa:', error);
                setLoading(false);
            });

    }

    useEffect(() => {
        LoadData();
        axios({
            method: 'GET',
            url: `${businessDetailsAPI}/${id}`
        }).then(async (response) => {
            console.log('2')
            console.log(response.data);
            await Geolocation.getCurrentPosition(
                async position => {
                    const { latitude, longitude } = position.coords;
                    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
                    console.log("b lat.", response.data.latitude)
                    console.log("b lon.", response.data.longitude)

                    const toRadian = n => (n * Math.PI) / 180
                    let lat2 = response.data.latitude
                    let lon2 = response.data.longitude
                    let lat1 = latitude
                    let lon1 = longitude
                    console.log(lat1, lon1 + "===" + lat2, lon2)
                    let R = 6371  // km
                    let x1 = lat2 - lat1
                    let dLat = toRadian(x1)
                    let x2 = lon2 - lon1
                    let dLon = toRadian(x2)
                    let a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(toRadian(lat1)) * Math.cos(toRadian(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
                    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                    let d = R * c
                    response.data.distance = parseInt(d * 0.621371);

                    await setBusinessDetailsAwait(response.data)
                    await setMarkers(parseFloat(response.data.latitude), parseFloat(response.data.longitude));
                },
                error => {
                    console.error('Error getting current location: ', error);
                },
                { enableHighAccuracy: false, timeout: 500 }
            );

        }).catch((error) => {
            console.log("Error fetching data:/", error)
            setLoading(false);
        });
        console.log(memberID);


        axios({
            method: 'GET',
            url: `${wdays}/${id}`
        }).then(async (response) => {
            // console.log('4')
            await setworkingDaysAwait(response.data);
            setLoading(false);
        });
    }, [isFocused])
    return (
        <View style={styles.container}>
            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', width: '97%', height: '10%', alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity style={{ width: '15%', height: '100%', alignItems: 'center', justifyContent: 'center' }} onPress={() => navigation.navigate('Locations')}>
                        <Image source={require('../assets/more-button-ved.png')} style={styles.setimg1} />
                    </TouchableOpacity>
                    <Text style={styles.welcomeText}>{businessDetails.businessName}</Text>
                    <TouchableOpacity style={{ width: '15%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={require('../assets/notification-oRK.png')} style={styles.setimg2} />
                    </TouchableOpacity>
                </View>

                <SafeAreaView style={{ paddingTop: '5%', height: '90%', width: '97%', alignItems: 'center', borderRadius: 50 }}>
                    <ScrollView style={{ flex: 1, height: '100%', width: '97%', borderRadius: 50 }}>
                        <View style={styles.detailView}>
                            <Image source={{ uri: imageUrl }} style={styles.imageBusiness} />
                            <Text style={{ fontWeight: '800', paddingHorizontal: '3%', fontSize: 18, top: 5 }}>{businessDetails.businessName}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#717679', paddingHorizontal: '3%', fontWeight: '700', fontSize: 14, top: 12 }}>{businessDetails.industry}</Text>
                                <Text style={{ color: '#73a5bc', paddingHorizontal: '3%', fontWeight: '700', fontSize: 14, top: 12, alignSelf: 'flex-end' }}> {businessDetails.distance} mi </Text>
                            </View>
                            <Image source={{ uri: logoUrl }} style={styles.logoBusiness} />
                            <View style={{ paddingHorizontal: '3%' }}>
                                <Text style={styles.loyaltyRewards}>Loyalty Rewards</Text>
                                <Text style={styles.subheading}>Earn 1 pt for every visit</Text>
                                {earnerRewards.map((rewards, index) => (
                                    <Text key={index} style={{ fontWeight: '600', fontSize: 16, marginTop: '2%', paddingHorizontal: '2%' }}>
                                        {earnerRewards[index].rewardName}
                                    </Text>
                                ))}
                            </View>
                            <View style={{ paddingHorizontal: '3%' }}>
                                <Text style={{ marginTop: '7%', fontWeight: '700', fontSize: 18 }}>Photos</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Image style={{ width: 80, height: 80, borderRadius: 10, marginTop: '2%', marginLeft: '2%' }} source={require('../assets/rectangle-32.png')} />
                                    <Image style={{ width: 80, height: 80, borderRadius: 10, marginTop: '2%', marginLeft: '2%' }} source={require('../assets/rectangle-33.png')} />
                                    <Image style={{ width: 80, height: 80, borderRadius: 10, marginTop: '2%', marginLeft: '2%' }} source={require('../assets/rectangle-34.png')} />
                                </View>
                            </View>
                            <View style={{ paddingHorizontal: '3%' }} >
                                <Text style={{ marginTop: '7%', fontWeight: '700', fontSize: 18 }}>Hours</Text>
                                {workingDays.map((day, index) => (
                                    <Text key={index} style={{ marginTop: '1%', fontWeight: '700', color: '#717679', paddingHorizontal: '2%', fontSize: 12 }}>
                                        {`${day.dayName}: ${day.fromTime} - ${day.toTime}`}
                                    </Text>
                                ))}
                            </View>
                            <View style={{ paddingHorizontal: '3%' }} >
                                <Text style={styles.adressHeading}>Address:</Text>
                                <Text style={{ color: '#8c9194', fontSize: 14, marginTop: '2%', paddingHorizontal: '2%' }}>{businessDetails.adress}</Text>
                            </View>
                            <View style={{ paddingHorizontal: '3%', marginTop: '3%' }}>
                                <View style={styles.mapViewMain}>
                                    <MapView
                                        style={styles.mapView}
                                        provider={PROVIDER_GOOGLE}
                                        region={initialRegion}
                                        showsMyLocationButton={true}
                                        selected={true}
                                        scrollEnabled={false}
                                        zoomEnabled={false}
                                        customMapStyle={[
                                            {
                                                "featureType": "transit",
                                                "elementType": "geometry",
                                                "stylers": [
                                                    {
                                                        "color": "#f8f7f7"
                                                    }
                                                ]
                                            },
                                            {
                                                "featureType": "road",
                                                "elementType": "geometry",
                                                "stylers": [
                                                    {
                                                        "color": "#c8d6e3"  // Blue color
                                                    }
                                                ]
                                            },
                                            {
                                                "featureType": "road",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                    {
                                                        "color": "#000"
                                                    }
                                                ]
                                            },
                                            {
                                                "featureType": "water",
                                                "elementType": "geometry",
                                                "stylers": [
                                                    {
                                                        "color": "#95c3d6"
                                                    }
                                                ]
                                            },
                                            {
                                                "featureType": "water",
                                                "elementType": "labels.text.stroke",
                                                "stylers": [
                                                    {
                                                        "color": "#000"
                                                    }
                                                ]
                                            }
                                        ]}
                                    >
                                        {initialRegion && (
                                            <Marker
                                                coordinate={initialRegion}
                                                title={businessDetails.businessName}
                                            >
                                                <Image
                                                    source={(currentIcon)}
                                                    style={{ width: 32, height: 32 }}
                                                    resizeMode="contain"
                                                />
                                            </Marker>
                                        )}
                                    </MapView>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View>

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
    )
}

const styles = StyleSheet.create({
    workingDays: {
        // marginLeft: '2%'
        paddingHorizontal: '2%'
    },
    mapViewMain: {
        width: '100%',
        height: 250
    },
    mapView: {
        width: '100%',
        height: '97%',
    },
    adressHeading: {
        marginTop: '7%',
        fontWeight: '700',
        fontSize: 18
    },
    subheading: {
        fontWeight: '500',
        fontSize: 12,
        marginTop: '2%',
        marginLeft: '0.5%',
        color: '#717679',
        paddingHorizontal: '2%'
    },
    loyaltyRewards: {
        marginTop: '15%',
        fontWeight: '700',
        fontSize: 18
    },
    detailView: {
        backgroundColor: 'white',
        // padding: 10,
        height: '100%',
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    logoBusiness: {
        width: 100,
        height: 50,
        top: 20,
        marginHorizontal: '4%'
    },
    imageBusiness: {
        width: '100%',
        height: 175,
        position: 'relative',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    welcomeText: {
        color: 'black',
        fontSize: 18,
        fontWeight: '800',
        marginTop: '15%',
        textAlign: 'center',
        width: '70%',
        height: '100%'
    },
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center',
    },
    setimg1: {
        width: 50,
        height: 50,
        marginTop: 15,
        // position: 'absolute',
        alignSelf: 'center',
        // right: -20
    },
    setimg2: {
        width: 50,
        height: 50,
        marginTop: 15,
        alignSelf: 'center',
    }
})