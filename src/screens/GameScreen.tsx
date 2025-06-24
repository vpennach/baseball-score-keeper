import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import StripedBackground from '../components/StripedBackground';
import * as ScreenOrientation from 'expo-screen-orientation';

type GameScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
  route: RouteProp<RootStackParamList, 'Game'>;
};

type PlayerStats = {
  atBats: number;
  hits: number;
  runs: number;
  rbis: number;
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
  firstBase: boolean;
  secondBase: boolean;
  thirdBase: boolean;
};

export default function GameScreen({ navigation, route }: GameScreenProps) {
  const { homeTeam, awayTeam, homePlayers, awayPlayers, maxInnings } = route.params;

  // Lock to landscape mode when screen loads
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    lockOrientation();

    // Unlock when leaving screen
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const truncatePlayerName = (name: string) => {
    if (name.length > 6) {
      return name.substring(0, 6) + '..';
    }
    return name;
  };

  const initialPlayerStats = (players: string[]) =>
    players.reduce(
      (acc, player) => ({
        ...acc,
        [player]: { atBats: 0, hits: 0, runs: 0, rbis: 0 },
      }),
      {}
    );

  const [gameState, setGameState] = useState<GameState>({
    inning: 1,
    isTopInning: true,
    outs: 0,
    homeScore: 0,
    awayScore: 0,
    homePlayerStats: initialPlayerStats(homePlayers),
    awayPlayerStats: initialPlayerStats(awayPlayers),
    balls: 0,
    strikes: 0,
    firstBase: false,
    secondBase: false,
    thirdBase: false,
  });

  const updatePlayerStats = (
    player: string,
    isHomeTeam: boolean,
    updates: Partial<PlayerStats>
  ) => {
    setGameState((prev) => {
      const teamStats = isHomeTeam ? prev.homePlayerStats : prev.awayPlayerStats;
      const newTeamStats = {
        ...teamStats,
        [player]: { ...teamStats[player], ...updates },
      };
      return {
        ...prev,
        [isHomeTeam ? 'homePlayerStats' : 'awayPlayerStats']: newTeamStats,
      };
    });
  };

  const recordAtBat = (player: string, isHomeTeam: boolean, result: 'hit' | 'out') => {
    updatePlayerStats(player, isHomeTeam, {
      atBats: (gameState[isHomeTeam ? 'homePlayerStats' : 'awayPlayerStats'][player].atBats + 1),
      hits: result === 'hit' ? gameState[isHomeTeam ? 'homePlayerStats' : 'awayPlayerStats'][player].hits + 1 : gameState[isHomeTeam ? 'homePlayerStats' : 'awayPlayerStats'][player].hits,
    });

    if (result === 'out') {
      setGameState((prev) => {
        const newOuts = prev.outs + 1;
        if (newOuts === 3) {
          return {
            ...prev,
            outs: 0,
            isTopInning: !prev.isTopInning,
            inning: prev.isTopInning ? prev.inning : prev.inning + 1,
          };
        }
        return { ...prev, outs: newOuts };
      });
    }
  };

  const recordRun = (player: string, isHomeTeam: boolean) => {
    updatePlayerStats(player, isHomeTeam, {
      runs: gameState[isHomeTeam ? 'homePlayerStats' : 'awayPlayerStats'][player].runs + 1,
    });
    setGameState((prev) => ({
      ...prev,
      [isHomeTeam ? 'homeScore' : 'awayScore']: prev[isHomeTeam ? 'homeScore' : 'awayScore'] + 1,
    }));
  };

  const recordRBI = (player: string, isHomeTeam: boolean) => {
    updatePlayerStats(player, isHomeTeam, {
      rbis: gameState[isHomeTeam ? 'homePlayerStats' : 'awayPlayerStats'][player].rbis + 1,
    });
  };

  const endGame = () => {
    Alert.alert(
      'End Game',
      'Are you sure you want to end the game?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Game',
          style: 'destructive',
          onPress: () => {
            // TODO: Save game data to MongoDB
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StripedBackground />
      <View style={styles.gameLayout}>
        {/* Away Team Lineup (Left Side) */}
        <View style={styles.lineupSection}>
          <Text style={styles.teamTitle}>{awayTeam}</Text>
          <ScrollView style={styles.lineupScroll}>
            {awayPlayers.map((player, index) => (
              <View key={player} style={styles.lineupItem}>
                <Text style={styles.lineupNumber}>{index + 1}.</Text>
                <Text style={styles.lineupName}>{truncatePlayerName(player)}</Text>
                <Text style={styles.playerStats}>
                  {gameState.awayPlayerStats[player]?.rbis || 0}RBI {gameState.awayPlayerStats[player]?.hits || 0}-{gameState.awayPlayerStats[player]?.atBats || 0}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Score Bug (Center) */}
        <View style={styles.scoreBug}>
          {/* Top Section - Team Names and Scores */}
          <View style={styles.topSection}>
            {/* Away Team Row */}
            <View style={styles.teamRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNumber}>{gameState.awayScore}</Text>
              </View>
              <View style={styles.teamNameBox}>
                <Text style={styles.teamNameText}>{awayTeam}</Text>
              </View>
            </View>
            
            {/* Home Team Row */}
            <View style={styles.teamRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNumber}>{gameState.homeScore}</Text>
              </View>
              <View style={styles.teamNameBox}>
                <Text style={styles.teamNameText}>{homeTeam}</Text>
              </View>
            </View>
          </View>

          {/* Bottom Section - Split into left and right */}
          <View style={styles.bottomSection}>
            {/* Left Side - Pitch Count and Outs */}
            <View style={styles.leftSection}>
              <Text style={styles.pitchCount}>{gameState.balls}-{gameState.strikes}</Text>
              <View style={styles.outsContainer}>
                <View style={[styles.outSquare, gameState.outs >= 1 && styles.outSquareActive]} />
                <View style={[styles.outSquare, gameState.outs >= 2 && styles.outSquareActive]} />
              </View>
            </View>

            {/* Right Side - Bases and Inning */}
            <View style={styles.rightSection}>
              <View style={styles.basesContainer}>
                <View style={[styles.baseSquare, styles.secondBase, gameState.secondBase && styles.baseOccupied]} />
                <View style={[styles.baseSquare, styles.thirdBase, gameState.thirdBase && styles.baseOccupied]} />
                <View style={[styles.baseSquare, styles.firstBase, gameState.firstBase && styles.baseOccupied]} />
              </View>
              <View style={styles.inningBox}>
                <Text style={styles.inningText}>
                  {gameState.isTopInning ? 'T' : 'B'}{gameState.inning}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Home Team Lineup (Right Side) */}
        <View style={styles.lineupSection}>
          <Text style={styles.teamTitle}>{homeTeam}</Text>
          <ScrollView style={styles.lineupScroll}>
            {homePlayers.map((player, index) => (
              <View key={player} style={styles.lineupItem}>
                <Text style={styles.lineupNumber}>{index + 1}.</Text>
                <Text style={styles.lineupName}>{truncatePlayerName(player)}</Text>
                <Text style={styles.playerStats}>
                  {gameState.homePlayerStats[player]?.rbis || 0}RBI {gameState.homePlayerStats[player]?.hits || 0}-{gameState.homePlayerStats[player]?.atBats || 0}
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
  gameLayout: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineupSection: {
    flex: 1,
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
    marginBottom: 200,
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
}); 