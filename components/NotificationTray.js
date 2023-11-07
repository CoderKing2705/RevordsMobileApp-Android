import { TextInput, ToastAndroid, TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet, Image, Modal } from 'react-native';
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
import moment from 'moment/moment';

const NotificationTray = ({ navigation }) => {
    const focus = useIsFocused();
    memberID = 0;
    // const [loadingData, setLoadingData] = useState(true);
    const [userData, setUserData] = useState('');
    const baseUrl = Globals.API_URL + "/MembersWishLists/GetNotificationFormMobileApp"
    const [MemberData, setMemberData] = useState([{}]);
    const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
    const [isAutoPilotModalVisible, setIsAutoPilotModalVisible] = useState(false);
    const [promotionClaimData, setPromotionClaimData] = useState([]);
    const [autoPilotClaimData, setAutoPilotClaimData] = useState([]);
    const [loading, setLoading] = useState(false);

    async function setMemData(value) {
        await setMemberData(value);
    }

    const setIsPromoModalVisibleData = async (promotion) => {
        setIsPromoModalVisible(true);
        setPromotionClaimData(promotion);
    }
    const setIsAPModalVisibleData = async (autopilot, businessdata) => {
        setIsAutoPilotModalVisible(true);
        setAutoPilotClaimData(autopilot);
    }

    const openPromoModal = async (promotion) => {
        setLoading(true)
        await setIsPromoModalVisibleData(promotion);
        setLoading(false)
    }
    const openAPModal = async (autopilot, item) => {
        setLoading(true)
        await setIsAPModalVisibleData(autopilot, item);
        setLoading(false)
    }

    const closePromoModal = () => {
        setLoading(true);
        setIsPromoModalVisible(false);
        setLoading(false);
    }
    const closeAPModal = () => {
        setLoading(true);
        setIsAutoPilotModalVisible(false);
        setLoading(false);
    }

    const claimData = async (type, ID) => {
        await axios({
            method: 'GET',
            url: `${Globals.API_URL}/Promotions/GetRewardsByActivityTypeAndIDInMobile/${type}/${ID}`
        }).then(async (response) => {
            ToastAndroid.showWithGravityAndOffset(
                'Claimed Successfully!',
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50,
            );
            // setWishList([]);
            // await getRefreshData();
            setIsPromoModalVisible(false);
            // setLoading(false)
        }).catch(error => {
            console.error('Error retrieving dataa:', error);
            setLoading(false);
        });
    }

    const closePromoRedeemModal = async (type, ID) => {
        setLoading(true)
        await claimData(type, ID);
        // setIsPromoModalVisible(false);
        await getData();
        setLoading(false);
    }
    const closeAutoPilotRedeemModal = async (type, ID) => {
        setLoading(true)
        await axios({
            method: 'GET',
            url: `${Globals.API_URL}/Promotions/GetRewardsByActivityTypeAndIDInMobile/${type}/${ID}`
        }).then(async (response) => {
            ToastAndroid.showWithGravityAndOffset(
                'Claimed Successfully!',
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50,
            );
            // setWishList([]);
            // await getRefreshData();

            setIsAutoPilotModalVisible(false);
            // setLoading(false)
        }).catch(error => {
            console.error('Error retrieving dataa:', error);
            setLoading(false);
        });
        // setLoading(false)
    }

    const getData = async () => {
        AsyncStorage.getItem('token')
            .then(async (value) => {
                setLoading(true);

                if (value !== null) {
                    await setMemData(JSON.parse(value));
                    memberID = (JSON.parse(value))[0].memberId;

                    await axios({
                        method: 'GET',
                        url: `${baseUrl}/${memberID}`
                    }).then(async response => {
                        await setUserData(response.data);
                        setLoading(false)
                    }).catch((error) => {
                        console.error("Error fetching data", error)
                        setLoading(false);
                    });
                }
            })
    }
    useEffect(() => {
        getData();
    }, [focus]);
    return (
        <>
            <View style={styles.container}>
                <View style={[{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
                isPromoModalVisible ? { backgroundColor: 'rgba(0,0,0,0.5)', opacity: 0.4 } : '', isAutoPilotModalVisible ? { backgroundColor: 'rgba(0,0,0,0.5)', opacity: 0.4 } : '']}>
                    <View style={{ flexDirection: 'row', width: '97%', height: '10%', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => navigation.navigate('Location')}>
                            <Image source={require('../assets/more-button-ved.png')} style={styles.setimg1} />
                        </TouchableOpacity>
                        <Text style={styles.welcomeText}>Notifications</Text>
                    </View>
                    <View style={[{ width: '97%', height: '90%', marginTop: '5%' },
                    isPromoModalVisible ? { opacity: 0.4 } : '', isAutoPilotModalVisible ? { opacity: 0.4 } : '']}>
                        <View style={[styles.store, isPromoModalVisible ? { opacity: 0.4 } : '', isAutoPilotModalVisible ? { opacity: 0.4 } : '']}>
                            <FlatList
                                data={userData}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => {
                                    return (
                                        <TouchableOpacity style={{ paddingVertical: 10 }} activeOpacity={.9} onPress={() => openPromoModal(item)}>
                                            <Card style={[styles.card, isPromoModalVisible ? { opacity: 0.4 } : '', isAutoPilotModalVisible ? { opacity: 0.4 } : '']}>
                                                <Card.Content style={[styles.cardContent, isPromoModalVisible ? { opacity: 0.4 } : '', isAutoPilotModalVisible ? { opacity: 0.4 } : '']}>
                                                    <View style={{ width: '20%', height: '100%', alignItems: 'center' }}>
                                                        <Image source={require('../assets/giftImg1.png')} style={[styles.giftIcon]} />
                                                    </View>
                                                    <View style={{ width: '80%', height: '100%' }}>
                                                        <Title style={{ fontSize: 16, fontWeight: '800', color: '#3380a3' }}>{item.promotionalMessage}</Title>
                                                        <View style={{ flexDirection: 'row' }}>
                                                            {item.sentAgo > 0 && <Text style={{ color: '#717679', fontSize: 12, fontWeight: '400' }}>{item.sentAgo} Days ago</Text>}
                                                            {item.sentAgo == 0 && <Text style={{ color: '#717679', fontSize: 12, fontWeight: '400' }}>Today</Text>}
                                                            {item.expiryDays > 0 && <Text style={{ position: 'absolute', right: 0, fontSize: 12, fontWeight: '500', color: '#921c1c' }}>Expires in {item.expiryDays} Days</Text>}
                                                            {item.expiryDays < 0 && <Text style={{ position: 'absolute', right: 0, color: '#cccccc', fontSize: 12, fontWeight: '400' }}>Expired</Text>}
                                                            {item.expiryDays == 0 && <Text style={{ position: 'absolute', right: 0, fontSize: 12, fontWeight: '400' }}>Expiring Today</Text>}
                                                        </View>
                                                    </View>
                                                </Card.Content>
                                            </Card>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    </View>
                </View>

                <Modal
                    animationType={'slide'}
                    transparent={true}
                    visible={isPromoModalVisible}
                    onRequestClose={() => {
                        console.log('Modal has been closed.');
                    }}>
                    <View style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={styles.modal}>
                            <View style={{ flexDirection: 'row', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                {/* <Text style={styles.welcomeText}>User Profile</Text> */}
                                <Image source={{ uri: `${Globals.Root_URL}${promotionClaimData.sentFromGroupImage}` }} style={styles.logoBusinessInModal} />

                                <TouchableOpacity onPress={closePromoModal} style={styles.cancelImgContainer}>
                                    <Image source={require('../assets/cancelImg.png')} style={styles.cancelImg} />
                                </TouchableOpacity>
                            </View>
                            {/* <Text style={styles.modalbusinessName}>{promotionClaimData.sentFrom}</Text> */}
                            <Text style={styles.modalPromoMsg}>{promotionClaimData.promotionalMessage}</Text>
                            <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Offer Start Date </Text>- {moment(promotionClaimData.offerStartDate).format("MM/DD/YYYY")}</Text>
                            <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Offer End Date </Text>- {moment(promotionClaimData.offerEndDate).format("MM/DD/YYYY")}</Text>
                            {(promotionClaimData.expiryDays > 0) && <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Expires in - </Text>{promotionClaimData.expiryDays} days</Text>}
                            {(promotionClaimData.expiryDays < 0) && <Text style={styles.modaltext}><Text style={{ fontWeight: '600', color: '#cccccc', }}>Expired</Text></Text>}
                            {(promotionClaimData.expiryDays == 0) && <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Expiring Today</Text></Text>}

                            {/* {promotionClaimData.isSpinWheel && <Text style={styles.modaltext}>Spinwheel available at store</Text>} */}

                            {(promotionClaimData.filePath != '' && promotionClaimData.filePath != null) && <Image style={styles.avatarImg} source={{ uri: Globals.Root_URL + promotionClaimData.filePath }} ></Image>}
                            <Text style={styles.modaltext}>Redeemable at -<Text style={{ fontWeight: '700' }}> {promotionClaimData.redeemableAt}</Text></Text>
                            {(promotionClaimData.isClaimed == false && promotionClaimData.expiryDays >= 0) && <TouchableOpacity onPress={() => closePromoRedeemModal('promo', promotionClaimData.id)} style={styles.frame2vJu1ModalClaim}>
                                <Text style={styles.getStartednru1}>Claim</Text>
                            </TouchableOpacity>}
                            {(promotionClaimData.isClaimed == true || promotionClaimData.expiryDays < 0) &&
                                <TouchableOpacity style={styles.frame2vJu1ModalBack}>
                                    <Text style={styles.getStartednru1}>Claimed</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                </Modal>

                <SafeAreaView>
                    <View style={styles.container}>
                        <Spinner
                            visible={loading}
                            textContent={''}
                            textStyle={styles.spinnerStyle} />
                    </View>
                </SafeAreaView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    frame2vJu1ModalBack: {
        backgroundColor: '#969696',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: 35,
        // position: 'absolute',
        // top: '97%',
        // bottom: 10,
        marginVertical: 15,
        alignSelf: 'center'
    },
    getStartednru1: {
        lineHeight: 22.5,
        fontFamily: 'SatoshiVariable, SourceSansPro',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: 14,
        color: '#ffffff',
        flex: 10,
        zIndex: 10,
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    frame2vJu1ModalClaim: {
        backgroundColor: '#7d5513',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: 35,
        // position: 'absolute',
        // top: '97%',
        // bottom: 10,
        marginVertical: 15,
        alignSelf: 'center'
    },
    avatarImg: {
        // width: '2%'
        height: 150,
        width: 150,
        marginVertical: 7,
        alignSelf: 'center',
        borderRadius: 15
    },
    modalbusinessName: {
        fontWeight: '800',
        fontSize: 18,
        color: '#325b6f',
        textAlign: 'center',
        marginTop: 7,
        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'black',
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingVertical: 5
    },
    modalPromoMsg: {
        fontWeight: '600',
        fontSize: 15,
        color: '#f77c8c',
        paddingHorizontal: 10,
        marginTop: 20
    },
    cancelImg: {
        width: 25,
        height: 25,
        marginTop: 5,
        marginEnd: 5
        // position: 'absolute',
        // alignSelf: 'flex-end',
        // right: 0,
    },
    cancelImgContainer: {
        alignSelf: 'flex-end',
        position: 'absolute',
        right: 0,
        height: 50,
        justifyContent: 'flex-start'
    },
    logoBusinessInModal: {
        height: 50,
        width: 100,
        marginTop: 10,
        marginLeft: 10,
        alignSelf: 'center'
    },
    modal: {
        alignSelf: 'center',
        backgroundColor: '#fff',
        // padding: 100,
        // height: '75%',
        width: '85%',
        // marginTop: '30%',
        position: 'relative',
        borderRadius: 15,
        padding: 5
    },
    modaltext: {
        color: '#3f2949',
        marginTop: 5,
        paddingHorizontal: 10
    },
    giftIcon: {
        width: 40,
        height: 40,
        // alignSelf: 'center',
        top: '17%',
    },
    cardContent: {
        // marginHorizontal: '2%',
        flexDirection: 'row',
        backgroundColor: '#fff',
        // borderBottomColor: '#000',
        // borderBottomWidth: 1,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 5,
        // width: '98%',
        height: 'auto'
        // alignItems: 'center',
        // bottom: '25%',
        // left: '27%',
        // padding: '2%'
    },
    cardCover: {
        // padding: '2%'
        height: '70%',
        width: '100%'
    },
    card: {
        // marginTop: 5,
        // marginBottom: 5,
        // height: 300,
        width: '98%',
        flexDirection: 'row',
        alignSelf: 'center',
        borderRadius: 10
    },
    store: {
        // marginLeft: 8,
        // marginRight: 8,
        width: '95%',
        height: '95%',
        // position: 'relative',
        flexShrink: 0,
        marginTop: '2%',
        alignSelf: 'center',
        marginBottom: '20%',
        // backgroundColor: '#cdcce6',
        borderRadius: 15
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

export default NotificationTray;