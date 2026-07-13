// AfricaHome API Client
const API_URL = import.meta.env.VITE_API_URL || 'https://africahome.onrender.com/api';

class API {
  constructor() {
    this.token = localStorage.getItem('ah_token');
    this.user = JSON.parse(localStorage.getItem('ah_user') || 'null');
    if (this.user && this.user._id && !this.user.id) this.user.id = this.user._id;
    this.listeners = [];
  }

  subscribe(fn) { this.listeners.push(fn); }
  notify() { this.listeners.forEach(fn => fn()); }

  getHeaders() {
    const h = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  async request(path, options = {}) {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: { ...this.getHeaders(), ...options.headers }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur serveur');
      return data;
    } catch (error) {
      throw error;
    }
  }

  // ============= AUTH =============
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    this.setAuth(data.token, data.user);
    return data;
  }

  async login(phone, password, type) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password, type })
    });
    this.setAuth(data.token, data.user);
    return data;
  }

  async googleAuth(googleData) {
    const data = await this.request('/auth/google-auth', {
      method: 'POST',
      body: JSON.stringify(googleData)
    });
    if (data.token && data.user) {
      this.setAuth(data.token, data.user);
    }
    return data;
  }

  setAuth(token, user) {
    if (user && user._id && !user.id) user.id = user._id;
    this.token = token;
    this.user = user;
    localStorage.setItem('ah_token', token);
    localStorage.setItem('ah_user', JSON.stringify(user));
    this.notify();
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('ah_token');
    localStorage.removeItem('ah_user');
    this.notify();
  }

  getCurrentUser() { return this.user; }
  isLoggedIn() { return !!this.token; }

  async getMe() {
    const data = await this.request('/auth/me');
    if (data.user && data.user._id && !data.user.id) data.user.id = data.user._id;
    this.user = data.user;
    localStorage.setItem('ah_user', JSON.stringify(data.user));
    return data.user;
  }

  async updateProfile(profileData) {
    const data = await this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    if (data.user && data.user._id && !data.user.id) data.user.id = data.user._id;
    this.user = data.user;
    localStorage.setItem('ah_user', JSON.stringify(data.user));
    this.notify();
    return data.user;
  }

  // ============= LISTINGS =============
  async getListings(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    return this.request(`/listings?${params.toString()}`);
  }

  async getPublicStats() {
    return this.request('/listings/public-stats');
  }

  async getListing(id) {
    return this.request(`/listings/${id}`);
  }

  async getMyListings() {
    return this.request('/listings/user/mine');
  }

  async createListing(listingData) {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData)
    });
  }

  async updateListing(id, data) {
    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteListing(id) {
    return this.request(`/listings/${id}`, { method: 'DELETE' });
  }

  async getLocations() {
    return this.request('/listings/locations');
  }

  // ============= UPLOAD =============
  async uploadFiles(files) {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.urls;
  }

  // ============= FAVORITES =============
  async getFavorites() {
    return this.request('/favorites');
  }

  async toggleFavorite(listingId) {
    return this.request(`/favorites/${listingId}`, { method: 'POST' });
  }

  isFavorite(listingId) {
    return this.user?.favorites?.includes(listingId) || false;
  }

  // ============= PAYMENTS =============
  async initPayment(planId) {
    return this.request('/payment/init', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
  }

  async verifyPayment(transaction_id, tx_ref) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ transaction_id, tx_ref })
    });
  }

  async confirmPayment(planId, reference) {
    const data = await this.request('/payment/confirm', {
      method: 'POST',
      body: JSON.stringify({ planId, reference })
    });
    this.setAuth(this.token, data.user);
    return data.user;
  }

  async submitVerification(verificationData) {
    const data = await this.request('/auth/submit-verification', {
      method: 'POST',
      body: JSON.stringify(verificationData)
    });
    this.setAuth(this.token, data.user);
    return data.user;
  }

  async getPaymentHistory() {
    return this.request('/payments/history');
  }

  // ============= REVIEWS =============
  async getReviews(listingId) {
    return this.request(`/favorites/reviews/${listingId}`);
  }

  async addReview(listingId, rating, comment) {
    return this.request('/favorites/reviews', {
      method: 'POST',
      body: JSON.stringify({ listingId, rating, comment })
    });
  }

  // ============= ADMIN =============
  async adminGetUsers() {
    return this.request('/admin/users');
  }

  async adminToggleVerify(id) {
    return this.request(`/admin/users/${id}/verify`, { method: 'PUT' });
  }

  async adminVerifyUser(id, { action, checklist, note } = {}) {
    return this.request(`/admin/users/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ action, checklist, note })
    });
  }

  async adminActivateSubscription(id, planId) {
    return this.request(`/admin/users/${id}/activate-subscription`, {
      method: 'PUT',
      body: JSON.stringify({ planId })
    });
  }

  async adminGetUser(id) {
    return this.request(`/admin/users/${id}`);
  }

  async adminDeleteUser(id) {
    return this.request(`/admin/users/${id}`, { method: 'DELETE' });
  }

  async adminGetListings() {
    return this.request('/admin/listings');
  }

  async adminToggleListing(id) {
    return this.request(`/admin/listings/${id}/toggle`, { method: 'PUT' });
  }

  async adminDeleteListing(id) {
    return this.request(`/admin/listings/${id}`, { method: 'DELETE' });
  }

  async adminGetReviews() {
    return this.request('/admin/reviews');
  }

  async adminDeleteReview(id) {
    return this.request(`/admin/reviews/${id}`, { method: 'DELETE' });
  }

  async adminPurgeDemoData() {
    return this.request('/admin/purge-demo-data', { method: 'POST' });
  }
}

export const api = new API();
