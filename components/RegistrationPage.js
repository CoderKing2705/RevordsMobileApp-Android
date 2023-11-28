import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import SelectDropdown from 'react-native-select-dropdown';
import Globals from '../components/Globals';
import messaging from '@react-native-firebase/messaging';


export default function RegistrationPage({ route }) {
    const [selectedMonths, setSelectedMonth] = useState('January');
    const [selectDays, setSelectedDays] = useState('1');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const { Phone } = route.params;
    const [isValid, setIsValid] = useState(true);

    //console.log(Phone)
    const months = [
        'January', 'February', 'March', 'April', 'May',
        'June', 'July', 'August', 'September', 'October',
        'November', 'December'
    ];
    let tokenid = "";
    const days = Array.from({ length: 31 }, (_, index) => (index + 1).toString());
    const navigation = useNavigation();

    const getDeviceToken = async () => {
        tokenid = await messaging().getToken();
    };

    const postData = async () => {
        const monthIndex = months.findIndex(month => month.toLowerCase() === selectedMonths.toLowerCase());
        const birthMonth = monthIndex > 8 ? monthIndex + 1 : '0' + (monthIndex + 1);
        const birthDay = selectDays > 9 ? selectDays : '0' + selectDays;
        await getDeviceToken();
        const MemberData = [];
        let currentDate = (new Date()).toISOString();
        let currentYear = new Date().getFullYear();

        fetch(Globals.API_URL + '/MemberProfiles/PostMemberProfileByPhone', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "uniqueID": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "id": 0,
                "memberName": name == '' ? 'User' + Phone.substring(5,) : name,
                "birthDate": `${currentYear}-${birthMonth}-${birthDay}`,
                "emailID": email == '' ? null : email,
                "phoneNo": Phone,
                "isActive": true,
                "createdBy": 1,
                "createdDate": currentDate,
                "lastModifiedBy": 1,
                "lastModifiedDate": currentDate,
                "appToken": tokenid,
                "memberProfile": []
            }),
        }).then((res) => {
            console.log(JSON.stringify(res))
            getMemberData();
        });
    }

    const start = async () => {
        if (email != null && email != '' && email != undefined) {
            const isValidEmail = validateEmail(email);
            setIsValid(isValidEmail);
            if (isValidEmail) {
                postData();
            }
        }
        else {
            postData();
        }
    }
    const getMemberData = async () => {
        const response = await fetch(
            Globals.API_URL + '/MemberProfiles/GetMemberByPhoneNo/' + Phone)
        const json = await response.json();
        navigation.navigate('TabNavigation', { MemberData: json, Phone: Phone });

    }

    const validateEmail = (email) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    return (
        <View style={styles.screen93X}>
            <Text style={styles.createYourAccount}> Create your Account! </Text>
            <TextInput style={styles.nameInput} onChangeText={(t) => setName(t)} placeholder='Enter your Name'></TextInput>
            <View style={styles.lineOne}></View>
            <TextInput style={styles.emailInput} onChangeText={(t) => setEmail(t)} placeholder='Enter your Email' />
            <View style={styles.lineTwo}></View>
            {!isValid && <Text style={{ color: 'red', marginTop: '2%', marginLeft: '4%', }}>Invalid Email Address</Text>}

            <View style={styles.grpDrpDown}>
                <SelectDropdown style={styles.drpDownMonth} data={months} onSelect={(selectedItem, index) => setSelectedMonth(selectedItem)}
                    defaultButtonText='Birth Month' buttonTextAfterSelection={(selectedItem, index) => selectedItem}
                    rowTextForSelection={(item, index) => item} />
                <SelectDropdown style={styles.drpDownDays} data={days} onSelect={(selectedItem, index) => setSelectedDays(selectedItem)}
                    defaultButtonText='Birth Day' buttonTextAfterSelection={(selectedItem, index) => selectedItem}
                    rowTextForSelection={(item, index) => item} />
            </View>

            <View style={styles.registrationViewBtn}>
                <TouchableOpacity activeOpacity={.7} style={styles.btnRegister} onPress={start}>
                    <Text style={styles.txtRegister}>
                        REGISTER
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    txtRegister: {
        color: 'white',
        fontWeight: '700',
        fontSize: 20
    },
    btnRegister: {
        width: '50%',
        height: '100%',
        lineHeight: 23,
        textTransform: 'uppercase',
        color: '#ffffff',
        fontFamily: 'Satoshi Variable, "Source Sans Pro"',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#140d05',
        borderRadius: 8,
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: '#140d05',
    },
    registrationViewBtn: {
        width: '100%',
        height: 48,
        position: 'absolute',
        bottom: '5%',
        borderRadius: 8,
    },
    imageDrpDownArrowDays: {
        marginBottom: 2.874,
        width: 19.251,
        height: 10.501,
        resizeMode: 'contain',
        alignSelf: 'flex-start',
        flexShrink: 0,
    },
    imageDownArrow: {
        width: 19.251,
        height: 10.501,
        resizeMode: 'contain',
        alignSelf: 'flex-start',
        flexShrink: 0,
    },
    grpDrpDown: {
        height: 23,
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: '10%',
    },
    drpDownMonth: {
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 23,
        color: '#203139',
        fontFamily: 'Satoshi Variable, "Source Sans Pro"',
        flexShrink: 0,
        backgroundColor: 'black',
        textAlign: 'left'
    },
    drpDownDays: {
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 23,
        color: '#203139',
        fontFamily: 'Satoshi Variable, "Source Sans Pro"',
        flexShrink: 0,
    },
    emailInput: {
        width: '100%',
        height: 23,
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 23,
        color: '#203139',
        fontFamily: 'Satoshi Variable, "Source Sans Pro"',
        marginTop: '8%',
        marginLeft: '4%',
    },
    nameInput: {
        width: '100%',
        height: '23',
        marginTop: '30%',
        fontSize: 18,
        fontWeight: '500',
        color: '#203139',
        marginLeft: '4%',
        fontFamily: 'Satoshi Variable, "Source Sans Pro"'
    },
    lineOne: {
        width: '95%',
        height: 1.5,
        marginTop: '2%',
        alignSelf: 'center',
        backgroundColor: '#ffffff',
    },
    lineTwo: {
        width: '95%',
        height: 1.5,
        backgroundColor: '#ffffff',
        marginTop: '2%',
        alignSelf: 'center',
    },
    screen93X: {
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#d9e7ed',
        flexShrink: 0,
    },
    createYourAccount: {
        width: '10',
        height: 31,
        position: 'absolute',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        fontFamily: 'Satoshi Variable, "Source Sans Pro"',
        marginLeft: '16.5%',
        marginTop: '2%'
    }
})