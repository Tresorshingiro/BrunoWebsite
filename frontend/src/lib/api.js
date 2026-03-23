const API_BASE = import.meta.env.VITE_API_URL || ''

function getAuthHeaders() {
  const userToken = localStorage.getItem('userToken')
  const token = userToken
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function getAdminHeaders() {
  const token = localStorage.getItem('adminToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const api = {
  async request(method, path, data = null, options = {}) {
    const url = `${API_BASE}${path}`
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
    }
    if (data && method !== 'GET') config.body = JSON.stringify(data)
    const res = await fetch(url, config)
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.message || res.statusText)
    return json
  },

  get(path) {
    return this.request('GET', path)
  },
  post(path, data) {
    return this.request('POST', path, data)
  },
  put(path, data) {
    return this.request('PUT', path, data)
  },
  patch(path, data) {
    return this.request('PATCH', path, data)
  },
  delete(path) {
    return this.request('DELETE', path)
  },

  // Admin-specific helpers — always send adminToken regardless of userToken
  adminGet(path) {
    return this.request('GET', path, null, { headers: getAdminHeaders() })
  },
  adminPut(path, data) {
    return this.request('PUT', path, data, { headers: getAdminHeaders() })
  },
  adminPatch(path, data) {
    return this.request('PATCH', path, data, { headers: getAdminHeaders() })
  },
  adminDelete(path) {
    return this.request('DELETE', path, null, { headers: getAdminHeaders() })
  },

  // FormData for file uploads (no JSON Content-Type)
  async postForm(path, formData) {
    const token = localStorage.getItem('adminToken')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.message || res.statusText)
    return json
  },
  async putForm(path, formData) {
    const token = localStorage.getItem('adminToken')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers,
      body: formData,
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.message || res.statusText)
    return json
  },
}

// Public API helpers
export const booksApi = {
  getAll: () => api.get('/api/books'),
  getFeatured: () => api.get('/api/books/featured'),
  getById: (id) => api.get(`/api/books/${id}`),
}
export const blogApi = {
  getPublished: (params) => {
    const q = new URLSearchParams(params).toString()
    return api.get(`/api/blog${q ? `?${q}` : ''}`)
  },
  getLatest: () => api.get('/api/blog/latest'),
  getBySlug: (slug) => api.get(`/api/blog/${slug}`),
}
export const eventsApi = {
  getUpcoming: () => api.get('/api/events'),
  getPast: () => api.get('/api/events/past'),
  getById: (id) => api.get(`/api/events/${id}`),
}
export const contactApi = {
  submit: (data) => api.post('/api/contact', data),
}
export const subscribeApi = {
  subscribe: (email) => api.post('/api/subscriptions', { email }),
  unsubscribe: (token) => api.get(`/api/subscriptions/unsubscribe?token=${token}`),
}
export const paymentApi = {
  createIntent: (data) => api.post('/api/payment/create-intent', data),
  confirmOrder: (data) => api.post('/api/payment/confirm-order', data),
}
export const blogInteractionApi = {
  toggleLike: (id) => api.post(`/api/blog/${id}/like`),
  addComment: (id, content) => api.post(`/api/blog/${id}/comment`, { content }),
  deleteComment: (id, commentId) => api.delete(`/api/blog/${id}/comment/${commentId}`),
  addReply: (id, commentId, content) => api.post(`/api/blog/${id}/comment/${commentId}/reply`, { content }),
  deleteReply: (id, commentId, replyId) => api.delete(`/api/blog/${id}/comment/${commentId}/reply/${replyId}`),
  uploadImage: (formData) => {
    const token = localStorage.getItem('adminToken')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    return fetch(`${API_BASE}/api/blog/upload-image`, { method: 'POST', headers, body: formData })
      .then((r) => r.json())
  },
}

// Auth (admin)
export const authApi = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (username, email, password) =>
    api.post('/api/auth/register', { username, email, password }),
  me: () => api.adminGet('/api/auth/me'),
  updateProfile: (data) => api.adminPut('/api/auth/profile', data),
  stats: () => api.adminGet('/api/auth/stats'),
}

// Admin API (require adminToken)
export const adminApi = {
  books: {
    create: (formData) => api.postForm('/api/books', formData),
    update: (id, formData) => api.putForm(`/api/books/${id}`, formData),
    delete: (id) => api.adminDelete(`/api/books/${id}`),
  },
  blog: {
    getAll: () => api.adminGet('/api/blog/admin/all'),
    getById: (id) => api.adminGet(`/api/blog/id/${id}`),
    create: (formData) => api.postForm('/api/blog', formData),
    update: (id, formData) => api.putForm(`/api/blog/${id}`, formData),
    delete: (id) => api.adminDelete(`/api/blog/${id}`),
  },
  events: {
    getAll: () => api.adminGet('/api/events/admin/all'),
    create: (formData) => api.postForm('/api/events', formData),
    update: (id, formData) => api.putForm(`/api/events/${id}`, formData),
    delete: (id) => api.adminDelete(`/api/events/${id}`),
  },
  contact: {
    getAll: () => api.adminGet('/api/contact'),
    toggleRead: (id) => api.adminPatch(`/api/contact/${id}/toggle-read`),
    delete: (id) => api.adminDelete(`/api/contact/${id}`),
  },
  orders: {
    getAll: () => api.adminGet('/api/payment/orders'),
    getById: (id) => api.adminGet(`/api/payment/orders/${id}`),
    updateStatus: (id, status) => api.adminPatch(`/api/payment/orders/${id}/status`, { status }),
    delete: (id) => api.adminDelete(`/api/payment/orders/${id}`),
  },
}
