import axios from 'axios';
import { useEffect, useState } from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity } from 'react-native';
import Globals from '../components/Globals';
import { Card } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { SafeAreaView } from 'react-native-safe-area-context';
import Spinner from 'react-native-loading-spinner-overlay';
import moment, { isMoment } from 'moment/moment';
const Favourite = () => {
    const businessGroupId = "1";
    lang = 0;
    lat = 0;
    const wishListUrl = `${Globals.API_URL}/MembersWishLists/GetMemberWishListByMemberID`;
    const userEarnedRewardsAPI = Globals.API_URL + `/RewardConfigs/GetRewardConfigBusinessGroupwiseMemberwise/${businessGroupId}`;
    const [wishList, setWishList] = useState([]);
    const [formattedDate, setFormattedDate] = useState([]);
    const logoPath = wishList[0] ? wishList[0].logoPath : null;
    const logoUrl = Globals.Root_URL + `${logoPath}`;
    const [MemberData, setMemberData] = useState([{}]);
    const [loading, setLoading] = useState(false);
    const [earnerRewards, setEarnedRevards] = useState([]);
    const isFocused = useIsFocused();
    async function setLangandLat(latitude, longitude) {
        lang = longitude;
        lat = latitude;
    }

    memberID = 0;
    async function setEarnedRevardsData(value) {
        setEarnedRevards(value);
    }

    async function setWishListData(value) {
        setWishList(value);
    }

    async function setMemData(value) {
        await setMemberData(value);
    }

    useEffect(() => {
        AsyncStorage.getItem('token')
            .then(async (value) => {
                setLoading(true);
                if (value !== null) {
                    await setMemData(JSON.parse(value));
                    memberID = (JSON.parse(value))[0].memberId;
                    await axios({
                        method: 'GET',
                        url: `${wishListUrl}/${memberID}`
                    }).then(async (response) => {
                        console.log('response---', response.data)
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
                                await setWishListData(response.data);
                                setLoading(false)
                            },
                            error => {
                                console.error('Error getting current location: ', error);
                            },
                            { enableHighAccuracy: false, timeout: 5000 }
                        );
                    });
                    memberID = (JSON.parse(value))[0].memberId;
                    // await axios({
                    //     method: 'GET',
                    //     url: `${userEarnedRewardsAPI}/${memberID}`
                    // }).then((response) => {

                    //     setEarnedRevardsData(response.data)
                    //     setLoading(false);
                    // }).catch((error) => {
                    //     console.log("Error fetching data", error);
                    //     setLoading(false);
                    // });
                }
            })
            .catch(error => {
                console.error('Error retrieving dataa:', error);
                setLoading(false);
            });


    }, [isFocused]);

    return (
        <View style={styles.container}>
            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', width: '97%', height: '10%', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={styles.welcomeText}>Favourite</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('ProfileEdit', { MemberData: MemberData })}>
                        <Image source={require('../assets/notification-skD.png')} style={styles.setimg1} />
                    </TouchableOpacity>
                </View>

                <SafeAreaView style={{ paddingTop: '5%', height: '90%', width: '97%', alignItems: 'center', borderRadius: 50 }}>
                    <ScrollView style={{ flex: 1, height: '100%', width: '97%', borderRadius: 50 }}>
                        <View style={styles.wishlistView}>
                            {wishList && wishList.map((item, index) => (
                                <View key={index} style={styles.listView}>
                                    <Image source={{ uri: logoUrl }} style={styles.logoBusiness} />
                                    <Image source={require('../assets/heart-dNh.png')} style={styles.likeHeart} />
                                    <Text style={styles.totalLikes}> 1.5K Likes </Text>
                                    <Text style={styles.businessName}>{item.businessName}</Text>
                                    <Text style={styles.industry}> {item.industry} </Text>
                                    <Text style={styles.memberDetails}> {item.distance} mi | Member Since - {moment(item.createdDate).format("MM/DD/YYYY")}</Text>

                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.cardView}>
                                            <Card style={{ width: 150, borderRadius: 20, height: 150, marginRight: 10, marginBottom: 5, backgroundColor: '#f4f5f5' }}>
                                                <Text style={styles.badge}> {item.badgeName} </Text>
                                                <Image source={require('../assets/vector-ZRj.png')} style={[styles.trophyImg, { tintColor: item.badgeColor }]} />
                                                <Text style={styles.memberPoints}> {item.currentPoints} pt </Text>
                                            </Card>

                                            {item.promotionData.map((promotion, earnReward) => (
                                                <Card key={earnReward} style={{ width: 150, borderRadius: 20, height: 150, marginRight: 10, marginBottom: 5, backgroundColor: '#f4f5f5' }}>
                                                    <Text style={styles.achievableName}> {promotion.promotionalMessage} </Text>
                                                    <Text style={styles.achievalbeValue}> {promotion.expiryDays} days </Text>
                                                </Card>
                                            ))}

                                            {item.autopilotData.map((autopilot, earnReward) => (
                                                <Card key={earnReward} style={{ width: 150, borderRadius: 20, height: 150, marginRight: 10, marginBottom: 5, backgroundColor: '#f4f5f5' }}>
                                                    <Text style={styles.achievableName}> {autopilot.rewardName} </Text>
                                                    <Text style={styles.achievalbeValue}> {autopilot.expiryDays} days </Text>
                                                </Card>
                                            ))}

                                            {item.rewardData.map((reward, earnReward) => (
                                                <Card key={earnReward} style={{ width: 150, borderRadius: 20, height: 150, marginRight: 10, marginBottom: 5, backgroundColor: '#f4f5f5' }}>
                                                    <Text style={styles.achievableName}> {reward.rewardName} </Text>
                                                    <Text style={styles.achievalbeValue}> {reward.achivableTargetValue} pts </Text>
                                                    <View>
                                                        <Progress.Bar
                                                            style={styles.progressBar}
                                                            progress={1 - ((reward.pendingToAchiveValue) / reward.achivableTargetValue)}
                                                            width={110}
                                                            color='#2ac95d' />
                                                    </View>
                                                    {(reward.pendingToAchiveValue > 0) && <Text style={styles.pendingpoints}> {reward.pendingToAchiveValue} left </Text>}
                                                    {(reward.pendingToAchiveValue <= 0) && <Text style={styles.pendingpoints}> 0 left </Text>}
                                                </Card>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            ))}
                        </View>
                        <SafeAreaView>
                            <View style={styles.container}>
                                <Spinner
                                    visible={loading}
                                    textContent={''}
                                    textStyle={styles.spinnerStyle} />
                            </View>
                        </SafeAreaView>
                    </ScrollView >
                </SafeAreaView>
            </View>
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
        flex: 1,
        height: '100%',
        width: '97%',
        borderRadius: 50
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
        right: '-4%',
        fontWeight: '700',
        fontSize: 14,
        color: '#717679'
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
        backgroundColor: 'white',
        borderRadius: 15,
        width: '100%',
        marginBottom: '3%'
    },
    wishlistView: {
        // padding: '10%',
        // margin: '2%',
        // backgroundColor: 'white',
        padding: 10,
        height: '100%',
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    notificationImg: {
        width: 49,
        height: 49,
        resizeMode: 'contain',
        flex: 1,
        position: 'absolute',
        top: '1%',
    },
    welcomeText: {
        color: 'black',
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        width: '80%'
    },
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center'
    },
    setimg1: {
        width: 50,
        height: 50,
        marginTop: -20,
        position: 'absolute',
        alignSelf: 'flex-end',
        right: -20
    }
})

export default Favourite;