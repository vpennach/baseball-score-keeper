import React, { useState } from 'react';
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
};

export default function GameScreen({ navigation, route }: GameScreenProps) {
  const { homeTeam, awayTeam, homePlayers, awayPlayers } = route.params;

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

  const renderPlayerStats = (player: string, stats: PlayerStats) => (
    <View key={player} style={styles.playerStats}>
      <Text style={styles.playerName}>{player}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>AB: {stats.atBats}</Text>
        <Text style={styles.stat}>H: {stats.hits}</Text>
        <Text style={styles.stat}>R: {stats.runs}</Text>
        <Text style={styles.stat}>RBI: {stats.rbis}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StripedBackground />
      <View style={styles.scoreboard}>
        <Text style={styles.teamName}>{awayTeam}</Text>
        <Text style={styles.score}>{gameState.awayScore}</Text>
        <Text style={styles.teamName}>{homeTeam}</Text>
        <Text style={styles.score}>{gameState.homeScore}</Text>
        <Text style={styles.inning}>
          {gameState.isTopInning ? 'Top' : 'Bottom'} {gameState.inning}
        </Text>
        <Text style={styles.outs}>Outs: {gameState.outs}</Text>
      </View>

      <ScrollView style={styles.statsContainer}>
        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>{awayTeam}</Text>
          {awayPlayers.map((player) =>
            renderPlayerStats(player, gameState.awayPlayerStats[player])
          )}
        </View>

        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>{homeTeam}</Text>
          {homePlayers.map((player) =>
            renderPlayerStats(player, gameState.homePlayerStats[player])
          )}
        </View>
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.endButton} onPress={endGame}>
          <Text style={styles.endButtonText}>End Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scoreboard: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  teamName: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  score: {
    fontSize: 48,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
  },
  inning: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
    fontFamily: 'PressStart2P',
  },
  outs: {
    color: '#fff',
    fontSize: 18,
    marginTop: 5,
    fontFamily: 'PressStart2P',
  },
  statsContainer: {
    flex: 1,
    padding: 20,
  },
  teamSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'PressStart2P',
    color: '#2196F3',
    marginBottom: 15,
  },
  playerStats: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginBottom: 10,
  },
  playerName: {
    fontSize: 18,
    fontFamily: 'PressStart2P',
    marginBottom: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'PressStart2P',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PressStart2P',
  },
  endButton: {
    backgroundColor: '#000000',
    padding: 15,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PressStart2P',
  },
}); 