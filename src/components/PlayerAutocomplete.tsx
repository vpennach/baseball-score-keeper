import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

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
  const containerRef = useRef<View>(null);
  
  // Hardcoded player names for testing
  const hardcodedPlayers = [
    'Aaron',
    'Barry',
    'Carlos',
    'David',
    'Eddie',
    'Frank',
    'George',
    'Henry',
    'Ivan',
    'Jack'
  ];

  // Check if the current value is a new player (not in hardcoded list)
  const isNewPlayer = value.trim() !== '' && !hardcodedPlayers.some(player => 
    player.toLowerCase() === value.trim().toLowerCase()
  );

  // Filter players based on input and exclude already selected names
  const filteredPlayers = hardcodedPlayers.filter(player => {
    // Check if this player name matches the input
    const matchesInput = player.toLowerCase().includes((value || '').toLowerCase());
    
    // Check if this player name is already selected by another player
    const isAlreadySelected = allPlayerNames.some(selectedName => 
      selectedName.trim().toLowerCase() === player.toLowerCase()
    );
    
    return matchesInput && !isAlreadySelected;
  });

  const handleTextChange = (text: string) => {
    onChangeText(text);
    setShowDropdown(true);
  };

  const handleSelectPlayer = (playerName: string) => {
    onChangeText(playerName);
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

  const handleOutsideClick = () => {
    setShowDropdown(false);
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsideClick}>
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
            >
              {filteredPlayers.map((playerName, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.playerItem}
                  onPress={() => handleSelectPlayer(playerName)}
                >
                  <Text style={styles.playerName}>{playerName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
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