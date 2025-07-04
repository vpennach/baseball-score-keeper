const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

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
      .sort({ battingAverage: -1 });

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
    const { stat = 'battingAverage', limit = 10 } = req.query;
    
    const validStats = ['battingAverage', 'sluggingPercentage', 'hits', 'runs', 'rbis', 'homers'];
    
    if (!validStats.includes(stat)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stat parameter'
      });
    }

    const leaders = await Player.find({ [stat]: { $gt: 0 } })
      .sort({ [stat]: -1 })
      .limit(parseInt(limit))
      .select(`name team ${stat} gamesPlayed atBats`);

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