import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { gameService, playerService, ApiResponse } from '../services';

const ApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testApiConnection = async () => {
    setIsLoading(true);
    addResult('Testing API connection...');

    try {
      // Test getting all games
      const gamesResponse = await gameService.getAllGames();
      const games = gamesResponse.data?.data || [];
      if (gamesResponse.success) {
        addResult(`✅ Successfully fetched ${games.length} games`);
      } else {
        addResult(`❌ Failed to fetch games: ${gamesResponse.error}`);
      }

      // Test getting all players
      const playersResponse = await playerService.getAllPlayers();
      const players = playersResponse.data?.data || [];
      if (playersResponse.success) {
        addResult(`✅ Successfully fetched ${players.length} players`);
      } else {
        addResult(`❌ Failed to fetch players: ${playersResponse.error}`);
      }

    } catch (error) {
      addResult(`❌ API test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreatePlayer = async () => {
    setIsLoading(true);
    addResult('Testing player creation...');

    try {
      const testPlayer = {
        name: `Test Player ${Date.now()}`,
      };

      const response = await playerService.createPlayer(testPlayer);
      if (response.success) {
        addResult(`✅ Successfully created player: ${response.data?.name}`);
      } else {
        addResult(`❌ Failed to create player: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Player creation failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateGame = async () => {
    setIsLoading(true);
    addResult('Testing game creation...');

    try {
      const testGame = {
        homeTeam: 'Home Team',
        awayTeam: 'Away Team',
        homeAbbreviation: 'HOME',
        awayAbbreviation: 'AWAY',
        homePlayers: ['Player 1', 'Player 2'],
        awayPlayers: ['Player 3', 'Player 4'],
        maxInnings: 9,
        gameSummary: {
          totalInnings: 9,
          homePlayerStats: {
            'Player 1': {
              atBats: 4,
              hits: 1,
              runs: 0,
              rbis: 0,
              singles: 1,
              doubles: 0,
              triples: 0,
              homers: 0,
              totalBases: 1
            },
            'Player 2': {
              atBats: 4,
              hits: 2,
              runs: 1,
              rbis: 1,
              singles: 2,
              doubles: 0,
              triples: 0,
              homers: 0,
              totalBases: 2
            }
          },
          awayPlayerStats: {
            'Player 3': {
              atBats: 4,
              hits: 1,
              runs: 0,
              rbis: 0,
              singles: 1,
              doubles: 0,
              triples: 0,
              homers: 0,
              totalBases: 1
            },
            'Player 4': {
              atBats: 4,
              hits: 0,
              runs: 0,
              rbis: 0,
              singles: 0,
              doubles: 0,
              triples: 0,
              homers: 0,
              totalBases: 0
            }
          },
          homeScore: 1,
          awayScore: 0,
          winner: 'home',
          gameEndReason: 'regulation'
        }
      };

      const response = await gameService.createGame(testGame);
      if (response.success) {
        addResult(`✅ Successfully created game: ${response.data?.homeTeam} vs ${response.data?.awayTeam}`);
      } else {
        addResult(`❌ Failed to create game: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Game creation failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Test Component</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={testApiConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Test API Connection'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testCreatePlayer}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating...' : 'Test Create Player'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testCreateGame}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating...' : 'Test Create Game'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>No test results yet. Run a test to see results.</Text>
        ) : (
          testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noResults: {
    color: '#666',
    fontStyle: 'italic',
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
});

export default ApiTest; 