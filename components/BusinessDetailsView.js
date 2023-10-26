import { StyleSheet } from 'react-native'
import { View, Text, Image } from 'react-native'
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Globals from '../components/Globals';
import { SafeAreaView } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { StatusBar } from "react-native";
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';

export default function BusinessDetailsView({ route }) {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [loading, setLoading] = useState(false);
    const goBackToCardView = () => {
        navigation.navigate("Locations")
    };
    const businessDetailsAPI = `${Globals.API_URL}/BusinessProfiles`;
    const businessGroupId = "1";
    const userEarnedRewardsAPI = Globals.API_URL + `/RewardConfigs/GetRewardConfigBusinessGroupwiseMemberwise/${businessGroupId}`;
    const id = route.params.id;
    const [businessDetails, setBusinessDetails] = useState([]);
    const [earnerRewards, setEarnedRevards] = useState([]);
    const imagePath = businessDetails ? businessDetails.imagePath : null;
    const logoPath = businessDetails ? businessDetails.logoPath : null;
    const imageUrl = Globals.Root_URL + `${imagePath}`;
    const logoUrl = Globals.Root_URL + `${logoPath}`;
    const wdays = Globals.API_URL + '/BusinessProfiles/GetBusinesswiseWorkingDaysForMobile';
    const [workingDays, setWorkingDays] = useState([{}]);
    const [error, setError] = useState(null);
    const [MemberData, setMemberData] = useState([{}]);

    async function setBusinessDetailsAwait(data) {
        await setBusinessDetails(data);
    }
    async function setworkingDaysAwait(data) {
        await setWorkingDays(data);
    }

    async function setMemData(value) {
        await setMemberData(value);
    }
    async function setEarnedRevardsData(value) {
        await setEarnedRevards(value);
    }
    useEffect(() => {
        setLoading(true);
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
            url: `${businessDetailsAPI}/${id}`
        }).then(async (response) => {
            await setBusinessDetailsAwait(response.data)
        }).catch((error) => {
            console.log("Error fetching data:/", error)
            setLoading(false);
        });

        axios({
            method: 'GET',
            url: `${userEarnedRewardsAPI}/${MemberData[0].memberId}`
        }).then(async (response) => {
            await setEarnedRevardsData(response.data)
        }).catch((error) => {
            console.log("Error fetching data", error);
            setLoading(false);
        });

        axios({
            method: 'GET',
            url: `${wdays}/${id}`
        }).then(async (response) => {
            await setworkingDaysAwait(response.data);
            setLoading(false);
        });
    }, [isFocused])
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
                        <View>
                            <Text style={styles.loyaltyRewards}> Loyalty Rewards </Text>
                            <Text style={styles.subheading}> Earn 1 pt for every $10 spent </Text>
                            {earnerRewards.map((rewards, index) => (
                                <Text key={index} style={{ fontWeight: '700', fontSize: 15, marginTop: '2%' }}>
                                    {earnerRewards[index].rewardName}
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
                        <View style={styles.workingDays} >
                            <Text style={{ marginTop: '10%', fontWeight: '900' }}> Hours </Text>
                            {workingDays.map((day, index) => (
                                <Text key={index}>
                                    {`${day.dayName}: ${day.fromTime} - ${day.toTime}`}
                                </Text>
                            ))}
                        </View>
                        <View>
                            <Text style={styles.adressHeading}> Address: </Text>
                            <Text style={{ color: '#8c9194', fontSize: 16, marginTop: '2%' }}> {businessDetails.adress} </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <Spinner
                        visible={loading}
                        textContent={''}
                        textStyle={styles.spinnerTextStyle}
                    />
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    workingDays: {
        marginLeft: '4%'
    },
    mapViewMain: {
        width: 20,
        height: 20
    },
    adressHeading: {
        marginTop: '10%',
        fontWeight: '900'
    },
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
})