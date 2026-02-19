const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: {
    id: number;
    email: string;
    username: string;
    role: string;
    is_admin: boolean;
    is_agent: boolean;
    is_normal_user: boolean;
  };
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

export interface Transaction {
  id: number;
  transaction_id: string;
  member_account: number;
  member_account_email: string;
  member_account_username: string;
  type: string;
  amount: string;
  remark_type: string;
  remark: string;
  status: string;
  created_at: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  count: number;
  user_role: string;
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
  price_min_percent?: number;
  price_max_percent?: number;
  frozen_commission_rate?: number | null;
}

export interface AgentUserListItem {
  id: number;
  email: string;
  username: string;
  phone_number: string;
  invitation_code: string;
  role: string;
  level: {
    id: number;
    level: number;
    level_name: string;
    required_points: number;
    commission_rate: string;
    frozen_commission_rate?: string | null;
    min_orders: number;
    price_min_percent?: string | null;
    price_max_percent?: string | null;
    benefits: string;
    status: string;
    created_at: string;
  } | null;
  created_by?: number;
  created_by_email?: string;
  created_by_username?: string;
  original_account?: number | null;
  original_account_id?: number | null;
  original_account_email?: string | null;
  original_account_username?: string | null;
  is_training_account?: boolean;
  balance?: string | null;
  balance_frozen?: boolean;
  balance_frozen_amount?: string | null;
  date_joined: string;
  last_login?: string | null;
  is_active?: boolean;
  training_accounts?: AgentUserListItem[];
}

export interface AgentUsersResponse {
  users: AgentUserListItem[];
  count: number;
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

  async getUserForEdit(userId: number): Promise<{
    username: string;
    email: string;
    phone_number: string;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/users/${userId}/edit/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch user for edit');
    }

