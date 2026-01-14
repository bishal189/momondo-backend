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

export interface Level {
  id: number;
  level: number;
  level_name: string;
  required_points: number;
  commission_rate: string;
  min_orders: number;
  benefits: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface LevelsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Level[];
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

  async logout(refreshToken?: string): Promise<void> {
    const body: { refresh_token?: string } = {};
    if (refreshToken) {
      body.refresh_token = refreshToken;
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Logout failed');
    }
  },

  async getUserProfile(): Promise<UserProfile> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/profile/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch user profile');
    }

    return response.json();
  },

  async checkRole(): Promise<{
    is_admin: boolean;
    is_agent: boolean;
    is_user: boolean;
    role: string;
    user_id: number;
    username: string;
    email: string;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/check-role/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to check user role');
    }

    return response.json();
  },

  async createAgent(agentData: {
    username: string;
    email: string;
    phone_number: string;
    login_password: string;
    confirm_login_password: string;
  }): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/admin/agents/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to create agent');
      (error as any).errors = errorData;
      throw error;
    }

    return response.json();
  },

  async activateUser(userId: number): Promise<{
    message: string;
    user: {
      id: number;
      email: string;
      username: string;
      phone_number: string;
      invitation_code: string;
      role: string;
      created_by: number;
      created_by_email: string;
      created_by_username: string;
      date_joined: string;
      last_login: string | null;
      is_active: boolean;
    };
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/admin/users/${userId}/activate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to activate user');
    }

    return response.json();
  },

  async deactivateUser(userId: number): Promise<{
    message: string;
    user: {
      id: number;
      email: string;
      username: string;
      phone_number: string;
      invitation_code: string;
      role: string;
      created_by: number;
      created_by_email: string;
      created_by_username: string;
      date_joined: string;
      last_login: string | null;
      is_active: boolean;
    };
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/admin/users/${userId}/deactivate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to deactivate user');
    }

    return response.json();
  },

  async getAgentUsers(): Promise<{
    agents: Array<{
      id: number;
      name: string;
      email: string;
      phone: string;
      invitation_code: string;
      total_users: number;
      status: string;
      created_by: string;
      created_by_email: string;
      created_at: string;
    }>;
    count: number;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/admin/agents/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch agents');
    }

    return response.json();
  },

  async getMyUsers(): Promise<{
    users: Array<{
      id: number;
      email: string;
      username: string;
      phone_number: string;
      invitation_code: string;
      role: string;
      level?: {
        id: number;
        level: number;
        level_name: string;
        required_points: number;
        commission_rate: string;
        min_orders: number;
        benefits: string;
        status: string;
        created_at: string;
      } | null;
      created_by: number;
      created_by_email: string;
      created_by_username: string;
      date_joined: string;
      last_login: string | null;
      is_active: boolean;
    }>;
    count: number;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/agent/my-users/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch users');
    }

    return response.json();
  },

  async getAdminAgentUsers(): Promise<{
    users: Array<{
      id: number;
      username: string;
      email: string;
      phone_number: string;
      invitation_code: string;
      role: string;
      level?: {
        id: number;
        level: number;
        level_name: string;
        required_points: number;
        commission_rate: string;
        min_orders: number;
        benefits: string;
        status: string;
        created_at: string;
      } | null;
      created_by: string;
      created_by_id: number;
      created_by_email: string;
      status: string;
      date_joined: string;
      last_login: string | null;
    }>;
    count: number;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/admin/agents/users/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch users');
    }

    return response.json();
  },

  async createUserByAgent(userData: {
    username: string;
    email: string;
    phone_number: string;
    login_password: string;
    confirm_login_password: string;
    withdraw_password: string;
    confirm_withdraw_password: string;
  }): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/agent/users/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to create user');
      (error as any).errors = errorData;
      throw error;
    }

    return response.json();
  },

  async getLoginActivities(page?: number): Promise<LoginActivitiesResponse> {
    const url = page 
      ? `${API_BASE_URL}/api/activity/login-activities/?page=${page}`
      : `${API_BASE_URL}/api/activity/login-activities/`;
    
    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch login activities');
    }

    return response.json();
  },

  async getDashboardStats(): Promise<{
    total_users: number;
    active_session: number;
    total_agent: number;
    suspended_users: number;
    top_recent_users?: Array<{
      id: number;
      initials: string;
      name: string;
      email: string;
      time_ago: string;
      status: string;
    }>;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/admin/dashboard/stats/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch dashboard stats');
    }

    return response.json();
  },

  async getLevels(params?: { status?: 'ACTIVE' | 'INACTIVE'; search?: string }): Promise<LevelsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }

    const url = `${API_BASE_URL}/api/level/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch levels');
    }

    return response.json();
  },

  async createLevel(levelData: {
    level: number;
    level_name: string;
    required_points: number;
    commission_rate: string;
    min_orders: number;
    benefits: string;
    status: 'ACTIVE' | 'INACTIVE';
  }): Promise<Level> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/level/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(levelData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to create level');
      (error as any).errors = errorData;
      throw error;
    }

    return response.json();
  },

  async getLevelDetail(id: number): Promise<Level> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/level/${id}/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch level details');
    }

    return response.json();
  },

  async updateLevel(id: number, levelData: {
    level: number;
    level_name: string;
    required_points: number;
    commission_rate: string;
    min_orders: number;
    benefits: string;
    status: 'ACTIVE' | 'INACTIVE';
  }): Promise<Level> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/level/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(levelData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to update level');
      (error as any).errors = errorData;
      throw error;
    }

    return response.json();
  },

  async deleteLevel(id: number): Promise<{ message: string }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/level/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to delete level');
    }

    return response.json();
  },

  async assignLevelToUser(userId: number, levelId: number | null): Promise<any> {
    const body: { user_id: number; level_id?: number } = {
      user_id: userId,
    };

    if (levelId) {
      body.level_id = levelId;
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/api/level/assign/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to assign level');
      (error as any).errors = errorData;
      throw error;
    }

    return response.json();
  },

  async getProducts(params?: {
    status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
    search?: string;
    min_price?: string;
    max_price?: string;
  }): Promise<{ products: Array<{
    id: number;
    image: string | null;
    image_url: string | null;
    title: string;
    description: string;
    price: string;
    status: 'ACTIVE' | 'INACTIVE';
    created_at: string;
  }>; count: number }> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.min_price) {
      queryParams.append('min_price', params.min_price);
    }
    if (params?.max_price) {
      queryParams.append('max_price', params.max_price);
    }

    const url = `${API_BASE_URL}/api/product/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch products');
    }

    return response.json();
  },

  async createProduct(productData: {
    title: string;
    description: string;
    price: string;
    status: 'ACTIVE' | 'INACTIVE';
    image?: File;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('title', productData.title);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('status', productData.status);
    
    if (productData.image) {
      formData.append('image', productData.image);
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to create product');
      (error as any).errors = errorData;
      throw error;
    }

    return response.json();
  },

  async getProductDetail(id: number): Promise<{
    id: number;
    image: string | null;
    image_url: string | null;
    title: string;
    description: string;
    price: string;
    status: 'ACTIVE' | 'INACTIVE';
    created_at: string;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/${id}/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch product details');
    }

    return response.json();
  },

  async updateProduct(id: number, productData: {
    title: string;
    description: string;
    price: string;
    status: 'ACTIVE' | 'INACTIVE';
    image?: File;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('title', productData.title);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('status', productData.status);
    
    if (productData.image) {
      formData.append('image', productData.image);
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/${id}/`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to update product');
      (error as any).errors = errorData;
      throw error;
    }

    return response.json();
  },

  async deleteProduct(id: number): Promise<{ message: string }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to delete product');
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

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const handleTokenRefresh = async (): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken();
  
  try {
    const newToken = await refreshPromise;
    return newToken;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
};

const forceLogout = () => {
  authStorage.clearAuth();
  window.location.href = '/login';
};

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = authStorage.getToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const newToken = await handleTokenRefresh();
    
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(url, {
        ...options,
        headers,
      });
    } else {
      forceLogout();
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
};

export const logout = async (): Promise<void> => {
  const token = authStorage.getToken();
  const refreshToken = authStorage.getRefreshToken();
  
  if (token) {
    try {
      await api.logout(refreshToken || undefined);
    } catch {
    }
  }
  
  authStorage.clearAuth();
  window.location.href = '/login';
};

