import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

  const handleHomeTeamChange = (text: string) => {
    // Remove special characters and only allow letters, numbers, and spaces
    const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, '');
    if (sanitizedText.length <= 13) {
      setHomeTeam(sanitizedText);
    }
  };

  const handleAwayTeamChange = (text: string) => {
    // Remove special characters and only allow letters, numbers, and spaces
    const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, '');
    if (sanitizedText.length <= 13) {
      setAwayTeam(sanitizedText);
    }
  };

  const handleHomeTeamSubmit = () => {
    // If the team name is only spaces, reset to empty
    if (homeTeam.trim() === '') {
      setHomeTeam('');
    }
  };

  const handleAwayTeamSubmit = () => {
    // If the team name is only spaces, reset to empty
    if (awayTeam.trim() === '') {
      setAwayTeam('');
    }
  };

  const addHomePlayer = () => {
    if (homePlayers.length < 9) {
      setHomePlayers([...homePlayers, '']);
    }
  };

  const addAwayPlayer = () => {
    if (awayPlayers.length < 9) {
      setAwayPlayers([...awayPlayers, '']);
    }
  };

  const handleHomePlayerChange = (index: number, text: string) => {
    const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, '');
    const newPlayers = [...homePlayers];
    newPlayers[index] = sanitizedText;
    setHomePlayers(newPlayers);
  };

  const handleAwayPlayerChange = (index: number, text: string) => {
    const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, '');
    const newPlayers = [...awayPlayers];
    newPlayers[index] = sanitizedText;
    setAwayPlayers(newPlayers);
  };

  const handleHomePlayerSubmit = (index: number) => {
    if (homePlayers[index].trim() === '') {
      const newPlayers = [...homePlayers];
      newPlayers[index] = '';
      setHomePlayers(newPlayers);
    }
  };

  const handleAwayPlayerSubmit = (index: number) => {
    if (awayPlayers[index].trim() === '') {
      const newPlayers = [...awayPlayers];
      newPlayers[index] = '';
      setAwayPlayers(newPlayers);
    }
  };

  const removeLastHomePlayer = () => {
    if (homePlayers.length > 0) {
      setHomePlayers(homePlayers.slice(0, -1));
    }
  };

  const removeLastAwayPlayer = () => {
    if (awayPlayers.length > 0) {
      setAwayPlayers(awayPlayers.slice(0, -1));
    }
  };

  const startGame = () => {
    if (homeTeam && awayTeam) {
      navigation.navigate('Game', {
        homeTeam,
        awayTeam,
        homePlayers: homePlayers.filter(player => player.trim() !== ''),
        awayPlayers: awayPlayers.filter(player => player.trim() !== ''),
      });
    }
  };

  const renderPlayerInputs = (players: string[], isHomeTeam: boolean) => (
    <View style={styles.playersSection}>
      <View style={styles.playersHeader}>
        <Text style={styles.playersTitle}>Players</Text>
        {players.length < 9 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={isHomeTeam ? addHomePlayer : addAwayPlayer}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
      {players.map((player, index) => (
        <View key={index} style={styles.playerInputContainer}>
          <Text style={styles.playerNumber}>{index + 1}.</Text>
          <TextInput
            style={styles.playerInput}
            placeholder="Player Name"
            placeholderTextColor="#666"
            value={player}
            onChangeText={(text) => isHomeTeam ? handleHomePlayerChange(index, text) : handleAwayPlayerChange(index, text)}
            onSubmitEditing={() => isHomeTeam ? handleHomePlayerSubmit(index) : handleAwayPlayerSubmit(index)}
            returnKeyType="done"
          />
        </View>
      ))}
      {players.length > 0 && (
        <View style={styles.playersHeader}>
          <Text style={styles.playersTitle}>Remove</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={isHomeTeam ? removeLastHomePlayer : removeLastAwayPlayer}
          >
            <Text style={styles.addButtonText}>-</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StripedBackground />
      <View style={styles.divider} />
      <ScrollView 
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          <View style={styles.teamSection}>
            <Text style={styles.title}>Home Team</Text>
            <TextInput
              style={styles.input}
              placeholder="Team Name"
              placeholderTextColor="#666"
              value={homeTeam}
              onChangeText={handleHomeTeamChange}
              onSubmitEditing={handleHomeTeamSubmit}
              returnKeyType="done"
            />
            {renderPlayerInputs(homePlayers, true)}
          </View>

          <View style={styles.teamSection}>
            <Text style={styles.title}>Away Team</Text>
            <TextInput
              style={styles.input}
              placeholder="Team Name"
              placeholderTextColor="#666"
              value={awayTeam}
              onChangeText={handleAwayTeamChange}
              onSubmitEditing={handleAwayTeamSubmit}
              returnKeyType="done"
            />
            {renderPlayerInputs(awayPlayers, false)}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={startGame}
          disabled={!homeTeam || !awayTeam}
        >
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  teamSection: {
    flex: 1,
    padding: 20,
    zIndex: 1,
  },
  divider: {
    width: 4,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    marginLeft: -2,
    zIndex: 2,
  },
  title: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    marginBottom: 15,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 10,
    fontFamily: 'PressStart2P',
    fontSize: 10,
  },
  bottomButtons: {
    padding: 20,
    gap: 10,
    zIndex: 3,
  },
  startButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    alignItems: 'center',
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
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PressStart2P',
  },
  scrollView: {
    flex: 1,
  },
  playersSection: {
    marginTop: 20,
  },
  playersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playersTitle: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    paddingBottom: 10,
  },
  addButton: {
    marginLeft: 10,
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  addButtonText: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#000000',
    lineHeight: 24,
  },
  playerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerNumber: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    marginRight: 8,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  playerInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 8,
    fontFamily: 'PressStart2P',
    fontSize: 10,
  },
}); 