    return response.json();
  },

  async updateUser(
    userId: number,
    data: {
      username: string;
      email?: string;
      phone_number: string;
      new_password?: string;
      confirm_new_password?: string;
      level_id?: number;
      parent_id?: string;
      balance?: number;
      today_commission?: number;
      freeze_amount?: number;
      credibility?: string;
      withdrawal_min_amount?: number;
      withdrawal_max_amount?: number;
      withdrawal_needed_to_complete_order?: number;
      matching_range_min?: number;
      matching_range_max?: number;
      payment_password?: string;
      confirm_payment_password?: string;
      allow_rob_order?: boolean;
      allow_withdrawal?: boolean;
      number_of_draws?: number;
      winning_amount?: number;
      custom_winning_amount?: string;
      [key: string]: unknown;
    }
  ): Promise<{ message?: string; user?: unknown }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/users/${userId}/edit/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to update user');
      (error as any).errors = errorData.errors || errorData;
      throw error;
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
      (error as any).errors = errorData.errors || errorData;
      throw error;
    }

    return response.json();
  },

  async updateAgentProfile(agentId: number, agentData: {
    username: string;
    email: string;
    phone_number: string;
    login_password: string;
  }): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/admin/agents/${agentId}/profile/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to update agent profile');
      (error as any).errors = errorData.errors || errorData;
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

  async agentActivateUser(userId: number): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/agent/users/${userId}/activate/`, {
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

  async getMyUsers(): Promise<AgentUsersResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/agent/my-users/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch users');
    }

    return response.json();
  },

  async getAdminAgentUsers(): Promise<AgentUsersResponse> {
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

  async createTrainingAccount(trainingData: {
    username: string;
    email: string;
    phone_number: string;
    login_password: string;
    confirm_login_password: string;
    original_account_refer_code: string;
    withdraw_password: string;
    confirm_withdraw_password: string;
  }): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/agent/training-accounts/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trainingData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to create training account');
      (error as any).errors = errorData.errors || errorData;
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
    price_min_percent?: number;
    price_max_percent?: number;
    frozen_commission_rate?: number | null;
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
    price_min_percent?: number;
    price_max_percent?: number;
    frozen_commission_rate?: number | null;
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

  async assignProductsToLevel(levelId: number, productIds: number[]): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/assign-to-level/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level_id: levelId,
        product_ids: productIds,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to assign products to level');
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
    limit?: number;
    offset?: number;
    user_id?: number;
  }): Promise<{
    products: Array<{
      id: number;
      image: string | null;
      image_url: string | null;
      title: string;
      description: string;
      price: string;
      status: 'ACTIVE' | 'INACTIVE';
      created_at: string;
      position?: number;
      review_status?: string;
      inserted_for_user?: boolean;
      effective_price?: string;
      potential_commission?: number | null;
      commission_amount?: number | null;
      commission_rate?: number | null;
    }>;
    count: number;
    limit?: number;
    offset?: number;
    has_more?: boolean;
    next_offset?: number;
  }> {
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
    if (params?.limit != null) {
      queryParams.append('limit', String(params.limit));
    }
    if (params?.offset != null) {
      queryParams.append('offset', String(params.offset));
    }
    if (params?.user_id != null) {
      queryParams.append('user_id', String(params.user_id));
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

  async insertProductAtPosition(productId: number, position: number, userId: number): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/${productId}/position/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ position, user_id: userId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to insert product at position');
      (error as any).errors = errorData;
      throw error;
    }

    return response.json();
  },

  async addProductToUser(userId: number, productId: number): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/admin/user/${userId}/product/${productId}/add/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to add product to user');
    }

    return response.json();
  },

  async removeProductFromUser(userId: number, productId: number): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/admin/user/${userId}/product/${productId}/remove/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to remove product from user');
    }

    return response.json();
  },

  async getLevelProducts(levelId: number): Promise<{
    level: {
      id: number;
      level: number;
      level_name: string;
      required_points: number;
      commission_rate: string;
      min_orders: number;
      benefits: string;
      status: string;
      created_at: string;
    };
    products: Array<{
      id: number;
      image: string | null;
      image_url: string | null;
      title: string;
      description: string;
      price: string;
      status: 'ACTIVE' | 'INACTIVE';
      created_at: string;
    }>;
    count: number;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/level/${levelId}/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch level products');
    }

    return response.json();
  },

  async addBalance(transactionData: {
    member_account: number;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    remark_type: string;
    remark: string;
  }): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/transaction/add-balance/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to add balance');
      (error as any).errors = errorData;
      throw error;
    }

    return response.json();
  },

  async getAdminAgentTransactions(): Promise<TransactionsResponse> {
    const url = `${API_BASE_URL}/api/transaction/admin-agent/`;
    
    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Transaction API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url,
      });
      throw new Error(errorData.message || errorData.detail || `Failed to fetch transactions (${response.status})`);
    }

    return response.json();
  },

  async approveTransaction(transactionId: number): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/transaction/${transactionId}/approve/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to approve transaction');
      (error as any).errors = errorData;
      throw error;
    }

    return response.json();
  },

  async rejectTransaction(transactionId: number): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/transaction/${transactionId}/reject/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to reject transaction');
      (error as any).errors = errorData;
      throw error;
    }

    return response.json();
  },

  async resetUserOrder(userId: number, levelId: number): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/reset/user/${userId}/level/${levelId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.detail || 'Failed to reset order');
      (error as any).errors = errorData;
      throw error;
    }

    return response.json();
  },

  async getUserProducts(userId: number): Promise<{
    user_id: number;
    username: string;
    min_orders: number;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/admin/user/${userId}/products/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch user products');
    }

    return response.json();
  },

  async getUserCompletedCount(userId: number): Promise<{
    user_id: number;
    username: string;
    completed: number;
    min_orders: number;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/admin/user/${userId}/completed-count/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch completed count');
    }

    return response.json();
  },

  async resetUserContinuousOrders(userId: number): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/admin/user/${userId}/reset-continuous-orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to reset continuous orders');
    }

    return response.json();
  },

  async getUserOrderOverview(userId: number): Promise<{
    user_id: number;
    username: string;
    current_orders_made: number;
    orders_received_today: number;
    max_orders_by_level: number;
    start_continuous_orders_after: number;
    daily_available_orders: number;
    assigned_products: Array<{ id: number; title: string; position: number; price?: string | number }>;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/admin/user/${userId}/order-overview/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch order overview');
    }

    return response.json();
  },

  async updateUserOrderOverview(
    userId: number,
    data: {
      start_continuous_orders_after: number;
      assigned_products: { product_id: number; position: number }[];
    }
  ): Promise<{ start_continuous_orders_after: number; assigned_products?: { product_id: number; position: number }[] }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/product/admin/user/${userId}/order-overview/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to update order overview');
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

