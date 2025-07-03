const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const Player = require('../models/Player');

// @route   POST /api/games
// @desc    Save a new game
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      homeTeam,
      awayTeam,
      homeAbbreviation,
      awayAbbreviation,
      homePlayers,
      awayPlayers,
      maxInnings,
      gameHistory,
      finalGameState,
      gameSummary
    } = req.body;

    // Create new game
    const game = new Game({
      homeTeam,
      awayTeam,
      homeAbbreviation,
      awayAbbreviation,
      homePlayers,
      awayPlayers,
      maxInnings,
      gameHistory,
      finalGameState,
      gameSummary
    });

    const savedGame = await game.save();

    // Update player statistics
    await updatePlayerStats(savedGame);

    res.status(201).json({
      success: true,
      data: savedGame
    });
  } catch (error) {
    console.error('Error saving game:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving game',
      error: error.message
    });
  }
});

// @route   GET /api/games
// @desc    Get all games
// @access  Public
router.get('/', async (req, res) => {
  try {
    const games = await Game.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching games',
      error: error.message
    });
  }
});

// @route   GET /api/games/:id
// @desc    Get a specific game
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching game',
      error: error.message
    });
  }
});

// @route   DELETE /api/games/:id
// @desc    Delete a game
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting game',
      error: error.message
    });
  }
});

// Helper function to update player statistics
async function updatePlayerStats(game) {
  try {
    // Update home team players
    for (const [playerName, stats] of game.gameSummary.homePlayerStats) {
      await Player.findOneAndUpdate(
        { name: playerName },
        {
          $inc: {
            gamesPlayed: 1,
            atBats: stats.atBats,
            hits: stats.hits,
            runs: stats.runs,
            rbis: stats.rbis,
            singles: stats.singles,
            doubles: stats.doubles,
            triples: stats.triples,
            homers: stats.homers,
            totalBases: stats.totalBases
          },
          $addToSet: { teams: game.homeTeam } // Add team to array if not already present
        },
        { upsert: true, new: true }
      );
    }

    // Update away team players
    for (const [playerName, stats] of game.gameSummary.awayPlayerStats) {
      await Player.findOneAndUpdate(
        { name: playerName },
        {
          $inc: {
            gamesPlayed: 1,
            atBats: stats.atBats,
            hits: stats.hits,
            runs: stats.runs,
            rbis: stats.rbis,
            singles: stats.singles,
            doubles: stats.doubles,
            triples: stats.triples,
            homers: stats.homers,
            totalBases: stats.totalBases
          },
          $addToSet: { teams: game.awayTeam } // Add team to array if not already present
        },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error updating player stats:', error);
  }
}

module.exports = router; 