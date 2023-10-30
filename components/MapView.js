import { StyleSheet, View, Text, Image, TextInput, PermissionsAndroid } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, CalloutSubview } from 'react-native-maps';
import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import customIcon from '../assets/casinoIcon.png';
import currentIcon from '../assets/currentlocation.png';
import GeoLocation from 'react-native-geolocation-service';
// import { PERMISSIONS } from 'react-native-permissions';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
// import * as Location from 'expo-location';
import Geolocation from '@react-native-community/geolocation';
import Globals from './Globals';
import axios from 'axios';
// import { Button } from 'react-native-paper';

export default function MapViewing({ navigation }) {
    const [initialRegion, setInitialRegion] = useState(null);
    const [markerForOther, setMarkersForOtherBusiness] = useState({ title: '', coordinate: { latitude: 0.00000, longitude: 0.00000 } });
    const [locationPermission, setLocationPermission] = useState(null);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    lang = 0;
    lat = 0;
    const [businessData, setBusinessData] = useState([{}]);
    const businessGroupID = "1";
    const baseUrl = Globals.API_URL + "/BusinessProfiles/GetBusinessProfilesByGroupID"

    const navigateToList = () => {
        navigation.navigate("TabNavigation");
    }
    const markerClick = () => {
        console.log('sdfsdfsf');
    }
    useEffect(() => {
        requestLocationPermission();
        axios({
            method: 'GET',
            url: `${baseUrl}/${businessGroupID}`
        })
            .then(async response => {
                await setBusinessDataWhole(response.data);
            })
            .catch((error) => {
                console.error("Error fetching data", error)
            });
    }, []);
    async function setLangandLat(latitude, longitude) {
        lang = longitude,
            lat = latitude
    }
    async function setBusinessDataWhole(data) {
        setBusinessData(data);
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
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
                await setLangandLat(latitude, longitude);
                await setMarkers(latitude, longitude);
                // You can now use the latitude and longitude in your app
            },
            error => {
                console.error('Error getting current location: ', error);
            },
            { enableHighAccuracy: false, timeout: 5000 }
        );
    };
    const justconsole = async () => {
        console.log('dsfsdfsfdsfds');
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
                getCurrentLocation();
                console.log('Location permission granted');
                // You can now access the location
            } else if (permissionStatus === RESULTS.DENIED) {
                const newPermissionStatus = await request(
                    Platform.OS === 'ios'
                        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
                );

                if (newPermissionStatus === RESULTS.GRANTED) {
                    getCurrentLocation();
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
    console.log(businessData);
    return (
        <View style={styles.container}>

            <Text style={styles.textWhere}> Where to go? </Text>

            <Image style={styles.notificationLbl} source={require('../assets/notification-oRK.png')} />

            <View style={styles.searchBoxMain}>
                <TextInput style={styles.searchInput} placeholder='Search..' />
                <Image style={styles.magnifyingGlass} source={require('../assets/magnifyingglass-qQV.png')} />
                <View style={styles.mainMapImage}>
                    <TouchableHighlight onPress={() => navigation.navigate('Locations')}>
                        <Image style={styles.mapImage} source={require('../assets/maptrifold-iCR.png')} />
                    </TouchableHighlight>
                </View>
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
                            title="My Location"
                            image={currentIcon}
                            style={{ width: 5, height: 5 }}
                        />
                    )}
                    {businessData && businessData.map((business, index) => (
                        business.latitude && <Marker
                            key={index}
                            coordinate={{ latitude: parseFloat(business.latitude), longitude: parseFloat(business.longitude) }}
                            image={customIcon}>
                            <Callout onPress={() => navigation.navigate('BusinessDetailView', { id: business.id })} style={styles.locationbuttoncallout}>
                                <TouchableHighlight >
                                    <Text>
                                        {business.businessName}
                                    </Text>
                                </TouchableHighlight >

                            </Callout>
                        </Marker>
                    ))}
                </MapView>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    searchBoxMain: {
        marginLeft: '2%',
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        marginTop: '10%'
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
        width: '50%',
        padding: 13.97,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        flex: 1,
        marginRight: '5%'
    },
    mapImage: {
        width: 26,
        height: 24,
    },
    mainMapImage: {
        padding: 15,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#3380a3',
        borderRadius: 8,
        flexShrink: 0,
        marginRight: '2%'
    },
    magnifyingGlass: {
        height: 26.028,
        resizeMode: 'contain',
        backgroundColor: 'transparent',
        marginLeft: '50%',
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
        marginTop: '5%'
    },
    mapView: {
        width: '100%',
        height: '100%',
    }
})