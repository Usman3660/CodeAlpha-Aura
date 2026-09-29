// ==========================================================================
// AURA 3D — REST API Client Wrapper
// ==========================================================================

const API_BASE = '/api';

const api = {
  // Helper for requests with auth header
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('aura_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      return { success: false, message: 'Network or server error' };
    }
  },

  // Auth Endpoints
  auth: {
    login: (credentials) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getProfile: () => api.request('/auth/me'),
    updateProfile: (data) => api.request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) })
  },

  // Products Endpoints
  products: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.request(`/products${queryString ? `?${queryString}` : ''}`);
    },
    getCategories: () => api.request('/products/categories'),
    getById: (id) => api.request(`/products/${id}`),
    addReview: (productId, reviewData) => api.request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    }),
    addProduct: (productData) => api.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    })
  },

  // Orders Endpoints
  orders: {
    create: (orderData) => api.request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
    getMyOrders: () => api.request('/orders/my-orders'),
    getAllOrders: () => api.request('/orders/all'),
    getById: (id) => api.request(`/orders/${id}`),
    updateStatus: (id, status) => api.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  },

  // Coupons
  coupons: {
    apply: (code, cartTotal) => api.request('/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code, cartTotal })
    }),
    getAll: () => api.request('/coupons')
  },

  // Health / Stats
  system: {
    getStats: () => api.request('/stats'),
    getHealth: () => api.request('/health')
  }
};
