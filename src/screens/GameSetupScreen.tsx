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

type GameSetupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GameSetup'>;
};

export default function GameSetupScreen({ navigation }: GameSetupScreenProps) {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [homePlayers, setHomePlayers] = useState<string[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<string[]>([]);
  const [newHomePlayer, setNewHomePlayer] = useState('');
  const [newAwayPlayer, setNewAwayPlayer] = useState('');

  const addHomePlayer = () => {
    if (newHomePlayer.trim()) {
      setHomePlayers([...homePlayers, newHomePlayer.trim()]);
      setNewHomePlayer('');
    }
  };

  const addAwayPlayer = () => {
    if (newAwayPlayer.trim()) {
      setAwayPlayers([...awayPlayers, newAwayPlayer.trim()]);
      setNewAwayPlayer('');
    }
  };

  const removeHomePlayer = (index: number) => {
    setHomePlayers(homePlayers.filter((_, i) => i !== index));
  };

  const removeAwayPlayer = (index: number) => {
    setAwayPlayers(awayPlayers.filter((_, i) => i !== index));
  };

  const startGame = () => {
    if (!homeTeam || !awayTeam) {
      Alert.alert('Error', 'Please enter both team names');
      return;
    }
    if (homePlayers.length === 0 || awayPlayers.length === 0) {
      Alert.alert('Error', 'Please add at least one player to each team');
      return;
    }
    navigation.navigate('Game', {
      homeTeam,
      awayTeam,
      homePlayers,
      awayPlayers,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.teamSection}>
        <Text style={styles.sectionTitle}>Home Team</Text>
        <TextInput
          style={styles.teamInput}
          placeholder="Enter home team name"
          value={homeTeam}
          onChangeText={setHomeTeam}
        />
        <View style={styles.playerInputContainer}>
          <TextInput
            style={styles.playerInput}
            placeholder="Add home player"
            value={newHomePlayer}
            onChangeText={setNewHomePlayer}
          />
          <TouchableOpacity style={styles.addButton} onPress={addHomePlayer}>
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
        </View>
        {homePlayers.map((player, index) => (
          <View key={index} style={styles.playerRow}>
            <Text style={styles.playerName}>{player}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeHomePlayer(index)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.teamSection}>
        <Text style={styles.sectionTitle}>Away Team</Text>
        <TextInput
          style={styles.teamInput}
          placeholder="Enter away team name"
          value={awayTeam}
          onChangeText={setAwayTeam}
        />
        <View style={styles.playerInputContainer}>
          <TextInput
            style={styles.playerInput}
            placeholder="Add away player"
            value={newAwayPlayer}
            onChangeText={setNewAwayPlayer}
          />
          <TouchableOpacity style={styles.addButton} onPress={addAwayPlayer}>
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
        </View>
        {awayPlayers.map((player, index) => (
          <View key={index} style={styles.playerRow}>
            <Text style={styles.playerName}>{player}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeAwayPlayer(index)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.startButton} onPress={startGame}>
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  teamSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 15,
  },
  teamInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  playerInputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  playerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#f4511e',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: '#f4511e',
    fontSize: 20,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 