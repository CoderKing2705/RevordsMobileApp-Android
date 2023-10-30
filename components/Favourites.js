import axios from 'axios';
import { useEffect, useState } from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import Globals from '../components/Globals';
import { Card } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
const Favourite = () => {
    const businessGroupId = "1";
    const wishListUrl = `${Globals.API_URL}/MembersWishLists/GetMemberWishListByMemberID`;
    const userEarnedRewardsAPI = Globals.API_URL + `/RewardConfigs/GetRewardConfigBusinessGroupwiseMemberwise/${businessGroupId}`;
    const [wishList, setWishList] = useState([]);
    const [formattedDate, setFormattedDate] = useState([]);
    const logoPath = wishList[0] ? wishList[0].logoPath : null;
    const logoUrl = Globals.Root_URL + `${logoPath}`;
    const [badgeColor, setBadgeColor] = useState([]);
    const [MemberData, setMemberData] = useState([{}]);
    const [loading, setLoading] = useState(false);
    const [earnerRewards, setEarnedRevards] = useState([]);
    const isFocused = useIsFocused();

    async function setEarnedRevardsData(value) {
        setEarnedRevards(value);
    }

    async function setMemData(value) {
        await setMemberData(value);
    }
    useEffect(() => {
        AsyncStorage.getItem('token')
            .then(async (value) => {
                if (value !== null) {
                    await setMemData(JSON.parse(value));
                }
            })
            .catch(error => {
                console.error('Error retrieving dataa:', error);
                setLoading(false);
            });

        axios({
            method: 'GET',
            url: `${wishListUrl}/${MemberData[0].memberId}`
        }).then(async (response) => {
            setWishList(response.data);
            const createdDate = new Date(response.data[0].createdDate);
            const day = createdDate.getDate();
            const month = createdDate.getMonth();
            const year = createdDate.getFullYear();
            const formatDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
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
                    console.error('Error getting distance: ', error);
                },
                { enableHighAccuracy: false, timeout: 500 }
            );
            setFormattedDate(formatDate);
            setBadgeColor(response.data[0].badgeColor);
        });

        axios({
            method: 'GET',
            url: `${userEarnedRewardsAPI}/${MemberData[0].memberId}`
        }).then((response) => {
            setEarnedRevardsData(response.data)
            console.log("1234")
            console.log(earnerRewards[0].rewardName);
        }).catch((error) => {
            console.log("Error fetching data", error);
            setLoading(false);
        });
    }, [isFocused]);

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Favourite</Text>
            <Image style={styles.notificationImg} source={require('../assets/notification-skD.png')} />
            <ScrollView contentContainerStyle={styles.scrollviewContainer}>
                <View style={styles.wishlistView}>
                    {wishList.map((item, index) => (
                        <View key={index} style={styles.listView}>
                            <Image source={{ uri: logoUrl }} style={styles.logoBusiness} />
                            <Image source={require('../assets/heart-dNh.png')} style={styles.likeHeart} />
                            <Text style={styles.totalLikes}> {item.totalLikes} likes </Text>
                            <Text style={styles.businessName}>{item.businessName}</Text>
                            <Text style={styles.industry}> {item.industry} </Text>
                            <Text style={styles.memberDetails}> {item.distance} mi | Member Since - {formattedDate}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.cardView}>
                                    <Card style={{ width: 150, height: 150, marginRight: 10 }}>
                                        <Text style={styles.badge}> {item.badgeName} </Text>
                                        <Image source={require('../assets/vector-ZRj.png')} style={[styles.trophyImg, { tintColor: badgeColor }]} />
                                        <Text style={styles.memberPoints}> {item.currentPoints} pt </Text>
                                    </Card>
                                    {earnerRewards.map((reward, earnReward) => (
                                        <Card key={earnReward} style={{ width: 150, height: 150, marginRight: 10 }}>
                                            <Text style={styles.achievableName}> {earnerRewards[earnReward].rewardName} </Text>
                                            <Text style={styles.achievalbeValue}> {earnerRewards[earnReward].achivableTargetValue} pts </Text>
                                            <View>
                                                <Progress.Bar
                                                    style={styles.progressBar}
                                                    progress={earnerRewards[earnReward].pendingToAchiveValue / earnerRewards[earnReward].achivableTargetValue}
                                                    width={110}
                                                    color='#2ac95d' />
                                            </View>
                                            <Text style={styles.pendingpoints}> {earnerRewards[earnReward].pendingToAchiveValue} left </Text>
                                        </Card>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    ))}
                </View>
            </ScrollView >
        </View >
    );
};

const styles = StyleSheet.create({
    cardView: {
        width: 150,
        height: 150,
        marginRight: 9,

    },
    pendingpoints: {
        color: '#73a5bc',
        fontWeight: '800',
        top: 45,
        left: 40,
        bottom: 12,
        fontSize: 16
    },
    progressBar: {
        top: 35,
        left: 20
    },
    achievalbeValue: {
        color: '#717679',
        fontWeight: '700',
        fontSize: 15,
        top: '25%'
    },
    achievableName: {
        fontWeight: '700',
        color: '#000000',
        fontSize: 15,
        width: 150,
        top: '20%',
        padding: '2%',
        left: 5
    },
    scrollviewContainer: {
        flexGrow: 0,
        right: 45,
    },
    badge: {
        color: '#000000',
        fontWeight: '700',
        alignSelf: 'center',
        top: '20%',
        fontSize: 17
    },
    memberPoints: {
        color: '#73a5bc',
        fontWeight: '800',
        top: 40,
        left: 57,
        bottom: 20,
        fontSize: 16
    },
    trophyImg: {
        width: 60,
        height: 50,
        alignSelf: 'center',
        top: '30%'
    },
    cardView: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    memberDetails: {
        color: '#203139',
        fontWeight: '700',
        fontSize: 14,
        bottom: '6%',
        right: '1.5%'
    },
    industry: {
        color: '#717679',
        fontWeight: '700',
        fontSize: 15,
        bottom: '10%',
        right: '1.5%'
    },
    totalLikes: {
        alignSelf: 'flex-end',
        bottom: '19%',
        right: '5%'
    },
    likeHeart: {
        width: 24,
        height: 21,
        alignSelf: 'flex-end',
        right: '21%',
        bottom: '12%'
    },
    businessName: {
        fontWeight: '800',
        fontSize: 18,
        color: '#000000',
        bottom: '12%'
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
        width: 360,
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