import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { formatNameForDatabase, capitalizePlayerName } from '../utils/nameUtils';
import { getPlayerNames } from '../services/api';

interface PlayerAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  style?: any;
  allPlayerNames?: string[];
}

export default function PlayerAutocomplete({
  value,
  onChangeText,
  onBlur,
  placeholder = 'Player Name',
  style,
  allPlayerNames = []
}: PlayerAutocompleteProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [databasePlayers, setDatabasePlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<View>(null);

  // Fetch player names from database on component mount
  useEffect(() => {
    fetchPlayerNames();
  }, []);

  const fetchPlayerNames = async () => {
    setLoading(true);
    try {
      const response = await getPlayerNames();
      if (response.success && Array.isArray(response.data)) {
        setDatabasePlayers(response.data);
      } else {
        setDatabasePlayers([]); // Defensive: always set an array
      }
    } catch (error) {
      setDatabasePlayers([]); // Defensive: always set an array
      console.error('Error fetching player names:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if the current value is a new player (not in database)
  const isNewPlayer = value.trim() !== '' && !databasePlayers.some(player => 
    formatNameForDatabase(player) === formatNameForDatabase(value)
  );

  // Filter players based on input and exclude already selected names
  const filteredPlayers = databasePlayers.filter(player => {
    // If input is empty, show all players (except already selected ones)
    const matchesInput = value.trim() === '' || player.toLowerCase().includes((value || '').toLowerCase());
    
    // Check if this player name is already selected by another player
    const isAlreadySelected = allPlayerNames.some(selectedName => 
      formatNameForDatabase(selectedName) === formatNameForDatabase(player)
    );
    
    return matchesInput && !isAlreadySelected;
  });

  const handleTextChange = (text: string) => {
    onChangeText(text);
    setShowDropdown(true);
  };

  const handleSelectPlayer = (playerName: string) => {
    onChangeText(capitalizePlayerName(playerName));
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow for selection
    setTimeout(() => setShowDropdown(false), 200);
    // Call the onBlur prop for validation
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <View style={styles.container} ref={containerRef}>
      <TextInput
        style={[
          styles.input, 
          style,
          isNewPlayer && styles.newPlayerInput
        ]}
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor="#666"
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        returnKeyType="done"
        autoCorrect={false}
      />
      
      {showDropdown && filteredPlayers.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView 
            style={styles.dropdownList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {filteredPlayers.map((playerName, index) => (
              <TouchableOpacity
                key={index}
                style={styles.playerItem}
                onPress={() => handleSelectPlayer(playerName)}
                activeOpacity={0.7}
              >
                <Text style={styles.playerName}>{capitalizePlayerName(playerName)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 9999,
    flex: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    fontFamily: 'PressStart2P',
    fontSize: 8,
    minWidth: 0, // Allow flex to control width
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#808080',
    borderWidth: 3,
    borderColor: '#000000',
    maxHeight: 80,
    zIndex: 99999,
    elevation: 999,
  },
  dropdownList: {
    flex: 1,
  },
  playerItem: {
    padding: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  playerName: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
  },
  newPlayerInput: {
    backgroundColor: '#FFFF00',
  },
}); 