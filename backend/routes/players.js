const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// @route   POST /api/players
// @desc    Create a new player
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Player name is required'
      });
    }

    // Check if player already exists (case-insensitive)
    const existingPlayer = await Player.findOne({ name: name.trim().toLowerCase() });
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        message: 'Player already exists'
      });
    }

    // Create new player
    const player = new Player({
      name: name.trim(),
      teams: [],
      gamesPlayed: 0,
      atBats: 0,
      hits: 0,
      runs: 0,
      rbis: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      homers: 0,
      totalBases: 0
    });

    const savedPlayer = await player.save();

    res.status(201).json({
      success: true,
      data: savedPlayer
    });
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating player',
      error: error.message
    });
  }
});

// @route   GET /api/players
// @desc    Get all players with their statistics
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { team, sortBy = 'name', order = 'asc' } = req.query;
    
    let query = {};
    if (team) {
      query.teams = team; // Search for players who have played on this team
    }

    let sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const players = await Player.find(query)
      .sort(sortOptions)
      .limit(100);

    res.json({
      success: true,
      count: players.length,
      data: players
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching players',
      error: error.message
    });
  }
});

// @route   GET /api/players/names
// @desc    Get all player names for autocomplete
// @access  Public
router.get('/names', async (req, res) => {
  try {
    const players = await Player.find({})
      .select('name')
      .sort({ name: 1 });

    const playerNames = players.map(player => player.name);

    res.json({
      success: true,
      data: playerNames
    });
  } catch (error) {
    console.error('Error fetching player names:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching player names',
      error: error.message
    });
  }
});

// @route   GET /api/players/stats/:playerName
// @desc    Get career stats for a specific player
// @access  Public
router.get('/stats/:playerName', async (req, res) => {
  try {
    const playerName = req.params.playerName.toLowerCase().trim();
    
    const player = await Player.findOne({ name: playerName });
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    // Calculate batting average and slugging percentage
    const battingAverage = player.atBats > 0 ? (player.hits / player.atBats).toFixed(3) : '.000';
    const sluggingPercentage = player.atBats > 0 ? (player.totalBases / player.atBats).toFixed(3) : '.000';

    const careerStats = {
      gamesPlayed: player.gamesPlayed,
      atBats: player.atBats,
      hits: player.hits,
      runs: player.runs,
      rbis: player.rbis,
      singles: player.singles,
      doubles: player.doubles,
      triples: player.triples,
      homers: player.homers,
      totalBases: player.totalBases,
      battingAverage,
      sluggingPercentage
    };

    res.json({
      success: true,
      data: careerStats
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching player stats',
      error: error.message
    });
  }
});

// @route   GET /api/players/:id
// @desc    Get a specific player
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching player',
      error: error.message
    });
  }
});

// @route   GET /api/players/team/:teamName
// @desc    Get all players who have played for a specific team
// @access  Public
router.get('/team/:teamName', async (req, res) => {
  try {
    const players = await Player.find({ teams: req.params.teamName })
      .sort({ name: 1 });

    res.json({
      success: true,
      count: players.length,
      data: players
    });
  } catch (error) {
    console.error('Error fetching team players:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team players',
      error: error.message
    });
  }
});

// @route   GET /api/players/stats/leaders
// @desc    Get statistical leaders
// @access  Public
router.get('/stats/leaders', async (req, res) => {
  try {
    const { stat = 'hits', limit = 10 } = req.query;
    
    const validStats = ['hits', 'runs', 'rbis', 'homers', 'atBats', 'gamesPlayed'];
    
    if (!validStats.includes(stat)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stat parameter'
      });
    }

    const leaders = await Player.find({ [stat]: { $gt: 0 } })
      .sort({ [stat]: -1 })
      .limit(parseInt(limit))
      .select(`name teams ${stat} gamesPlayed atBats`);

    res.json({
      success: true,
      stat,
      count: leaders.length,
      data: leaders
    });
  } catch (error) {
    console.error('Error fetching leaders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaders',
      error: error.message
    });
  }
});

// @route   DELETE /api/players/:id
// @desc    Delete a player
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    res.json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting player',
      error: error.message
    });
  }
});

module.exports = router; 