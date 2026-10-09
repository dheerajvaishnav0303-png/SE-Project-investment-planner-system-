const API_BASE = '/api';

/**
 * Generic helper for JSON API requests with automatic JWT token attachment
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('investplan_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    // If relative proxy fails, retry once with direct backend URL
    if (url.startsWith('/api')) {
      try {
        const directUrl = `http://localhost:5000/api${endpoint}`;
        const fallbackRes = await fetch(directUrl, { ...options, headers });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) return fallbackData;
      } catch {
        // Ignore fallback error, throw primary error below
      }
    }

    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  logout: () =>
    request('/auth/logout', {
      method: 'POST'
    }),
  getMe: () => request('/auth/me'),

  // User Profile & Account Settings
  getUserProfile: () => request('/user/profile'),
  updateUserProfile: (data) =>
    request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  changePassword: (passwords) =>
    request('/user/password', {
      method: 'PUT',
      body: JSON.stringify(passwords)
    }),
  deleteAccount: () =>
    request('/user/account', {
      method: 'DELETE'
    }),

  // Health Check
  checkHealth: () => request('/health'),

  // Financial Profile & Budgeting
  getProfile: () => request('/profile'),
  updateProfile: (profileData) =>
    request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),
  resetProfile: () =>
    request('/profile/reset', {
      method: 'POST'
    }),

  // Investments Management
  getInvestments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/investments${qs ? `?${qs}` : ''}`);
  },
  createInvestment: (data) =>
    request('/investments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getInvestmentById: (id) => request(`/investments/${id}`),
  updateInvestment: (id, data) =>
    request(`/investments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteInvestment: (id) =>
    request(`/investments/${id}`, {
      method: 'DELETE'
    }),

  // Financial Goals
  getGoals: () => request('/goals'),
  createGoal: (goalData) =>
    request('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData)
    }),
  getGoalById: (id) => request(`/goals/${id}`),
  updateGoal: (id, goalData) =>
    request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData)
    }),
  deleteGoal: (id) =>
    request(`/goals/${id}`, {
      method: 'DELETE'
    }),

  // SIP Planner
  getSIPs: () => request('/sips'),
  createSIP: (data) =>
    request('/sips', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getSIPById: (id) => request(`/sips/${id}`),
  updateSIP: (id, data) =>
    request(`/sips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteSIP: (id) =>
    request(`/sips/${id}`, {
      method: 'DELETE'
    }),

  // Financial Transactions
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/transactions${qs ? `?${qs}` : ''}`);
  },
  createTransaction: (data) =>
    request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // User Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: 'PATCH'
    }),
  markAllNotificationsRead: () =>
    request('/notifications/read-all', {
      method: 'PATCH'
    }),

  // Dashboard Overview & Planner Engine
  getSummary: () => request('/planner/summary'),
  getPlan: () => request('/planner/plan'),

  // Customer Marketplace
  getCustomerPortfolio: () => request('/customer/portfolio'),
  getCustomerPlans: () => request('/customer/plans'),
  getCustomerInvestments: () => request('/customer/investments'),
  createCustomerInvestment: (data) =>
    request('/customer/investments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getCustomerTransactions: () => request('/customer/transactions'),
  createCustomerTransaction: (data) =>
    request('/customer/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getCustomerNotifications: () => request('/customer/notifications'),

  // Admin Portal APIs
  getAdminDashboard: () => request('/admin/dashboard'),
  getAdminAnalytics: (range = '30d') => request(`/admin/analytics?range=${range}`),
  getAdminUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  getAdminUserDetails: (id) => request(`/admin/users/${id}`),
  updateAdminUserStatus: (id, status) =>
    request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  deleteAdminUser: (id) =>
    request(`/admin/users/${id}`, {
      method: 'DELETE'
    }),
  getAdminInvestments: () => request('/admin/investments'),
  getAdminTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/transactions${qs ? `?${qs}` : ''}`);
  },
  updateAdminTransactionStatus: (id, status) =>
    request(`/admin/transactions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  getAdminPlans: () => request('/admin/plans'),
  createAdminPlan: (data) =>
    request('/admin/plans', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAdminPlan: (id, data) =>
    request(`/admin/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  toggleAdminPlanStatus: (id) =>
    request(`/admin/plans/${id}/status`, {
      method: 'PATCH'
    }),
  deleteAdminPlan: (id) =>
    request(`/admin/plans/${id}`, {
      method: 'DELETE'
    }),
  getAdminReports: (type = 'investments') => request(`/admin/reports?type=${type}`),
  getAdminNotifications: () => request('/admin/notifications'),
  createAdminNotification: (data) =>
    request('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getAdminSettings: () => request('/admin/settings'),
  updateAdminProfile: (data) =>
    request('/admin/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  seedAdminDemo: () =>
    request('/admin/seed', {
      method: 'POST'
    })
};

export default api;
