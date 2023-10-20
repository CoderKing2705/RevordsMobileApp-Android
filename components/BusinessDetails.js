import { StyleSheet, View, Image, Text, ScrollView } from "react-native";
import Globals from '../components/Globals';
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { SafeAreaView } from "react-native";
import { StatusBar } from "react-native";

export default function BusinessDetails({ route }) {
    const navigation = useNavigation();
    const id = route.params.id;
    const businessGroupId = "1";
    const [businessDetails, setBusinessDetails] = useState([]);
    const businessDetailsAPI = `${Globals.API_URL}/BusinessProfiles`;
    const imagePath = businessDetails ? businessDetails.imagePath : null;
    const logoPath = businessDetails ? businessDetails.logoPath : null;
    const imageUrl = `http://ho.hitechprojects.co.in:8101/WWWROOT/${imagePath}`;
    const logoUrl = `http://ho.hitechprojects.co.in:8101/WWWROOT/${logoPath}`;
    const earnedRewardsAPI = `http://ho.hitechprojects.co.in:8101/api/RewardConfigs/GetRewardConfigBusinessGroupwiseMemberwise/${businessGroupId}`;
    const [earnerRewards, setEarnedRevards] = useState([{}]);
    const [memberData, setMemberData] = useState([])
    const goBackToCardView = () => {
        navigation.navigate("Locations")
    };
    useEffect(() => {
        //console.log('sdfsfsdffsfdfsfsfsf')
        AsyncStorage.getItem('token')
            .then(value => {
                if (value !== null) {
                    let a = [];
                    a = value;
                    setMemberData(JSON.parse(a)[0].memberId);
                    // console.log(memberData);
                }
            })
            .catch(error => {
                console.error('Error retrieving data:', error);
            });
        axios({
            method: 'GET',
            url: `${businessDetailsAPI}/${id}`
        })
            .then(response => {
                setBusinessDetails(response.data)
                console.log(response.data)
                console.log(1111)
                console.log(businessDetails.businesswiseWorkingDays[0].sunFromTime);
            })
            .catch(error => {
                console.log("Error Fetching data", error)
            });
        axios({
            method: 'GET',
            url: `${earnedRewardsAPI}/1`
        })
            .then((response) => {
                setEarnedRevards(response.data)
                console.log(response.data)
                console.log(earnerRewards[0].rewardName)
            })
            .catch(error => {
                console.log("Error Fetching data", error)
            });
    }, [])

    return (
        <View style={styles.container}>
            <View style={{ marginTop: '1%', flexDirection: 'row', width: '80%', height: '5%', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity onPress={goBackToCardView}>
                    <Image source={require('../assets/more-button-ved.png')} style={styles.setimg1} />
                </TouchableOpacity>
                <Text style={styles.welcomeText}>
                    {businessDetails.businessName}
                </Text>
                <TouchableOpacity>
                    <Image source={require('../assets/more-button-Cam.png')} style={styles.setimg2} />
                </TouchableOpacity>
            </View>
            <SafeAreaView style={{ paddingTop: StatusBar.currentHeight }}>
                <ScrollView style={{ flex: 1 }}>
                    <View style={styles.detailView}>
                        <Image source={{ uri: imageUrl }} style={styles.imageBusiness} />
                        <Text style={{ fontWeight: 700, top: 5 }}> {businessDetails.businessName} </Text>
                        <Text style={{ color: '#717679', fontWeight: 700, top: 18 }}> {businessDetails.industry} </Text>
                        <Image source={{ uri: logoUrl }} style={styles.logoBusiness} />
                        <View >
                            <Text style={styles.loyaltyRewards}> Loyalty Rewards </Text>
                            <Text style={styles.subheading}> Earn 1 pt for every $10 spent </Text>
                            {earnerRewards.map((rewards, index) => (
                                <Text key={index} style={{ fontWeight: '700', fontSize: 15, marginTop: '2%' }}>
                                    {earnerRewards[0].rewardName}
                                </Text>
                            ))}
                        </View>
                        <View style={styles.photosView}>
                            <Text style={{ marginTop: '10%', fontWeight: '900' }}> Photos </Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Image style={{ width: 80, height: 80, borderRadius: 10, marginTop: '2%', marginLeft: '2%' }} source={require('../assets/rectangle-32.png')} />
                                <Image style={{ width: 80, height: 80, borderRadius: 10, marginTop: '2%', marginLeft: '2%' }} source={require('../assets/rectangle-33.png')} />
                                <Image style={{ width: 80, height: 80, borderRadius: 10, marginTop: '2%', marginLeft: '2%' }} source={require('../assets/rectangle-34.png')} />
                            </View>
                        </View>
                        <View>
                            <Text style={{ marginTop: '10%', fontWeight: '900' }}> Hours </Text>
                            <Text> Monday: {businessDetails.businesswiseWorkingDays[0].monFromTime}  </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}
const styles = StyleSheet.create({
    subheading: {
        fontWeight: '500',
        fontSize: 12,
        marginTop: '2%',
        marginLeft: '0.5%',
        color: '#717679'
    },
    loyaltyRewards: {
        marginTop: '20%',
        fontWeight: '900'
    },
    detailView: {
        backgroundColor: 'white',
        padding: 10,
        height: 900,
    },
    logoBusiness: {
        width: 50,
        height: 50,
        top: 30,
        right: -5
    },
    imageBusiness: {
        width: 350,
        height: 150,
        position: 'relative',
        borderRadius: 20,
    },
    welcomeText: {
        color: 'black',
        fontSize: 15,
        fontWeight: '900',
        textTransform: 'uppercase',
        textAlign: 'center',
        width: '80%',
        top: 10
    },
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center',
    },
    setimg1: {
        position: 'relative',
        width: 50,
        height: 50,
        right: 15,
        top: 10,
    },
    setimg2: {
        position: 'relative',
        width: 50,
        height: 50,
        right: 40,
        top: 10,
        left: 15
    }
});