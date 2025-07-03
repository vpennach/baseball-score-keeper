const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  teams: [{ type: String }], // Array of all teams this player has played for
  gamesPlayed: { type: Number, default: 0 },
  atBats: { type: Number, default: 0 },
  hits: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  rbis: { type: Number, default: 0 },
  singles: { type: Number, default: 0 },
  doubles: { type: Number, default: 0 },
  triples: { type: Number, default: 0 },
  homers: { type: Number, default: 0 },
  totalBases: { type: Number, default: 0 },
  battingAverage: { type: Number, default: 0 },
  sluggingPercentage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate batting average and slugging percentage before saving
playerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate batting average
  if (this.atBats > 0) {
    this.battingAverage = parseFloat((this.hits / this.atBats).toFixed(3));
  }
  
  // Calculate slugging percentage
  if (this.atBats > 0) {
    this.sluggingPercentage = parseFloat((this.totalBases / this.atBats).toFixed(3));
  }
  
  next();
});

module.exports = mongoose.model('Player', playerSchema); 