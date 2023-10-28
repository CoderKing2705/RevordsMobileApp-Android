import { TextInput, TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Avatar, Card, Drawer, Title } from 'react-native-paper';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Spinner from 'react-native-loading-spinner-overlay';
import Globals from './Globals';
import Geolocation from '@react-native-community/geolocation';

const Location = ({ navigation }) => {
    lang = 0;
    lat = 0;
    const [loadingData, setLoadingData] = useState(true);
    const [userData, setUserData] = useState('');
    const userId = "1";
    const baseUrl = Globals.API_URL + "/BusinessProfiles/GetBusinessProfilesByGroupID"
    const getCurrentLocation = async () => {
        Geolocation.getCurrentPosition(
            async position => {
                const { latitude, longitude } = position.coords;
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
                await setLangandLat(latitude, longitude);
                // You can now use the latitude and longitude in your app
            },
            error => {
                console.error('Error getting current location: ', error);
            },
            { enableHighAccuracy: false, timeout: 5000 }
        );
    };
    async function setLangandLat(latitude, longitude) {
        lang = longitude,
            lat = latitude
    }

    async function calculateDistance(lattitude1, longittude1, lattitude2, longittude2) {

        return d
    }

    const NavigateToMapView = () => {
        navigation.navigate("MapView")
    }

    NavigateToBusinessDetails = (item) => {
        navigation.navigate("BusinessDetailView", { id: item })
        console.log(item);
    }

    useEffect(() => {
        setLoadingData(true);
        getCurrentLocation();
        axios({
            method: 'GET',
            url: `${baseUrl}/${userId}`
        }).then(async response => {
            await response.data.map((data1, index) => {
                console.log("current lat.", lat)
                console.log("current lon.", lang)
                console.log("b lat.", data1.latitude)
                console.log("b lon.", data1.longitude)

                const toRadian = n => (n * Math.PI) / 180
                let lat2 = data1.latitude
                let lon2 = data1.longitude
                let lat1 = lat
                let lon1 = lang
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
                console.log("distance==?", (d * 0.621371))
                data1.distance = parseInt(d * 0.621371);
            })
            await setUserData(response.data);
            setLoadingData(false)
        }).catch((error) => {
            console.error("Error fetching data", error)
        });
    }, []);
    console.log(userData)
    return (
        <>
            <View style={styles.container}>
                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', width: '97%', height: '10%', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={styles.welcomeText}>Where to go?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ProfileEdit', { MemberData: MemberData })}>
                            <Image source={require('../assets/notification-oRK.png')} style={styles.setimg1} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '97%', height: '90%', marginTop: '5%' }}>
                        <View style={styles.searchBoxMain}>
                            <TextInput style={styles.searchInput} placeholder='Search..' />
                            <Image style={styles.magnifyingGlass} source={require('../assets/magnifyingglass-qQV.png')} />
                            <View style={styles.mainMapImage}>
                                <TouchableOpacity onPress={() => navigation.navigate("MapViewing")}>
                                    <Image style={styles.mapImage} source={require('../assets/maptrifold-iCR.png')} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.store}>
                            <FlatList
                                data={userData}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => {
                                    return (
                                        <Card style={styles.card} onPress={() => this.NavigateToBusinessDetails(item.id)}>
                                            <Card.Cover source={{ uri: Globals.Root_URL + item.imagePath }} style={styles.cardCover} />
                                            <Card.Title
                                                left={() =>
                                                    <Image style={styles.avatarImg} source={{ uri: Globals.Root_URL + item.logoPath }}></Image>
                                                }
                                            />
                                            <Card.Content style={styles.cardContent}>
                                                <Title style={{ fontSize: 16, fontWeight: '800', color: '#3b3939' }}> {item.businessName}</Title>
                                                <Text style={{ color: '#717679', fontWeight: '500' }}> {item.industry} </Text>
                                                <Text style={styles.milesText}> {item.distance} mi </Text>
                                            </Card.Content>
                                        </Card>
                                    );
                                }}
                            />
                        </View>
                    </View>
                </View>

                <SafeAreaView>
                    <View style={styles.container}>
                        <Spinner
                            visible={loadingData}
                            textContent={''}
                            textStyle={styles.spinnerStyle} />
                    </View>
                </SafeAreaView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    cardContent: {
        marginHorizontal: '2%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        bottom: '25%',
        left: '27%',
        // padding: '2%'
    },
    avatarImg: {
        // width: '2%'
        height: 50,
        width: 100
    },
    cardCover: {
        // padding: '2%'
        height: '70%',
        width: '100%'
    },
    card: {
        marginBottom: 10,
        height: 300,
        width: '100%',
    },
    store: {
        // marginLeft: 8,
        // marginRight: 8,
        width: '97%',
        // position: 'relative',
        flexShrink: 0,
        marginTop: '2%',
        alignSelf: 'center',
        marginBottom: '20%'
        // flexDirection: 'column'
    },
    mapImage: {
        width: 26,
        height: 24,
        objectFit: 'contain',
    },
    mainMapImage: {
        padding: 15,
        paddingHorizontal: 23,
        paddingBottom: 15,
        paddingLeft: 24,
        height: '100%',
        backgroundColor: '#3380a3',
        borderRadius: 8,
        flexShrink: 0,
        marginRight: '2%'
    },
    magnifyingGlass: {
        height: 26.028,
        resizeMode: 'contain',
        backgroundColor: 'transparent',
        marginLeft: '45%',
        position: 'absolute'
    },
    searchInput: {
        width: '50%',
        padding: 13.97,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        flex: 1,
        marginRight: '2%'
    },
    searchBoxMain: {
        marginLeft: '2%',
        flexDirection: 'row',
        alignItems: 'center',
        display: 'flex',
        flexShrink: 0
    },
    notificationLbl: {
        width: 48,
        height: 48,
        resizeMode: 'contain',
        flex: 0,
        marginTop: '1%',
        left: '190%'
    },
    textWhere: {
        marginLeft: '2%',
        fontSize: 23,
        fontWeight: '900',
        color: '#000000',
        fontFamily: 'Satoshi Variable, "Source Sans Pro"',
    },
    header: {
        margin: '2%',
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: '15%'
    },
    grpSearch: {
        padding: '0rem 0.8rem 1.6rem 0.7rem',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 0,
        flexDirection: 'row'
    },
    // container: {
    //     width: '100%',
    //     height: '100%',
    //     overflow: 'hidden',
    //     position: 'relative',
    //     backgroundColor: '#d9e7ed',
    //     flexShrink: 0,
    // }

    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center',
    },

    setimg1: {
        width: 50,
        height: 50,
        marginTop: -16,
        position: 'absolute',
        alignSelf: 'flex-end',
        right: -20
    },
    milesText: {
        color: '#73a5bc',
        fontSize: 14,
        fontWeight: '700'
    },
    welcomeText: {
        color: 'black',
        fontSize: 22,
        fontWeight: '800',
        marginTop: '5%',
        textAlign: 'center',
        width: '80%'
    },
})

export default Location;