import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { registerDeviceToken } from '@/services/placementos-api';
import { useAuth } from '@clerk/clerk-react';

export const useNotifications = () => {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !Capacitor.isNativePlatform()) {
      return;
    }

    const initializeNotifications = async () => {
      try {
        let perm = await PushNotifications.checkPermissions();
        
        if (perm.receive !== 'granted') {
          perm = await PushNotifications.requestPermissions();
        }

        if (perm.receive === 'granted') {
          await PushNotifications.register();
        }

        // Listen for successful registration
        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token: ' + token.value);
          try {
            await registerDeviceToken(token.value, Capacitor.getPlatform());
          } catch (err) {
            console.error('Failed to register device token with backend', err);
          }
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration error: ', error.error);
        });

        // Handle notification received in foreground
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ', notification);
        });

        // Handle notification click/action
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed: ', notification);
        });

      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [isLoaded, isSignedIn]);
};
