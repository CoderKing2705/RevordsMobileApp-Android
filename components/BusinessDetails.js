import { StyleSheet, View, Image, Text } from "react-native";
import Globals from '../components/Globals';
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
export default function BusinessDetails({ route }) {
    const navigation = useNavigation();
    const id = route.params.id;
    const [businessDetails, setBusinessDetails] = useState([]);
    const businessDetailsAPI = `${Globals.API_URL}/BusinessProfiles`;
    const imagePath = businessDetails ? businessDetails.imagePath : null;
    const imageUrl = `http://ho.hitechprojects.co.in:8101/WWWROOT/${imagePath}`;
    const goBackToCardView = () => {
        navigation.navigate("Locations")
    };
    console.log(imagePath)
    useEffect(() => {
        axios({
            method: 'GET',
            url: `${businessDetailsAPI}/${id}`
        })
            .then(response => {
                setBusinessDetails(response.data)
                //console.log(response.data.businessName)
                // console.log(businessId);
            })
            .catch(error => {
                console.log("Error Fetching data", error)
            });
    }, [id])
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
            <View style={{ backgroundColor: 'white' }}>
                <Image source={{ uri: imageUrl }} style={styles.imageBusiness} />
                <Text style={{ fontWeight: 700, bottom: 8 }}> {businessDetails.businessName} </Text>
                <Text style={{ color: '#717679', fontWeight: 700, }}> {businessDetails.industry} </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    imageBusiness: {
        width: 350,
        height: 150,
        position: 'relative',
        bottom: 25,
        borderRadius: 20
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