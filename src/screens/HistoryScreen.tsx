import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

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
      <Text style={styles.title}>Game History</Text>
      <FlatList
        data={mockGames}
        renderItem={renderGame}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f4511e',
    padding: 20,
  },
  listContainer: {
    padding: 20,
  },
  gameCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
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
    fontWeight: 'bold',
    marginBottom: 5,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  vs: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 20,
  },
}); 