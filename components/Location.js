import { TextInput, TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Avatar, Card, Drawer, Title } from 'react-native-paper';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { FlatList } from 'react-native-gesture-handler';
import MapViewing from './MapView';
import { createStackNavigator } from '@react-navigation/stack';


const Location = ({ navigation }) => {

    // const navigation = useNavigation();
    const [userData, setUserData] = useState('');
    const userId = "1";
    const imagePath = "http://ho.hitechprojects.co.in:8101/wwwroot/bg-01.png";
    const baseUrl = "http://ho.hitechprojects.co.in:8101/api/BusinessProfiles/GetBusinessProfilesByGroupID"
    const NavigateToMapView = () => {
        navigation.navigate("MapView")
    }
    useEffect(() => {
        axios({
            method: 'GET',
            url: `${baseUrl}/${userId}`
        })
            .then(response => {
                setUserData(response.data);
                console.log(response.data[0])
            })
            .catch((error) => {
                console.error("Error fetching data", error)
            });
    }, []);


    return (
        <>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.textWhere}> Where to go? </Text>
                    <Image style={styles.notificationLbl} source={require('../assets/notification-oRK.png')} />
                </View>
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
                                <Card style={styles.card}>
                                    <Card.Cover source={{ uri: imagePath }} style={styles.cardCover} />
                                    <Card.Title style={styles.avatarImg} left={() => <Avatar.Image size={50} left="70%" source={require('../assets/image-4-LPb.png')} />} />
                                    <Card.Content style={styles.cardContent}>
                                        <Title>{item.businessName}</Title>
                                        <Text> {item.industry} </Text>
                                    </Card.Content>
                                </Card>
                            );
                        }}
                    />
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    cardContent: {
        margin: '2%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        bottom: '20%',
        left: '22%',
        padding: '2%'
    },
    avatarImg: {
        width: '2%'
    },
    cardCover: {
        padding: '2%'
    },
    card: {
        marginBottom: 10,
    },
    store: {
        marginLeft: 8,
        marginRight: 8,
        width: '95%',
        position: 'relative',
        flexShrink: 0,
        marginTop: '2%',
        flexDirection: 'column'
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
        marginLeft: '50%',
        position: 'absolute'
    },
    searchInput: {
        width: '50%',
        padding: 13.97,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        flex: 1,
        marginRight: '5%'
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
    container: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#d9e7ed',
        flexShrink: 0,
    }
})

export default Location;