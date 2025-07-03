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
import PlayerStatsModal from '../components/PlayerStatsModal';
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

export default function GameScreen({ navigation, route }: GameScreenProps) {
  const { homeTeam, awayTeam, homePlayers, awayPlayers, maxInnings } = route.params;

  // Game state history for back button
  const [gameHistory, setGameHistory] = useState<GameState[]>([]);

  // Player stats modal state
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');

  // Double play modal state
  const [showDoublePlayModal, setShowDoublePlayModal] = useState(false);

  // Lock to landscape mode when screen loads
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    lockOrientation();
  }, []);

  const truncatePlayerName = (name: string) => {
    if (name.length > 6) {
      return name.substring(0, 6) + '..';
    }
    return name;
  };

  const handlePlayerPress = (playerName: string) => {
    try {
      //console.log('=== PLAYER PRESS DEBUG ===');
      //console.log('1. Player pressed:', playerName);
      //console.log('2. Current showPlayerStats state:', showPlayerStats);
      //console.log('3. Current selectedPlayer state:', selectedPlayer);
      
      //console.log('4. Setting selectedPlayer to:', playerName);
      setSelectedPlayer(playerName);
      
      //console.log('5. Setting showPlayerStats to true');
      setShowPlayerStats(true);
      
      //console.log('6. handlePlayerPress completed successfully');
    } catch (error) {
      //console.error('ERROR in handlePlayerPress:', error);
      //console.error('Error stack:', error.stack);
    }
  };

  const initialPlayerStats = (players: string[]) =>
    players.reduce(
      (acc, player) => ({
        ...acc,
        [player]: { atBats: 0, hits: 0, runs: 0, rbis: 0, singles: 0, doubles: 0, triples: 0, homers: 0, totalBases: 0 },
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
    firstBase: null,
    secondBase: null,
    thirdBase: null,
    currentBatter: awayPlayers[0] || '',
    currentBatterIndex: 0,
    currentBatterIsHome: false,
    nextHomeBatter: 1,
    nextAwayBatter: 1,
    gameEnded: false,
  });

  const saveGameState = (state: GameState) => {
    setGameHistory(prev => [...prev, state]);
  };

  const checkGameEnd = (currentInning: number, isTopInning: boolean, homeScore: number, awayScore: number): boolean => {
    // Game ends when we've completed the bottom of the last inning
    // (i.e., when we're about to start the top of the next inning after maxInnings)
    if (isTopInning && currentInning > maxInnings) {
      // Check if the game is tied - if so, continue to extra innings
      if (homeScore === awayScore) {
        return false; // Continue to extra innings
      }
      return true; // Game is not tied, end the game
    }
    
    // Game ends when home team is already winning after top of the last inning
    // (i.e., when we're about to start the bottom of the last inning and home team leads)
    if (!isTopInning && currentInning === maxInnings && homeScore > awayScore) {
      return true; // Home team is winning, end the game
    }
    
    return false;
  };

  const checkWalkOff = (currentInning: number, isTopInning: boolean, homeScore: number, awayScore: number): boolean => {
    // Walk-off occurs when home team takes the lead in the bottom of the final inning or extra innings
    if (!isTopInning && homeScore > awayScore) {
      // Check if this is the final inning (either maxInnings or extra innings)
      if (currentInning >= maxInnings) {
        return true; // Walk-off!
      }
    }
    return false;
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
        newFirstBase = null;
        newSecondBase = null;
        newThirdBase = null;
      } else if (basesAdvanced === 2) {
        // Double - runners advance 2 bases
        if (prev.thirdBase) runs++;
        if (prev.secondBase) runs++;
        if (prev.firstBase) {
          newThirdBase = '3';
        }
        newSecondBase = '2';
        newFirstBase = null;
      } else if (basesAdvanced === 1) {
        // Single - runners advance 1 base
        if (prev.thirdBase) {
          runs++;
          newThirdBase = null; // Runner scored, clear third base
        }
        if (prev.secondBase) {
          newThirdBase = '2'; // Runner advances to third
          newSecondBase = null; // Clear second base
        }
        if (prev.firstBase) {
          newSecondBase = '2'; // Runner advances to second
          newFirstBase = null; // Clear first base
        }
        newFirstBase = '1'; // Batter reaches first
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
          singles: currentPlayerStats.singles + 1,
          totalBases: currentPlayerStats.totalBases + 1,
        }
      };

      // Advance runners and calculate runs
      let runs = 0;
      let newFirstBase = prev.firstBase;
      let newSecondBase = prev.secondBase;
      let newThirdBase = prev.thirdBase;
      let playersWhoScored: string[] = [];

      // Single - runners advance 1 base
      if (prev.thirdBase) {
        runs++;
        playersWhoScored.push(prev.thirdBase);
        newThirdBase = null; // Runner scored, clear third base
      }
      if (prev.secondBase) {
        newThirdBase = prev.secondBase; // Runner advances to third
        newSecondBase = null; // Clear second base
      }
      if (prev.firstBase) {
        newSecondBase = prev.firstBase; // Runner advances to second
        newFirstBase = null; // Clear first base
      }
      newFirstBase = prev.currentBatter; // Batter reaches first

      // Calculate RBIs for the batter
      const rbis = runs;

      // Give runs to players who scored
      const updatedTeamStats = { ...newTeamStats };
      playersWhoScored.forEach(playerName => {
        if (updatedTeamStats[playerName]) {
          updatedTeamStats[playerName] = {
            ...updatedTeamStats[playerName],
            runs: updatedTeamStats[playerName].runs + 1,
          };
        }
      });

      // Increment next batter number for current team
      const newNextHomeBatter = prev.currentBatterIsHome ? prev.nextHomeBatter + 1 : prev.nextHomeBatter;
      const newNextAwayBatter = !prev.currentBatterIsHome ? prev.nextAwayBatter + 1 : prev.nextAwayBatter;
      
      // Get next batter using modulo arithmetic
      const players = prev.currentBatterIsHome ? homePlayers : awayPlayers;
      const nextBatterNumber = prev.currentBatterIsHome ? newNextHomeBatter : newNextAwayBatter;
      const nextBatterIndex = (nextBatterNumber - 1) % players.length;
      const nextBatter = players[nextBatterIndex];

      // Calculate new scores after this hit
      const newHomeScore = prev.currentBatterIsHome ? prev.homeScore + runs : prev.homeScore;
      const newAwayScore = !prev.currentBatterIsHome ? prev.awayScore + runs : prev.awayScore;

      // Check for walk-off
      const isWalkOff = checkWalkOff(prev.inning, prev.isTopInning, newHomeScore, newAwayScore);

      return {
        ...prev,
        firstBase: newFirstBase,
        secondBase: newSecondBase,
        thirdBase: newThirdBase,
        balls: 0,
        strikes: 0,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        gameEnded: isWalkOff || prev.gameEnded,
        [prev.currentBatterIsHome ? 'homePlayerStats' : 'awayPlayerStats']: {
          ...updatedTeamStats,
          [prev.currentBatter]: {
            ...updatedTeamStats[prev.currentBatter],
            rbis: updatedTeamStats[prev.currentBatter].rbis + rbis,
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
          doubles: currentPlayerStats.doubles + 1,
          totalBases: currentPlayerStats.totalBases + 2,
        }
      };

      // Double - runners advance 2 bases
      let runs = 0;
      let newFirstBase = null;
      let newSecondBase = null;
      let newThirdBase = null;
      let playersWhoScored: string[] = [];

      if (prev.thirdBase) {
        runs++;
        playersWhoScored.push(prev.thirdBase);
      }
      if (prev.secondBase) {
        runs++;
        playersWhoScored.push(prev.secondBase);
      }
      if (prev.firstBase) {
        newThirdBase = prev.firstBase; // Runner advances to third
      }
      newSecondBase = prev.currentBatter; // Batter reaches second

      // Calculate RBIs for the batter
      const rbis = runs;

      // Give runs to players who scored
      const updatedTeamStats = { ...newTeamStats };
      playersWhoScored.forEach(playerName => {
        if (updatedTeamStats[playerName]) {
          updatedTeamStats[playerName] = {
            ...updatedTeamStats[playerName],
            runs: updatedTeamStats[playerName].runs + 1,
          };
        }
      });

      // Increment next batter number for current team
      const newNextHomeBatter = prev.currentBatterIsHome ? prev.nextHomeBatter + 1 : prev.nextHomeBatter;
      const newNextAwayBatter = !prev.currentBatterIsHome ? prev.nextAwayBatter + 1 : prev.nextAwayBatter;
      
      // Get next batter using modulo arithmetic
      const players = prev.currentBatterIsHome ? homePlayers : awayPlayers;
      const nextBatterNumber = prev.currentBatterIsHome ? newNextHomeBatter : newNextAwayBatter;
      const nextBatterIndex = (nextBatterNumber - 1) % players.length;
      const nextBatter = players[nextBatterIndex];

      // Calculate new scores after this hit
      const newHomeScore = prev.currentBatterIsHome ? prev.homeScore + runs : prev.homeScore;
      const newAwayScore = !prev.currentBatterIsHome ? prev.awayScore + runs : prev.awayScore;

      // Check for walk-off
      const isWalkOff = checkWalkOff(prev.inning, prev.isTopInning, newHomeScore, newAwayScore);

      return {
        ...prev,
        firstBase: newFirstBase,
        secondBase: newSecondBase,
        thirdBase: newThirdBase,
        balls: 0,
        strikes: 0,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        gameEnded: isWalkOff || prev.gameEnded,
        [prev.currentBatterIsHome ? 'homePlayerStats' : 'awayPlayerStats']: {
          ...updatedTeamStats,
          [prev.currentBatter]: {
            ...updatedTeamStats[prev.currentBatter],
            rbis: updatedTeamStats[prev.currentBatter].rbis + rbis,
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
          triples: currentPlayerStats.triples + 1,
          totalBases: currentPlayerStats.totalBases + 3,
        }
      };

      // Triple - all runners score, batter reaches third
      let runs = 0;
      let playersWhoScored: string[] = [];
      
      if (prev.firstBase) {
        runs++;
        playersWhoScored.push(prev.firstBase);
      }
      if (prev.secondBase) {
        runs++;
        playersWhoScored.push(prev.secondBase);
      }
      if (prev.thirdBase) {
        runs++;
        playersWhoScored.push(prev.thirdBase);
      }

      // Calculate RBIs for the batter
      const rbis = runs;

      // Give runs to players who scored
      const updatedTeamStats = { ...newTeamStats };
      playersWhoScored.forEach(playerName => {
        if (updatedTeamStats[playerName]) {
          updatedTeamStats[playerName] = {
            ...updatedTeamStats[playerName],
            runs: updatedTeamStats[playerName].runs + 1,
          };
        }
      });

      // Increment next batter number for current team
      const newNextHomeBatter = prev.currentBatterIsHome ? prev.nextHomeBatter + 1 : prev.nextHomeBatter;
      const newNextAwayBatter = !prev.currentBatterIsHome ? prev.nextAwayBatter + 1 : prev.nextAwayBatter;
      
      // Get next batter using modulo arithmetic
      const players = prev.currentBatterIsHome ? homePlayers : awayPlayers;
      const nextBatterNumber = prev.currentBatterIsHome ? newNextHomeBatter : newNextAwayBatter;
      const nextBatterIndex = (nextBatterNumber - 1) % players.length;
      const nextBatter = players[nextBatterIndex];
      
      // Calculate new scores after this hit
      const newHomeScore = prev.currentBatterIsHome ? prev.homeScore + runs : prev.homeScore;
      const newAwayScore = !prev.currentBatterIsHome ? prev.awayScore + runs : prev.awayScore;

      // Check for walk-off
      const isWalkOff = checkWalkOff(prev.inning, prev.isTopInning, newHomeScore, newAwayScore);
      
      return {
        ...prev,
        firstBase: null,
        secondBase: null,
        thirdBase: '3', // Batter reaches third
        balls: 0,
        strikes: 0,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        gameEnded: isWalkOff || prev.gameEnded,
        [prev.currentBatterIsHome ? 'homePlayerStats' : 'awayPlayerStats']: {
          ...updatedTeamStats,
          [prev.currentBatter]: {
            ...updatedTeamStats[prev.currentBatter],
            rbis: updatedTeamStats[prev.currentBatter].rbis + rbis,
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
          homers: currentPlayerStats.homers + 1,
          totalBases: currentPlayerStats.totalBases + 4,
        }
      };

      // Home run - all runners score plus the batter
      let runs = 1; // Batter scores
      let playersWhoScored: string[] = [prev.currentBatter]; // Batter scores
      
      if (prev.firstBase) {
        runs++;
        playersWhoScored.push(prev.firstBase);
      }
      if (prev.secondBase) {
        runs++;
        playersWhoScored.push(prev.secondBase);
      }
      if (prev.thirdBase) {
        runs++;
        playersWhoScored.push(prev.thirdBase);
      }

      // Calculate RBIs for the batter
      const rbis = runs;

      // Give runs to players who scored
      const updatedTeamStats = { ...newTeamStats };
      playersWhoScored.forEach(playerName => {
        if (updatedTeamStats[playerName]) {
          updatedTeamStats[playerName] = {
            ...updatedTeamStats[playerName],
            runs: updatedTeamStats[playerName].runs + 1,
          };
        }
      });

      // Increment next batter number for current team
      const newNextHomeBatter = prev.currentBatterIsHome ? prev.nextHomeBatter + 1 : prev.nextHomeBatter;
      const newNextAwayBatter = !prev.currentBatterIsHome ? prev.nextAwayBatter + 1 : prev.nextAwayBatter;
      
      // Get next batter using modulo arithmetic
      const players = prev.currentBatterIsHome ? homePlayers : awayPlayers;
      const nextBatterNumber = prev.currentBatterIsHome ? newNextHomeBatter : newNextAwayBatter;
      const nextBatterIndex = (nextBatterNumber - 1) % players.length;
      const nextBatter = players[nextBatterIndex];
      
      // Calculate new scores after this hit
      const newHomeScore = prev.currentBatterIsHome ? prev.homeScore + runs : prev.homeScore;
      const newAwayScore = !prev.currentBatterIsHome ? prev.awayScore + runs : prev.awayScore;

      // Check for walk-off
      const isWalkOff = checkWalkOff(prev.inning, prev.isTopInning, newHomeScore, newAwayScore);
      
      return {
        ...prev,
        firstBase: null,
        secondBase: null,
        thirdBase: null,
        balls: 0,
        strikes: 0,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        gameEnded: isWalkOff || prev.gameEnded,
        [prev.currentBatterIsHome ? 'homePlayerStats' : 'awayPlayerStats']: {
          ...updatedTeamStats,
          [prev.currentBatter]: {
            ...updatedTeamStats[prev.currentBatter],
            rbis: updatedTeamStats[prev.currentBatter].rbis + rbis,
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
        let shouldEndGame = false; // Initialize to prevent undefined

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
            // Switch to bottom of inning
            newIsTopInning = false;
            
            // Check if game should end (home team already winning in last inning)
            shouldEndGame = checkGameEnd(prev.inning, newIsTopInning, prev.homeScore, prev.awayScore);
            
            // Use saved next home batter number
            const homeBatterIndex = (prev.nextHomeBatter - 1 + homePlayers.length) % homePlayers.length;
            newCurrentBatter = homePlayers[homeBatterIndex];
            newCurrentBatterIndex = homeBatterIndex;
            newCurrentBatterIsHome = true;
            
          } else {
            // Switch to top of next inning
            newIsTopInning = true;
            newInning = prev.inning + 1;
            
            // Check if game should end
            shouldEndGame = checkGameEnd(newInning, newIsTopInning, prev.homeScore, prev.awayScore);
            
            // Use saved next away batter number
            const awayBatterIndex = (prev.nextAwayBatter - 1 + awayPlayers.length) % awayPlayers.length;
            newCurrentBatter = awayPlayers[awayBatterIndex];
            newCurrentBatterIndex = awayBatterIndex;
            newCurrentBatterIsHome = false;
          }
          // Clear bases when switching teams
          newFirstBase = null;
          newSecondBase = null;
          newThirdBase = null;
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
          gameEnded: shouldEndGame || prev.gameEnded,
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
      let shouldEndGame = false; // Initialize to prevent undefined

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
          // Switch to bottom of inning
          newIsTopInning = false;
          
          // Check if game should end (home team already winning in last inning)
          shouldEndGame = checkGameEnd(prev.inning, newIsTopInning, prev.homeScore, prev.awayScore);
          
          // Use saved next home batter number
          const homeBatterIndex = (prev.nextHomeBatter - 1 + homePlayers.length) % homePlayers.length;
          newCurrentBatter = homePlayers[homeBatterIndex];
          newCurrentBatterIndex = homeBatterIndex;
          newCurrentBatterIsHome = true;
          
        } else {
          // Switch to top of next inning
          newIsTopInning = true;
          newInning = prev.inning + 1;
          
          // Check if game should end
          shouldEndGame = checkGameEnd(newInning, newIsTopInning, prev.homeScore, prev.awayScore);
          
          // Use saved next away batter number
          const awayBatterIndex = (prev.nextAwayBatter - 1 + awayPlayers.length) % awayPlayers.length;
          newCurrentBatter = awayPlayers[awayBatterIndex];
          newCurrentBatterIndex = awayBatterIndex;
          newCurrentBatterIsHome = false;
        }
        // Clear bases when switching teams
        newFirstBase = null;
        newSecondBase = null;
        newThirdBase = null;
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
        gameEnded: shouldEndGame || prev.gameEnded,
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

  // Helper function to check if any runners are on base
  const hasRunnersOnBase = () => {
    return gameState.firstBase !== null || gameState.secondBase !== null || gameState.thirdBase !== null;
  };

  // Helper function to check if double play is allowed
  const canDoublePlay = () => {
    return hasRunnersOnBase() && gameState.outs < 2;
  };

  // Helper function to count runners on base
  const countRunnersOnBase = () => {
    let count = 0;
    if (gameState.firstBase !== null) count++;
    if (gameState.secondBase !== null) count++;
    if (gameState.thirdBase !== null) count++;
    return count;
  };

  // Helper function to get available base options for double play
  const getAvailableBaseOptions = () => {
    const options = [];
    if (gameState.firstBase !== null) options.push('1B');
    if (gameState.secondBase !== null) options.push('2B');
    if (gameState.thirdBase !== null) options.push('3B');
    return options;
  };

  // Handle double play button press
  const handleDoublePlay = () => {
    if (!hasRunnersOnBase()) {
      return; // Button should be disabled, but just in case
    }

    const runnerCount = countRunnersOnBase();
    
    if (runnerCount === 1 || gameState.outs >= 1) {
      // Single runner or already 1+ outs - no need for modal
      executeDoublePlay(null);
    } else {
      // Multiple runners and 0 outs - show modal to choose which runner
      setShowDoublePlayModal(true);
    }
  };

  // Execute the double play
  const executeDoublePlay = (selectedBase: string | null) => {
    saveGameState(gameState);
    
    setGameState(prev => {
      // Record out for current batter (without advancing to next batter)
      const currentBatter = prev.currentBatter;
      const isHomeTeam = prev.currentBatterIsHome;
      
      // Update stats directly without calling recordAtBat
      let newHomePlayerStats = prev.homePlayerStats;
      let newAwayPlayerStats = prev.awayPlayerStats;
      
      if (isHomeTeam) {
        const currentStats = prev.homePlayerStats[currentBatter];
        newHomePlayerStats = {
          ...prev.homePlayerStats,
          [currentBatter]: {
            ...currentStats,
            atBats: currentStats.atBats + 1,
          },
        };
      } else {
        const currentStats = prev.awayPlayerStats[currentBatter];
        newAwayPlayerStats = {
          ...prev.awayPlayerStats,
          [currentBatter]: {
            ...currentStats,
            atBats: currentStats.atBats + 1,
          },
        };
      }
      
      let newFirstBase = prev.firstBase;
      let newSecondBase = prev.secondBase;
      let newThirdBase = prev.thirdBase;
      let newOuts = prev.outs + 1;

      // Remove the selected runner (if specified) or just clear bases
      if (selectedBase === '1B') {
        newFirstBase = null;
      } else if (selectedBase === '2B') {
        newSecondBase = null;
      } else if (selectedBase === '3B') {
        newThirdBase = null;
      } else {
        // No specific runner selected, clear all bases
        newFirstBase = null;
        newSecondBase = null;
        newThirdBase = null;
      }

      // Add second out
      newOuts += 1;

      // Check if inning should end
      let newInning = prev.inning;
      let newIsTopInning = prev.isTopInning;
      let newCurrentBatter = prev.currentBatter;
      let newCurrentBatterIndex = prev.currentBatterIndex;
      let newCurrentBatterIsHome = prev.currentBatterIsHome;
      let newNextHomeBatter = prev.nextHomeBatter;
      let newNextAwayBatter = prev.nextAwayBatter;
      let shouldEndGame = false; // Initialize to prevent undefined

      if (newOuts >= 3) {
        // Inning ends
        newOuts = 0;
        
        // Increment next batter number for the team that just finished
        if (prev.currentBatterIsHome) {
          newNextHomeBatter = prev.nextHomeBatter + 1;
        } else {
          newNextAwayBatter = prev.nextAwayBatter + 1;
        }
        
        if (prev.isTopInning) {
          // Check if game should end BEFORE switching to bottom of inning
          // (home team already winning in last inning)
          shouldEndGame = checkGameEnd(prev.inning, false, prev.homeScore, prev.awayScore);
          
          if (!shouldEndGame) {
            // Switch to bottom of inning
            newIsTopInning = false;
            
            // Use saved next home batter number
            const homeBatterIndex = (newNextHomeBatter - 1 + homePlayers.length) % homePlayers.length;
            newCurrentBatter = homePlayers[homeBatterIndex];
            newCurrentBatterIndex = homeBatterIndex;
            newCurrentBatterIsHome = true;
          }
        } else {
          // Switch to top of next inning
          newInning = prev.inning + 1;
          newIsTopInning = true;
          
          // Check if game should end
          shouldEndGame = checkGameEnd(newInning, newIsTopInning, prev.homeScore, prev.awayScore);
          
          if (!shouldEndGame) {
            // Use saved next away batter number
            const awayBatterIndex = (newNextAwayBatter - 1 + awayPlayers.length) % awayPlayers.length;
            newCurrentBatter = awayPlayers[awayBatterIndex];
            newCurrentBatterIndex = awayBatterIndex;
            newCurrentBatterIsHome = false;
          }
        }
      } else {
        // Still same team's turn - increment next batter number and advance to next batter
        if (prev.currentBatterIsHome) {
          newNextHomeBatter = prev.nextHomeBatter + 1;
          const homeBatterIndex = (newNextHomeBatter - 1 + homePlayers.length) % homePlayers.length;
          newCurrentBatter = homePlayers[homeBatterIndex];
          newCurrentBatterIndex = homeBatterIndex;
        } else {
          newNextAwayBatter = prev.nextAwayBatter + 1;
          const awayBatterIndex = (newNextAwayBatter - 1 + awayPlayers.length) % awayPlayers.length;
          newCurrentBatter = awayPlayers[awayBatterIndex];
          newCurrentBatterIndex = awayBatterIndex;
        }
      }

      // Reset count
      const newBalls = 0;
      const newStrikes = 0;

      return {
        ...prev,
        homePlayerStats: newHomePlayerStats,
        awayPlayerStats: newAwayPlayerStats,
        inning: newInning,
        isTopInning: newIsTopInning,
        outs: newOuts,
        firstBase: newFirstBase,
        secondBase: newSecondBase,
        thirdBase: newThirdBase,
        currentBatter: newCurrentBatter,
        currentBatterIndex: newCurrentBatterIndex,
        currentBatterIsHome: newCurrentBatterIsHome,
        nextHomeBatter: newNextHomeBatter,
        nextAwayBatter: newNextAwayBatter,
        balls: newBalls,
        strikes: newStrikes,
        gameEnded: shouldEndGame || prev.gameEnded,
      };
    });

    setShowDoublePlayModal(false);
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
              <TouchableOpacity 
                key={player} 
                style={[
                  styles.lineupItem,
                  gameState.currentBatter === player && !gameState.currentBatterIsHome && styles.currentBatter
                ]}
                onPress={() => handlePlayerPress(player)}
              >
                <Text style={styles.lineupNumber}>{index + 1}.</Text>
                <Text style={styles.lineupName}>{truncatePlayerName(player)}</Text>
                <Text style={styles.playerStats}>
                  {gameState.awayPlayerStats[player]?.rbis || 0}RBI {gameState.awayPlayerStats[player]?.hits || 0}-{gameState.awayPlayerStats[player]?.atBats || 0}
                </Text>
              </TouchableOpacity>
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
              <TouchableOpacity 
                style={[
                  styles.gameButton, 
                  styles.outButton,
                  !canDoublePlay() && styles.disabledButton
                ]} 
                onPress={handleDoublePlay}
                disabled={!canDoublePlay()}
              >
                <Text style={[
                  styles.buttonText,
                  !canDoublePlay() && styles.disabledButtonText
                ]}>DP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Home Team Lineup (Right Side) */}
        <View style={styles.homeLineupSection}>
          <Text style={styles.teamTitle}>{homeTeam}</Text>
          <ScrollView style={styles.lineupScroll}>
            {homePlayers.map((player, index) => (
              <TouchableOpacity 
                key={player} 
                style={[
                  styles.lineupItem,
                  gameState.currentBatter === player && gameState.currentBatterIsHome && styles.currentBatter
                ]}
                onPress={() => handlePlayerPress(player)}
              >
                <Text style={styles.lineupNumber}>{index + 1}.</Text>
                <Text style={styles.lineupName}>{truncatePlayerName(player)}</Text>
                <Text style={styles.playerStats}>
                  {gameState.homePlayerStats[player]?.rbis || 0}RBI {gameState.homePlayerStats[player]?.hits || 0}-{gameState.homePlayerStats[player]?.atBats || 0}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Player Stats Modal */}
      <PlayerStatsModal
        visible={showPlayerStats}
        onClose={() => setShowPlayerStats(false)}
        playerName={selectedPlayer}
        playerStats={
          gameState.homePlayerStats[selectedPlayer] || 
          gameState.awayPlayerStats[selectedPlayer] || 
          { atBats: 0, hits: 0, runs: 0, rbis: 0, singles: 0, doubles: 0, triples: 0, homers: 0, totalBases: 0 }
        }
      />

      {/* Double Play Modal */}
      {showDoublePlayModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Which runner got out?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[
                  styles.modalButton,
                  gameState.firstBase === null && styles.disabledModalButton
                ]}
                onPress={() => executeDoublePlay('1B')}
                disabled={gameState.firstBase === null}
              >
                <Text style={[
                  styles.modalButtonText,
                  gameState.firstBase === null && styles.disabledModalButtonText
                ]}>1B</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.modalButton,
                  gameState.secondBase === null && styles.disabledModalButton
                ]}
                onPress={() => executeDoublePlay('2B')}
                disabled={gameState.secondBase === null}
              >
                <Text style={[
                  styles.modalButtonText,
                  gameState.secondBase === null && styles.disabledModalButtonText
                ]}>2B</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.modalButton,
                  gameState.thirdBase === null && styles.disabledModalButton
                ]}
                onPress={() => executeDoublePlay('3B')}
                disabled={gameState.thirdBase === null}
              >
                <Text style={[
                  styles.modalButtonText,
                  gameState.thirdBase === null && styles.disabledModalButtonText
                ]}>3B</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowDoublePlayModal(false)}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Game End Overlay */}
      {gameState.gameEnded && (
        <View style={styles.gameEndOverlay}>
          <View style={styles.gameEndContent}>
            <Text style={styles.gameEndTitle}>GAME OVER</Text>
            <View style={styles.finalScoreContainer}>
              <Text style={styles.finalScoreText}>
                {route.params.awayAbbreviation} {gameState.awayScore} - {gameState.homeScore} {route.params.homeAbbreviation}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.returnHomeButton} 
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.returnHomeButtonText}>RETURN TO HOME</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  disabledButton: {
    backgroundColor: '#CCCCCC',
    borderColor: '#999999',
  },
  disabledButtonText: {
    color: '#666666',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderColor: '#000000',
    borderWidth: 5,
    borderRadius: 10,
    maxWidth: 300,
    minWidth: 250,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PressStart2P',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,

  },
  modalButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#000000',
    marginHorizontal: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
  },
  disabledModalButton: {
    backgroundColor: '#CCCCCC',
    borderColor: '#999999',
  },
  disabledModalButtonText: {
    color: '#666666',
  },
  cancelButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#000000',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
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
  gameEndOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameEndContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderColor: '#000000',
    borderWidth: 5,
  },
  gameEndTitle: {
    fontSize: 24,
    fontFamily: 'PressStart2P',
    color: '#000000',
    marginBottom: 20,
  },
  finalScoreContainer: {
    marginBottom: 20,
  },
  finalScoreText: {
    fontSize: 18,
    fontFamily: 'PressStart2P',
    color: '#000000',
  },
  returnHomeButton: {
    backgroundColor: '#FF0000',
    padding: 10,
    borderWidth: 2,
    borderColor: '#000000',
  },
  returnHomeButtonText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
  },
}); 