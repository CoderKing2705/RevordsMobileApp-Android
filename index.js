import { AppRegistry, Text, TextInput } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

export default function Index() {
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.allowFontScaling = false;
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.allowFontScaling = false;
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background', remoteMessage);
    });
    messaging().getInitialNotification(async remoteMessage => {
        console.log('Message handeled in the background', remoteMessage);
    });
    AppRegistry.registerComponent(appName, () => App);
}