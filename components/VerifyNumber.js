import { useState, useEffect } from 'react';
import { StyleSheet, Image, Text, View, Pressable, Button, SafeAreaView, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import MaskInput from 'react-native-mask-input';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Globals from '../components/Globals';
import Spinner from 'react-native-loading-spinner-overlay';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


const VerifyNumber = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [unMaskPhone, setunMaskPhone] = useState('');
  const [isValid, setIsValid] = useState(true);

  spinner = false;
  randomnumber = "";
  CustomerExists = false;

  const generateRandomNumber = () => {
    const min = 1000;
    const max = 9999;
    const randomNumber =
      Math.floor(Math.random() * (max - min + 1)) + min;
    randomnumber = randomNumber.toString();
    return randomNumber;
  };

  async function fetchAPI() {
    try {
      setLoading(true);
      const response = await fetch(
        Globals.API_URL + '/MemberProfiles/GetMemberByPhoneNo/' + unMaskPhone)
      const json = await response.json();
      CustomerExists = json != undefined && json.length > 0 ? json : null;

      const randomOtp = await generateRandomNumber();
      console.log(randomOtp)
      try {
        fetch(`${Globals.API_URL}/Mail/SendOTP/${parseFloat(unMaskPhone)}/${randomOtp}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }).then((res) => {
          console.log('otp response-----', JSON.stringify(res))
          // if (res.ok) {
            navigation.navigate('GetOtp', { OTP: randomOtp, CustomerExists: CustomerExists, Phone: unMaskPhone })
            setLoading(false);
            return json;
          // } else {
          //   ToastAndroid.showWithGravityAndOffset(
          //     'You can only signin with U.S.A. Number!',
          //     ToastAndroid.LONG,
          //     ToastAndroid.BOTTOM,
          //     25,
          //     50,
          //   );
          //   setLoading(false);
          // }
        });
      } catch (error) {
        console.log(error);
        ToastAndroid.showWithGravityAndOffset(
          'There is some issue! TRY Again!',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50,
        );
      }

    } catch (error) {
      setLoading(false);
      alert(error)
      return error;
    }
  }

  const handleOnPress = async () => {
    console.log(unMaskPhone)
    try {
      if (unMaskPhone.length == 10) {
        await fetchAPI();
      }
      else {
        setIsValid(false);
      }
    }
    catch (e) {
      alert(e);
    }
  }

  return (
    <KeyboardAwareScrollView style={{ backgroundColor: '#d9e7ed' }}>
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Welcome To</Text>
        <Image source={require('../assets/companylogo.png')} style={styles.companylogo} />
        <View style={styles.deviceView}>
          <Image source={require('../assets/devicemobile-9n9.png')} style={styles.mobilelogo} />
        </View>
        <Text style={styles.verifyText}>Verify Your Number</Text>
        <MaskInput
          value={phone}
          style={styles.textInput}
          keyboardType="numeric"
          maxLength={14}
          onChangeText={(masked, unmasked) => {
            if (unmasked.length <= 10) {
              setPhone(masked); // you can use the unmasked value as well       
              setunMaskPhone(unmasked);
            }
          }}
          mask={['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
          placeholder="(000) 000-0000"
        />
        {!isValid && <Text style={{ color: 'red', marginTop: 4 }}>Invalid Phone Number</Text>}

        <TouchableOpacity activeOpacity={.7} onPress={handleOnPress} style={styles.frame2vJu}>
          <Text style={styles.getStartednru}>Request Otp</Text>
          <Image source={require('../assets/arrowcircleright-R8m.png')} style={styles.arrowcirclerightTy3} />
        </TouchableOpacity>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <Spinner
              //visibility of Overlay Loading Spinner
              visible={loading}
              //Text with the Spinner
              textContent={''}
              //Text style of the Spinner Text
              textStyle={styles.spinnerTextStyle}
            />
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#d9e7ed',
    alignItems: 'center'
  },
  welcomeText: {
    color: '#3380a3',
    fontSize: 24,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: '5%'
  },
  companylogo: {
    flexShrink: 0,
    width: '70%',
    resizeMode: 'contain',
    // marginTop: '-10%'
  },
  deviceView: {
    backgroundColor: '#fff',
    width: 150,
    height: 150,
    alignItems: 'center',
    padding: '5%',
    borderRadius: 500,
    // marginTop: '-10%',
    justifyContent: 'center'
  },
  mobilelogo: {
    width: '50%',
    height: '80%'
  },
  verifyText: {
    color: '#140d05',
    fontSize: 24,
    fontWeight: '700',
    marginTop: '5%',
    marginBottom: '5%'
  },
  textInput: {
    height: 45,
    width: '55%',
    borderColor: 'gray',
    borderBottomWidth: 1,
    paddingLeft: 2,
    borderRadius: 8,
    fontSize: 24,
  },
  frame2vJu: {
    marginTop: '5%',
    marginBottom: 35,
    backgroundColor: '#140d05',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    width: '60%',
    flexDirection: 'row',
  },
  getStartednru: {
    textTransform: 'uppercase',
    fontFamily: 'SatoshiVariable, SourceSansPro',
    flexShrink: 0,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    flex: 10,
    zIndex: 10,
    width: '100%'
  },
  arrowcirclerightTy3: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    flexShrink: 0,
    marginRight: 20,
  },
})

export default VerifyNumber;