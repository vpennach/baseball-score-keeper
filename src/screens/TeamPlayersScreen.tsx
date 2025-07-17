import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import StripedBackground from '../components/StripedBackground';
import { useScreenOrientation } from '../hooks/useScreenOrientation';

type TeamPlayersScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TeamPlayers'>;
  route: RouteProp<RootStackParamList, 'TeamPlayers'>;
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

type TeamPlayerData = {
  name: string;
  stats: PlayerStats;
};

export default function TeamPlayersScreen({ navigation, route }: TeamPlayersScreenProps) {
  const { teamName, teamAbbreviation, players, playerStats, opposingTeamName } = route.params;
  
  console.log('TeamPlayersScreen params:', { teamName, opposingTeamName });
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Lock to landscape mode
  useScreenOrientation('landscape');

  const calculateBattingAverage = (hits: number, atBats: number) => {
    if (atBats === 0) return '.000';
    return (hits / atBats).toFixed(3);
  };

  const calculateSluggingPercentage = (totalBases: number, atBats: number) => {
    if (atBats === 0) return '.000';
    return (totalBases / atBats).toFixed(3);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPlayerStats = [...playerStats].sort((a, b) => {
    let aValue: any = a[sortField as keyof typeof a];
    let bValue: any = b[sortField as keyof typeof b];

    if (sortField === 'name') {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    } else if (sortField === 'battingAverage') {
      aValue = a.stats.atBats > 0 ? a.stats.hits / a.stats.atBats : 0;
      bValue = b.stats.atBats > 0 ? b.stats.hits / b.stats.atBats : 0;
    } else if (sortField === 'sluggingPercentage') {
      aValue = a.stats.atBats > 0 ? a.stats.totalBases / a.stats.atBats : 0;
      bValue = b.stats.atBats > 0 ? b.stats.totalBases / b.stats.atBats : 0;
    } else {
      aValue = a.stats[sortField as keyof typeof a.stats] || 0;
      bValue = b.stats[sortField as keyof typeof b.stats] || 0;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getSortIndicator = (field: string) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <View style={styles.container}>
      <StripedBackground />
      <View style={styles.header}>
        <Text style={styles.title}>{teamName} Players vs. {opposingTeamName}</Text>
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
            {sortedPlayerStats.map((player, index) => (
              <View key={index} style={[styles.dataRow, index % 2 === 1 && styles.alternateRow]}>
                <View style={[styles.dataCell, styles.nameDataCell]}>
                  <Text style={styles.dataText}>{player.name}</Text>
                </View>
                <View style={styles.dataCell}>
                  <Text style={styles.dataText}>{player.stats.atBats}</Text>
                </View>
                <View style={styles.dataCell}>
                  <Text style={styles.dataText}>{player.stats.hits}</Text>
                </View>
                <View style={[styles.dataCell, styles.baCell]}>
                  <Text style={styles.dataText}>{calculateBattingAverage(player.stats.hits, player.stats.atBats)}</Text>
                </View>
                <View style={styles.dataCell}>
                  <Text style={styles.dataText}>{player.stats.runs}</Text>
                </View>
                <View style={[styles.dataCell, styles.rbiCell]}>
                  <Text style={styles.dataText}>{player.stats.rbis}</Text>
                </View>
                <View style={styles.dataCell}>
                  <Text style={styles.dataText}>{player.stats.singles}</Text>
                </View>
                <View style={styles.dataCell}>
                  <Text style={styles.dataText}>{player.stats.doubles}</Text>
                </View>
                <View style={styles.dataCell}>
                  <Text style={styles.dataText}>{player.stats.triples}</Text>
                </View>
                <View style={styles.dataCell}>
                  <Text style={styles.dataText}>{player.stats.homers}</Text>
                </View>
                <View style={[styles.dataCell, styles.slgCell]}>
                  <Text style={styles.dataText}>{calculateSluggingPercentage(player.stats.totalBases, player.stats.atBats)}</Text>
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
    paddingBottom: 10,
    minHeight: 60,
  },
  title: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    flex: 1,
    textAlign: 'center',
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