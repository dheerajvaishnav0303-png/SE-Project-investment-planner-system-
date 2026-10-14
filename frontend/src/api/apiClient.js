/**
 * API Client for Investment Planner System
 * Supports live backend API, configurable VITE_API_URL, safe response parsing,
 * and resilient demo fallback when running on static hosting without a connected backend.
 */

const RAW_API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = RAW_API_URL ? `${RAW_API_URL.replace(/\/+$/, '')}/api` : '/api';

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

/**
 * Local demo storage helpers for static hosting (e.g. Vercel without active cloud backend)
 */
function getStorage(key, defaultValue) {
  try {
    const val = localStorage.getItem(`demo_${key}`);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(`demo_${key}`, JSON.stringify(value));
  } catch {
    // Ignore localStorage write error
  }
}

// Initial mock datasets for standalone demo mode
const DEFAULT_DEMO_INVESTMENTS = [
  { _id: 'inv-1', name: 'Nifty 50 Index Fund', investmentType: 'Mutual Funds', amount: 50000, currentValue: 62000, units: 250, expectedReturn: 12, startDate: '2024-01-15' },
  { _id: 'inv-2', name: 'Tata Consultancy Services', investmentType: 'Stocks / Equity', amount: 35000, currentValue: 41000, units: 10, expectedReturn: 14, startDate: '2024-03-20' },
  { _id: 'inv-3', name: 'HDFC High Yield FD', investmentType: 'Fixed Deposits', amount: 100000, currentValue: 107500, units: 1, expectedReturn: 7.5, startDate: '2023-11-01' },
  { _id: 'inv-4', name: 'Sovereign Gold Bond', investmentType: 'Gold / Commodities', amount: 25000, currentValue: 31000, units: 5, expectedReturn: 10, startDate: '2024-02-10' }
];

const DEFAULT_DEMO_GOALS = [
  { _id: 'goal-1', title: 'Emergency Reserve Fund', category: 'Emergency Fund', targetAmount: 300000, currentAmount: 180000, targetDate: '2026-12-31', priority: 'High', expectedAnnualReturn: 7 },
  { _id: 'goal-2', title: 'New Car Down Payment', category: 'Vehicle', targetAmount: 500000, currentAmount: 240000, targetDate: '2027-06-30', priority: 'Medium', expectedAnnualReturn: 10 },
  { _id: 'goal-3', title: 'Retirement Wealth Corpus', category: 'Retirement', targetAmount: 20000000, currentAmount: 1200000, targetDate: '2045-01-01', priority: 'High', expectedAnnualReturn: 12 }
];

const DEFAULT_DEMO_SIPS = [
  { _id: 'sip-1', name: 'Parag Parikh Flexi Cap Fund', investmentType: 'Mutual Funds', monthlyAmount: 5000, durationYears: 5, expectedReturn: 14, status: 'Active' },
  { _id: 'sip-2', name: 'Mirae Asset Large Cap Fund', investmentType: 'Mutual Funds', monthlyAmount: 3000, durationYears: 10, expectedReturn: 12, status: 'Active' }
];

const DEFAULT_DEMO_NOTIFICATIONS = [
  { _id: 'notif-1', title: 'SIP Executed Successfully', message: '₹5,000 invested into Parag Parikh Flexi Cap Fund', type: 'Investment', read: false, createdAt: new Date().toISOString() },
  { _id: 'notif-2', title: 'Portfolio Milestone Reached', message: 'Your total portfolio crossed ₹2,40,000!', type: 'Portfolio', read: false, createdAt: new Date(Date.now() - 86400000).toISOString() }
];

/**
 * Handle demo/mock requests when backend server is unavailable
 */
