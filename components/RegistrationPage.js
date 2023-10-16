import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import SelectDropdown from 'react-native-select-dropdown';


export default function RegistrationPage() {
    const [selectedMonths, setSelectedMonth] = useState('January');
    const [selectDays, setSelectedDays] = useState('1');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const months = [
        'January', 'February', 'March', 'April', 'May',
        'June', 'July', 'August', 'September', 'October',
        'November', 'December'
    ];

    const days = Array.from({ length: 31 }, (_, index) => (index + 1).toString());
    const navigation = useNavigation();
    const start = () => {
        // navigation.navigate('TabNavigation');
        console.log(name)
        console.log(email)
        console.log(selectDays)
        console.log(selectedMonths)
        // let currentDate = (new Date()).toISOString();
        // let currentYear = new Date().getFullYear();
        // fetch(Globals.API_URL + '/MemberProfiles/PostMemberProfileByPhone', {
        //     method: 'POST',
        //     headers: {
        //         Accept: 'application/json',
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         "uniqueID": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        //         "id": 0,
        //         "memberName": name,
        //         "birthDate": `${currentYear}-${selectedMonths}-${selectDays}`,
        //         "emailID": email,
        //         "phoneNo": currentDate,
        //         "isActive": true,
        //         "createdBy": 1,
        //         "createdDate": currentDate,
        //         "lastModifiedBy": 1,
        //         "lastModifiedDate": currentDate,
        //         "memberProfile": []
        //     }),
        // }).then((res) => console.log(res.json())).then((json) => {console.log(json)});
    }

    return (
        <View style={styles.screen93X}>
            <Text style={styles.createYourAccount}> Create your Account! </Text>
            <TextInput style={styles.nameInput} onChangeText={(t) => setName(t)} placeholder='Enter your Name'></TextInput>
            <View style={styles.lineOne}></View>
            <TextInput style={styles.emailInput} onChangeText={(t) => setEmail(t)} placeholder='Enter your Email' />
            <View style={styles.lineTwo}></View>

            <View style={styles.grpDrpDown}>
                <SelectDropdown style={styles.drpDownMonth} data={months} onSelect={(selectedItem, index) => setSelectedMonth(selectedItem)}
                    defaultButtonText='Birth Month' buttonTextAfterSelection={(selectedItem, index) => selectedItem}
                    rowTextForSelection={(item, index) => item} />
                {/* <Image source={require('../assets/caretdown-eU1.png')} style={styles.imageDownArrow} /> */}
                <SelectDropdown style={styles.drpDownDays} data={days} onSelect={(selectedItem, index) => setSelectedDays(selectedItem)}
                    defaultButtonText='Birth Day' buttonTextAfterSelection={(selectedItem, index) => selectedItem}
                    rowTextForSelection={(item, index) => item} />
                {/* <Image source={require('../assets/caretdown-8b3.png')} style={styles.imageDrpDownArrowDays} /> */}
            </View>

            <View style={styles.registrationViewBtn}>
                <TouchableOpacity style={styles.btnRegister} onPress={start}>
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
        // left: 96,
        // top: 734,
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
        // margin: '0rem 26.37rem 2.87rem 0rem', 
        width: 19.251,
        height: 10.501,
        resizeMode: 'contain',
        alignSelf: 'flex-start',
        flexShrink: 0,
    },
    grpDrpDown: {
        // width: '50%', // Converted from 35.4625rem
        height: 23, // Converted from 2.3rem
        // position: 'absolute',
        // left: 16, // Converted from 1.6rem
        // top: 251, // Converted from 25.1rem
        // display: 'flex',
        // alignItems: 'flex-end',
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
        // position: 'absolute',
        // left: 16,
        // top: 123,
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 23,
        color: '#203139',
        fontFamily: 'Satoshi Variable, "Source Sans Pro"',
        marginTop: '8%',
        // marginRight: '10%',
        marginLeft: '4%',
    },
    nameInput: {
        width: '100%',
        height: '23',
        // position: 'absolute',
        // top: 123,
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
        // left: 16,
        // top: 157,
        marginTop: '2%',
        alignSelf: 'center',
        backgroundColor: '#ffffff',
    },
    lineTwo: {
        width: '95%',
        height: 1.5,
        // left: 16,
        // top: 157,
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