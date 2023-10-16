import { useState, useEffect } from 'react';
import { StyleSheet, Image, Text, View, Pressable, Button, SafeAreaView } from 'react-native';
import MaskInput from 'react-native-mask-input';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Globals from '../components/Globals';
import Spinner from 'react-native-loading-spinner-overlay';


const VerifyNumber = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [unMaskPhone, setunMaskPhone] = useState('');

  const startLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 5000);
  };

  spinner = false;
  ToEmail = "";
  randomnumber = "";
  CustomerExists = false;

  function MailSendAPI(ToEmail) {
    let formdata = new FormData();
    generateRandomNumber();
    formdata.append("FromForm[DisplayName]", 'DisplayName')
    formdata.append("FromForm[ToEmail]", this.ToEmail)
    formdata.append("FromForm[Subject]", "OTP")
    formdata.append("FromForm[Body]", this.randomnumber)
    formdata.append("FromForm[BusinessLogoPath]", "")
    formdata.append("FromForm[AnnoucementImagePath]", "")
    formdata.append("FromForm[RevordsImagePath]", "")

    return fetch(Globals.API_URL + '/Mail/Send', {
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data',
      }, body: formdata
    })
      .then(response => { return response; })
      .catch(err => { });
  }

  function generateRandomNumber() {
    const min = 1000;
    const max = 9999;
    const randomNumber =
      Math.floor(Math.random() * (max - min + 1)) + min;
    this.randomnumber = randomNumber.toString();
  };

  async function fetchAPI() {
    try {
      setLoading(true);
      const response = await fetch(
        Globals.API_URL + '/MemberProfiles/GetMemberByPhoneNo/' + unMaskPhone)
      const json = await response.json();
      // console.log(json);
      this.CustomerExists = json != undefined && json.length > 0 ? json : false;
      this.ToEmail = "parthskyward@gmail.com";
      await MailSendAPI(ToEmail).then(
        navigation.navigate('GetOtp', { OTP: this.randomnumber, CustomerExists: this.CustomerExists })
      ).catch();
      setLoading(false);
      return json;
    } catch (error) {
      return error;
    }
  }

  handleOnPress = () => {
    try {
      fetchAPI();
    }
    catch (e) {
      console.log(e);
    }
  }

  return (
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
        onChangeText={(masked, unmasked) => {
          if (unmasked.length <= 10) {
            setPhone(masked); // you can use the unmasked value as well       
            setunMaskPhone(unmasked);
          }
        }}
        mask={['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
        placeholder="(000) 000-0000"
      />

      <TouchableOpacity onPress={this.handleOnPress} style={styles.frame2vJu}>
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
    marginTop: '-10%'
  },
  deviceView: {
    backgroundColor: '#fff',
    width: 150,
    height: 150,
    alignItems: 'center',
    padding: '5%',
    borderRadius: 500,
    marginTop: '-10%',
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
    width: '50%',
    borderColor: 'gray',
    borderBottomWidth: 1,
    paddingLeft: 10,
    borderRadius: 8,
    // textAlign: 'center',
    fontSize: 24
  },
  frame2vJu: {
    backgroundColor: '#140d05',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    width: 200,
    flexDirection: 'row',
    marginTop: '5%'
  },
  getStartednru: {
    lineHeight: 22.5,
    textTransform: 'uppercase',
    fontFamily: 'SatoshiVariable, SourceSansPro',
    flexShrink: 0,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ffffff',
    margin: '0 29 1 0',
    flex: 10,
    zIndex: 10,
  },
  arrowcirclerightTy3: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    flexShrink: 0,
    marginLeft: 10
  },
})

export default VerifyNumber;