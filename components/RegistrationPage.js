import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Globals from '../components/Globals';
import messaging from '@react-native-firebase/messaging';
import moment from 'moment';
import RNPickerSelect from 'react-native-picker-select';

export default function RegistrationPage({ route }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const { Phone } = route.params;
    const [isValid, setIsValid] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [daysInMonth, setDaysInMonth] = useState([]);
    const months = [
        { label: 'January', value: '01' },
        { label: 'February', value: '02' },
        { label: 'March', value: '03' },
        { label: 'April', value: '04' },
        { label: 'May', value: '05' },
        { label: 'June', value: '06' },
        { label: 'July', value: '07' },
        { label: 'August', value: '08' },
        { label: 'September', value: '09' },
        { label: 'October', value: '10' },
        { label: 'November', value: '11' },
        { label: 'December', value: '12' },
    ];

    useEffect(() => {
        if (selectedMonth) {
            const daysArray = [];
            const daysInSelectedMonth = moment(`2024-${selectedMonth}`, 'YYYY-MM').daysInMonth();

            for (let i = 1; i <= daysInSelectedMonth; i++) {
                const formattedDay = i < 10 ? `0${i}` : `${i}`;
                daysArray.push({ label: formattedDay, value: formattedDay });
            }

            setDaysInMonth(daysArray);
            setSelectedDay('');
        }
    }, [selectedMonth]);

    let tokenid = "";
    const navigation = useNavigation();

    const getDeviceToken = async () => {
        tokenid = await messaging().getToken();
    };

    const postData = async () => {
        await getDeviceToken();
        let currentDate = (new Date()).toISOString();
        let currentYear = new Date().getFullYear();
        let platformOS = Platform.OS;

        fetch(Globals.API_URL + '/MemberProfiles/PostMemberProfileByPhone', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "uniqueID": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "id": 0,
                "memberName": (name == '' || name == null || name == undefined) ? 'USER ' + Phone.substring(5,) : name,
                "birthDate": (selectedMonth == '' || selectedDay == '' || selectedMonth == null || selectedDay == null ||
                    selectedMonth == undefined || selectedDay == undefined) ? null : `${currentYear}-${selectedMonth}-${selectedDay}`,
                "emailID": (email == '' || email == null || email == undefined) ? null : email,
                "phoneNo": Phone,
                "isActive": true,
                "createdBy": 1,
                "createdDate": currentDate,
                "lastModifiedBy": 1,
                "lastModifiedDate": currentDate,
                "appToken": tokenid,
                "deviceOS": platformOS == "android" ? 1 : 2,
                "memberProfile": []
            }),
        }).then((res) => {
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
            <TextInput style={styles.nameInput} onChangeText={(t) => setName(t.trim())} placeholder='Enter your Name'></TextInput>
            <View style={styles.lineOne}></View>
            <TextInput style={styles.emailInput} onChangeText={(t) => setEmail(t)} placeholder='Enter your Email' />
            <View style={styles.lineTwo}></View>
            {!isValid && <Text style={{ color: 'red', marginTop: '2%', marginLeft: '4%', }}>Invalid Email Address</Text>}

            <View style={styles.pickerContainer}>
                <RNPickerSelect
                    placeholder={{ label: 'Select Birth Month', value: null }}
                    items={months}
                    onValueChange={(value) => setSelectedMonth(value)}
                    style={pickerSelectStyles}
                    value={selectedMonth}
                />
            </View>
            <View style={styles.lineThree}></View>
            <View style={styles.pickerContainer}>
                <RNPickerSelect
                    placeholder={{ label: 'Select Birth Day', value: null }}
                    items={daysInMonth}
                    onValueChange={(value) => setSelectedDay(value)}
                    style={pickerSelectStyles}
                    value={selectedDay}
                />
            </View>
            <View style={styles.lineThree}></View>
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
    pickerContainer: {

    },
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
    lineThree: {
        width: '95%',
        height: 1.5,
        backgroundColor: '#ffffff',
        // marginTop: '2%',
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

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
        // backgroundColor: 'white',
        marginTop: 5,
        width: '100%',
        alignSelf: 'center',
    },
    inputIOSContainer: {
        borderBottomColor: 'purple', // Border color when open
        borderBottomWidth: 2, // Border width when open
    },
    inputAndroidContainer: {
        borderBottomColor: 'purple', // Border color when open
        borderBottomWidth: 2, // Border width when open
    },
});