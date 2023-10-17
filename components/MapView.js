import { StyleSheet, View, Text, Image, TextInput } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import customIcon from '../assets/location.png';
import GeoLocation from 'react-native-geolocation-service';
import { PERMISSIONS } from 'react-native-permissions';

export default function MapViewing({ navigation }) {
    const [initialRegion, setInitialRegion] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    // const navigation = useNavigation();
    const navigateToList = () => {
        navigation.navigate("TabNavigation");
    }
    const markers = [
        { title: 'Fortune Plus Oswego LLC', coordinate: { latitude: 23.23173, longitude: 72.67351 } },
        { title: 'Fortune Plus LLC', coordinate: { latitude: 22.2457, longitude: 68.96494 } },
        { title: 'Fortune’s Cafe - Carpentersville', coordinate: { latitude: 20.88799, longitude: 70.40116 } },
        { title: 'Fortune Plus South Elgin LLC', coordinate: { latitude: 23.58333, longitude: 72.13344 } },
        { title: 'Fortune Plus - Melrose Park', coordinate: { latitude: 23.59948, longitude: 72.39153 } },
    ];

    useEffect(() => {
        if (markers.length > 0) {
            const sumLat = markers.reduce((acc, marker) => acc + marker.coordinate.latitude, 0);
            const sumLong = markers.reduce((acc, marker) => acc + marker.coordinate.longitude, 0);
            const centerLat = sumLat / markers.length;
            const centerLong = sumLong / markers.length;

            setInitialRegion({
                latitude: centerLat,
                longitude: centerLong,
                longitudeDelta: 5.13,
                latitudeDelta: 0.011
            });
        }
    }, []);

    useEffect(() => {
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
        GeoLocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });

                setInitialRegion({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    longitudeDelta: 5.13,
                    latitudeDelta: 0.011
                });
            },
            (error) => console.error("Error getting location", error),
            {
                enableHighAccuracy: true,
                timeout: 2000,
                maximumAge: 1000
            }
        )
    })
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
                    // minZoomLevel={15}
                    showsMyLocationButton={true}
                    pitchEnabled={true}
                >
                    {userLocation && (
                        <Marker
                            coordinate={userLocation}
                            title="My Location"
                            image={customIcon}
                        />
                    )}
                    {markers.map((marker, index) => (
                        <Marker
                            key={index}
                            coordinate={marker.coordinate}
                            title={marker.title}
                            image={customIcon} />
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