const API_BASE = import.meta.env.VITE_API_URL || ''

function getAuthHeaders() {
  // Check for user token first, then admin token
  const userToken = localStorage.getItem('userToken')
  const adminToken = localStorage.getItem('adminToken')
  const token = userToken || adminToken
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
  getById: (id) => api.get(`/api/events/${id}`),
}
export const contactApi = {
  submit: (data) => api.post('/api/contact', data),
}
export const paymentApi = {
  createIntent: (data) => api.post('/api/payment/create-intent', data),
  confirmOrder: (data) => api.post('/api/payment/confirm-order', data),
}

// Auth (admin)
export const authApi = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (username, email, password) =>
    api.post('/api/auth/register', { username, email, password }),
  me: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  stats: () => api.get('/api/auth/stats'),
}

// Admin API (require token)
export const adminApi = {
  books: {
    create: (formData) => api.postForm('/api/books', formData),
    update: (id, formData) => api.putForm(`/api/books/${id}`, formData),
    delete: (id) => api.delete(`/api/books/${id}`),
  },
  blog: {
    getAll: () => api.get('/api/blog/admin/all'),
    getById: (id) => api.get(`/api/blog/id/${id}`),
    create: (formData) => api.postForm('/api/blog', formData),
    update: (id, formData) => api.putForm(`/api/blog/${id}`, formData),
    delete: (id) => api.delete(`/api/blog/${id}`),
  },
  events: {
    getAll: () => api.get('/api/events/admin/all'),
    create: (formData) => api.postForm('/api/events', formData),
    update: (id, formData) => api.putForm(`/api/events/${id}`, formData),
    delete: (id) => api.delete(`/api/events/${id}`),
  },
  contact: {
    getAll: () => api.get('/api/contact'),
    toggleRead: (id) => api.patch(`/api/contact/${id}/toggle-read`),
    delete: (id) => api.delete(`/api/contact/${id}`),
  },
  orders: {
    getAll: () => api.get('/api/payment/orders'),
    getById: (id) => api.get(`/api/payment/orders/${id}`),
    updateStatus: (id, status) => api.patch(`/api/payment/orders/${id}/status`, { status }),
    delete: (id) => api.delete(`/api/payment/orders/${id}`),
  },
}
