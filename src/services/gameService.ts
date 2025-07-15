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