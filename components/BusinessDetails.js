import { StyleSheet, View, Image, Text } from "react-native";
import Globals from '../components/Globals';
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";


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
    const earnedRewardsAPI = `${Globals.API_URL}/RewardConfigs/GetRewardConfigBusinessGroupwiseMemberwise`;
    const [earnerRewards, setEarnedRevards] = useState('');
    const [memberData, setMemberData] = useState('')
    const memberId = memberData ? memberData.memberId : null;
    // console.log(222)
    // console.log(memberData.memberId);
    const goBackToCardView = () => {
        navigation.navigate("Locations")
    };
    useEffect(() => {
        AsyncStorage.getItem('token')
            .then(value => {
                if (value !== null) {
                    //console.log(1234)
                    let a = [];
                    a = value;
                    setMemberData(JSON.parse(a)[0]);
                    // console.log(22222)
                    console.log(memberData.memberId);
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
            })
            .catch(error => {
                console.log("Error Fetching data", error)
            });
    }, [id])


    useEffect(() => {
        axios({
            method: 'GET',
            url: `${earnedRewardsAPI}/${businessGroupId}/${memberId}`
        })
            .then(response => {
                setEarnedRevards(response.data)
                // console.log(earnerRewards.rewardName)
            })
            .catch(error => {
                console.log("Error Fetching data", error)
            });
    },[earnedRewardsAPI, businessGroupId, memberData.memberId])
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', width: '80%', height: '15%', alignItems: 'center', justifyContent: 'center' }}>
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
            <View style={styles.detailView}>
                <Image source={{ uri: imageUrl }} style={styles.imageBusiness} />
                <Text style={{ fontWeight: 700, top: 5 }}> {businessDetails.businessName} </Text>
                <Text style={{ color: '#717679', fontWeight: 700, top: 18 }}> {businessDetails.industry} </Text>
                <Image source={{ uri: logoUrl }} style={styles.logoBusiness} />
                <View>
                    <Text style={styles.loyaltyRewards}> Loyalty Rewards </Text>
                    <Text style={styles.subheading}> Earn 1 pt for every $10 spent </Text>
                    <Text> {earnedRewardsAPI.rewardName} </Text>
                </View>
            </View>
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
        fontWeight: '800'
    },
    detailView: {
        backgroundColor: 'white',
        padding: 10,
        height: 600,
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
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
        textAlign: 'center',
        width: '80%',
        marginBottom: '15%',
        right: 5,
        top: 5
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
        bottom: 20,
    },
    setimg2: {
        position: 'relative',
        width: 50,
        height: 50,
        right: 40,
        bottom: 20,
        left: 15
    }
});