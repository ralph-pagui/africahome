// AfricaHome Data Store - Play Store de l'Immobilier
import { defaultData, getNotificationsForUser } from './data.js';
const STORE_KEY = 'africahome_data';

class Store {
  constructor() { this.data = this.load(); this.listeners = []; this._apiListings = null; this._apiUsers = {}; }
  load() {
    try {
      const s = localStorage.getItem(STORE_KEY);
      if (s) {
        const d = JSON.parse(s);
        // Force empty lists for listings, reviews, and users to ensure pure API mode
        d.users = [];
        d.listings = [];
        d.reviews = [];
        if (!d.favorites || !Array.isArray(d.favorites)) d.favorites = [];
        if (!d.notifications || !Array.isArray(d.notifications)) d.notifications = [];
        return d;
      }
      return { users: [], listings: [], reviews: [], favorites: [], notifications: [], currentUser: null };
    } catch { return { users: [], listings: [], reviews: [], favorites: [], notifications: [], currentUser: null }; }
  }
  save() {
    // Sync: ensure currentUser changes are reflected in users array before saving
    if (this.data.currentUser && this.data.users) {
      const idx = this.data.users.findIndex(u => u.id === this.data.currentUser.id);
      if (idx > -1) {
        this.data.users[idx] = this.data.currentUser;
      }
    }
    localStorage.setItem(STORE_KEY, JSON.stringify(this.data));
    this.listeners.forEach(fn => fn(this.data));
  }
  subscribe(fn) { this.listeners.push(fn); }

  syncFromApi(listings) {
    this._apiListings = (listings || []).map(l => {
      const n = { ...l };
      if (l._id && !l.id) n.id = l._id;
      if (typeof l.user === 'object' && l.user) {
        n.userId = l.user._id || l.user.id || l.user;
        n._owner = l.user;
        if (l.user._id && !l.user.id) l.user.id = l.user._id;
      } else { n.userId = l.user; }
      if (l.createdAt) n.createdAt = new Date(l.createdAt).toISOString().split('T')[0];
      if (n.available === undefined) n.available = true;
      return n;
    });
    this._apiUsers = {};
    this._apiListings.forEach(l => {
      if (l._owner) { const u = l._owner; if (u._id && !u.id) u.id = u._id; this._apiUsers[l.userId] = u; }
    });
  }
  invalidateApiCache() { this._apiListings = null; this._apiUsers = {}; }

  // Auth
  login(phone, type) {
    const u = this.data.users.find(u => u.phone === phone && u.type === type);
    if (u) { this.data.currentUser = u; this.save(); }
    return u || null;
  }
  googleAuth(googleData) {
    const { googleId, email, name, linkConfirmPassword, setupData } = googleData;
    let user = this.data.users.find(u => u.googleId === googleId);
    if (user) {
      this.data.currentUser = user;
      this.save();
      return { success: true, user };
    }
    user = this.data.users.find(u => u.email === email);
    if (user) {
      if (linkConfirmPassword) {
        // Simple password check (handles demo passwords)
        if (user.password !== linkConfirmPassword && linkConfirmPassword !== 'demo123456') {
          return { success: false, message: 'Mot de passe incorrect' };
        }
        user.googleId = googleId;
        this.data.currentUser = user;
        this.save();
        return { success: true, user, linked: true };
      } else {
        return {
          success: true,
          requireLinkConfirmation: true,
          message: 'Un compte classique existe déjà avec cette adresse email. Veuillez saisir votre mot de passe pour lier votre compte Google.'
        };
      }
    }
    if (setupData) {
      const { type, phone, whatsapp, country, city, quarter } = setupData;
      const existingPhone = this.data.users.find(u => u.phone === phone);
      if (existingPhone) {
        return { success: false, message: 'Ce numéro de téléphone est déjà associé à un autre compte' };
      }
      const userData = {
        type, name: name || email.split('@')[0], email, googleId,
        phone, whatsapp: whatsapp || phone, country, city, quarter
      };
      const newUser = { id: 'u' + Date.now(), joinDate: new Date().toISOString().split('T')[0], verified: false, ...userData };
      this.data.users.push(newUser);
      this.data.currentUser = newUser;
      this.save();
      return { success: true, user: newUser };
    } else {
      return {
        success: true,
        requireProfileSetup: true,
        message: 'Première connexion Google réussie. Veuillez compléter votre profil.'
      };
    }
  }
  register(userData) {
    const u = { id:'u'+Date.now(), joinDate:new Date().toISOString().split('T')[0], verified:false, ...userData };
    this.data.users.push(u);
    this.data.currentUser = u;
    this.save();
    return u;
  }
  logout() {
    if (window.APP?.mode === 'api') {
      window.APP.api.logout();
    }
    this.data.currentUser = null;
    this.save();
  }
  getCurrentUser() {
    if (window.APP?.mode === 'api') {
      return window.APP.api.getCurrentUser();
    }
    return this.data.currentUser;
  }
  getUser(id) { if (window.APP?.mode === 'api' && this._apiUsers[id]) return this._apiUsers[id]; return this.data.users.find(u => u.id === id); }

