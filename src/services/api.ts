const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
  refresh: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  phone_number: string;
  invitation_code: string;
  role: string;
  date_joined: string;
  last_login: string;
  is_active: boolean;
}

export interface LoginActivity {
  id: number;
  user: number;
  user_email: string;
  user_username: string;
  ip_address: string;
  browser: string;
  operating_system: string;
  device_type: string;
  login_time: string;
}

export interface LoginActivitiesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LoginActivity[];
}

export const api = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Login failed');
    }

    return response.json();
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Token refresh failed');
    }

    return response.json();
  },

  async logout(token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Logout failed');
    }
  },

  async getUserProfile(token: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch user profile');
    }

    return response.json();
  },

  async getLoginActivities(token: string, page?: number): Promise<LoginActivitiesResponse> {
    const url = page 
      ? `${API_BASE_URL}/api/activity/login-activities/?page=${page}`
      : `${API_BASE_URL}/api/activity/login-activities/`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch login activities');
    }

    return response.json();
  },
};

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },
  
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  },
  
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },
  
  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  },
  
  clearAuth(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  
  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser(): any | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await api.refreshToken(refreshToken);
    if (response.access) {
      authStorage.setToken(response.access);
      if (response.refresh) {
        authStorage.setRefreshToken(response.refresh);
      }
      return response.access;
    }
    return null;
  } catch {
    authStorage.clearAuth();
    return null;
  }
};

export const logout = async (): Promise<void> => {
  const token = authStorage.getToken();
  
  if (token) {
    try {
      await api.logout(token);
    } catch {
    }
  }
  
  authStorage.clearAuth();
  
  localStorage.clear();
};

