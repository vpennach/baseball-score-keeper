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
  currentBatter: string;
  currentBatterIndex: number;
  currentBatterIsHome: boolean;
  nextHomeBatter: number;
  nextAwayBatter: number;
};

export default function GameScreen({ navigation, route }: GameScreenProps) {
  const { homeTeam, awayTeam, homePlayers, awayPlayers, maxInnings } = route.params;

  // Game state history for back button
  const [gameHistory, setGameHistory] = useState<GameState[]>([]);

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
    currentBatter: awayPlayers[0] || '',
    currentBatterIndex: 0,
    currentBatterIsHome: false,
    nextHomeBatter: 1,
    nextAwayBatter: 1,
  });

  const saveGameState = (state: GameState) => {
    setGameHistory(prev => [...prev, state]);
  };

  const goBack = () => {
    if (gameHistory.length > 0) {
      const previousState = gameHistory[gameHistory.length - 1];
      setGameState(previousState);
      setGameHistory(prev => prev.slice(0, -1));
    }
  };

  const advanceRunners = (basesAdvanced: number) => {
    setGameState(prev => {
      let runs = 0;
      let newFirstBase = prev.firstBase;
      let newSecondBase = prev.secondBase;
      let newThirdBase = prev.thirdBase;

      // Advance runners based on how many bases the hit was worth
      if (basesAdvanced >= 3) {
        // Triple or HR - all runners score
        if (prev.firstBase) runs++;
        if (prev.secondBase) runs++;
        if (prev.thirdBase) runs++;
        newFirstBase = false;
        newSecondBase = false;
        newThirdBase = false;
      } else if (basesAdvanced === 2) {
        // Double - runners advance 2 bases
        if (prev.thirdBase) runs++;
        if (prev.secondBase) runs++;
        if (prev.firstBase) {
          newThirdBase = true;
        }
        newSecondBase = false;
        newFirstBase = false;
      } else if (basesAdvanced === 1) {
        // Single - runners advance 1 base
        if (prev.thirdBase) {
          runs++;
          newThirdBase = false; // Runner scored, clear third base
        }
        if (prev.secondBase) {
          newThirdBase = true; // Runner advances to third
          newSecondBase = false; // Clear second base
        }
        if (prev.firstBase) {
          newSecondBase = true; // Runner advances to second
          newFirstBase = false; // Clear first base
        }
        newFirstBase = true; // Batter reaches first
      }

      return {
        ...prev,
        firstBase: newFirstBase,
        secondBase: newSecondBase,
        thirdBase: newThirdBase,
        homeScore: prev.currentBatterIsHome ? prev.homeScore + runs : prev.homeScore,
        awayScore: !prev.currentBatterIsHome ? prev.awayScore + runs : prev.awayScore,
      };
    });
  };

  const handle1B = () => {
    const currentState = { ...gameState };
    saveGameState(currentState);

    setGameState(prev => {
      // Update current batter stats
      const teamStats = prev.currentBatterIsHome ? prev.homePlayerStats : prev.awayPlayerStats;
      const currentPlayerStats = teamStats[prev.currentBatter];
      const newTeamStats = {
        ...teamStats,
        [prev.currentBatter]: {
          ...currentPlayerStats,
          atBats: currentPlayerStats.atBats + 1,
          hits: currentPlayerStats.hits + 1,
        }
      };

      // Advance runners and calculate runs
      let runs = 0;
      let newFirstBase = prev.firstBase;
      let newSecondBase = prev.secondBase;
      let newThirdBase = prev.thirdBase;

      // Single - runners advance 1 base
      if (prev.thirdBase) {
        runs++;
        newThirdBase = false; // Runner scored, clear third base
      }
      if (prev.secondBase) {
        newThirdBase = true; // Runner advances to third
        newSecondBase = false; // Clear second base
      }
      if (prev.firstBase) {
        newSecondBase = true; // Runner advances to second
        newFirstBase = false; // Clear first base
      }
      newFirstBase = true; // Batter reaches first

      // Calculate RBIs for the batter
      const rbis = runs;

      // Increment next batter number for current team
      const newNextHomeBatter = prev.currentBatterIsHome ? prev.nextHomeBatter + 1 : prev.nextHomeBatter;
      const newNextAwayBatter = !prev.currentBatterIsHome ? prev.nextAwayBatter + 1 : prev.nextAwayBatter;
      
      // Get next batter using modulo arithmetic
      const players = prev.currentBatterIsHome ? homePlayers : awayPlayers;
      const nextBatterNumber = prev.currentBatterIsHome ? newNextHomeBatter : newNextAwayBatter;
      const nextBatterIndex = (nextBatterNumber - 1) % players.length;
      const nextBatter = players[nextBatterIndex];

      return {
        ...prev,
        firstBase: newFirstBase,
        secondBase: newSecondBase,
        thirdBase: newThirdBase,
        balls: 0,
        strikes: 0,
        homeScore: prev.currentBatterIsHome ? prev.homeScore + runs : prev.homeScore,
        awayScore: !prev.currentBatterIsHome ? prev.awayScore + runs : prev.awayScore,
        [prev.currentBatterIsHome ? 'homePlayerStats' : 'awayPlayerStats']: {
          ...newTeamStats,
          [prev.currentBatter]: {
            ...newTeamStats[prev.currentBatter],
            rbis: newTeamStats[prev.currentBatter].rbis + rbis,
          }
        },
        currentBatter: nextBatter,
        currentBatterIndex: nextBatterIndex,
        currentBatterIsHome: prev.currentBatterIsHome,
        nextHomeBatter: newNextHomeBatter,
        nextAwayBatter: newNextAwayBatter,
      };
    });
  };

  const handle2B = () => {
    const currentState = { ...gameState };
    saveGameState(currentState);

    setGameState(prev => {
      // Update current batter stats
      const teamStats = prev.currentBatterIsHome ? prev.homePlayerStats : prev.awayPlayerStats;
      const currentPlayerStats = teamStats[prev.currentBatter];
      const newTeamStats = {
        ...teamStats,
        [prev.currentBatter]: {
          ...currentPlayerStats,
          atBats: currentPlayerStats.atBats + 1,
          hits: currentPlayerStats.hits + 1,
        }
      };

      // Double - runners advance 2 bases
      let runs = 0;
      let newFirstBase = false;
      let newSecondBase = false;
      let newThirdBase = false;

      if (prev.thirdBase) runs++;
      if (prev.secondBase) runs++;
      if (prev.firstBase) {
        newThirdBase = true;
      }
      newSecondBase = true; // Batter reaches second

      // Calculate RBIs for the batter
      const rbis = runs;

      // Increment next batter number for current team
      const newNextHomeBatter = prev.currentBatterIsHome ? prev.nextHomeBatter + 1 : prev.nextHomeBatter;
      const newNextAwayBatter = !prev.currentBatterIsHome ? prev.nextAwayBatter + 1 : prev.nextAwayBatter;
      
      // Get next batter using modulo arithmetic
      const players = prev.currentBatterIsHome ? homePlayers : awayPlayers;
      const nextBatterNumber = prev.currentBatterIsHome ? newNextHomeBatter : newNextAwayBatter;
      const nextBatterIndex = (nextBatterNumber - 1) % players.length;
      const nextBatter = players[nextBatterIndex];
      
      return {
        ...prev,
        firstBase: newFirstBase,
        secondBase: newSecondBase,
        thirdBase: newThirdBase,
        balls: 0,
        strikes: 0,
        homeScore: prev.currentBatterIsHome ? prev.homeScore + runs : prev.homeScore,
        awayScore: !prev.currentBatterIsHome ? prev.awayScore + runs : prev.awayScore,
        [prev.currentBatterIsHome ? 'homePlayerStats' : 'awayPlayerStats']: {
          ...newTeamStats,
          [prev.currentBatter]: {
            ...newTeamStats[prev.currentBatter],
            rbis: newTeamStats[prev.currentBatter].rbis + rbis,
          }
        },
        currentBatter: nextBatter,
        currentBatterIndex: nextBatterIndex,
        currentBatterIsHome: prev.currentBatterIsHome,
        nextHomeBatter: newNextHomeBatter,
        nextAwayBatter: newNextAwayBatter,
      };
    });
  };

  const handle3B = () => {
    const currentState = { ...gameState };
    saveGameState(currentState);

    setGameState(prev => {
      // Update current batter stats
      const teamStats = prev.currentBatterIsHome ? prev.homePlayerStats : prev.awayPlayerStats;
      const currentPlayerStats = teamStats[prev.currentBatter];
      const newTeamStats = {
        ...teamStats,
        [prev.currentBatter]: {
          ...currentPlayerStats,
          atBats: currentPlayerStats.atBats + 1,
          hits: currentPlayerStats.hits + 1,
        }
      };

      // Triple - all runners score, batter reaches third
      let runs = 0;
      if (prev.firstBase) runs++;
      if (prev.secondBase) runs++;
      if (prev.thirdBase) runs++;

      // Calculate RBIs for the batter
      const rbis = runs;

      // Increment next batter number for current team
      const newNextHomeBatter = prev.currentBatterIsHome ? prev.nextHomeBatter + 1 : prev.nextHomeBatter;
      const newNextAwayBatter = !prev.currentBatterIsHome ? prev.nextAwayBatter + 1 : prev.nextAwayBatter;
      
      // Get next batter using modulo arithmetic
      const players = prev.currentBatterIsHome ? homePlayers : awayPlayers;
      const nextBatterNumber = prev.currentBatterIsHome ? newNextHomeBatter : newNextAwayBatter;
      const nextBatterIndex = (nextBatterNumber - 1) % players.length;
      const nextBatter = players[nextBatterIndex];
      
      return {
        ...prev,
        firstBase: false,
        secondBase: false,
        thirdBase: true, // Batter reaches third
        balls: 0,
        strikes: 0,
        homeScore: prev.currentBatterIsHome ? prev.homeScore + runs : prev.homeScore,
        awayScore: !prev.currentBatterIsHome ? prev.awayScore + runs : prev.awayScore,
        [prev.currentBatterIsHome ? 'homePlayerStats' : 'awayPlayerStats']: {
          ...newTeamStats,
          [prev.currentBatter]: {
            ...newTeamStats[prev.currentBatter],
            rbis: newTeamStats[prev.currentBatter].rbis + rbis,
          }
        },
        currentBatter: nextBatter,
        currentBatterIndex: nextBatterIndex,
        currentBatterIsHome: prev.currentBatterIsHome,
        nextHomeBatter: newNextHomeBatter,
        nextAwayBatter: newNextAwayBatter,
      };
    });
  };

  const handleHR = () => {
    const currentState = { ...gameState };
    saveGameState(currentState);

    setGameState(prev => {
      // Update current batter stats
      const teamStats = prev.currentBatterIsHome ? prev.homePlayerStats : prev.awayPlayerStats;
      const currentPlayerStats = teamStats[prev.currentBatter];
      const newTeamStats = {
        ...teamStats,
        [prev.currentBatter]: {
          ...currentPlayerStats,
          atBats: currentPlayerStats.atBats + 1,
          hits: currentPlayerStats.hits + 1,
        }
      };

      // Home run - all runners score plus the batter
      let runs = 1; // Batter scores
      if (prev.firstBase) runs++;
      if (prev.secondBase) runs++;
      if (prev.thirdBase) runs++;

      // Calculate RBIs for the batter
      const rbis = runs;

      // Increment next batter number for current team
      const newNextHomeBatter = prev.currentBatterIsHome ? prev.nextHomeBatter + 1 : prev.nextHomeBatter;
      const newNextAwayBatter = !prev.currentBatterIsHome ? prev.nextAwayBatter + 1 : prev.nextAwayBatter;
      
      // Get next batter using modulo arithmetic
      const players = prev.currentBatterIsHome ? homePlayers : awayPlayers;
      const nextBatterNumber = prev.currentBatterIsHome ? newNextHomeBatter : newNextAwayBatter;
      const nextBatterIndex = (nextBatterNumber - 1) % players.length;
      const nextBatter = players[nextBatterIndex];
      
      return {
        ...prev,
        firstBase: false,
        secondBase: false,
        thirdBase: false,
        balls: 0,
        strikes: 0,
        homeScore: prev.currentBatterIsHome ? prev.homeScore + runs : prev.homeScore,
        awayScore: !prev.currentBatterIsHome ? prev.awayScore + runs : prev.awayScore,
        [prev.currentBatterIsHome ? 'homePlayerStats' : 'awayPlayerStats']: {
          ...newTeamStats,
          [prev.currentBatter]: {
            ...newTeamStats[prev.currentBatter],
            rbis: newTeamStats[prev.currentBatter].rbis + rbis,
          }
        },
        currentBatter: nextBatter,
        currentBatterIndex: nextBatterIndex,
        currentBatterIsHome: prev.currentBatterIsHome,
        nextHomeBatter: newNextHomeBatter,
        nextAwayBatter: newNextAwayBatter,
      };
    });
  };

  const handleStrike = () => {
    const currentState = { ...gameState };
    saveGameState(currentState);

    setGameState(prev => {
      const newStrikes = prev.strikes + 1;
      
      if (newStrikes === 3) {
        // Strikeout - add out and move to next batter
        let newOuts = prev.outs + 1;
        let newInning = prev.inning;
        let newIsTopInning = prev.isTopInning;
        let newCurrentBatter = prev.currentBatter;
        let newCurrentBatterIndex = prev.currentBatterIndex;
        let newCurrentBatterIsHome = prev.currentBatterIsHome;
        let newFirstBase = prev.firstBase;
        let newSecondBase = prev.secondBase;
        let newThirdBase = prev.thirdBase;
        let newNextHomeBatter = prev.nextHomeBatter;
        let newNextAwayBatter = prev.nextAwayBatter;

        // Update current batter stats (strikeout - only at bat, no hit)
        const teamStats = prev.currentBatterIsHome ? prev.homePlayerStats : prev.awayPlayerStats;
        const currentPlayerStats = teamStats[prev.currentBatter];
        const newTeamStats = {
          ...teamStats,
          [prev.currentBatter]: {
            ...currentPlayerStats,
            atBats: currentPlayerStats.atBats + 1,
          }
        };

        if (newOuts === 3) {
          // 3 outs - switch teams/innings
          newOuts = 0;
          
          // Increment next batter number for the team that just finished
          if (prev.currentBatterIsHome) {
            newNextHomeBatter = prev.nextHomeBatter + 1;
          } else {
            newNextAwayBatter = prev.nextAwayBatter + 1;
          }
          
          if (prev.isTopInning) {
            // Switch from top to bottom (away -> home)
            newIsTopInning = false;
            
            // Use saved next home batter number
            const homeBatterIndex = (prev.nextHomeBatter - 1) % homePlayers.length;
            newCurrentBatter = homePlayers[homeBatterIndex];
            newCurrentBatterIndex = homeBatterIndex;
            newCurrentBatterIsHome = true;
            
          } else {
            // Switch from bottom to top of next inning (home -> away)

            newIsTopInning = true;
            newInning = prev.inning + 1;
            
            // Use saved next away batter number
            const awayBatterIndex = (prev.nextAwayBatter - 1) % awayPlayers.length;
            newCurrentBatter = awayPlayers[awayBatterIndex];
            newCurrentBatterIndex = awayBatterIndex;
            newCurrentBatterIsHome = false;
            
          }
          // Clear bases when switching teams
          newFirstBase = false;
          newSecondBase = false;
          newThirdBase = false;
        } else {
          // Still same team's turn - increment next batter number and advance to next batter
          if (prev.currentBatterIsHome) {
            newNextHomeBatter = prev.nextHomeBatter + 1;
            const homeBatterIndex = (newNextHomeBatter - 1) % homePlayers.length;
            newCurrentBatter = homePlayers[homeBatterIndex];
            newCurrentBatterIndex = homeBatterIndex;
          } else {
            newNextAwayBatter = prev.nextAwayBatter + 1;
            const awayBatterIndex = (newNextAwayBatter - 1) % awayPlayers.length;
            newCurrentBatter = awayPlayers[awayBatterIndex];
            newCurrentBatterIndex = awayBatterIndex;
          }
          
        }

        return {
          ...prev,
          strikes: 0,
          balls: 0,
          outs: newOuts,
          inning: newInning,
          isTopInning: newIsTopInning,
          currentBatter: newCurrentBatter,
          currentBatterIndex: newCurrentBatterIndex,
          currentBatterIsHome: newCurrentBatterIsHome,
          firstBase: newFirstBase,
          secondBase: newSecondBase,
          thirdBase: newThirdBase,
          nextHomeBatter: newNextHomeBatter,
          nextAwayBatter: newNextAwayBatter,
          [prev.currentBatterIsHome ? 'homePlayerStats' : 'awayPlayerStats']: newTeamStats,
        };
      } else {
        // Just a strike - update count
        return {
          ...prev,
          strikes: newStrikes,
        };
      }
    });
  };

  const handleOut = () => {
    const currentState = { ...gameState };
    saveGameState(currentState);

    setGameState(prev => {
      let newOuts = prev.outs + 1;
      let newInning = prev.inning;
      let newIsTopInning = prev.isTopInning;
      let newCurrentBatter = prev.currentBatter;
      let newCurrentBatterIndex = prev.currentBatterIndex;
      let newCurrentBatterIsHome = prev.currentBatterIsHome;
      let newFirstBase = prev.firstBase;
      let newSecondBase = prev.secondBase;
      let newThirdBase = prev.thirdBase;
      let newNextHomeBatter = prev.nextHomeBatter;
      let newNextAwayBatter = prev.nextAwayBatter;

      // Update current batter stats (out - only at bat, no hit)
      const teamStats = prev.currentBatterIsHome ? prev.homePlayerStats : prev.awayPlayerStats;
      const currentPlayerStats = teamStats[prev.currentBatter];
      const newTeamStats = {
        ...teamStats,
        [prev.currentBatter]: {
          ...currentPlayerStats,
          atBats: currentPlayerStats.atBats + 1,
        }
      };

      if (newOuts === 3) {
        // 3 outs - switch teams/innings
        newOuts = 0;
        
        
        // Increment next batter number for the team that just finished
        if (prev.currentBatterIsHome) {
          newNextHomeBatter = prev.nextHomeBatter + 1;
        } else {
          newNextAwayBatter = prev.nextAwayBatter + 1;
        }
        
        if (prev.isTopInning) {
          // Switch from top to bottom (away -> home)
          newIsTopInning = false;
          
          // Use saved next home batter number
          const homeBatterIndex = (prev.nextHomeBatter - 1) % homePlayers.length;
          newCurrentBatter = homePlayers[homeBatterIndex];
          newCurrentBatterIndex = homeBatterIndex;
          newCurrentBatterIsHome = true;
          
        } else {
          // Switch from bottom to top of next inning (home -> away)
          newIsTopInning = true;
          newInning = prev.inning + 1;
          
          // Use saved next away batter number
          const awayBatterIndex = (prev.nextAwayBatter - 1) % awayPlayers.length;
          newCurrentBatter = awayPlayers[awayBatterIndex];
          newCurrentBatterIndex = awayBatterIndex;
          newCurrentBatterIsHome = false;
        }
        // Clear bases when switching teams
        newFirstBase = false;
        newSecondBase = false;
        newThirdBase = false;
      } else {
        // Still same team's turn - increment next batter number and advance to next batter
        if (prev.currentBatterIsHome) {
          newNextHomeBatter = prev.nextHomeBatter + 1;
          const homeBatterIndex = (newNextHomeBatter - 1) % homePlayers.length;
          newCurrentBatter = homePlayers[homeBatterIndex];
          newCurrentBatterIndex = homeBatterIndex;
        } else {
          newNextAwayBatter = prev.nextAwayBatter + 1;
          const awayBatterIndex = (newNextAwayBatter - 1) % awayPlayers.length;
          newCurrentBatter = awayPlayers[awayBatterIndex];
          newCurrentBatterIndex = awayBatterIndex;
        }
      }

      return {
        ...prev,
        strikes: 0,
        balls: 0,
        outs: newOuts,
        inning: newInning,
        isTopInning: newIsTopInning,
        currentBatter: newCurrentBatter,
        currentBatterIndex: newCurrentBatterIndex,
        currentBatterIsHome: newCurrentBatterIsHome,
        firstBase: newFirstBase,
        secondBase: newSecondBase,
        thirdBase: newThirdBase,
        nextHomeBatter: newNextHomeBatter,
        nextAwayBatter: newNextAwayBatter,
        [prev.currentBatterIsHome ? 'homePlayerStats' : 'awayPlayerStats']: newTeamStats,
      };
    });
  };

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
      
      {/* End Game Button - Absolute positioned in top right */}
      <TouchableOpacity style={styles.endGameButton} onPress={endGame}>
        <Text style={styles.endGameButtonText}>END GAME</Text>
      </TouchableOpacity>

      {/* Back Button - Absolute positioned in top left */}
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backButtonText}>BACK 1 PLAY</Text>
      </TouchableOpacity>

      <View style={styles.gameLayout}>
        {/* Away Team Lineup (Left Side) */}
        <View style={styles.lineupSection}>
          <Text style={styles.teamTitle}>{awayTeam}</Text>
          <ScrollView style={styles.lineupScroll}>
            {awayPlayers.map((player, index) => (
              <View key={player} style={[
                styles.lineupItem,
                gameState.currentBatter === player && !gameState.currentBatterIsHome && styles.currentBatter
              ]}>
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
        <View style={styles.centerSection}>
          <View style={styles.scoreBug}>
            {/* Top Section - Team Names and Scores */}
            <View style={styles.topSection}>
              {/* Away Team Row */}
              <View style={styles.teamRow}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreNumber}>{gameState.awayScore}</Text>
                </View>
                <View style={styles.teamNameBox}>
                  <Text style={styles.teamNameText}>{route.params.awayAbbreviation}</Text>
                </View>
              </View>
              
              {/* Home Team Row */}
              <View style={styles.teamRow}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreNumber}>{gameState.homeScore}</Text>
                </View>
                <View style={styles.teamNameBox}>
                  <Text style={styles.teamNameText}>{route.params.homeAbbreviation}</Text>
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

          {/* Game Control Buttons */}
          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.gameButton} onPress={handle1B}>
                <Text style={styles.buttonText}>1B</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.gameButton} onPress={handle2B}>
                <Text style={styles.buttonText}>2B</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.gameButton} onPress={handle3B}>
                <Text style={styles.buttonText}>3B</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.gameButton, styles.hrButton]} onPress={handleHR}>
                <Text style={styles.buttonText}>HR</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.gameButton, styles.strikeButton]} onPress={handleStrike}>
                <Text style={styles.buttonText}>STRIKE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.gameButton, styles.outButton]} onPress={handleOut}>
                <Text style={styles.buttonText}>OUT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Home Team Lineup (Right Side) */}
        <View style={styles.homeLineupSection}>
          <Text style={styles.teamTitle}>{homeTeam}</Text>
          <ScrollView style={styles.lineupScroll}>
            {homePlayers.map((player, index) => (
              <View key={player} style={[
                styles.lineupItem,
                gameState.currentBatter === player && gameState.currentBatterIsHome && styles.currentBatter
              ]}>
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
  hrButton: {
    backgroundColor: '#FFD700',
  },
  strikeButton: {
    backgroundColor: '#FF0000',
  },
  outButton: {
    backgroundColor: '#FF0000',
  },
  endGameButton: {
    position: 'absolute',
    bottom: 10,
    right: 55,
    backgroundColor: '#FF0000',
    padding: 10,
    borderWidth: 2,
    borderColor: '#000000',
    zIndex: 1000,
  },
  endGameButtonText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
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