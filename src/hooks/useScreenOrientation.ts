import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

export const useScreenOrientation = (orientation: 'portrait' | 'landscape' | 'default') => {
  useEffect(() => {
    const setOrientation = async () => {
      try {
        switch (orientation) {
          case 'portrait':
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            break;
          case 'landscape':
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            break;
          case 'default':
            await ScreenOrientation.unlockAsync();
            break;
        }
      } catch (error) {
        console.log('Error setting screen orientation:', error);
      }
    };

    setOrientation();

    // Cleanup function to reset orientation when component unmounts
    return () => {
      ScreenOrientation.unlockAsync().catch(console.log);
    };
  }, [orientation]);
}; 