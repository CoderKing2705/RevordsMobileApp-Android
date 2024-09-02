import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { EventBus } from './EventEmitter';

const LogoutHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const handleLogout = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'LandingScreen' }],
      });
    };

    EventBus.on('logout', handleLogout);

    return () => {
      EventBus.off('logout', handleLogout);
    };
  }, [navigation]);

  return null;
};

export default LogoutHandler;