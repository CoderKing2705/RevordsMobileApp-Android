import { StyleSheet, Image, Text, View, Pressable, Button } from 'react-native';
// import { TextInput } from 'react-native-gesture-handler';
import MaskInput from 'react-native-mask-input';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { useRef, useState } from 'react';

const Favourite = ({ navigation }) => {

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Favourite</Text>
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
})

export default Favourite;