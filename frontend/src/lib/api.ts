// API client for interacting with the Flask backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

// Token management
const TOKEN_KEY = 'auth_tokens';

export function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  const tokens = localStorage.getItem(TOKEN_KEY);
  return tokens ? JSON.parse(tokens) : null;
}

export function setStoredTokens(tokens: AuthTokens | null): void {
  if (typeof window === 'undefined') return;
  if (tokens) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Add authorization header if we have tokens
    const tokens = getStoredTokens();
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    });

    if (tokens) {
      headers.set('Authorization', `Bearer ${tokens.access_token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 by clearing tokens
      if (response.status === 401) {
        setStoredTokens(null);
      }
      throw new Error(data.error || 'An error occurred');
    }

    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

// Auth API functions
export async function signUp(email: string, password: string) {
  const response = await apiRequest<{
    id: string;
    email: string;
    created_at: string;
    message: string;
  }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  return response;
}

export async function signIn(email: string, password: string) {
  const response = await apiRequest<AuthTokens & {
    id: string;
    email: string;
  }>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.data) {
    // Store tokens
    setStoredTokens({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_at: response.data.expires_at,
    });
  }

  return response;
}

export async function signOut() {
  try {
    // First try to notify the backend
    const response = await apiRequest<{ message: string }>('/auth/signout', {
      method: 'POST',
    });

    // If successful or if we get any response, clear the tokens
    setStoredTokens(null);
    return response;
  } catch (error) {
    console.error('Error during signout:', error);
    // If we get a 401, it means the token is already invalid, so we should clear it
    if (error instanceof Error && error.message.includes('401')) {
      setStoredTokens(null);
    }
    throw error;
  }
}

export async function getCurrentUser() {
  return apiRequest<{
    id: string;
    email: string;
    email_verified: boolean;
    last_sign_in: string;
    created_at: string;
  }>('/auth/user');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const tokens = getStoredTokens();
  if (!tokens) return false;

  // Check if token is expired
  const expiresAt = new Date(tokens.expires_at).getTime();
  const now = new Date().getTime();
  
  return expiresAt > now;
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