import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import StripedBackground from '../components/StripedBackground';
import { getGameById } from '../services/api';
import { useScreenOrientation } from '../hooks/useScreenOrientation';

type GameDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GameDetails'>;
  route: RouteProp<RootStackParamList, 'GameDetails'>;
};

type GameData = {
  id: string;
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
  gameHistory?: any[];
  finalGameState?: {
    homeScore: number;
    awayScore: number;
    inning: number;
    inningHalf: string;
  };
};

export default function GameDetailsScreen({ navigation, route }: GameDetailsScreenProps) {
  const { gameId } = route.params;
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lock to portrait mode
  useScreenOrientation('portrait');

  // Fetch game data when screen loads
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        const response = await getGameById(gameId);
        
        if (response.success && response.data) {
          setGameData(response.data);
        } else {
          setError(response.error || 'Failed to fetch game data');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Error fetching game data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getWinnerText = () => {
    if (gameData.gameSummary.winner === 'home') {
      return `${gameData.homeTeam} wins`;
    } else if (gameData.gameSummary.winner === 'away') {
      return `${gameData.awayTeam} wins`;
    } else {
      return 'Game ended in a tie';
    }
  };

  const getGameEndReasonText = () => {
    switch (gameData.gameSummary.gameEndReason) {
      case 'regulation':
        return 'Regulation Game';
      case 'extra innings':
        return 'Extra Innings';
      case 'walk-off':
        return 'Walk-off Victory';
      case 'mercy rule':
        return 'Mercy Rule';
      default:
        return gameData.gameSummary.gameEndReason;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StripedBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading game details...</Text>
        </View>
      </View>
    );
  }

  if (error || !gameData) {
    return (
      <View style={styles.container}>
        <StripedBackground />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading game details</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StripedBackground />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Game Details</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>
        </View>

        {/* Game Info Card */}
        <View style={styles.gameInfoCard}>
          <Text style={styles.dateText}>{formatDate(gameData.gameDate)}</Text>
          <Text style={styles.timeText}>{formatTime(gameData.gameDate)}</Text>
          
          {/* Score Display */}
          <View style={styles.scoreContainer}>
            <View style={styles.teamScore}>
              <Text style={styles.teamName}>{gameData.awayTeam}</Text>
              <Text style={styles.score}>{gameData.gameSummary.awayScore}</Text>
            </View>
            <Text style={styles.vs}>@</Text>
            <View style={styles.teamScore}>
              <Text style={styles.teamName}>{gameData.homeTeam}</Text>
              <Text style={styles.score}>{gameData.gameSummary.homeScore}</Text>
            </View>
          </View>

          {/* Game Result */}
          <View style={styles.resultContainer}>
            <Text style={styles.winnerText}>{getWinnerText()}</Text>
            <Text style={styles.gameEndReason}>{getGameEndReasonText()}</Text>
            <Text style={styles.inningsText}>{gameData.gameSummary.totalInnings} innings</Text>
          </View>
        </View>

        {/* Teams Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teams</Text>
          <View style={styles.teamsContainer}>
            <TouchableOpacity 
              style={styles.teamCard}
              onPress={() => {
                const awayPlayerStats = (gameData as any).gameSummary?.awayPlayerStats ? 
                  Object.entries((gameData as any).gameSummary.awayPlayerStats).map(([name, stats]: [string, any]) => ({
                    name,
                    stats
                  })) : [];
                
                navigation.navigate('TeamPlayers', {
                  teamName: gameData.awayTeam,
                  teamAbbreviation: gameData.awayAbbreviation,
                  players: gameData.awayPlayers || [],
                  playerStats: awayPlayerStats,
                  opposingTeamName: gameData.homeTeam
                });
              }}
            >
              <Text style={styles.teamCardTitle}>{gameData.awayTeam}</Text>
              <Text style={styles.teamAbbreviation}>{gameData.awayAbbreviation}</Text>
              <Text style={styles.playerCount}>{gameData.awayPlayers?.length || 0} players</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.teamCard}
              onPress={() => {
                const homePlayerStats = (gameData as any).gameSummary?.homePlayerStats ? 
                  Object.entries((gameData as any).gameSummary.homePlayerStats).map(([name, stats]: [string, any]) => ({
                    name,
                    stats
                  })) : [];
                
                navigation.navigate('TeamPlayers', {
                  teamName: gameData.homeTeam,
                  teamAbbreviation: gameData.homeAbbreviation,
                  players: gameData.homePlayers || [],
                  playerStats: homePlayerStats,
                  opposingTeamName: gameData.awayTeam
                });
              }}
            >
              <Text style={styles.teamCardTitle}>{gameData.homeTeam}</Text>
              <Text style={styles.teamAbbreviation}>{gameData.homeAbbreviation}</Text>
              <Text style={styles.playerCount}>{gameData.homePlayers?.length || 0} players</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Game Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Settings</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Innings:</Text>
              <Text style={styles.settingValue}>{gameData.maxInnings}</Text>
            </View>

          </View>
        </View>

        {/* Game Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Timeline</Text>
          <TouchableOpacity 
            style={styles.timelineCard}
            onPress={() => {
              navigation.navigate('GameTimeline', { gameId: gameId });
            }}
          >
            <Text style={styles.timelineTitle}>Final Game State</Text>
            <Text style={styles.timelineSubtitle}>Tap to view all game states</Text>
            {(gameData as any).finalGameState ? (
              <View style={styles.finalStatePreview}>
                <Text style={styles.finalStateText}>
                  {gameData.homeTeam}: {(gameData as any).finalGameState.homeScore} | {gameData.awayTeam}: {(gameData as any).finalGameState.awayScore}
                </Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>No game state data available</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  backButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'PressStart2P',
  },
  gameInfoCard: {
    backgroundColor: '#FFD700',
    padding: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#000000',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontFamily: 'PressStart2P',
    color: '#000000',
    marginBottom: 5,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#666666',
    marginBottom: 15,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  teamScore: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#000000',
    marginBottom: 5,
  },
  score: {
    fontSize: 32,
    fontFamily: 'PressStart2P',
    color: '#000000',
    fontWeight: 'bold',
  },
  vs: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#000000',
    marginHorizontal: 20,
  },
  resultContainer: {
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  gameEndReason: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#666666',
    marginBottom: 5,
  },
  inningsText: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    flex: 0.48,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
  },
  teamCardTitle: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#000000',
    marginBottom: 5,
  },
  teamAbbreviation: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#666666',
    marginBottom: 5,
  },
  playerCount: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#666666',
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderWidth: 2,
    borderColor: '#000000',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#000000',
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#666666',
  },

  placeholderText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
  },
  timelineTitle: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#000000',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  timelineSubtitle: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#666666',
    marginBottom: 10,
  },
  finalStatePreview: {
    alignItems: 'center',
  },
  finalStateText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#000000',
    marginBottom: 5,
  },
  finalStateInning: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#666666',
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