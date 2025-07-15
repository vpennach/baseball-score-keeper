import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import StripedBackground from '../components/StripedBackground';
import * as ScreenOrientation from 'expo-screen-orientation';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  // Lock to portrait mode when screen loads
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
    lockOrientation();
  }, []);

  return (
    <View style={styles.container}>
      <StripedBackground />
      <Text style={styles.title}>Party Baseball</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('GameSetup')}
        >
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.buttonText}>Game History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('PlayerStats')}
        >
          <Text style={styles.buttonText}>Player Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={() => navigation.navigate('ApiTest')}
        >
          <Text style={styles.buttonText}>API Test</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PressStart2P',
    marginBottom: 40,
    marginTop: -100,
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    padding: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  button: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    width: '100%',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'PressStart2P',
  },
  testButton: {
    backgroundColor: '#FF6B6B',
  },
}); 