function handleDemoFallback(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('investplan_user') || '{}');
    } catch {
      return {};
    }
  })();
  const userKey = currentUser._id || 'demo_user';

  // 1. Auth: Login
  if (endpoint === '/auth/login' && method === 'POST') {
    const email = (body.email || '').toLowerCase().trim();
    const isAdmin = body.requestedPortal === 'admin' || email.includes('admin');

    if (isAdmin) {
      const adminData = {
        _id: 'admin-demo-id',
        name: 'Chief Investment Officer',
        email: email || 'admin@investplan.com',
        role: 'admin',
        currency: '₹',
        token: 'demo-jwt-admin-token-xyz'
      };
      return { success: true, message: 'Welcome Administrator (Demo Mode)', data: adminData };
    }

    const userData = {
      _id: 'user-demo-id',
      name: 'Alex Johnson',
      email: email || 'user@investplan.com',
      role: 'customer',
      currency: '₹',
      walletBalance: 25000,
      token: 'demo-jwt-user-token-xyz'
    };
    return { success: true, message: 'Welcome back (Demo Mode)', data: userData };
  }

  // 2. Auth: Register
  if (endpoint === '/auth/register' && method === 'POST') {
    const newUserData = {
      _id: `user-${Date.now()}`,
      name: body.name || 'New Investor',
      email: (body.email || '').toLowerCase().trim(),
      role: 'customer',
      currency: '₹',
      walletBalance: 0,
      token: `demo-jwt-${Date.now()}`
    };
    // Initialize clean empty states for new user
    setStorage(`inv_${newUserData._id}`, []);
    setStorage(`goals_${newUserData._id}`, []);
    setStorage(`sips_${newUserData._id}`, []);
    setStorage(`txns_${newUserData._id}`, []);
    return { success: true, message: 'Account registered successfully (Demo Mode)', data: newUserData };
  }

  // 3. Health Check
  if (endpoint === '/health') {
    return { status: 'ok', message: 'Investment Planner API (Demo Mode)', timestamp: new Date().toISOString() };
  }

  // 4. Planner Summary
  if (endpoint === '/planner/summary') {
    const invList = getStorage(`inv_${userKey}`, DEFAULT_DEMO_INVESTMENTS);
    const totalInvested = invList.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    const currentValue = invList.reduce((acc, i) => acc + (Number(i.currentValue) || Number(i.amount) || 0), 0);
    const totalReturns = currentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : '0.00';

    return {
      success: true,
      currency: '₹',
      summary: {
        totalInvested,
        currentValue,
        totalReturns,
        returnPercentage: Number(returnPercentage),
        activeInvestmentsCount: invList.length,
        activeSIPsCount: getStorage(`sips_${userKey}`, DEFAULT_DEMO_SIPS).length,
        goalsCount: getStorage(`goals_${userKey}`, DEFAULT_DEMO_GOALS).length,
        walletBalance: currentUser.walletBalance || 25000
      }
    };
  }

  // 5. Investments CRUD
  if (endpoint.startsWith('/investments')) {
    let invs = getStorage(`inv_${userKey}`, DEFAULT_DEMO_INVESTMENTS);
    if (method === 'POST') {
      const newInv = {
        _id: `inv-${Date.now()}`,
        ...body,
        amount: Number(body.amount) || 0,
        currentValue: Number(body.currentValue) || Number(body.amount) || 0,
        createdAt: new Date().toISOString()
      };
      invs = [newInv, ...invs];
      setStorage(`inv_${userKey}`, invs);
      return { success: true, message: 'Investment added successfully', data: newInv };
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/').pop();
      invs = invs.filter((i) => i._id !== id);
      setStorage(`inv_${userKey}`, invs);
      return { success: true, message: 'Investment deleted' };
    }
    return { success: true, data: invs, count: invs.length };
  }

  // 6. Goals CRUD
  if (endpoint.startsWith('/goals')) {
    let goals = getStorage(`goals_${userKey}`, DEFAULT_DEMO_GOALS);
    if (method === 'POST') {
      const newGoal = {
        _id: `goal-${Date.now()}`,
        ...body,
        targetAmount: Number(body.targetAmount) || 0,
        currentAmount: Number(body.currentAmount) || 0,
        createdAt: new Date().toISOString()
      };
      goals = [newGoal, ...goals];
      setStorage(`goals_${userKey}`, goals);
      return { success: true, message: 'Goal created', data: newGoal };
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/').pop();
      goals = goals.filter((g) => g._id !== id);
      setStorage(`goals_${userKey}`, goals);
      return { success: true, message: 'Goal deleted' };
    }
    return { success: true, data: goals };
  }

  // 7. SIPs CRUD
  if (endpoint.startsWith('/sips')) {
    let sips = getStorage(`sips_${userKey}`, DEFAULT_DEMO_SIPS);
    if (method === 'POST') {
      const newSip = {
        _id: `sip-${Date.now()}`,
        ...body,
        monthlyAmount: Number(body.monthlyAmount) || 0,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      sips = [newSip, ...sips];
      setStorage(`sips_${userKey}`, sips);
      return { success: true, message: 'SIP created', data: newSip };
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/').pop();
      sips = sips.filter((s) => s._id !== id);
      setStorage(`sips_${userKey}`, sips);
      return { success: true, message: 'SIP cancelled' };
    }
    return { success: true, data: sips };
  }

  // 8. Notifications
  if (endpoint.startsWith('/notifications')) {
    let notifs = getStorage(`notifs_${userKey}`, DEFAULT_DEMO_NOTIFICATIONS);
    return { success: true, data: notifs, unreadCount: notifs.filter((n) => !n.read).length };
  }

  // 9. Profile
  if (endpoint.startsWith('/profile') || endpoint.startsWith('/user/profile')) {
    return {
      success: true,
      data: {
        name: currentUser.name || 'Alex Johnson',
        email: currentUser.email || 'user@investplan.com',
        currency: '₹',
        monthlyIncome: 60000,
        monthlyExpenses: 28000,
        riskPreference: 'Moderate',
        horizonYears: 10
      }
    };
  }

  // 10. Admin Dashboard & Management
  if (endpoint.startsWith('/admin')) {
    if (endpoint === '/admin/dashboard') {
      return {
        success: true,
        stats: {
          totalAum: 48500000,
          activeInvestors: 1420,
          activePlansCount: 24,
          pendingTransactionsCount: 3,
          monthlyVolume: 4200000
        }
      };
    }
    if (endpoint.startsWith('/admin/users')) {
      let users = getStorage('admin_users_list', [
        { _id: 'u1', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+91 98765 43210', role: 'customer', status: 'active', totalInvestment: 215000, portfolioValue: 248000, walletBalance: 15000, createdAt: '2024-01-10' },
        { _id: 'u2', name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+91 98765 12345', role: 'customer', status: 'active', totalInvestment: 150000, portfolioValue: 172000, walletBalance: 8000, createdAt: '2024-02-14' },
        { _id: 'u3', name: 'Amit Verma', email: 'amit.verma@example.com', phone: '+91 98765 67890', role: 'customer', status: 'active', totalInvestment: 80000, portfolioValue: 92500, walletBalance: 12000, createdAt: '2024-03-01' }
      ]);

      if (method === 'PUT' && !endpoint.endsWith('/status')) {
        const id = endpoint.split('/').pop();
        const idx = users.findIndex((u) => u._id === id);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...body, updatedAt: new Date().toISOString() };
          setStorage('admin_users_list', users);
          return { success: true, message: `User ${users[idx].name} updated in real-time`, data: users[idx] };
        }
      }

      if (method === 'PUT' && endpoint.endsWith('/status')) {
        const parts = endpoint.split('/');
        const id = parts[parts.length - 2];
        const idx = users.findIndex((u) => u._id === id);
        if (idx !== -1) {
          users[idx].status = body.status;
          setStorage('admin_users_list', users);
          return { success: true, message: `User status updated to ${body.status}`, data: users[idx] };
        }
      }

      return {
        success: true,
        data: users,
        total: users.length
      };
    }
    if (endpoint.startsWith('/admin/investments') || endpoint.startsWith('/admin/plans')) {
      return {
        success: true,
        data: [
          { _id: 'p1', name: 'Bluechip Equity Growth Plan', type: 'Equity', expectedReturn: 14, minInvestment: 5000, riskLevel: 'Moderate', status: 'published' },
          { _id: 'p2', name: 'Sovereign Debt Stability Fund', type: 'Fixed Income', expectedReturn: 8.5, minInvestment: 10000, riskLevel: 'Low', status: 'published' },
          { _id: 'p3', name: 'Tech Opportunities Small Cap', type: 'High Growth', expectedReturn: 18, minInvestment: 2500, riskLevel: 'High', status: 'published' }
        ]
      };
    }
    return { success: true, message: 'Admin action completed' };
  }

  // Default fallback response
  return { success: true, data: [] };
}

