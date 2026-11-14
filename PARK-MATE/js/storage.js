/**
 * js/storage.js
 * LocalStorage wrapper and state persistence engine.
 */

const AppStorage = {
  KEYS: {
    USER: 'lpu_current_user',
    SLOTS: 'lpu_parking_slots_db',
    BOOKINGS: 'lpu_campus_bookings',
    VEHICLES: 'lpu_user_vehicles',
    PARKED: 'lpu_saved_parked_loc',
    NOTIFS: 'lpu_user_notifications',
    PENDING: 'lpu_pending_booking',
    SYNC_SIGNAL: 'lpu_booking_sync_signal'
  },

  init() {
    if (!localStorage.getItem(this.KEYS.SLOTS)) {
      localStorage.setItem(this.KEYS.SLOTS, JSON.stringify(LPU_INITIAL_DATA.generateDefaultSlots()));
    }
    if (!localStorage.getItem(this.KEYS.VEHICLES)) {
      localStorage.setItem(this.KEYS.VEHICLES, JSON.stringify(LPU_INITIAL_DATA.defaultVehicles));
    }
    if (!localStorage.getItem(this.KEYS.BOOKINGS)) {
      localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(LPU_INITIAL_DATA.defaultBookings));
    }
    if (!localStorage.getItem(this.KEYS.NOTIFS)) {
      localStorage.setItem(this.KEYS.NOTIFS, JSON.stringify(LPU_INITIAL_DATA.defaultNotifications));
    }
    // Pre-populate realistic default saved parked vehicle location
    if (!localStorage.getItem(this.KEYS.PARKED)) {
      localStorage.setItem(this.KEYS.PARKED, JSON.stringify({
        block: 25,
        slot: 'B25-P014',
        zone: 'Zone B • Four-Wheeler',
        vehicle: 'PB 08 CC 4821 (Honda City)',
        notes: 'Parked near tree shade opposite Uni-Mall North Gate',
        timestamp: 'Today, 09:30 AM'
      }));
    }
  },

  getUser() {
    return localStorage.getItem(this.KEYS.USER);
  },

  setUser(userId) {
    localStorage.setItem(this.KEYS.USER, userId);
  },

  clearUser() {
    localStorage.removeItem(this.KEYS.USER);
  },

  getSlots() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.SLOTS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveSlots(slots) {
    localStorage.setItem(this.KEYS.SLOTS, JSON.stringify(slots));
  },

  updateSlotStatus(slotId, newStatus) {
    const slots = this.getSlots();
    const target = slots.find(s => s.slotId === slotId);
    if (target) {
      target.status = newStatus;
      this.saveSlots(slots);
    }
  },

  getBookings() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.BOOKINGS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveBookings(bookings) {
    localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(bookings));
  },

  getVehicles() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.VEHICLES)) || [];
    } catch (e) {
      return [];
    }
  },

  saveVehicles(vehicles) {
    localStorage.setItem(this.KEYS.VEHICLES, JSON.stringify(vehicles));
  },

  getParkedLocation() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.PARKED));
    } catch (e) {
      return null;
    }
  },

  saveParkedLocation(locData) {
    localStorage.setItem(this.KEYS.PARKED, JSON.stringify(locData));
  },

  clearParkedLocation() {
    localStorage.removeItem(this.KEYS.PARKED);
  },

  getNotifications() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.NOTIFS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveNotifications(notifs) {
    localStorage.setItem(this.KEYS.NOTIFS, JSON.stringify(notifs));
  },

  addNotification(notif) {
    const notifs = this.getNotifications();
    notifs.unshift({
      id: 'notif-' + Date.now(),
      title: notif.title,
      message: notif.message,
      time: 'Just now',
      unread: true
    });
    this.saveNotifications(notifs);
  }
};

AppStorage.init();

// Add these helper methods inside your StorageService in js/storage.js

const SESSION_KEY = 'parkmate_active_session';

const StorageService = {
  // ... your other storage methods (slots, vehicles, bookings) ...

  // Save active logged-in user
  saveUserSession(user) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save session to localStorage', e);
    }
  },

  // Get active session on page reload
  getUserSession() {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to parse session from localStorage', e);
      return null;
    }
  },

  // Clear session on logout
  clearUserSession() {
    localStorage.removeItem(SESSION_KEY);
  }
};