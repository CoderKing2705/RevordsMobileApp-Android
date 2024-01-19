import { StyleSheet } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from './Profile';
import ProfileEdit from './ProfileEdit';

const ProfileStack = ({ route, navigation }) => {
    const profileStack = createNativeStackNavigator();
    const {MemberData} = route.params
    console.log(MemberData)
    return (
        <>
            <profileStack.Navigator  initialRouteName='Profile' >
                <profileStack.Screen name="Profiles" component={Profile} initialParams={{ MemberData }} options={{
                    headerShown: false,
                }}/>
                <profileStack.Screen name="ProfileEdit" component={ProfileEdit} initialParams={{ MemberData }} options={{
                    headerShown: false,
                }}/>
            </profileStack.Navigator>
        </>
    );
};

const styles = StyleSheet.create({

})

export default ProfileStack;