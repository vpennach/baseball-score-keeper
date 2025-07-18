import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import StripedBackground from '../components/StripedBackground';
import { getAllPlayers } from '../services/api';
import { capitalizePlayerName } from '../utils/nameUtils';
import { useScreenOrientation } from '../hooks/useScreenOrientation';

type PlayerStatsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlayerStats'>;
};

type PlayerStats = {
  name: string;
  gamesPlayed: number;
  atBats: number;
  hits: number;
  runs: number;
  rbis: number;
  singles: number;
  doubles: number;
  triples: number;
  homers: number;
  totalBases: number;
  battingAverage: string;
  sluggingPercentage: string;
};

type SortField = 'name' | 'gamesPlayed' | 'atBats' | 'hits' | 'runs' | 'rbis' | 'singles' | 'doubles' | 'triples' | 'homers' | 'totalBases' | 'battingAverage' | 'sluggingPercentage';

export default function PlayerStatsScreen({ navigation }: PlayerStatsScreenProps) {
  const [sortField, setSortField] = useState<SortField>('sluggingPercentage');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Lock to landscape mode
  useScreenOrientation('landscape');

  // Fetch all players on component mount
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await getAllPlayers();
      if (response.success && response.data) {
        // Transform the data to match our PlayerStats type
        const transformedPlayers: PlayerStats[] = response.data.map((player: any) => ({
          name: capitalizePlayerName(player.name),
          gamesPlayed: player.gamesPlayed || 0,
          atBats: player.atBats || 0,
          hits: player.hits || 0,
          runs: player.runs || 0,
          rbis: player.rbis || 0,
          singles: player.singles || 0,
          doubles: player.doubles || 0,
          triples: player.triples || 0,
          homers: player.homers || 0,
          totalBases: player.totalBases || 0,
          battingAverage: player.atBats > 0 ? (player.hits / player.atBats).toFixed(3) : '.000',
          sluggingPercentage: player.atBats > 0 ? (player.totalBases / player.atBats).toFixed(3) : '.000'
        }));
        setPlayers(transformedPlayers);
      } else {
        console.error('Failed to fetch players:', response.error);
        setPlayers([]);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle string values (batting average, slugging percentage)
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <View style={styles.container}>
      <StripedBackground />
      <View style={styles.header}>
        <Text style={styles.title}>Player Career Stats</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableContentContainer}>
          {/* Fixed Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity 
              style={[styles.headerCell, styles.nameHeaderCell]} 
              onPress={() => handleSort('name')}
            >
              <Text style={styles.headerText}>NAME{getSortIndicator('name')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerCell} 
              onPress={() => handleSort('gamesPlayed')}
            >
              <Text style={styles.headerText}>G{getSortIndicator('gamesPlayed')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerCell} 
              onPress={() => handleSort('atBats')}
            >
              <Text style={styles.headerText}>AB{getSortIndicator('atBats')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerCell} 
              onPress={() => handleSort('hits')}
            >
              <Text style={styles.headerText}>H{getSortIndicator('hits')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.headerCell, styles.baCell]} 
              onPress={() => handleSort('battingAverage')}
            >
              <Text style={styles.headerText}>BA{getSortIndicator('battingAverage')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerCell} 
              onPress={() => handleSort('runs')}
            >
              <Text style={styles.headerText}>R{getSortIndicator('runs')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.headerCell, styles.rbiCell]} 
              onPress={() => handleSort('rbis')}
            >
              <Text style={styles.headerText}>RBI{getSortIndicator('rbis')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerCell} 
              onPress={() => handleSort('singles')}
            >
              <Text style={styles.headerText}>1B{getSortIndicator('singles')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerCell} 
              onPress={() => handleSort('doubles')}
            >
              <Text style={styles.headerText}>2B{getSortIndicator('doubles')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerCell} 
              onPress={() => handleSort('triples')}
            >
              <Text style={styles.headerText}>3B{getSortIndicator('triples')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerCell} 
              onPress={() => handleSort('homers')}
            >
              <Text style={styles.headerText}>HR{getSortIndicator('homers')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.headerCell, styles.slgCell]} 
              onPress={() => handleSort('sluggingPercentage')}
            >
              <Text style={styles.headerText}>SLG{getSortIndicator('sluggingPercentage')}</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Data Rows */}
          <ScrollView style={styles.dataContainer} showsVerticalScrollIndicator={true}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading player stats...</Text>
              </View>
            ) : (
              sortedPlayers.map((player, index) => (
                <View key={index} style={[styles.dataRow, index % 2 === 1 && styles.alternateRow]}>
                  <View style={[styles.dataCell, styles.nameDataCell]}>
                    <Text style={styles.dataText}>{player.name}</Text>
                  </View>
                  <View style={styles.dataCell}>
                    <Text style={styles.dataText}>{player.gamesPlayed}</Text>
                  </View>
                  <View style={styles.dataCell}>
                    <Text style={styles.dataText}>{player.atBats}</Text>
                  </View>
                  <View style={styles.dataCell}>
                    <Text style={styles.dataText}>{player.hits}</Text>
                  </View>
                  <View style={[styles.dataCell, styles.baCell]}>
                    <Text style={styles.dataText}>{player.battingAverage}</Text>
                  </View>
                  <View style={styles.dataCell}>
                    <Text style={styles.dataText}>{player.runs}</Text>
                  </View>
                  <View style={[styles.dataCell, styles.rbiCell]}>
                    <Text style={styles.dataText}>{player.rbis}</Text>
                  </View>
                  <View style={styles.dataCell}>
                    <Text style={styles.dataText}>{player.singles}</Text>
                  </View>
                  <View style={styles.dataCell}>
                    <Text style={styles.dataText}>{player.doubles}</Text>
                  </View>
                  <View style={styles.dataCell}>
                    <Text style={styles.dataText}>{player.triples}</Text>
                  </View>
                  <View style={styles.dataCell}>
                    <Text style={styles.dataText}>{player.homers}</Text>
                  </View>
                  <View style={[styles.dataCell, styles.slgCell]}>
                    <Text style={styles.dataText}>{player.sluggingPercentage}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    flex: 1,
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
  tableContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tableContentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#000000',
  },
  headerCell: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  nameCell: {
    width: 120,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  nameHeaderCell: {
    width: 120,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
  },
  nameDataCell: {
    width: 120,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baCell: {
    width: 70,
  },
  rbiCell: {
    width: 60,
  },
  slgCell: {
    width: 70,
  },
  headerText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#000000',
    fontWeight: 'bold',
  },
  dataContainer: {
    maxHeight: 261,
  },
  dataRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#000000',
  },
  dataCell: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  dataText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#000000',
  },
  alternateRow: {
    backgroundColor: '#D0D0D0',
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
  },
}); 