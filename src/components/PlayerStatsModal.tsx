import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

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

interface PlayerStatsModalProps {
  visible: boolean;
  onClose: () => void;
  playerName: string;
  playerStats: PlayerStats;
}

export default function PlayerStatsModal({ visible, onClose, playerName, playerStats }: PlayerStatsModalProps) {
  if (!visible) return null;

  // Calculate batting average and slugging percentage for game stats
  const gameBattingAverage = playerStats.atBats > 0 ? (playerStats.hits / playerStats.atBats).toFixed(3) : '.000';
  const gameSluggingPercentage = playerStats.atBats > 0 ? (playerStats.totalBases / playerStats.atBats).toFixed(3) : '.000';

  // Career stats (placeholder with zeros for now)
  const careerStats = {
    atBats: 0,
    hits: 0,
    runs: 0,
    rbis: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    homers: 0,
    totalBases: 0,
  };
  const careerBattingAverage = '.000';
  const careerSluggingPercentage = '.000';

  return (
    <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
      <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
        <View style={styles.header}>
          <Text style={styles.title}>{playerName} Stats</Text>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>
        </View>
        
        {/* Game Stats Table */}
        <Text style={styles.tableTitle}>Game Stats</Text>
        <View style={styles.tableContainer}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <View style={styles.headerCell}><Text style={styles.headerText}>H</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>AB</Text></View>
            <View style={[styles.headerCell, styles.wideCell]}><Text style={styles.headerText}>BA</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>R</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>1B</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>2B</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>3B</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>HR</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>RBI</Text></View>
            <View style={[styles.headerCell, styles.wideCell]}><Text style={styles.headerText}>SLG</Text></View>
          </View>
          
          {/* Data Row */}
          <View style={styles.tableRow}>
            <View style={styles.cell}><Text style={styles.cellText}>{playerStats.hits}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{playerStats.atBats}</Text></View>
            <View style={[styles.cell, styles.wideCell]}><Text style={styles.cellText}>{gameBattingAverage}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{playerStats.runs}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{playerStats.singles}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{playerStats.doubles}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{playerStats.triples}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{playerStats.homers}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{playerStats.rbis}</Text></View>
            <View style={[styles.cell, styles.wideCell]}><Text style={styles.cellText}>{gameSluggingPercentage}</Text></View>
          </View>
        </View>

        {/* Career Stats Table */}
        <Text style={styles.tableTitle}>Career Stats</Text>
        <View style={styles.tableContainer}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <View style={styles.headerCell}><Text style={styles.headerText}>H</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>AB</Text></View>
            <View style={[styles.headerCell, styles.wideCell]}><Text style={styles.headerText}>BA</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>R</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>1B</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>2B</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>3B</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>HR</Text></View>
            <View style={styles.headerCell}><Text style={styles.headerText}>RBI</Text></View>
            <View style={[styles.headerCell, styles.wideCell]}><Text style={styles.headerText}>SLG</Text></View>
          </View>
          
          {/* Data Row */}
          <View style={styles.tableRow}>
            <View style={styles.cell}><Text style={styles.cellText}>{careerStats.hits}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{careerStats.atBats}</Text></View>
            <View style={[styles.cell, styles.wideCell]}><Text style={styles.cellText}>{careerBattingAverage}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{careerStats.runs}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{careerStats.singles}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{careerStats.doubles}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{careerStats.triples}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{careerStats.homers}</Text></View>
            <View style={styles.cell}><Text style={styles.cellText}>{careerStats.rbis}</Text></View>
            <View style={[styles.cell, styles.wideCell]}><Text style={styles.cellText}>{careerSluggingPercentage}</Text></View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#FFD700',
    padding: 20,
    borderWidth: 3,
    borderColor: '#000000',
    minWidth: 650,
    minHeight: 250,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '85%',
  },
  title: {
    fontSize: 18,
    fontFamily: 'PressStart2P',
    color: '#000000',
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tableContainer: {
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    padding: 10,
    minWidth: 600,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 25,
  },
  headerText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#000000',
    fontWeight: 'bold',
  },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 25,
  },
  cellText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#000000',
  },
  wideCell: {
    flex: 2,
  },
  tableTitle: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 2,
    alignSelf: 'flex-start',
    marginLeft: 50,
  },
}); 