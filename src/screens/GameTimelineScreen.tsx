import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import StripedBackground from '../components/StripedBackground';
import { getGameById } from '../services/api';
import { useScreenOrientation } from '../hooks/useScreenOrientation';
import * as ScreenOrientation from 'expo-screen-orientation';

type GameTimelineScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GameTimeline'>;
  route: RouteProp<RootStackParamList, 'GameTimeline'>;
};

type PlayerStats = {
  atBats: number;
  hits: number;
  runs: number;
  rbis: number;
  singles: number;
  doubles: number;
  triples: number;
  homers: number;
  totalBases: number;
};

type GameState = {
  inning: number;
  isTopInning: boolean;
  outs: number;
  homeScore: number;
  awayScore: number;
  homePlayerStats: Record<string, PlayerStats>;
  awayPlayerStats: Record<string, PlayerStats>;
  balls: number;
  strikes: number;
  firstBase: string | null;
  secondBase: string | null;
  thirdBase: string | null;
  currentBatter: string;
  currentBatterIndex: number;
  currentBatterIsHome: boolean;
  nextHomeBatter: number;
  nextAwayBatter: number;
  gameEnded: boolean;
};

type GameData = {
  id: string;
  gameDate: string;
  homeTeam: string;
  awayTeam: string;
  homeAbbreviation: string;
  awayAbbreviation: string;
  homePlayers: string[];
  awayPlayers: string[];
  maxInnings: number;
  gameHistory?: GameState[];
  finalGameState?: GameState;
};

