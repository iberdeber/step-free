// API client for interacting with the Flask backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // This is important for handling cookies/sessions
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

// Auth API functions
export async function signUp(email: string, password: string) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signIn(email: string, password: string) {
  return apiRequest('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signOut() {
  return apiRequest('/auth/signout', {
    method: 'POST',
  });
}

export async function getCurrentUser() {
  return apiRequest('/auth/user');
}

// Route tracking API functions
export async function insertRouteHistory(
  userId: string,
  startPoint: string,
  endPoint: string,
  routeData: object,
  duration: number
) {
  return apiRequest('/routes/history', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      startPoint,
      endPoint,
      routeData,
      duration,
    }),
  });
}

export async function getRouteHistory(userId: string) {
  return apiRequest(`/routes/history/${userId}`);
}

// Health check
export async function checkHealth() {
  return apiRequest('/health');
} 