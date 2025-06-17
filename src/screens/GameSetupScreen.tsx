import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import StripedBackground from '../components/StripedBackground';

type GameSetupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GameSetup'>;
};

export default function GameSetupScreen({ navigation }: GameSetupScreenProps) {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [homePlayers, setHomePlayers] = useState<string[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<string[]>([]);
  const [homePlayerInput, setHomePlayerInput] = useState('');
  const [awayPlayerInput, setAwayPlayerInput] = useState('');

  const addHomePlayer = () => {
    if (homePlayerInput.trim()) {
      setHomePlayers([...homePlayers, homePlayerInput.trim()]);
      setHomePlayerInput('');
    }
  };

  const addAwayPlayer = () => {
    if (awayPlayerInput.trim()) {
      setAwayPlayers([...awayPlayers, awayPlayerInput.trim()]);
      setAwayPlayerInput('');
    }
  };

  const removeHomePlayer = (index: number) => {
    setHomePlayers(homePlayers.filter((_, i) => i !== index));
  };

  const removeAwayPlayer = (index: number) => {
    setAwayPlayers(awayPlayers.filter((_, i) => i !== index));
  };

  const startGame = () => {
    if (homeTeam && awayTeam && homePlayers.length > 0 && awayPlayers.length > 0) {
      navigation.navigate('Game', {
        homeTeam,
        awayTeam,
        homePlayers,
        awayPlayers,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StripedBackground />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Home Team</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter home team name"
          placeholderTextColor="#666"
          value={homeTeam}
          onChangeText={setHomeTeam}
        />

        <Text style={styles.title}>Home Players</Text>
        <View style={styles.playerInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter player name"
            placeholderTextColor="#666"
            value={homePlayerInput}
            onChangeText={setHomePlayerInput}
          />
          <TouchableOpacity style={styles.addButton} onPress={addHomePlayer}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        {homePlayers.map((player, index) => (
          <View key={index} style={styles.playerItem}>
            <Text style={styles.playerName}>{player}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeHomePlayer(index)}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.title}>Away Team</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter away team name"
          placeholderTextColor="#666"
          value={awayTeam}
          onChangeText={setAwayTeam}
        />

        <Text style={styles.title}>Away Players</Text>
        <View style={styles.playerInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter player name"
            placeholderTextColor="#666"
            value={awayPlayerInput}
            onChangeText={setAwayPlayerInput}
          />
          <TouchableOpacity style={styles.addButton} onPress={addAwayPlayer}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        {awayPlayers.map((player, index) => (
          <View key={index} style={styles.playerItem}>
            <Text style={styles.playerName}>{player}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeAwayPlayer(index)}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.startButton}
          onPress={startGame}
          disabled={!homeTeam || !awayTeam || homePlayers.length === 0 || awayPlayers.length === 0}
        >
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 10,
    fontFamily: 'PressStart2P',
    fontSize: 14,
  },
  playerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    alignItems: 'center',
    marginLeft: 10,
    minWidth: 80,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PressStart2P',
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
  },
  playerName: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#000000',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontFamily: 'PressStart2P',
  },
  startButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PressStart2P',
  },
  backButton: {
    backgroundColor: '#000000',
    padding: 15,
    alignItems: 'center',
    margin: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PressStart2P',
  },
}); 