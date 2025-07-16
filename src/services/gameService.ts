import apiRequest, { ApiResponse } from './api';

// Game-related types (we'll import these from your backend types later)
export interface GameState {
  currentInning: number;
  isTopInning: boolean;
  homeTeam: {
    name: string;
    score: number;
    players: Player[];
  };
  awayTeam: {
    name: string;
    score: number;
    players: Player[];
  };
  currentBatter: string;
  bases: string[];
  outs: number;
  balls: number;
  strikes: number;
  gameStatus: 'active' | 'completed' | 'paused';
}

export interface Player {
  id: string;
  name: string;
  team: string;
  stats: {
    atBats: number;
    hits: number;
    runs: number;
    rbis: number;
    walks: number;
    strikeouts: number;
  };
}

export interface Game {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  homeAbbreviation: string;
  awayAbbreviation: string;
  homePlayers: string[];
  awayPlayers: string[];
  maxInnings: number;
  gameHistory: any[];
  gameHistoryCount: number;
  finalGameState?: any;
  gameSummary: {
    totalInnings: number;
    homePlayerStats: Record<string, any>;
    awayPlayerStats: Record<string, any>;
    homeScore: number;
    awayScore: number;
    winner: string;
    gameEndReason: string;
    duration?: number;
  };
  gameDate: string;
  createdAt: string;
  updatedAt: string;
}

// Utility function to calculate final game summary
export const calculateGameSummary = (
  gameState: any,
  homeTeam: string,
  awayTeam: string,
  maxInnings: number,
  gameHistory: any[]
): {
  totalInnings: number;
  homePlayerStats: Record<string, any>;
  awayPlayerStats: Record<string, any>;
  homeScore: number;
  awayScore: number;
  winner: string;
  gameEndReason: string;
} => {
  // Determine winner and game end reason
  let winner: string;
  let gameEndReason: string;
  
  // Calculate the actual total innings played
  // If the game ended in the top of an inning, that inning wasn't completed
  // If the game ended in the bottom of an inning, that inning was completed
  const totalInningsPlayed = gameState.isTopInning ? gameState.inning - 1 : gameState.inning;
  
  if (gameState.homeScore > gameState.awayScore) {
    winner = 'home';
    if (totalInningsPlayed > maxInnings) {
      gameEndReason = 'extra innings';
    } else if (!gameState.isTopInning && totalInningsPlayed === maxInnings) {
      gameEndReason = 'walk-off';
    } else {
      gameEndReason = 'regulation';
    }
  } else if (gameState.awayScore > gameState.homeScore) {
    winner = 'away';
    if (totalInningsPlayed > maxInnings) {
      gameEndReason = 'extra innings';
    } else {
      gameEndReason = 'regulation';
    }
  } else {
    winner = 'tie';
    gameEndReason = 'tie game';
  }

  // Calculate batting averages and slugging percentages for home players
  const homePlayerStats: Record<string, any> = {};
  Object.entries(gameState.homePlayerStats).forEach(([playerName, stats]: [string, any]) => {
    const battingAverage = stats.atBats > 0 ? parseFloat((stats.hits / stats.atBats).toFixed(3)) : 0;
    const sluggingPercentage = stats.atBats > 0 ? parseFloat((stats.totalBases / stats.atBats).toFixed(3)) : 0;
    
    homePlayerStats[playerName] = {
      ...stats,
      battingAverage,
      sluggingPercentage
    };
  });

  // Calculate batting averages and slugging percentages for away players
  const awayPlayerStats: Record<string, any> = {};
  Object.entries(gameState.awayPlayerStats).forEach(([playerName, stats]: [string, any]) => {
    const battingAverage = stats.atBats > 0 ? parseFloat((stats.hits / stats.atBats).toFixed(3)) : 0;
    const sluggingPercentage = stats.atBats > 0 ? parseFloat((stats.totalBases / stats.atBats).toFixed(3)) : 0;
    
    awayPlayerStats[playerName] = {
      ...stats,
      battingAverage,
      sluggingPercentage
    };
  });

  return {
    totalInnings: totalInningsPlayed,
    homePlayerStats,
    awayPlayerStats,
    homeScore: gameState.homeScore,
    awayScore: gameState.awayScore,
    winner,
    gameEndReason
  };
};

// Game API service functions
export const gameService = {
  // Create a new game
  createGame: async (gameData: {
    homeTeam: string;
    awayTeam: string;
    homeAbbreviation: string;
    awayAbbreviation: string;
    homePlayers: string[];
    awayPlayers: string[];
    maxInnings?: number;
    gameHistory?: any[];
    finalGameState?: any;
    gameSummary: {
      totalInnings: number;
      homePlayerStats: Record<string, any>;
      awayPlayerStats: Record<string, any>;
      homeScore: number;
      awayScore: number;
      winner: string;
      gameEndReason: string;
    };
  }): Promise<ApiResponse<Game>> => {
    return apiRequest<Game>('/games', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  },

  // Get all games
  getAllGames: async (): Promise<ApiResponse<{ data: Game[] }>> => {
    return apiRequest<{ data: Game[] }>('/games');
  },

  // Get a specific game by ID
  getGameById: async (gameId: string): Promise<ApiResponse<Game>> => {
    return apiRequest<Game>(`/games/${gameId}`);
  },

  // Update a game
  updateGame: async (gameId: string, gameData: Partial<Game>): Promise<ApiResponse<Game>> => {
    return apiRequest<Game>(`/games/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify(gameData),
    });
  },

  // Delete a game
  deleteGame: async (gameId: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/games/${gameId}`, {
      method: 'DELETE',
    });
  },

  // Get game history
  getGameHistory: async (gameId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/games/${gameId}/history`);
  },

  // Complete a game
  completeGame: async (gameId: string, finalState: any): Promise<ApiResponse<Game>> => {
    return apiRequest<Game>(`/games/${gameId}/complete`, {
      method: 'POST',
      body: JSON.stringify(finalState),
    });
  },
};

export default gameService; 