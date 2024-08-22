import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Location from './Location';
import MapViewing from './MapView';
import BusinessDetailsView from './BusinessDetailsView';
import { useContext } from 'react';
import PageSequenceContext from './contexts/PageSequence/PageSequenceContext';

const LocationStack = ({ route, navigation }) => {
    const PageSequence = useContext(PageSequenceContext);
    const locationStack = createNativeStackNavigator();
    return (
        <>
            <locationStack.Navigator initialRouteName={PageSequence.pageSequenceData.mobileFirstLocationPage} >
                <locationStack.Screen name="Locations" component={Location} options={{
                    headerShown: false,
                }} />                
                <locationStack.Screen name="MapViewing" component={MapViewing} options={{
                    headerShown: false,
                }} />
                <locationStack.Screen name="BusinessDetailView" component={BusinessDetailsView} options={{
                    headerShown: false
                }} />
            </locationStack.Navigator>
        </>
    );
};

const styles = StyleSheet.create({

})

export default LocationStack;