const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('autoserve_token');
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const options = { method, headers, cache: 'no-store' };
  if (body) options.body = JSON.stringify(body);
  
  let fetchUrl = `${BASE_URL}${path}`;
  if (method === 'GET') {
    const separator = fetchUrl.includes('?') ? '&' : '?';
    fetchUrl += `${separator}_t=${Date.now()}`;
  }
  
  const res = await fetch(fetchUrl, options);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  get:    (path)       => request('GET',    path),
  post:   (path, body) => request('POST',   path, body),
  put:    (path, body) => request('PUT',    path, body),
  patch:  (path, body) => request('PATCH',  path, body),
  delete: (path)       => request('DELETE', path),
};

// ── Auth ──────────────────────────────────────────────────
export const authService = {
  login: async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    localStorage.setItem('autoserve_token', data.token || '');
    localStorage.setItem('autoserve_user', JSON.stringify(data));
    return data;
  },
  register: async (userData) => {
    const { confirm: _, ...payload } = userData;
    const data = await api.post('/auth/register', payload);
    localStorage.setItem('autoserve_token', data.token || '');
    localStorage.setItem('autoserve_user', JSON.stringify(data));
    return data;
  },
  forgotPassword: (email)              => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  logout: () => {
    localStorage.removeItem('autoserve_token');
    localStorage.removeItem('autoserve_user');
  },
  updateProfile: async (id, data) => {
    const user = await api.put(`/auth/update/${id}`, data);
    // update localStorage
    const current = JSON.parse(localStorage.getItem('autoserve_user') || '{}');
    localStorage.setItem('autoserve_user', JSON.stringify({ ...current, ...user }));
    return user;
  },
  deleteProfile: (id) => api.delete(`/auth/delete/${id}`),
  getCurrentUser: () => {
    const s = localStorage.getItem('autoserve_user');
    return s ? JSON.parse(s) : null;
  },
  isLoggedIn: () => !!localStorage.getItem('autoserve_user'),
  getAllUsers: () => api.get('/auth/users'),
};

// ── Customers ─────────────────────────────────────────────
export const customerService = {
  getAll:  ()         => api.get('/customers'),
  getById: (id)       => api.get(`/customers/${id}`),
  create:  (data)     => api.post('/customers', data),
  update:  (id, data) => api.put(`/customers/${id}`, data),
  delete:  (id)       => api.delete(`/customers/${id}`),
};

// ── Vehicles ──────────────────────────────────────────────
export const vehicleService = {
  getAll:  ()         => api.get('/vehicles'),
  getById: (id)       => api.get(`/vehicles/${id}`),
  create:  (data)     => api.post('/vehicles', data),
  update:  (id, data) => api.put(`/vehicles/${id}`, data),
  delete:  (id)       => api.delete(`/vehicles/${id}`),
};

// ── Bookings ──────────────────────────────────────────────
export const bookingService = {
  getAll:       ()           => api.get('/bookings'),
  getById:      (id)         => api.get(`/bookings/${id}`),
  create:       (data)       => api.post('/bookings', data),
  update:       (id, data)   => api.put(`/bookings/${id}`, data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  delete:       (id)         => api.delete(`/bookings/${id}`),
};

// ── Invoices ──────────────────────────────────────────────
export const invoiceService = {
  getAll:   ()              => api.get('/invoices'),
  getById:  (id)            => api.get(`/invoices/${id}`),
  create:   (data)          => api.post('/invoices', data),
  update:   (id, data)      => api.put(`/invoices/${id}`, data),
  markPaid: (id, payMethod) => api.patch(`/invoices/${id}/pay`, { payMethod }),
  delete:   (id)            => api.delete(`/invoices/${id}`),
};

// ── Feedback ──────────────────────────────────────────────
export const feedbackService = {
  getAll:       ()           => api.get('/feedback'),
  create:       (data)       => api.post('/feedback', data),
  update:       (id, data)   => api.put(`/feedback/${id}`, data),
  updateStatus: (id, status) => api.patch(`/feedback/${id}/status`, { status }),
  delete:       (id)         => api.delete(`/feedback/${id}`),
};

// ── Services Catalog ──────────────────────────────────────
export const servicesCatalogService = {
  getAll:  ()         => api.get('/services'),
  getById: (id)       => api.get(`/services/${id}`),
  create:  (data)     => api.post('/services', data),
  update:  (id, data) => api.put(`/services/${id}`, data),
  delete:  (id)       => api.delete(`/services/${id}`),
};

// ── Garages ───────────────────────────────────────────────
export const garageService = {
  getAll:      async () => {
    const users = await api.get('/auth/users');
    return users.filter(u => u.role === 'Garage Owner');
  },
  getById:     (id)       => api.get(`/garages/${id}`),
  create:      (data)     => api.post('/garages', data),
  update:      (id, data) => api.put(`/garages/${id}`, data),
  delete:      (id)       => api.delete(`/garages/${id}`),
  getServices: (id)       => api.get(`/garages/${id}/services`),
};