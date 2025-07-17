import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import StripedBackground from '../components/StripedBackground';
import { getAllGames } from '../services/api';
import { useScreenOrientation } from '../hooks/useScreenOrientation';

type HistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'History'>;
};

type GameData = {
  _id: string;
  gameDate: string;
  homeTeam: string;
  awayTeam: string;
  homeAbbreviation: string;
  awayAbbreviation: string;
  gameSummary: {
    homeScore: number;
    awayScore: number;
    winner: string;
    gameEndReason: string;
    totalInnings: number;
  };
  homePlayers: string[];
  awayPlayers: string[];
  maxInnings: number;
};

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lock to portrait mode
  useScreenOrientation('portrait');

  // Fetch games when screen loads
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await getAllGames();
        
        if (response.success && response.data) {
          setGames(response.data);
        } else {
          setError(response.error || 'Failed to fetch games');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Error fetching games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderGame = ({ item }: { item: GameData }) => (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => {
        navigation.navigate('GameDetails', { gameId: item._id });
      }}
    >
      <Text style={styles.date}>{formatDate(item.gameDate)}</Text>
      <View style={styles.teamsContainer}>
        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{item.awayTeam}</Text>
          <Text style={styles.score}>{item.gameSummary.awayScore}</Text>
        </View>
        <Text style={styles.vs}>vs</Text>
        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{item.homeTeam}</Text>
          <Text style={styles.score}>{item.gameSummary.homeScore}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StripedBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading games...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StripedBackground />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading games</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
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

  return (
    <View style={styles.container}>
      <StripedBackground />
      <Text style={styles.title}>Game History</Text>
      <FlatList
        data={games}
        renderItem={renderGame}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
      />
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
  title: {
    fontSize: 24,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    padding: 20,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  listContainer: {
    padding: 20,
  },
  gameCard: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    fontFamily: 'PressStart2P',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamScore: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontFamily: 'PressStart2P',
    marginBottom: 5,
  },
  score: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#666',
    textAlign: 'center',
  },
  vs: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 5,
  },
  gameItem: {
    backgroundColor: '#2196F3',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  gameTitle: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
  },
  backButton: {
    backgroundColor: '#000000',
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PressStart2P',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.8,
  },
}); 