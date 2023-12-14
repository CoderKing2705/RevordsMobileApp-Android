import { StyleSheet, ToastAndroid } from 'react-native'
import { View, Text, Image } from 'react-native'
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import Globals from '../components/Globals';
import { SafeAreaView } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import currentIcon from '../assets/casinoIcon.png';
import Geolocation from '@react-native-community/geolocation';
import * as Progress from 'react-native-progress';

export default function BusinessDetailsView({ route }) {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    lang = 0;
    lat = 0;
    const [initialRegion, setInitialRegion] = useState(null);
    let memberID = 0;
    const [loading, setLoading] = useState(false);

    const businessDetailsAPI = `${Globals.API_URL}/BusinessProfiles/GetBusinessLocationWiseMemberDetails`;
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

    const getLocation = (response) => {
        Geolocation.getCurrentPosition(
            async position => {
                const { latitude, longitude } = position.coords;

                const toRadian = n => (n * Math.PI) / 180
                let lat2 = response.data[0].latitude
                let lon2 = response.data[0].longitude
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
                response.data[0].distance = parseInt(d * 0.621371);

                await setBusinessDetailsAwait(response.data[0])
                await setMarkers(parseFloat(response.data[0].latitude), parseFloat(response.data[0].longitude));
                console.log('memberID', memberID)
                setLoading(false);
            },
            error => {
                console.error('Error getting current location: ', error);
            },
            { enableHighAccuracy: false, timeout: 500 }
        );
    }

    async function LoadData() {
        setLoading(true);

        AsyncStorage.getItem('token')
            .then(async (value) => {
                if (value !== null) {
                    memberID = (JSON.parse(value))[0].memberId;
                    await axios({
                        method: 'GET',
                        url: `${businessDetailsAPI}/${id}/${(JSON.parse(value))[0].memberId}`
                    }).then(async (response) => {
                        console.log(response.data);
                        await getLocation(response);
                    }).catch((error) => {
                        console.log("Error fetching data:/", error)
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

    const saveProfile = () => {
        AsyncStorage.getItem('token')
            .then(async (value) => {
                if (value !== null) {
                    memberID = (JSON.parse(value))[0].memberId;
                    console.log(memberID)
                    console.log(businessDetails.businessGroupId)
                    let currentDate = (new Date()).toISOString();
                    await fetch(Globals.API_URL + '/MemberProfiles/PostMemberProfileInMobileBySave', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "uniqueId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                            "id": 0,
                            "memberId": (JSON.parse(value))[0].memberId,
                            "notes": null,
                            "badgeId": 1,
                            "tagId": null,
                            "businessGroupId": businessDetails.businessGroupId,
                            "lastVisitDate": null,
                            "lifeTimePoints": 0,
                            "lifeTimeVisits": 0,
                            "smsoptIn": false,
                            "emailOptIn": ((JSON.parse(value))[0].emailId == '' || (JSON.parse(value))[0].emailId == null ||
                                (JSON.parse(value))[0].emailId == undefined) ? false : true,
                            "notificationOptIn": true,
                            "isHighroller": false,
                            "currentPoints": 0,
                            "sourceId": 14,
                            "stateId": 3,
                            "isActive": true,
                            "createdBy": (JSON.parse(value))[0].memberId,
                            "createdDate": currentDate,
                            "lastModifiedBy": (JSON.parse(value))[0].memberId,
                            "lastModifiedDate": currentDate,
                            "businessLocationID": businessDetails.businessId,
                            "baseLocationID": businessDetails.businessId
                        }),
                    }).then(async (res) => {
                        ToastAndroid.showWithGravityAndOffset(
                            'Claimed Successfully!',
                            ToastAndroid.LONG,
                            ToastAndroid.BOTTOM,
                            25,
                            50,
                        );
                        await LoadData();
                    });
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

        // axios({
        //     method: 'GET',
        //     url: `${wdays}/${id}`
        // }).then(async (response) => {
        //     await setworkingDaysAwait(response.data);
        //     setLoading(false);
        // });
    }, [isFocused])
    return (
        <View style={styles.container}>
            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', width: '97%', height: '10%', alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity activeOpacity={.7} style={{ width: '15%', height: '100%', alignItems: 'center', justifyContent: 'center' }} onPress={() => navigation.goBack()}>
                        <Image source={require('../assets/more-button-ved.png')} style={styles.setimg1} />
                    </TouchableOpacity>
                    <Text style={styles.welcomeText}>{businessDetails.businessName}</Text>
                    <TouchableOpacity activeOpacity={.7} onPress={() => navigation.navigate('NotificationTray')} style={{ width: '15%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={require('../assets/notification-oRK.png')} style={styles.setimg2} />
                    </TouchableOpacity>
                </View>

                <SafeAreaView style={{ paddingTop: '5%', height: '90%', width: '97%', alignItems: 'center', borderRadius: 50 }}>
                    <ScrollView style={{ flex: 1, height: '100%', width: '97%', borderRadius: 50 }} showsVerticalScrollIndicator={false}>
                        <View style={styles.detailView}>
                            <Image source={{ uri: imageUrl }} style={styles.imageBusiness} />
                            <Text style={{ fontWeight: '800', paddingHorizontal: '3%', fontSize: 18, top: 5 }}>{businessDetails.businessName}</Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#717679', paddingHorizontal: '3%', fontWeight: '700', fontSize: 14, top: 12 }}>{businessDetails.industry}</Text>
                                <Text style={{ color: '#73a5bc', paddingHorizontal: '3%', fontWeight: '700', fontSize: 14, top: 12, alignSelf: 'flex-end' }}> {businessDetails.distance} mi </Text>
                            </View>
                            {businessDetails.memberString == 'Member' && <Text style={{ fontWeight: '800', paddingHorizontal: '3%', fontSize: 14, top: 15, color: '#7d5513' }}>{businessDetails.memberString}</Text>}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Image source={{ uri: logoUrl }} style={styles.logoBusiness} />
                            </View>
                            {(businessDetails.promotionData || businessDetails.autopilotData) && (businessDetails.promotionData.length > 0 || businessDetails.autopilotData.length > 0) &&
                                <View style={{ paddingHorizontal: '3%' }}>
                                    <Text style={styles.Promotion}>Promotions</Text>
                                    {businessDetails.promotionData && businessDetails.promotionData.map((promo, index) => (
                                        <Fragment key={index}>
                                            <View style={{ flexDirection: 'row', width: '100%', marginTop: 7 }}>
                                                <View style={{ width: '65%' }}>
                                                    {(promo.promotionalMessage).toString().length < 25 && <Text style={{ fontWeight: '500', fontSize: 14, marginTop: '2%', paddingHorizontal: '2%' }}>
                                                        {promo.promotionalMessage}
                                                    </Text>}
                                                    {(promo.promotionalMessage).toString().length >= 25 && <Text onLongPress={() => promo.promotionalMessage} style={{ fontWeight: '500', fontSize: 14, marginTop: '2%', paddingHorizontal: '2%' }}>
                                                        {(promo.promotionalMessage).toString().substring(0, 25)}...
                                                    </Text>}
                                                </View>
                                                <View style={{ width: '35%', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                    {promo.expiryDays > 1 && <Text style={{
                                                        fontWeight: '500', fontSize: 12, marginTop: '2%', paddingHorizontal: '2%', borderWidth: 1,
                                                        borderColor: '#767676', paddingHorizontal: 5, paddingVertical: 3, color: '#767676', borderRadius: 5
                                                    }}>
                                                        {promo.expiryDays} days left
                                                    </Text>}
                                                    {promo.expiryDays == 1 && <Text style={{
                                                        fontWeight: '500', fontSize: 12, marginTop: '2%', paddingHorizontal: '2%', borderWidth: 1,
                                                        borderColor: '#767676', paddingHorizontal: 5, paddingVertical: 3, color: '#767676', borderRadius: 5
                                                    }}>
                                                        Expiring Today
                                                    </Text>}
                                                </View>
                                            </View>
                                        </Fragment>
                                    ))}
                                </View>
                            }
                            {/* {businessDetails.autopilotData.length > 0 &&
                                <View style={{ paddingHorizontal: '3%' }}> */}
                            {businessDetails.autopilotData && businessDetails.autopilotData.map((auto, index) => (
                                <View style={{ paddingHorizontal: '3%' }} key={index}>
                                    <Fragment>
                                        <View style={{ flexDirection: 'row', width: '100%', marginTop: 7 }}>
                                            <View style={{ width: '65%' }}>
                                                <Text style={{ fontWeight: '500', fontSize: 14, marginTop: '2%', paddingHorizontal: '2%' }}>
                                                    {auto.rewardName}
                                                </Text>
                                            </View>

                                            {auto.campaignName != 'Acquirement' &&
                                                <View style={{ width: '35%', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                    {auto.expiryDays > 1 && <Text style={{
                                                        fontWeight: '500', fontSize: 12, marginTop: '2%', paddingHorizontal: '2%', borderWidth: 1,
                                                        borderColor: '#767676', paddingHorizontal: 5, paddingVertical: 3, color: '#767676', borderRadius: 5
                                                    }}>
                                                        {auto.expiryDays} days left
                                                    </Text>}
                                                    {auto.expiryDays == 1 && <Text style={{
                                                        fontWeight: '500', fontSize: 12, marginTop: '2%', paddingHorizontal: '2%', borderWidth: 1,
                                                        borderColor: '#767676', paddingHorizontal: 5, paddingVertical: 3, color: '#767676', borderRadius: 5
                                                    }}>
                                                        Expiring Today
                                                    </Text>}
                                                </View>
                                            }
                                            {(auto.campaignName == 'Acquirement' && businessDetails.memberString != 'Member') &&
                                                <View style={{ width: '35%', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                    <TouchableOpacity activeOpacity={.7} onPress={saveProfile} style={styles.frame2vJu}>
                                                        <Text style={styles.getStartednru}>Save</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                            {(auto.campaignName == 'Acquirement' && businessDetails.memberString == 'Member') &&
                                                <View style={{ width: '35%', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                    <TouchableOpacity activeOpacity={.7} style={styles.frame2vJu1}>
                                                        <Text style={styles.getStartednru}>Saved</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                        </View>
                                    </Fragment>
                                </View>
                            ))}
                            {/* </View>
                            } */}
                            {businessDetails.rewardData && businessDetails.rewardData.length > 0 && <View style={{ paddingHorizontal: '3%' }}>
                                <Text style={styles.loyaltyRewards}>Loyalty Rewards</Text>
                                <Text style={styles.subheading}>Earn {businessDetails.rewardData[0].claimPointBusinessGroup} pt for every {businessDetails.rewardData[0].reclaimHours} hours</Text>
                                {businessDetails.rewardData && businessDetails.rewardData.map((rewards, index) => (
                                    <Fragment key={index}>
                                        <Text style={{ fontWeight: '600', fontSize: 16, marginTop: '5%', paddingHorizontal: '2%' }}>
                                            {rewards.rewardName}
                                        </Text>
                                        {rewards.currentPoints != null && <Progress.Bar
                                            style={styles.progressBar}
                                            progress={1 - ((rewards.pendingToAchiveValue) / rewards.achivableTargetValue)}
                                            width={250}
                                            color='#2ac95d' />}
                                        {rewards.currentPoints != null && <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: '2%', marginTop: '1%' }}>
                                            <Text style={{ color: '#717679' }}> {rewards.currentPoints} / {rewards.achivableTargetValue} pts</Text>
                                            {rewards.pendingToAchiveValue > 0 && <Text style={{ color: '#717679' }}>{rewards.pendingToAchiveValue} pts left</Text>}
                                            {rewards.pendingToAchiveValue <= 0 && <Text style={{ color: '#717679' }}>Redeem</Text>}
                                        </View>}
                                    </Fragment>
                                ))}
                            </View>}
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
                                {businessDetails.businesswiseWorkingDays && businessDetails.businesswiseWorkingDays.map((day, index) => (
                                    <Text key={index} style={{ marginTop: '1%', fontWeight: '700', color: '#717679', paddingHorizontal: '2%', fontSize: 12 }}>
                                        {`${day.dayName}: ${day.fromTime} - ${day.toTime}`}
                                    </Text>
                                ))}
                            </View>
                            {businessDetails.adress && <View style={{ paddingHorizontal: '3%' }} >
                                <Text style={styles.adressHeading}>Address:</Text>
                                <Text style={{ color: '#8c9194', fontSize: 14, marginTop: '2%', paddingHorizontal: '2%' }}>{businessDetails.adress}</Text>
                            </View>}
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
                                                        "color": "#c8d6e3"
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
                            {businessDetails.phoneNo && <View style={{ paddingHorizontal: '3%' }} >
                                <Text style={styles.adressHeading}>Phone:</Text>
                                {businessDetails.phoneNo && <Text style={{ color: '#8c9194', fontSize: 14, marginTop: '2%', paddingHorizontal: '2%' }}>
                                    {businessDetails.phoneNo.replace(/(\d{3})(\d{3})(\d{4})/, (_, a, b, c) => `(${a}) ${b}-${c}`)}
                                </Text>}
                            </View>}
                            {businessDetails.descriptions && <View style={{ paddingHorizontal: '3%' }} >
                                <Text style={styles.adressHeading}>Description:</Text>
                                <Text style={{ color: '#8c9194', fontSize: 14, marginTop: '2%', marginBottom: '3%', paddingHorizontal: '2%' }}>
                                    {businessDetails.descriptions}
                                </Text>
                            </View>}
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
    frame2vJu: {
        backgroundColor: '#3381a3',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        paddingVertical: 8,
        marginTop: 7,
        width: '98%',
        height: 40
    },
    frame2vJu1: {
        backgroundColor: '#a3b4be',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        paddingVertical: 8,
        marginTop: 7,
        width: '98%',
        height: 40
    },
    getStartednru: {
        // lineHeight: 22.5,
        textTransform: 'uppercase',
        fontFamily: 'SatoshiVariable, SourceSansPro',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: 18,
        color: '#ffffff',
        flex: 10,
        zIndex: 10,
        textAlign: 'center',
    },
    progressBar: {
        marginTop: '1%',
        left: 10
    },
    workingDays: {
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
        marginTop: '7%',
        fontWeight: '700',
        fontSize: 18
    },
    Promotion: {
        marginTop: '12%',
        fontWeight: '700',
        fontSize: 18
    },
    detailView: {
        backgroundColor: 'white',
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
        alignSelf: 'center',
    },
    setimg2: {
        width: 50,
        height: 50,
        marginTop: 15,
        alignSelf: 'center',
    }
})