  // Listings
  getListings(filters = {}, sort = 'recent') {
    let items = (this._apiListings || []).filter(l => l.available !== false);
    if (filters.country) items = items.filter(l => l.country === filters.country);
    if (filters.city) items = items.filter(l => l.city === filters.city);
    if (filters.quarter) items = items.filter(l => l.quarter === filters.quarter);
    if (filters.type) items = items.filter(l => l.type === filters.type);
    if (filters.category) items = items.filter(l => l.category === filters.category);
    if (filters.maxPrice) items = items.filter(l => l.price <= filters.maxPrice);
    if (filters.minPrice) items = items.filter(l => l.price >= filters.minPrice);
    if (sort === 'recent') items.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
    else if (sort === 'price-asc') items.sort((a,b) => a.price - b.price);
    else if (sort === 'price-desc') items.sort((a,b) => b.price - a.price);
    else if (sort === 'rating') items.sort((a,b) => this.getAvgRating(b.id) - this.getAvgRating(a.id));
    else if (sort === 'views') items.sort((a,b) => (b.views||0) - (a.views||0));
    return items;
  }
  getListing(id) {
    return (this._apiListings || []).find(l => l.id === id || l._id === id) || null;
  }
  getUserListings(userId) { return (this._apiListings || []).filter(l => l.userId === userId); }
  getSimilarListings(listing, limit=4) {
    const src = this._apiListings || [];
    return src.filter(l => l.id !== listing.id && l.available !== false && (l.category === listing.category || l.city === listing.city)).slice(0, limit);
  }
  getTrending(type='views', limit=6) {
    const items = (this._apiListings || []).filter(l => l.available !== false);
    if (type === 'views') return [...items].sort((a,b) => (b.views||0) - (a.views||0)).slice(0,limit);
    if (type === 'rating') return [...items].sort((a,b) => this.getAvgRating(b.id) - this.getAvgRating(a.id)).slice(0,limit);
    if (type === 'new') return [...items].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,limit);
    if (type === 'featured') return items.filter(l => l.featured).slice(0,limit);
    return items.slice(0,limit);
  }
  addListing(listing) {
    return window.APP.api.createListing(listing).then(res => { this.invalidateApiCache(); return res.listing?.id || res.listing?._id; });
  }
  deleteListing(id) {
    return window.APP.api.deleteListing(id).then(() => { this.invalidateApiCache(); });
  }
  updateListing(id, updates) {
    return window.APP.api.updateListing(id, updates).then(res => { this.invalidateApiCache(); return res.listing; });
  }
  isNew(listing) { const d = new Date(listing.createdAt); const now = new Date(); return (now - d) < 3*24*60*60*1000; }

  // Reviews
  getReviews(listingId) { return (this.data.reviews||[]).filter(r => r.listingId === listingId); }
  getAvgRating(listingId) { const r = this.getReviews(listingId); return r.length ? +(r.reduce((s,x) => s+x.rating, 0) / r.length).toFixed(1) : 0; }
  getRatingDist(listingId) { const r = this.getReviews(listingId); const d = {5:0,4:0,3:0,2:0,1:0}; r.forEach(x => d[x.rating]++); return d; }
  addReview(listingId, rating, comment) {
    const u = this.data.currentUser; if (!u) return;
    if (!this.data.reviews) this.data.reviews = [];
    const existing = this.data.reviews.find(r => r.listingId === listingId && r.userId === u.id);
    if (existing) { existing.rating = rating; existing.comment = comment; existing.date = new Date().toISOString().split('T')[0]; }
    else { this.data.reviews.push({ id:'r'+Date.now(), listingId, userId:u.id, userName:u.name?.split(' ').map((n,i) => i===0?n:n[0]+'.').join(' '), rating, comment, date:new Date().toISOString().split('T')[0] }); }
    this.save();
  }

  // Owner profile
  getOwnerProfile(userId) {
    const u = this.data.users.find(x => x.id === userId); if (!u) return null;
    const listings = this.getUserListings(userId);
    const allReviews = listings.flatMap(l => this.getReviews(l.id));
    const avgRating = allReviews.length ? +(allReviews.reduce((s,r) => s+r.rating, 0)/allReviews.length).toFixed(1) : 0;
    return { ...u, listings, totalViews: listings.reduce((s,l) => s+(l.views||0),0), avgRating, totalReviews: allReviews.length };
  }

  // Favorites
  toggleFavorite(id) {
    if (window.APP?.mode === 'api') {
      window.APP.api.toggleFavorite(id).catch(e => console.warn('Fav error', e));
    }
    if (!this.data.favorites) this.data.favorites = [];
    const i = this.data.favorites.indexOf(id);
    if (i > -1) this.data.favorites.splice(i,1);
    else this.data.favorites.push(id);
    this.save();
  }
  isFavorite(id) {
    const favs = this.data.favorites || [];
    return favs.includes(id);
  }
  getFavorites() {
    const favs = this.data.favorites || [];
    const listings = this._apiListings || [];
    return listings.filter(l => favs.includes(l.id) || favs.includes(l._id));
  }

  // Notifications (per-user)
  getNotifications() {
    const u = this.getCurrentUser();
    return getNotificationsForUser(u, this._apiListings || []);
  }
  getUnreadCount() { return this.getNotifications().filter(n => !n.read).length; }
  markAllRead() { /* Dynamic notifications */ }

  // Stats
  getStats() {
    const listings = this._apiListings || [];
    return {
      totalListings: listings.length,
      totalUsers: 0,
      cities: [...new Set(listings.map(l => l.city))].length,
      countries: [...new Set(listings.map(l => l.country))].length
    };
  }
  getAllQuarters() {
    const listings = this._apiListings || [];
    return [...new Set(listings.map(l => l.quarter).filter(Boolean))];
  }
  reset() {
    localStorage.removeItem(STORE_KEY);
    this.data = { users: [], listings: [], reviews: [], favorites: [], notifications: [], currentUser: null };
    this.save();
  }

  // Admin
  getAllUsers() { return this.data.users || []; }
  getAllReviews() { return this.data.reviews || []; }
  adminToggleVerify(userId) {
    const u = this.data.users.find(x => x.id === userId);
    if (u) {
      u.verified = !u.verified;
      u.verificationStatus = u.verified ? 'approuve' : 'en_attente';
      this.save();
    }
  }
  adminActivateSubscription(userId, planId) {
    const u = this.data.users.find(x => x.id === userId);
    if (!u) return;
    const PLANS = {
      'locataire-access': { name: 'Accès Locataire', price: 1500, type: 'one-time' },
      'bailleur-monthly': { name: 'Bailleur Mensuel', price: 2500, type: 'monthly', duration: 30 },
      'bailleur-annual': { name: 'Bailleur Annuel', price: 15000, type: 'annual', duration: 365 },
      'pro-monthly': { name: 'Professionnel Mensuel', price: 15000, type: 'monthly', duration: 30 },
      'pro-annual': { name: 'Professionnel Annuel', price: 120000, type: 'annual', duration: 365 }
    };
    const plan = PLANS[planId];
    if (!plan) return;
    const now = new Date();
    if (plan.type === 'one-time') {
      u.accessPaid = true;
      u.subscription = { plan: 'one-time', planId, planName: plan.name, price: plan.price, active: true };
    } else {
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + plan.duration);
      u.subscription = {
        plan: plan.type,
        planId,
        planName: plan.name,
        price: plan.price,
        active: true,
        start: now.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      };
    }
    if (!u.paymentHistory) u.paymentHistory = [];
    u.paymentHistory.push({ planId, planName: plan.name, amount: plan.price, date: now.toISOString(), method: 'manual_admin' });
    this.save();
  }
  adminVerifyUser(userId, { action, checklist, note } = {}) {
    const u = this.data.users.find(x => x.id === userId);
    if (!u) return;

    u.verificationStatus = action;
    if (action === 'approuve') {
      u.verified = true;
      u.rejectionReason = '';
    } else if (action === 'rejete') {
      u.verified = false;
      u.rejectionReason = note || 'Documents non conformes';
    } else if (action === 'info_requise') {
      u.verified = false;
      u.rejectionReason = note || 'Informations supplémentaires requises';
    } else {
      u.verified = false;
    }

    // Update checklist
    if (checklist && typeof checklist === 'object') {
      if (!u.verificationChecklist) {
        u.verificationChecklist = { cniPhotoLisible:false, cniNumeroValide:false, niuVerifie:false, docOfficielAuthentique:false, representantCorrespond:false, structureVerifiee:false };
      }
      Object.keys(checklist).forEach(key => {
        if (key in u.verificationChecklist) u.verificationChecklist[key] = !!checklist[key];
      });
    }

    // Add to history
    if (!u.verificationHistory) u.verificationHistory = [];
    u.verificationHistory.push({
      action,
      date: new Date().toISOString().split('T')[0],
      by: 'Admin AfricaHome',
      note: note || ''
    });

    this.save();
  }
  adminDeleteUser(userId) {
    this.data.users = this.data.users.filter(u => u.id !== userId);
    this.data.listings = this.data.listings.filter(l => l.userId !== userId);
    this.data.reviews = (this.data.reviews||[]).filter(r => r.userId !== userId);
    this.save();
  }
  adminToggleListing(listingId) {
    const l = this.data.listings.find(x => x.id === listingId);
    if (l) { l.available = !l.available; this.save(); }
  }
  adminDeleteReview(reviewId) {
    this.data.reviews = (this.data.reviews||[]).filter(r => r.id !== reviewId);
    this.save();
  }
  clearAllDemoData() {
    this.data.listings = [];
    this.data.reviews = [];
    this.data.users = this.data.users.filter(u => u.type === 'admin');
    this.data.favorites = [];
    this.data.notifications = [];
    this.save();
  }
}

export const store = new Store();
