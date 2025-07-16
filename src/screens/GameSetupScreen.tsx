import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import StripedBackground from '../components/StripedBackground';
import PlayerAutocomplete from '../components/PlayerAutocomplete';
import * as ScreenOrientation from 'expo-screen-orientation';
import { capitalizePlayerName, formatNameForDatabase } from '../utils/nameUtils';

type GameSetupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GameSetup'>;
};

export default function GameSetupScreen({ navigation }: GameSetupScreenProps) {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [homeAbbreviation, setHomeAbbreviation] = useState('');
  const [awayAbbreviation, setAwayAbbreviation] = useState('');
  const [homePlayers, setHomePlayers] = useState<string[]>(['']);
  const [awayPlayers, setAwayPlayers] = useState<string[]>(['']);
  const [selectedInnings, setSelectedInnings] = useState(9);
  const [showInningsModal, setShowInningsModal] = useState(false);

  const inningsOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Lock to portrait mode when screen loads
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
    lockOrientation();
  }, []);

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

  const handleHomeAbbreviationChange = (text: string) => {
    // Only allow letters, max 3 characters
    const sanitizedText = text.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (sanitizedText.length <= 3) {
      setHomeAbbreviation(sanitizedText);
    }
  };

  const handleAwayAbbreviationChange = (text: string) => {
    // Only allow letters, max 3 characters
    const sanitizedText = text.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (sanitizedText.length <= 3) {
      setAwayAbbreviation(sanitizedText);
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
    // Don't allow names that start with spaces
    if (text.startsWith(' ')) {
      return;
    }
    
    const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, '');
    if (sanitizedText.length <= 13) {
      const newPlayers = [...homePlayers];
      newPlayers[index] = sanitizedText;
      setHomePlayers(newPlayers);
    }
  };

  const handleAwayPlayerChange = (index: number, text: string) => {
    // Don't allow names that start with spaces
    if (text.startsWith(' ')) {
      return;
    }
    
    const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, '');
    if (sanitizedText.length <= 13) {
      const newPlayers = [...awayPlayers];
      newPlayers[index] = sanitizedText;
      setAwayPlayers(newPlayers);
    }
  };

  const handleHomePlayerSubmit = (index: number) => {
    let trimmedName = homePlayers[index].trim();
    
    // If the name is empty, just clear it and return
    if (trimmedName === '') {
      const newPlayers = [...homePlayers];
      newPlayers[index] = '';
      setHomePlayers(newPlayers);
      return;
    }
    
    // Check for duplicates (ignore empty names)
    const allPlayers = [...homePlayers, ...awayPlayers];
    const isDuplicate = allPlayers.some((player, playerIndex) => {
      if (playerIndex === index) return false; // Don't check against self
      const playerTrimmed = player.trim();
      if (playerTrimmed === '') return false; // Ignore empty names
      return formatNameForDatabase(playerTrimmed) === formatNameForDatabase(trimmedName);
    });
    
    if (isDuplicate) {
      // Clear the duplicate name
      const newPlayers = [...homePlayers];
      newPlayers[index] = '';
      setHomePlayers(newPlayers);
      Alert.alert('Duplicate Name', 'This name is already used by another player. Please enter a different name.');
      return;
    }
    
    // Apply capitalized name for display
    const newPlayers = [...homePlayers];
    newPlayers[index] = capitalizePlayerName(trimmedName);
    setHomePlayers(newPlayers);
  };

  const handleAwayPlayerSubmit = (index: number) => {
    let trimmedName = awayPlayers[index].trim();
    
    // If the name is empty, just clear it and return
    if (trimmedName === '') {
      const newPlayers = [...awayPlayers];
      newPlayers[index] = '';
      setAwayPlayers(newPlayers);
      return;
    }
    
    // Check for duplicates (ignore empty names)
    const allPlayers = [...homePlayers, ...awayPlayers];
    const isDuplicate = allPlayers.some((player, playerIndex) => {
      if (playerIndex === homePlayers.length + index) return false; // Don't check against self
      const playerTrimmed = player.trim();
      if (playerTrimmed === '') return false; // Ignore empty names
      return formatNameForDatabase(playerTrimmed) === formatNameForDatabase(trimmedName);
    });
    
    if (isDuplicate) {
      // Clear the duplicate name
      const newPlayers = [...awayPlayers];
      newPlayers[index] = '';
      setAwayPlayers(newPlayers);
      Alert.alert('Duplicate Name', 'This name is already used by another player. Please enter a different name.');
      return;
    }
    
    // Apply capitalized name for display
    const newPlayers = [...awayPlayers];
    newPlayers[index] = capitalizePlayerName(trimmedName);
    setAwayPlayers(newPlayers);
  };

  const removeLastHomePlayer = () => {
    if (homePlayers.length > 1) {
      setHomePlayers(homePlayers.slice(0, -1));
    }
  };

  const removeLastAwayPlayer = () => {
    if (awayPlayers.length > 1) {
      setAwayPlayers(awayPlayers.slice(0, -1));
    }
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    // Check team names
    if (!homeTeam.trim() || !awayTeam.trim()) {
      return false;
    }
    
    // Check team abbreviations
    if (!homeAbbreviation.trim() || !awayAbbreviation.trim()) {
      return false;
    }
    
    // Check that all players have names
    const validHomePlayers = homePlayers.filter(player => player.trim() !== '');
    const validAwayPlayers = awayPlayers.filter(player => player.trim() !== '');
    
    if (validHomePlayers.length === 0 || validAwayPlayers.length === 0) {
      return false;
    }
    
    // Check that there are no empty player slots
    if (validHomePlayers.length !== homePlayers.length || validAwayPlayers.length !== awayPlayers.length) {
      return false;
    }
    
    return true;
  };

  const startGame = () => {
    const validHomePlayers = homePlayers.filter(player => player.trim() !== '');
    const validAwayPlayers = awayPlayers.filter(player => player.trim() !== '');
    
    if (!homeTeam.trim()) {
      Alert.alert('Error', 'Please enter a home team name');
      return;
    }
    
    if (!awayTeam.trim()) {
      Alert.alert('Error', 'Please enter an away team name');
      return;
    }
    
    if (!homeAbbreviation.trim()) {
      Alert.alert('Error', 'Please enter a home team abbreviation');
      return;
    }
    
    if (!awayAbbreviation.trim()) {
      Alert.alert('Error', 'Please enter an away team abbreviation');
      return;
    }
    
    if (validHomePlayers.length === 0) {
      Alert.alert('Error', 'Please add at least one player to the home team');
      return;
    }
    
    if (validAwayPlayers.length === 0) {
      Alert.alert('Error', 'Please add at least one player to the away team');
      return;
    }
    
    // Check for empty player slots
    if (validHomePlayers.length !== homePlayers.length) {
      Alert.alert('Error', 'Please fill in all player names for the home team');
      return;
    }
    
    if (validAwayPlayers.length !== awayPlayers.length) {
      Alert.alert('Error', 'Please fill in all player names for the away team');
      return;
    }
    
    navigation.navigate('Game', {
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      homeAbbreviation: homeAbbreviation.trim(),
      awayAbbreviation: awayAbbreviation.trim(),
      homePlayers: validHomePlayers,
      awayPlayers: validAwayPlayers,
      maxInnings: selectedInnings,
    });
  };

  const renderPlayerInputs = (players: string[], isHomeTeam: boolean) => {
    // Get all current player names from both teams
    const allPlayerNames = [...homePlayers, ...awayPlayers];
    
    return (
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
          <View key={index} style={[styles.playerInputContainer, { zIndex: 1000 - index }]}>
            <Text style={styles.playerNumber}>{index + 1}.</Text>
            <PlayerAutocomplete
              value={player}
              onChangeText={(text) => isHomeTeam ? handleHomePlayerChange(index, text) : handleAwayPlayerChange(index, text)}
              onBlur={() => isHomeTeam ? handleHomePlayerSubmit(index) : handleAwayPlayerSubmit(index)}
              placeholder="Player Name"
              style={styles.playerInput}
              allPlayerNames={allPlayerNames}
            />
          </View>
        ))}
        {players.length > 1 && (
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
  };

  const renderInningsSelector = () => (
    <View style={styles.inningsSection}>
      <Text style={styles.inningsTitle}>Number of Innings</Text>
      <TouchableOpacity
        style={styles.inningsSelector}
        onPress={() => setShowInningsModal(true)}
      >
        <Text style={styles.inningsText}>{selectedInnings}</Text>
        <Text style={styles.inningsArrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );

  const renderInningsModal = () => (
    <Modal
      visible={showInningsModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowInningsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Innings</Text>
          {inningsOptions.map((innings) => (
            <TouchableOpacity
              key={innings}
              style={[
                styles.modalOption,
                selectedInnings === innings && styles.modalOptionSelected
              ]}
              onPress={() => {
                setSelectedInnings(innings);
                setShowInningsModal(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                selectedInnings === innings && styles.modalOptionTextSelected
              ]}>
                {innings}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalCancel}
            onPress={() => setShowInningsModal(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StripedBackground />
      <View style={styles.divider} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
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
                autoCorrect={false}
              />
              <TextInput
                style={styles.abbreviationInput}
                placeholder="Abr."
                placeholderTextColor="#666"
                value={homeAbbreviation}
                onChangeText={handleHomeAbbreviationChange}
                returnKeyType="done"
                autoCorrect={false}
              />
              {renderPlayerInputs(homePlayers, true)}
            </View>

            <View style={styles.divider} />

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
                autoCorrect={false}
              />
              <TextInput
                style={styles.abbreviationInput}
                placeholder="Abr."
                placeholderTextColor="#666"
                value={awayAbbreviation}
                onChangeText={handleAwayAbbreviationChange}
                returnKeyType="done"
                autoCorrect={false}
              />
              {renderPlayerInputs(awayPlayers, false)}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderInningsSelector()}
      {renderInningsModal()}

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[
            styles.startButton,
            !isFormValid() && styles.startButtonDisabled
          ]}
          onPress={startGame}
          disabled={!isFormValid()}
        >
          <Text style={[
            styles.startButtonText,
            !isFormValid() && styles.startButtonTextDisabled
          ]}>Start Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  abbreviationInput: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 10,
    fontFamily: 'PressStart2P',
    fontSize: 10,
    width: 100,
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
  startButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PressStart2P',
  },
  startButtonTextDisabled: {
    color: '#666666',
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
    zIndex: 100,
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
    fontSize: 8,
  },
  inningsSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 3,
  },
  inningsTitle: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  inningsSelector: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  inningsText: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#000000',
  },
  inningsArrow: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PressStart2P',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  modalOptionSelected: {
    backgroundColor: '#2196F3',
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#000000',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: '#FFFFFF',
  },
  modalCancel: {
    padding: 15,
    marginTop: 10,
    backgroundColor: '#CCCCCC',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#000000',
    textAlign: 'center',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
}); 