export default function GameTimelineScreen({ navigation, route }: GameTimelineScreenProps) {
  const { gameId } = route.params;
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);

  // Lock to landscape mode
  useScreenOrientation('landscape');

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

  const truncatePlayerName = (name: string) => {
    if (name.length > 6) {
      return name.substring(0, 6) + '..';
    }
    return name;
  };

  const getCurrentGameState = (): GameState | null => {
    if (!gameData) return null;
    
    if (gameData.gameHistory && gameData.gameHistory.length > 0) {
      return gameData.gameHistory[currentStateIndex];
    }
    
    // If no history, return final state or initial state
    if (gameData.finalGameState) {
      return gameData.finalGameState;
    }
    
    // Return initial state
    return {
      inning: 1,
      isTopInning: true,
      outs: 0,
      homeScore: 0,
      awayScore: 0,
      homePlayerStats: gameData.homePlayers.reduce((acc, player) => ({
        ...acc,
        [player]: { atBats: 0, hits: 0, runs: 0, rbis: 0, singles: 0, doubles: 0, triples: 0, homers: 0, totalBases: 0 },
      }), {}),
      awayPlayerStats: gameData.awayPlayers.reduce((acc, player) => ({
        ...acc,
        [player]: { atBats: 0, hits: 0, runs: 0, rbis: 0, singles: 0, doubles: 0, triples: 0, homers: 0, totalBases: 0 },
      }), {}),
      balls: 0,
      strikes: 0,
      firstBase: null,
      secondBase: null,
      thirdBase: null,
      currentBatter: gameData.awayPlayers[0] || '',
      currentBatterIndex: 0,
      currentBatterIsHome: false,
      nextHomeBatter: 1,
      nextAwayBatter: 1,
      gameEnded: false,
    };
  };

  const goToPreviousState = () => {
    if (currentStateIndex > 0) {
      setCurrentStateIndex(currentStateIndex - 1);
    }
  };

  const goToNextState = () => {
    if (gameData?.gameHistory && currentStateIndex < gameData.gameHistory.length - 1) {
      setCurrentStateIndex(currentStateIndex + 1);
    }
  };

  const canGoBack = currentStateIndex > 0;
  const canGoForward = gameData?.gameHistory ? currentStateIndex < gameData.gameHistory.length - 1 : false;

  if (loading) {
    return (
      <View style={styles.container}>
        <StripedBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading game timeline...</Text>
        </View>
      </View>
    );
  }

  if (error || !gameData) {
    return (
      <View style={styles.container}>
        <StripedBackground />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading game timeline</Text>
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

  const currentState = getCurrentGameState();
  if (!currentState) {
    return (
      <View style={styles.container}>
        <StripedBackground />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No game state data available</Text>
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
      
      {/* Back Button - Absolute positioned in top left */}
      <TouchableOpacity style={styles.backButton} onPress={async () => {
        // Set orientation to portrait before navigating back
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        navigation.goBack();
      }}>
        <Text style={styles.backButtonText}>BACK</Text>
      </TouchableOpacity>

      {/* Navigation Info - Absolute positioned in top right */}
      <View style={styles.navigationInfo}>
        <Text style={styles.navigationText}>
          {currentStateIndex + 1} / {(gameData.gameHistory?.length || 1)}
        </Text>
      </View>

      <View style={styles.gameLayout}>
        {/* Away Team Lineup (Left Side) */}
        <View style={styles.lineupSection}>
          <Text style={styles.teamTitle}>{gameData.awayTeam}</Text>
          <ScrollView style={styles.lineupScroll}>
            {gameData.awayPlayers.map((player, index) => (
              <View 
                key={player} 
                style={[
                  styles.lineupItem,
                  currentState.currentBatter === player && !currentState.currentBatterIsHome && styles.currentBatter
                ]}
              >
                <Text style={styles.lineupNumber}>{index + 1}.</Text>
                <Text style={styles.lineupName}>{truncatePlayerName(player)}</Text>
                <Text style={styles.playerStats}>
                  {currentState.awayPlayerStats[player]?.rbis || 0}RBI {currentState.awayPlayerStats[player]?.hits || 0}-{currentState.awayPlayerStats[player]?.atBats || 0}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Score Bug (Center) */}
        <View style={styles.centerSection}>
          <View style={styles.scoreBug}>
            {/* Top Section - Team Names and Scores */}
            <View style={styles.topSection}>
              {/* Away Team Row */}
              <View style={styles.teamRow}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreNumber}>{currentState.awayScore}</Text>
                </View>
                <View style={styles.teamNameBox}>
                  <Text style={styles.teamNameText}>{gameData.awayAbbreviation}</Text>
                </View>
              </View>
              
              {/* Home Team Row */}
              <View style={styles.teamRow}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreNumber}>{currentState.homeScore}</Text>
                </View>
                <View style={styles.teamNameBox}>
                  <Text style={styles.teamNameText}>{gameData.homeAbbreviation}</Text>
                </View>
              </View>
            </View>

            {/* Bottom Section - Split into left and right */}
            <View style={styles.bottomSection}>
              {/* Left Side - Pitch Count and Outs */}
              <View style={styles.leftSection}>
                <Text style={styles.pitchCount}>{currentState.balls}-{currentState.strikes}</Text>
                <View style={styles.outsContainer}>
                  <View style={[styles.outSquare, currentState.outs >= 1 && styles.outSquareActive]} />
                  <View style={[styles.outSquare, currentState.outs >= 2 && styles.outSquareActive]} />
                </View>
              </View>

              {/* Right Side - Bases and Inning */}
              <View style={styles.rightSection}>
                <View style={styles.basesContainer}>
                  <View style={[styles.baseSquare, styles.secondBase, currentState.secondBase && styles.baseOccupied]} />
                  <View style={[styles.baseSquare, styles.thirdBase, currentState.thirdBase && styles.baseOccupied]} />
                  <View style={[styles.baseSquare, styles.firstBase, currentState.firstBase && styles.baseOccupied]} />
                </View>
                <View style={styles.inningBox}>
                  <Text style={styles.inningText}>
                    {currentState.isTopInning ? 'T' : 'B'}{currentState.inning}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.gameButton, !canGoBack && styles.disabledButton]} 
                onPress={goToPreviousState}
                disabled={!canGoBack}
              >
                <Text style={[styles.buttonText, !canGoBack && styles.disabledButtonText]}>←</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.gameButton, !canGoForward && styles.disabledButton]} 
                onPress={goToNextState}
                disabled={!canGoForward}
              >
                <Text style={[styles.buttonText, !canGoForward && styles.disabledButtonText]}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Home Team Lineup (Right Side) */}
        <View style={styles.homeLineupSection}>
          <Text style={styles.teamTitle}>{gameData.homeTeam}</Text>
          <ScrollView style={styles.lineupScroll}>
            {gameData.homePlayers.map((player, index) => (
              <View 
                key={player} 
                style={[
                  styles.lineupItem,
                  currentState.currentBatter === player && currentState.currentBatterIsHome && styles.currentBatter
                ]}
              >
                <Text style={styles.lineupNumber}>{index + 1}.</Text>
                <Text style={styles.lineupName}>{truncatePlayerName(player)}</Text>
                <Text style={styles.playerStats}>
                  {currentState.homePlayerStats[player]?.rbis || 0}RBI {currentState.homePlayerStats[player]?.hits || 0}-{currentState.homePlayerStats[player]?.atBats || 0}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PressStart2P',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'PressStart2P',
    marginBottom: 10,
  },
  errorSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PressStart2P',
    marginBottom: 20,
    textAlign: 'center',
  },
  gameLayout: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineupSection: {
    flex: 2,
    padding: 5,
    marginHorizontal: 5,
    paddingLeft: 30
  },
  teamTitle: {
    fontSize: 18,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    paddingRight: 30
  },
  lineupScroll: {
    flex: 1,
  },
  lineupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#000000',
    maxWidth: 250,
  },
  lineupNumber: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#000000',
    marginRight: 8,
    minWidth: 20,
  },
  lineupName: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#000000',
    flex: 1,
  },
  playerStats: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#666666',
    marginLeft: 'auto',
  },
  scoreBug: {
    width: 200,
    height: 180,
    backgroundColor: '#808080',
    padding: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  topSection: {
    width: '100%',
    marginBottom: 10,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#000000',
    marginRight: 8,
    minWidth: 30,
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 18,
    fontFamily: 'PressStart2P',
    color: '#000000',
  },
  teamNameBox: {
    flex: 1,
  },
  teamNameText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  leftSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'center',
  },
  pitchCount: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  outsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outSquare: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    marginHorizontal: 2,
  },
  outSquareActive: {
    backgroundColor: '#FFD700',
  },
  basesContainer: {
    width: 60,
    height: 40,
    position: 'relative',
    marginBottom: 5,
  },
  baseSquare: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  secondBase: {
    top: 0,
    left: '50%',
    marginLeft: -10,
  },
  thirdBase: {
    bottom: 0,
    left: 0,
  },
  firstBase: {
    bottom: 0,
    right: 0,
  },
  inningBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#000000',
  },
  inningText: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#000000',
  },
  baseOccupied: {
    backgroundColor: '#FFD700',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    maxWidth: 250,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gameButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#000000',
    marginHorizontal: 5,
    minWidth: 45,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#000000',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    borderColor: '#999999',
  },
  disabledButtonText: {
    color: '#666666',
  },
  backButton: {
    position: 'absolute',
    bottom: 10,
    left: 55,
    backgroundColor: '#000000',
    padding: 10,
    borderWidth: 2,
    borderColor: '#000000',
    zIndex: 1000,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
  },
  navigationInfo: {
    position: 'absolute',
    bottom: 10,
    right: 55,
    backgroundColor: '#FFD700',
    padding: 10,
    borderWidth: 2,
    borderColor: '#000000',
    zIndex: 1000,
  },
  navigationText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#000000',
  },
  homeLineupSection: {
    flex: 2,
    padding: 5,
    marginHorizontal: 5,
    paddingLeft:50
  },
  currentBatter: {
    backgroundColor: '#FFFF00',
  },
}); 