/**
 * Generic helper for JSON API requests with automatic JWT token attachment,
 * safe response parsing, and graceful demo fallback.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = isBrowser ? localStorage.getItem('investplan_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const contentType = response.headers.get('content-type') || '';

    // Safely parse JSON if content-type indicates JSON
    let data = null;
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    }

    // If server responded with a non-OK status
    if (!response.ok) {
      // If 404 on static hosting (e.g. Vercel without cloud backend), seamlessly fallback to interactive demo
      if (response.status === 404) {
        console.warn(`[API] Endpoint '${endpoint}' returned 404 from host. Activating demo fallback mode.`);
        return handleDemoFallback(endpoint, options);
      }

      const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    // If response was OK and returned JSON
    if (data !== null) {
      return data;
    }

    // If response was OK but not JSON (unexpected plain text / html)
    const text = await response.text().catch(() => '');
    if (text.startsWith('<!doctype') || text.startsWith('The page could not')) {
      return handleDemoFallback(endpoint, options);
    }

    return { success: true, message: text };
  } catch (error) {
    // If running on localhost and proxy failed, try direct connection to localhost:5000
    if (isLocalhost && url.startsWith('/api')) {
      try {
        const directUrl = `http://localhost:5000/api${endpoint}`;
        const fallbackRes = await fetch(directUrl, { ...options, headers });
        const fallbackContentType = fallbackRes.headers.get('content-type') || '';
        if (fallbackRes.ok && fallbackContentType.includes('application/json')) {
          return await fallbackRes.json();
        }
      } catch {
        // Continue to demo fallback below
      }
    }

    // If network fetch failed entirely (e.g. offline, blocked, or host unreachable)
    console.warn(`[API Network Error] ${endpoint}: ${error.message}. Using demo fallback.`);
    try {
      return handleDemoFallback(endpoint, options);
    } catch {
      throw error;
    }
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
  updateAdminUser: (id, data) =>
    request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
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
