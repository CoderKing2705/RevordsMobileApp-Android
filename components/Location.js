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
import { useIsFocused } from '@react-navigation/native';
import { isLocationEnabled } from 'react-native-android-location-enabler';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Location = ({ navigation }) => {
    const focus = useIsFocused();
    const [search, setSearch] = useState('');
    const [filteredData, setFilteredData] = useState('');
    lang = 0;
    lat = 0;
    const [loadingData, setLoadingData] = useState(true);
    const [userData, setUserData] = useState('');
    const userId = "1";
    const baseUrl = Globals.API_URL + "/BusinessProfiles/GetBusinessProfilesForMobile"
    const getCurrentLocation = async () => {
        Geolocation.getCurrentPosition(
            async position => {
                const { latitude, longitude } = position.coords;

                await setLangandLat(latitude, longitude);
                // You can now use the latitude and longitude in your app
            },
            error => {
                console.error('Error getting current location: ', error);
            },
            { enableHighAccuracy: false, timeout: 5000 }
        );
    };
    async function handleCheckPressed() {
        if (Platform.OS === 'android') {
            const checkEnabled = await isLocationEnabled();

            if (!checkEnabled) {
                await handleEnabledPressed();
            }
            else {
                await getData();
            }
        }
    }

    async function handleEnabledPressed() {
        if (Platform.OS === 'android') {
            try {
                const enableResult = await promptForEnableLocationIfNeeded();
                await getData();

            } catch (error) {
                if (error instanceof Error) {
                    console.error(error.message);
                }
            }
        }
    }

    async function setLangandLat(latitude, longitude) {
        lang = longitude,
            lat = latitude
    }

    NavigateToBusinessDetails = (item) => {
        navigation.navigate("BusinessDetailView", { id: item })

    }

    const getData = async () => {
        setLoadingData(true);

        AsyncStorage.getItem('token')
            .then(async (value) => {
                if (value !== null) {
                    // memberID = (JSON.parse(value))[0].memberId;
                    await axios({
                        method: 'GET',
                        url: `${baseUrl}/${(JSON.parse(value))[0].memberId}`
                    }).then(async response => {
                        await Geolocation.getCurrentPosition(
                            async position => {
                                const { latitude, longitude } = position.coords;

                                await setLangandLat(latitude, longitude);
                                // You can now use the latitude and longitude in your app

                                await response.data.map((data1, index) => {


                                    const toRadian = n => (n * Math.PI) / 180
                                    let lat2 = data1.latitude
                                    let lon2 = data1.longitude
                                    let lat1 = lat
                                    let lon1 = lang

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
                                    data1.distance = parseInt(d * 0.621371);
                                })

                                response.data = response.data.sort((a, b) => { return a.distance - b.distance });
                                await setUserData(response.data);
                                await setFilteredData(response.data);
                                setLoadingData(false)
                            },
                            error => {
                                console.error('Error getting current location: ', error);
                                setLoadingData(false)
                            },
                            { enableHighAccuracy: false, timeout: 5000 }
                        );


                    }).catch((error) => {
                        console.error("Error fetching data", error)
                    });
                }
            })
            .catch(error => {
                console.error('Error retrieving dataa:', error);
            });


    }

    useEffect(() => {
        handleCheckPressed();
    }, [focus]);

    // const [query, setQuery] = useState('');
    // const [menuVisible, setMenuVisible] = useState(false);
    // const [suggestions, setSuggestions] = useState([
    //     'Apple', 'Banana', 'Cherry', 'Date', 'Grapes', 'Lemon', 'Orange', 'Peach', 'Pear', 'Plum'
    // ]);

    // const handleInputChange = (text) => {
    //     // Update the query and filter the suggestions based on the input
    //     setQuery(text);
    //     const filteredSuggestions = suggestions.filter(item =>
    //         item.toLowerCase().includes(text.toLowerCase())
    //     );
    //     setSuggestions(filteredSuggestions);
    // };

    // const handleItemPress = (item) => {
    //     // Set the selected suggestion as the input value
    //     setQuery(item);
    //     // Clear the suggestions
    //     setSuggestions([]);
    // };

    const handleInputChange = (text) => {
        if (text === '') {
            setFilteredData(userData);
        } else {
            let data = userData.filter(item => item.metaData.toLowerCase().includes(text.toLowerCase()));
            setFilteredData(data);
        }
    }

    return (
        <>
            <View style={styles.container}>
                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', width: '97%', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={styles.welcomeText}>Where to go?</Text>
                        <TouchableOpacity activeOpacity={.7} onPress={() => navigation.navigate('NotificationTray')}>
                            <Image source={require('../assets/notification-oRK.png')} style={styles.setimg1} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '97%', height: '90%', marginTop: 10 }}>
                        <View style={styles.searchBoxMain}>
                            <TextInput style={styles.searchInput} placeholder='Search..' onChangeText={text => handleInputChange(text)}
                            // value={query}
                            //     onChangeText={handleInputChange} onFocus={() => setMenuVisible(true)} 
                            />
                            {/* {menuVisible && <FlatList
                                style={styles.autocompleteList}
                                data={suggestions}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => handleItemPress(item)}>
                                        <Text style={styles.suggestionItem}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />} */}
                            <Image style={styles.magnifyingGlass} source={require('../assets/magnifyingglass-qQV.png')} />
                            <TouchableOpacity style={{ width: '16%', marginRight: '2%', }} activeOpacity={.7} onPress={() => navigation.navigate("MapViewing")}>
                                <View style={styles.mainMapImage}>
                                    <Image style={styles.mapImage} source={require('../assets/mapImg.png')} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.store}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={filteredData}
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
                                                {(item.businessName).toString().length < 25 && <Title style={{ fontSize: 16, fontWeight: '800', color: '#3b3939' }}> {item.businessName}</Title>}
                                                {(item.businessName).toString().length >= 25 && <Title style={{ fontSize: 16, fontWeight: '800', color: '#3b3939' }}> {(item.businessName).toString().substring(0, 25)}...</Title>}
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
    // autocompleteList: {
    //     marginTop: 10,
    //     top: '100%',
    //     width: '100%',
    //     position: 'absolute',
    //     zIndex: 15,
    //     backgroundColor: 'white'
    // },
    // suggestionItem: {
    //     padding: 10,
    //     fontSize: 18,
    //     borderBottomWidth: 1,
    //     borderBottomColor: 'lightgray',
    // },
    cardContent: {
        marginHorizontal: '2%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        bottom: '25%',
        left: '27%',
    },
    avatarImg: {
        height: '100%',
        // height: 50,
        width: 100,
        left: -7,
    },
    cardCover: {
        height: '70%',
        width: '100%'
    },
    card: {
        marginBottom: 10,
        height: 300,
        width: '100%',
    },
    store: {
        width: '97%',
        flexShrink: 0,
        marginTop: '2%',
        alignSelf: 'center',
        // marginBottom: '20%',
        height: '90%'
    },
    mapImage: {
        width: 26,
        height: 24,
        objectFit: 'contain',
    },
    mainMapImage: {
        padding: 15,
        // paddingHorizontal: 23,
        // paddingBottom: 15,
        // paddingLeft: 24,
        // height: '100%',
        backgroundColor: '#3380a3',
        borderRadius: 8,
        flexShrink: 0,
        // marginRight: '2%',
        width: '100%',
        alignItems: 'center'
    },
    magnifyingGlass: {
        height: 26.028,
        resizeMode: 'contain',
        backgroundColor: 'transparent',
        marginLeft: '50%',
        position: 'absolute'
    },
    searchInput: {
        width: '50%',
        height: 50,
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
        flexShrink: 0,
        height: 50,
        marginTop: 10
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
        right: -27
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
        // marginTop: '5%',
        textAlign: 'center',
        width: '80%'
    },
})

export default Location;