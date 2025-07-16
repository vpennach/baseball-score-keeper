import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import StripedBackground from '../components/StripedBackground';
import * as ScreenOrientation from 'expo-screen-orientation';

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

  // Lock to landscape mode when screen loads
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    lockOrientation();
  }, []);

  // Hardcoded test data
  const testPlayers: PlayerStats[] = [
    {
      name: 'Bincent',
      gamesPlayed: 4,
      atBats: 24,
      hits: 8,
      runs: 4,
      rbis: 4,
      singles: 2,
      doubles: 0,
      triples: 2,
      homers: 4,
      totalBases: 24,
      battingAverage: '0.333',
      sluggingPercentage: '1.000'
    },
    {
      name: 'Vinny',
      gamesPlayed: 3,
      atBats: 18,
      hits: 6,
      runs: 3,
      rbis: 5,
      singles: 1,
      doubles: 2,
      triples: 1,
      homers: 2,
      totalBases: 16,
      battingAverage: '0.333',
      sluggingPercentage: '0.889'
    },
    {
      name: 'Duffington',
      gamesPlayed: 5,
      atBats: 30,
      hits: 12,
      runs: 6,
      rbis: 8,
      singles: 4,
      doubles: 3,
      triples: 1,
      homers: 4,
      totalBases: 30,
      battingAverage: '0.400',
      sluggingPercentage: '1.000'
    },
    {
      name: 'Ducky',
      gamesPlayed: 2,
      atBats: 12,
      hits: 3,
      runs: 2,
      rbis: 1,
      singles: 2,
      doubles: 1,
      triples: 0,
      homers: 0,
      totalBases: 5,
      battingAverage: '0.250',
      sluggingPercentage: '0.417'
    },
    {
      name: 'Buff',
      gamesPlayed: 6,
      atBats: 36,
      hits: 15,
      runs: 8,
      rbis: 12,
      singles: 5,
      doubles: 4,
      triples: 2,
      homers: 4,
      totalBases: 36,
      battingAverage: '0.417',
      sluggingPercentage: '1.000'
    },
    {
      name: 'Spike',
      gamesPlayed: 4,
      atBats: 22,
      hits: 7,
      runs: 5,
      rbis: 6,
      singles: 3,
      doubles: 2,
      triples: 0,
      homers: 2,
      totalBases: 17,
      battingAverage: '0.318',
      sluggingPercentage: '0.773'
    },
    {
      name: 'Rocket',
      gamesPlayed: 7,
      atBats: 42,
      hits: 18,
      runs: 10,
      rbis: 15,
      singles: 6,
      doubles: 5,
      triples: 3,
      homers: 4,
      totalBases: 41,
      battingAverage: '0.429',
      sluggingPercentage: '0.976'
    },
    {
      name: 'Thunder',
      gamesPlayed: 3,
      atBats: 16,
      hits: 4,
      runs: 3,
      rbis: 2,
      singles: 2,
      doubles: 1,
      triples: 0,
      homers: 1,
      totalBases: 9,
      battingAverage: '0.250',
      sluggingPercentage: '0.563'
    },
    {
      name: 'Blitz',
      gamesPlayed: 5,
      atBats: 28,
      hits: 11,
      runs: 7,
      rbis: 9,
      singles: 4,
      doubles: 3,
      triples: 1,
      homers: 3,
      totalBases: 25,
      battingAverage: '0.393',
      sluggingPercentage: '0.893'
    },
    {
      name: 'Crash',
      gamesPlayed: 2,
      atBats: 14,
      hits: 5,
      runs: 4,
      rbis: 3,
      singles: 2,
      doubles: 2,
      triples: 0,
      homers: 1,
      totalBases: 11,
      battingAverage: '0.357',
      sluggingPercentage: '0.786'
    }
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPlayers = [...testPlayers].sort((a, b) => {
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
            {sortedPlayers.map((player, index) => (
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
    maxHeight: 400,
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
}); 