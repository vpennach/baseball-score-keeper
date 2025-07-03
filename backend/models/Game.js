const mongoose = require('mongoose');

const playerStatsSchema = new mongoose.Schema({
  atBats: { type: Number, default: 0 },
  hits: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  rbis: { type: Number, default: 0 },
  singles: { type: Number, default: 0 },
  doubles: { type: Number, default: 0 },
  triples: { type: Number, default: 0 },
  homers: { type: Number, default: 0 },
  totalBases: { type: Number, default: 0 }
});

const gameStateSchema = new mongoose.Schema({
  inning: { type: Number, required: true },
  isTopInning: { type: Boolean, required: true },
  outs: { type: Number, required: true },
  homeScore: { type: Number, required: true },
  awayScore: { type: Number, required: true },
  homePlayerStats: { type: Map, of: playerStatsSchema, default: {} },
  awayPlayerStats: { type: Map, of: playerStatsSchema, default: {} },
  balls: { type: Number, required: true },
  strikes: { type: Number, required: true },
  firstBase: { type: String, default: null },
  secondBase: { type: String, default: null },
  thirdBase: { type: String, default: null },
  currentBatter: { type: String, required: true },
  currentBatterIndex: { type: Number, required: true },
  currentBatterIsHome: { type: Boolean, required: true },
  nextHomeBatter: { type: Number, required: true },
  nextAwayBatter: { type: Number, required: true },
  gameEnded: { type: Boolean, default: false }
});

const gameSummarySchema = new mongoose.Schema({
  totalInnings: { type: Number, required: true },
  homePlayerStats: { type: Map, of: playerStatsSchema, default: {} },
  awayPlayerStats: { type: Map, of: playerStatsSchema, default: {} },
  homeScore: { type: Number, required: true },
  awayScore: { type: Number, required: true },
  winner: { type: String, required: true }, // 'home', 'away', or 'tie'
  gameEndReason: { type: String, required: true }, // 'regulation', 'extra innings', 'walk-off', etc.
  duration: { type: Number, default: 0 }, // in minutes, if we want to track this later
});

const gameSchema = new mongoose.Schema({
  // Basic game info
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  homeAbbreviation: { type: String, required: true },
  awayAbbreviation: { type: String, required: true },
  homePlayers: [{ type: String, required: true }],
  awayPlayers: [{ type: String, required: true }],
  maxInnings: { type: Number, required: true, default: 9 },
  
  // Game progression data
  gameHistory: [{ type: gameStateSchema }], // Complete game progression for replay/analysis
  gameHistoryCount: { type: Number, default: 0 }, // Number of history entries for quick reference
  
  // Final game data
  finalGameState: { type: gameStateSchema }, // Last state when game ended (for debugging/recovery)
  gameSummary: { type: gameSummarySchema, required: true }, // Clean final stats
  
  // Metadata
  gameDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field and gameHistoryCount before saving
gameSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.gameHistoryCount = this.gameHistory ? this.gameHistory.length : 0;
  next();
});

module.exports = mongoose.model('Game', gameSchema); 