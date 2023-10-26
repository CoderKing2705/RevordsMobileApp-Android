import axios from 'axios';
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { StyleSheet, Image, Text, View } from 'react-native';
import { Card } from 'react-native-paper';
import Globals from '../components/Globals';

const Favourite = ({ navigation, route }) => {
    const wishListUrl = 'http://ho.hitechprojects.co.in:8101/api/MembersWishLists/GetMemberWishListByMemberID';
    const [wishList, setWishList] = useState([]);
    const logoPath = wishList[0] ? wishList[0].logoPath : null;
    const logoUrl = Globals.Root_URL + `${logoPath}`;
    useEffect(() => {
        axios({
            method: 'GET',
            url: `${wishListUrl}/2`
        }).then((response) => {
            setWishList(response.data)
            // console.log("22222")
            console.log(wishList[0].logoPath)
        });
    }, []);
    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Favourite</Text>
            <Image style={styles.notificationImg} source={require('../assets/notification-skD.png')} />
            <View style={styles.wishlistView}>
                {wishList.map((item, index) => (
                    <View key={index} style={styles.listView}>
                        <Image source={{ uri: logoUrl }} style={styles.logoBusiness} />
                        <Image source={require('../assets/heart-dNh.png')} style={styles.likeHeart} />
                        <Text style={styles.totalLikes}> {item.totalLikes} likes </Text>
                        <Text style={styles.businessName}>{item.businessName}</Text>
                        <Text style={styles.industry}> {item.industry} </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    industry: {
        color: '#717679',
        fontWeight:'700',
        fontSize:15,
        bottom:'15%'
    },
    totalLikes: {
        alignSelf: 'flex-end',
        bottom: '56%',
        right: '5%'
    },
    likeHeart: {
        width: 24,
        height: 21,
        alignSelf: 'flex-end',
        right: '20%',
        bottom: '40%'
    },
    businessName: {
        fontWeight: '800',
        fontSize: 18,
        color: '#000000',
        bottom: '23%'
    },
    logoBusiness: {
        height: 50,
        width: 100
    },
    listView: {
        padding: '5%',
        margin: '2%',
        backgroundColor: 'white',
        borderRadius: 15,
        width: 360
    },
    wishlistView: {
        padding: '10%',
        margin: '2%',
    },
    notificationImg: {
        width: 49,
        height: 49,
        resizeMode: 'contain',
        flex: 1,
        left: '85%',
        position: 'absolute',
        top: '1%',
    },
    welcomeText: {
        textAlign: 'center',
        fontSize: 25,
        fontWeight: '900',
        color: '#000000',
        fontFamily: 'Satoshi Variable, "Source Sans Pro"',
        top: '2%'
    },
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center'
    }
})

export default Favourite;