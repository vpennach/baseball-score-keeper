import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import GameSetupScreen from './src/screens/GameSetupScreen';
import PlayerStatsScreen from './src/screens/PlayerStatsScreen';
import GameDetailsScreen from './src/screens/GameDetailsScreen';
import TeamPlayersScreen from './src/screens/TeamPlayersScreen';
import GameTimelineScreen from './src/screens/GameTimelineScreen';

export type RootStackParamList = {
  Home: undefined;
  GameSetup: undefined;
  Game: { 
    homeTeam: string;
    awayTeam: string;
    homeAbbreviation: string;
    awayAbbreviation: string;
    homePlayers: string[];
    awayPlayers: string[];
    maxInnings: number;
  };
  History: undefined;
  PlayerStats: undefined;
  GameDetails: {
    gameId: string;
  };
  TeamPlayers: {
    teamName: string;
    teamAbbreviation: string;
    players: string[];
    playerStats: Array<{
      name: string;
      stats: {
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
    }>;
    opposingTeamName: string;
  };
  GameTimeline: {
    gameId: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    'PressStart2P': require('./assets/fonts/PressStart2P-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#000000',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontFamily: 'PressStart2P',
              fontSize: 16,
            },
            headerBackVisible: false,
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Party Baseball' }}
          />
          <Stack.Screen 
            name="GameSetup" 
            component={GameSetupScreen} 
            options={{ title: 'Setup' }}
          />
          <Stack.Screen 
            name="Game" 
            component={GameScreen} 
            options={{ title: 'Game' }}
          />
          <Stack.Screen 
            name="History" 
            component={HistoryScreen} 
            options={{ title: 'History' }}
          />
          <Stack.Screen 
            name="PlayerStats" 
            component={PlayerStatsScreen} 
            options={{ title: 'Stats' }}
          />
          <Stack.Screen 
            name="GameDetails" 
            component={GameDetailsScreen} 
            options={{ title: 'Game Details' }}
          />
          <Stack.Screen 
            name="TeamPlayers" 
            component={TeamPlayersScreen} 
            options={{ title: 'Team Players' }}
          />
          <Stack.Screen 
            name="GameTimeline" 
            component={GameTimelineScreen} 
            options={{ title: 'Game Timeline' }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
});
