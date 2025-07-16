// API Configuration
const API_BASE_URL = 'http://localhost:3001/api'; // We'll make this configurable later

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Common headers for API requests
const getHeaders = () => ({
  'Content-Type': 'application/json',
});

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

// Player names API
export const getPlayerNames = async (): Promise<ApiResponse<string[]>> => {
  const response = await apiRequest<{ success: boolean; data: string[] }>('/players/names');
  if (response.success && response.data) {
    return {
      success: response.data.success,
      data: response.data.data
    };
  }
  return {
    success: false,
    error: 'Failed to fetch player names'
  };
};

export default apiRequest; 