import { StyleSheet, View, Text, Image, TextInput, PermissionsAndroid, SafeAreaView, BackHandler, Alert } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, CalloutSubview } from 'react-native-maps';
import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useCallback } from 'react';
import customIcon from '../assets/casinoIcon.png';
import currentIcon from '../assets/currentlocation.png';
import GeoLocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import * as Location from 'expo-location';
import Geolocation from '@react-native-community/geolocation';
import Globals from './Globals';
import axios from 'axios';
import { Button } from 'react-native-paper';
import { isLocationEnabled } from 'react-native-android-location-enabler';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import Spinner from 'react-native-loading-spinner-overlay';
import { useNetInfo } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function MapViewing({ navigation }) {
    const isFocused = useIsFocused();
    const [filteredData, setFilteredData] = useState('');
    const [initialRegion, setInitialRegion] = useState(null);
    const [markerForOther, setMarkersForOtherBusiness] = useState({ title: '', coordinate: { latitude: 0.00000, longitude: 0.00000 } });
    const [locationPermission, setLocationPermission] = useState(null);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    lang = 0;
    lat = 0;
    const [businessData, setBusinessData] = useState([{}]);
    const businessGroupID = "1";
    const baseUrl = Globals.API_URL + "/BusinessProfiles/GetBusinessProfilesForMobile"
    const [loading, setLoading] = useState(false);
    const netinfo = useNetInfo();

    async function handleCheckPressed() {
        if (Platform.OS === 'android') {
            const checkEnabled = await isLocationEnabled();
            if (!checkEnabled) {
                await handleEnabledPressed();
                // await getCurrentLocation();
            }
        }
    }

    const backPressed = () => {
        BackHandler.exitApp();
        navigation.navigate('LandingScreen');
    };

    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener('hardwareBackPress', backPressed);
            return () => {
                BackHandler.removeEventListener('hardwareBackPress', backPressed);
            };
        }, []));

    useEffect(() => {
        console.log('netinfo', netinfo)
        setLoading(true);
        requestLocationPermission();
        checkApplicationPermission();

        AsyncStorage.getItem('token')
            .then(async (value) => {
                if (value !== null) {
                    // memberID = (JSON.parse(value))[0].memberId;
                    axios({
                        method: 'GET',
                        url: `${baseUrl}/${(JSON.parse(value))[0].memberId}`
                    })
                        .then(async response => {
                            console.log('businesdata-----', response.data)
                            await setBusinessDataWhole(response.data);
                            setLoading(false);
                        })
                        .catch((error) => {
                            console.error("Error fetching data", error);
                            setLoading(false);
                        });
                }
            })
            .catch(error => {
                console.error('Error retrieving dataa:', error);
            });

        setLoading(false);

    }, [isFocused]);

    async function setLangandLat(latitude, longitude) {
        lang = longitude,
            lat = latitude
    }
    async function setBusinessDataWhole(data) {
        setBusinessData(data);
        setFilteredData(data);
    }
    async function setMarkers(centerLat, centerLong) {
        setInitialRegion({
            latitude: centerLat,
            longitude: centerLong,
            longitudeDelta: (0.0922 * 2),
            latitudeDelta: 0.0922
        });
    }
    const getCurrentLocation = async () => {
        Geolocation.getCurrentPosition(
            async position => {
                const { latitude, longitude } = position.coords;
                console.log('position.coords', latitude)
                await setLangandLat(position.coords.latitude, position.coords.longitude);
                await setMarkers(position.coords.latitude, position.coords.longitude);
                // You can now use the latitude and longitude in your app
            },
            error => {
                console.error('Error getting current location: ', error);
            },
            { enableHighAccuracy: false, timeout: 10000 }
        );
    };

    async function handleEnabledPressed() {
        if (Platform.OS === 'android') {
            try {
                const enableResult = await promptForEnableLocationIfNeeded();
                // if (enableResult) {
                // await getCurrentLocation();
                // }
            } catch (error) {
                if (error instanceof Error) {
                    console.error(error.message);
                }
            }
        }
    }

    const checkApplicationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                );
            } catch (error) {
            }
        }
    }

    const requestLocationPermission = async () => {
        try {
            let permissionStatus;

            if (Platform.OS === 'ios') {
                permissionStatus = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
            } else if (Platform.OS === 'android') {
                permissionStatus = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
            }

            if (permissionStatus === RESULTS.GRANTED) {
                await handleCheckPressed();
                await getCurrentLocation();
                // You can now access the location
            } else if (permissionStatus === RESULTS.DENIED) {
                const newPermissionStatus = await request(
                    Platform.OS === 'ios'
                        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
                );

                if (newPermissionStatus === RESULTS.GRANTED) {
                    await handleCheckPressed();
                    await getCurrentLocation();
                    console.log('Location permission granted');
                    // You can now access the location
                } else {
                    console.log('Location permission denied');
                }
            }
        } catch (error) {
            console.error('Error checking/requesting location permission: ', error);
        }
    };

    const handleInputChange = (text) => {
        if (text === '') {
            setFilteredData(businessData);
        } else {
            let data = businessData.filter(item => item.metaData.toLowerCase().includes(text.toLowerCase()));
            setFilteredData(data);
        }
    }

    return (
        <View style={styles.container}>

            <View style={{ flexDirection: 'row', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.welcomeText}>Where to go?</Text>
                <TouchableOpacity activeOpacity={.9} onPress={() => navigation.navigate('NotificationTray')}>
                    <Image source={require('../assets/notification-oRK.png')} style={styles.setimg1} />
                </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', width: '100%', height: 75, marginTop: 20, }}>
                <View style={{ width: '82%', paddingHorizontal: '2%', height: '70%' }}>
                    <TextInput style={styles.searchInput} placeholder='Search..' onChangeText={text => handleInputChange(text)} />
                    <Image style={styles.magnifyingGlass} source={require('../assets/magnifyingglass-qQV.png')} />
                </View>
                <TouchableOpacity activeOpacity={.7} onPress={() => navigation.navigate('Locations')}
                    style={{ width: '16%', height: '70%', marginRight: '2%' }}>
                    <View style={styles.mainMapImage}>
                        <Image style={styles.mapImage} source={require('../assets/listImg.png')} />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.mapViewMain}>
                <MapView
                    style={styles.mapView}
                    provider={PROVIDER_GOOGLE}
                    region={initialRegion}
                    showsMyLocationButton={true}
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
                            title="My Location">
                            <Image
                                source={(currentIcon)}
                                style={{ width: 32, height: 32 }}
                                resizeMode="contain"
                            />
                        </Marker>
                    )}
                    {filteredData && filteredData.map((business, index) => (
                        business.latitude && <Marker
                            key={index}
                            coordinate={{ latitude: parseFloat(business.latitude), longitude: parseFloat(business.longitude) }}>
                            <Image
                                source={{ uri: Globals.Root_URL + business.mapIconPath }}
                                style={{ width: 32, height: 32, }}
                                resizeMode="contain"
                            />
                            <Callout onPress={() => navigation.navigate('BusinessDetailView', { id: business.id })}
                                style={styles.locationbuttoncallout}>
                                <TouchableHighlight style={{ width: 180 }} >
                                    <Text style={{ textAlign: 'center' }}>
                                        {business.businessName}
                                    </Text>
                                </TouchableHighlight >
                            </Callout>
                        </Marker>
                    ))}
                </MapView>
            </View>

            <SafeAreaView>
                <View style={styles.container}>
                    <Spinner
                        visible={loading}
                        textContent={''}
                        textStyle={styles.spinnerStyle} />
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    setimg1: {
        width: 50,
        height: 50,
        marginTop: -16,
        position: 'absolute',
        alignSelf: 'flex-end',
        right: -25
    },
    welcomeText: {
        color: 'black',
        fontSize: 22,
        fontWeight: '800',
        // marginTop: '5%',
        textAlign: 'center',
        width: '80%'
    },
    searchBoxMain: {
        marginLeft: '3%',
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        marginTop: '5%'
    },
    locationbuttoncallout: {
        borderradius: 0,
        opacity: 0.8,
        backgroundcolor: "lightgrey",
    },
    customView: {
        marginLeft: '2%',
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        marginTop: '10%'
    },
    calloutText: {
        marginLeft: '2%',
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        marginTop: '10%'
    },
    searchInput: {
        width: '100%',
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#ffffff',
        borderRadius: 8,
    },
    mapImage: {
        width: 26,
        height: 24,
        // backgroundColor: '#3380a3',
    },
    mainMapImage: {
        backgroundColor: '#3380a3',
        borderRadius: 8,
        flexShrink: 0,
        width: '100%',
        padding: 25,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    magnifyingGlass: {
        height: 25,
        resizeMode: 'contain',
        backgroundColor: 'transparent',
        right: 0,
        top: '20%',
        position: 'absolute'
    },
    notificationLbl: {
        width: 49,
        height: 49,
        resizeMode: 'contain',
        flex: 1,
        left: '85%',
        position: 'absolute',
        top: '2%',
    },
    textWhere: {
        textAlign: 'center',
        fontSize: 25,
        fontWeight: '900',
        color: '#000000',
        fontFamily: 'Satoshi Variable, "Source Sans Pro"',
        marginTop: '2%',
        top: '2%'
    },
    container: {
        width: '100%',
        height: '100%',
        flex: 0,
        position: 'relative',
        backgroundColor: '#d9e7ed',
    },
    mapViewMain: {
        position: 'relative',
        flex: 0,
        // marginTop: 15,
    },
    mapView: {
        width: '100%',
        height: '100%',
    }
})