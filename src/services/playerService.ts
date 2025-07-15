import apiRequest, { ApiResponse } from './api';

// Player-related types
export interface PlayerStats {
  atBats: number;
  hits: number;
  runs: number;
  rbis: number;
  walks: number;
  strikeouts: number;
  battingAverage: number;
  onBasePercentage: number;
}

export interface PlayerTeam {
  teamName: string;
  gamesPlayed: number;
  stats: PlayerStats;
}

export interface Player {
  _id: string;
  name: string;
  teams: PlayerTeam[];
  careerStats: PlayerStats;
  totalGamesPlayed: number;
  createdAt: string;
  updatedAt: string;
}

// Player API service functions
export const playerService = {
  // Create a new player
  createPlayer: async (playerData: { name: string }): Promise<ApiResponse<Player>> => {
    return apiRequest<Player>('/players', {
      method: 'POST',
      body: JSON.stringify(playerData),
    });
  },

  // Get all players
  getAllPlayers: async (): Promise<ApiResponse<{ data: Player[] }>> => {
    return apiRequest<{ data: Player[] }>('/players');
  },

  // Get a specific player by ID
  getPlayerById: async (playerId: string): Promise<ApiResponse<Player>> => {
    return apiRequest<Player>(`/players/${playerId}`);
  },

  // Update a player
  updatePlayer: async (playerId: string, playerData: Partial<Player>): Promise<ApiResponse<Player>> => {
    return apiRequest<Player>(`/players/${playerId}`, {
      method: 'PUT',
      body: JSON.stringify(playerData),
    });
  },

  // Delete a player
  deletePlayer: async (playerId: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/players/${playerId}`, {
      method: 'DELETE',
    });
  },

  // Get player stats
  getPlayerStats: async (playerId: string): Promise<ApiResponse<PlayerStats>> => {
    return apiRequest<PlayerStats>(`/players/${playerId}/stats`);
  },

  // Get player career stats
  getPlayerCareerStats: async (playerId: string): Promise<ApiResponse<PlayerStats>> => {
    return apiRequest<PlayerStats>(`/players/${playerId}/career-stats`);
  },

  // Get players by team
  getPlayersByTeam: async (teamName: string): Promise<ApiResponse<Player[]>> => {
    return apiRequest<Player[]>(`/players/team/${encodeURIComponent(teamName)}`);
  },

  // Search players by name
  searchPlayers: async (searchTerm: string): Promise<ApiResponse<Player[]>> => {
    return apiRequest<Player[]>(`/players/search?q=${encodeURIComponent(searchTerm)}`);
  },
};

export default playerService; 