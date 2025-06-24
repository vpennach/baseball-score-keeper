import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import StripedBackground from '../components/StripedBackground';
import * as ScreenOrientation from 'expo-screen-orientation';

type HistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'History'>;
};

// TODO: Replace with actual game data from MongoDB
const mockGames = [
  {
    id: '1',
    date: '2024-03-15',
    homeTeam: 'Yankees',
    awayTeam: 'Red Sox',
    homeScore: 5,
    awayScore: 3,
  },
  {
    id: '2',
    date: '2024-03-14',
    homeTeam: 'Dodgers',
    awayTeam: 'Giants',
    homeScore: 2,
    awayScore: 4,
  },
];

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  // Lock to portrait mode when screen loads
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
    lockOrientation();
  }, []);

  const renderGame = ({ item }: { item: typeof mockGames[0] }) => (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => {
        // TODO: Navigate to game details
      }}
    >
      <Text style={styles.date}>{item.date}</Text>
      <View style={styles.teamsContainer}>
        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{item.awayTeam}</Text>
          <Text style={styles.score}>{item.awayScore}</Text>
        </View>
        <Text style={styles.vs}>vs</Text>
        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{item.homeTeam}</Text>
          <Text style={styles.score}>{item.homeScore}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StripedBackground />
      <Text style={styles.title}>Game History</Text>
      <FlatList
        data={mockGames}
        renderItem={renderGame}
        keyExtractor={(item) => item.id}
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
  },
  listContainer: {
    padding: 20,
  },
  gameCard: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    marginBottom: 15,
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
}); 