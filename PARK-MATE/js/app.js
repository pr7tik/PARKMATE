/**
 * LPU CENTRAL APPLICATION CONTROLLER
 * Routing, strict credentials verification, passkey protection, and cross-tab synchronizer.
 */

window.App = {
  currentUser: null,

  // Allowed University Registration IDs & Universal Password
  ALLOWED_USERS: ['12629947', '12614967', '12629686', '12626855'],
  UNIVERSAL_PASSWORD: 'LPU@321',

  init() {
    this.checkAuth();
    this.setupNavigation();
    this.setupAuthHandlers();
    this.setupAdminSecurity();
    this.setupCrossTabSync();
    this.setupVehiclesHandlers();
    this.setupFindVehicleHandlers();
    this.setupProfileHandlers();
    this.setupNotificationsHandlers();
    this.updateDashboardKpis();
    this.renderActivityTimeline();

    ParkingModule.init();
    BookingModule.init();
    NavigationModule.init();
    AdminModule.init();
  },

  // ALWAYS require login on every page refresh or initial visit
  checkAuth() {
    AppStorage.clearUser();
    sessionStorage.removeItem('lpu_admin_authenticated');
    this.currentUser = null;
    this.showLoginView();
  },

  showLoginView() {
    document.getElementById('login-view').classList.remove('hidden');
    document.getElementById('app-view').classList.add('hidden');

    // Clear input fields and errors on every display
    const userIdInput = document.getElementById('login-userid');
    const pwdInput = document.getElementById('login-password');
    const errorBox = document.getElementById('login-error');

    if (userIdInput) userIdInput.value = '';
    if (pwdInput) pwdInput.value = '';
    if (errorBox) errorBox.classList.add('hidden');
  },

  showAppView() {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');

    const topDisplay = document.getElementById('top-user-display');
    const dashName = document.getElementById('dash-user-name');
    const profName = document.getElementById('profile-display-name');
    const profIdInput = document.getElementById('profile-input-userid');
    const avatar = document.getElementById('user-avatar-initials');
    const profAvatar = document.getElementById('profile-big-avatar');

    const firstChar = this.currentUser ? this.currentUser.charAt(0).toUpperCase() : 'U';

    if (topDisplay) topDisplay.textContent = this.currentUser;
    if (dashName) dashName.textContent = this.currentUser;
    if (profName) profName.textContent = `Reg. No: ${this.currentUser}`;
    if (profIdInput) profIdInput.value = this.currentUser;
    if (avatar) avatar.textContent = firstChar;
    if (profAvatar) profAvatar.textContent = firstChar;
  },

  setupAuthHandlers() {
    const loginForm = document.getElementById('login-form');
    const errorBox = document.getElementById('login-error');
    const togglePwd = document.getElementById('toggle-pwd-btn');
    const pwdInput = document.getElementById('login-password');
    const userIdInput = document.getElementById('login-userid');

    if (togglePwd && pwdInput) {
      togglePwd.addEventListener('click', () => {
        const isPwd = pwdInput.type === 'password';
        pwdInput.type = isPwd ? 'text' : 'password';
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredId = userIdInput.value.trim();
        const enteredPwd = pwdInput.value.trim();

        if (!enteredId || !enteredPwd) {
          errorBox.textContent = 'Please enter both University Registration ID and Password.';
          errorBox.classList.remove('hidden');
          return;
        }

        // Strict verification
        const isUserValid = this.ALLOWED_USERS.includes(enteredId);
        const isPasswordValid = (enteredPwd === this.UNIVERSAL_PASSWORD);

        if (!isUserValid || !isPasswordValid) {
          errorBox.textContent = 'Invalid University Registration ID or Password. Access restricted to authorized student/faculty accounts.';
          errorBox.classList.remove('hidden');
          pwdInput.value = '';
          pwdInput.focus();
          this.showToast('Authentication failed: Unauthorized credentials', 'error');
          return;
        }

        // Login approved
        errorBox.classList.add('hidden');
        AppStorage.setUser(enteredId);
        this.currentUser = enteredId;
        this.showAppView();
        this.showToast(`Welcome back, ${enteredId}!`, 'success');
      });
    }

    const logoutBtns = [document.getElementById('btn-logout'), document.getElementById('profile-logout-btn')];
    logoutBtns.forEach(b => {
      if (!b) return;
      b.addEventListener('click', () => {
        AppStorage.clearUser();
        sessionStorage.removeItem('lpu_admin_authenticated');
        this.currentUser = null;
        this.showLoginView();
        this.showToast('Signed out of campus session', 'info');
      });
    });
  },

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .nav-switch-btn');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const targetView = link.getAttribute('data-view');
        if (!targetView) return;

        // Challenge admin security passkey
        if (targetView === 'admin' && !this.isAdminAuthenticated()) {
          this.showAdminAuthModal();
          return;
        }

        this.switchView(targetView);
        document.getElementById('app-sidebar').classList.remove('mobile-open');
      });
    });

    const mobileBtn = document.getElementById('mobile-toggle-btn');
    const closeBtn = document.getElementById('sidebar-close-btn');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        document.getElementById('app-sidebar').classList.add('mobile-open');
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('app-sidebar').classList.remove('mobile-open');
      });
    }

    document.querySelectorAll('[data-action="goto-blocks"]').forEach(b => {
      b.addEventListener('click', () => this.switchView('blocks'));
    });
    document.querySelectorAll('[data-action="goto-vehicle"]').forEach(b => {
      b.addEventListener('click', () => this.switchView('find-vehicle'));
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
      });
    });
  },

  isAdminAuthenticated() {
    return sessionStorage.getItem('lpu_admin_authenticated') === 'true';
  },

  showAdminAuthModal() {
    const modal = document.getElementById('modal-admin-auth');
    const errorBox = document.getElementById('admin-auth-error');
    const input = document.getElementById('admin-passkey-input');
    if (!modal) return;

    if (errorBox) errorBox.classList.add('hidden');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 150);
    }
    modal.classList.remove('hidden');
  },

  hideAdminAuthModal() {
    const modal = document.getElementById('modal-admin-auth');
    if (modal) modal.classList.add('hidden');
  },

  setupAdminSecurity() {
    const form = document.getElementById('form-admin-auth');
    const input = document.getElementById('admin-passkey-input');
    const errorBox = document.getElementById('admin-auth-error');
    const cancelBtn = document.getElementById('btn-cancel-admin-auth');
    const closeBtn = document.getElementById('btn-close-admin-auth');

    if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideAdminAuthModal());
    if (closeBtn) closeBtn.addEventListener('click', () => this.hideAdminAuthModal());

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPasskey = input.value.trim();

        if (enteredPasskey === 'LPU@321') {
          sessionStorage.setItem('lpu_admin_authenticated', 'true');
          if (errorBox) errorBox.classList.add('hidden');
          this.hideAdminAuthModal();
          this.switchView('admin');
          this.showToast('Estate Security Clearance Verified: Welcome Admin', 'success');
        } else {
          if (errorBox) {
            errorBox.textContent = 'Access Denied: Invalid Administrator Passkey.';
            errorBox.classList.remove('hidden');
          }
          input.value = '';
          input.focus();
          this.showToast('Access Denied: Invalid Administrator Passkey', 'error');
        }
      });
    }
  },

  switchView(viewName) {
    document.querySelectorAll('.nav-link').forEach(l => {
      if (l.getAttribute('data-view') === viewName) l.classList.add('active');
      else l.classList.remove('active');
    });

    document.querySelectorAll('.content-view').forEach(v => {
      v.classList.remove('active');
    });

    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
    }

    if (viewName === 'bookings') BookingModule.renderMyBookings();
    if (viewName === 'admin') AdminModule.renderAdminView();
    if (viewName === 'dashboard') {
      this.updateDashboardKpis();
      ParkingModule.renderDashboardOverview();
    }
  },

  setupCrossTabSync() {
    window.addEventListener('storage', (e) => {
      if (e.key === AppStorage.KEYS.SYNC_SIGNAL && e.newValue) {
        try {
          const signal = JSON.parse(e.newValue);
          if (signal.type === 'BOOKING_CREATED') {
            this.showToast(`Gate Pass Confirmed: Bay ${signal.slotId}!`, 'success');
            this.updateDashboardKpis();
            ParkingModule.renderDashboardOverview();
            ParkingModule.renderFullBlocksGrid();
            ParkingModule.renderGarageMap(ParkingModule.currentBlock);
            BookingModule.renderMyBookings();
            this.renderNotificationsList();
            this.renderActivityTimeline();
          }
        } catch (err) {
          console.error('Cross-tab sync error', err);
        }
      }
    });
  },

  updateDashboardKpis() {
    const slots = AppStorage.getSlots();
    const total = slots.length;
    const available = slots.filter(s => s.status === 'available').length;
    const occupied = slots.filter(s => s.status === 'occupied').length;
    const activeBookings = AppStorage.getBookings().filter(b => b.status === 'active').length;
    const pct = total ? Math.round((available / total) * 100) : 0;

    const kpiTotal = document.getElementById('kpi-total-slots');
    const kpiAvail = document.getElementById('kpi-avail-slots');
    const kpiOcc = document.getElementById('kpi-occ-slots');
    const kpiBookings = document.getElementById('kpi-user-bookings');
    const kpiPct = document.getElementById('kpi-avail-pct');
    const badgeBookings = document.getElementById('nav-booking-badge');

    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiAvail) kpiAvail.textContent = available;
    if (kpiOcc) kpiOcc.textContent = occupied;
    if (kpiBookings) kpiBookings.textContent = activeBookings;
    if (kpiPct) kpiPct.textContent = `${pct}% available`;
    if (badgeBookings) badgeBookings.textContent = activeBookings;
  },

  renderActivityTimeline() {
    const container = document.getElementById('dash-activity-list');
    if (!container) return;
    const bookings = AppStorage.getBookings();

    let logs = [
      { title: 'ANPR Gate 1: PB 08 CC 4821 entry verified', time: '12 mins ago' },
      { title: 'Automated barrier opened at Block 22', time: '28 mins ago' },
      { title: 'Security Patrol checkpoint cleared: Zone B', time: '1 hour ago' }
    ];

    if (bookings.length > 0) {
      bookings.slice(0, 3).forEach(b => {
        logs.unshift({
          title: `Slot ${b.slotId} reserved by Reg. ${b.userId}`,
          time: b.date + ' ' + b.arrivalTime
        });
      });
    }

    container.innerHTML = logs.map(l => `
      <li class="timeline-item">
        <span class="timeline-dot"></span>
        <div>
          <div class="timeline-title">${l.title}</div>
          <div class="timeline-time">${l.time}</div>
        </div>
      </li>
    `).join('');
  },

  setupVehiclesHandlers() {
    this.renderVehiclesList();

    const openModalBtn = document.getElementById('btn-open-add-vehicle');
    const modal = document.getElementById('modal-add-vehicle');
    const form = document.getElementById('form-add-vehicle');

    if (openModalBtn && modal) {
      openModalBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const reg = document.getElementById('veh-reg-num').value.trim().toUpperCase();
        const type = document.getElementById('veh-type').value;
        const model = document.getElementById('veh-model').value.trim() || 'Campus Registered Vehicle';

        if (!reg) return;

        const vehicles = AppStorage.getVehicles();
        vehicles.push({ regNumber: reg, type, model });
        AppStorage.saveVehicles(vehicles);

        modal.classList.add('hidden');
        form.reset();
        this.renderVehiclesList();
        this.showToast(`Vehicle ${reg} registered with campus estate`, 'success');
      });
    }
  },

  renderVehiclesList() {
    const container = document.getElementById('vehicles-container-grid');
    const selectForParked = document.getElementById('save-vehicle-select');
    if (!container) return;
    container.innerHTML = '';

    const vehicles = AppStorage.getVehicles();

    if (selectForParked) {
      selectForParked.innerHTML = '';
      vehicles.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.regNumber;
        opt.textContent = `${v.regNumber} - ${v.model}`;
        selectForParked.appendChild(opt);
      });
    }

    vehicles.forEach((v, index) => {
      const card = document.createElement('div');
      card.className = 'vehicle-card';
      card.innerHTML = `
        <div class="veh-number-plate">${v.regNumber}</div>
        <h4 style="font-size: 0.95rem; font-weight: 700; color: #183153;">${v.model}</h4>
        <p style="font-size: 0.8rem; color: #64748B; margin: 0.25rem 0 0.75rem 0;">
          Category: ${v.type === '2w' ? 'Two-Wheeler (Motorcycle/Scooter)' : 'Four-Wheeler / EV'}
        </p>
        <button class="btn btn-sm btn-outline text-red btn-remove-veh" data-index="${index}">De-register</button>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('.btn-remove-veh').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const list = AppStorage.getVehicles();
        list.splice(idx, 1);
        AppStorage.saveVehicles(list);
        this.renderVehiclesList();
        this.showToast('Vehicle de-registered from account', 'info');
      });
    });
  },

  setupFindVehicleHandlers() {
    this.renderSavedParkedLocation();

    const form = document.getElementById('save-parked-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const block = document.getElementById('save-block-select').value;
        const slot = document.getElementById('save-slot-input').value.trim();
        const vehicle = document.getElementById('save-vehicle-select').value;
        const notes = document.getElementById('save-notes-input').value.trim() || 'No memory notes entered';

        AppStorage.saveParkedLocation({
          block,
          slot,
          vehicle,
          notes,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        this.renderSavedParkedLocation();
        this.showToast(`Saved location: Block ${block} (${slot})`, 'success');
      });
    }

    const clearBtn = document.getElementById('btn-clear-saved-loc');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        AppStorage.clearParkedLocation();
        this.renderSavedParkedLocation();
        this.showToast('Cleared saved parking bay', 'info');
      });
    }

    const showOnMapBtn = document.getElementById('btn-show-saved-on-map');
    if (showOnMapBtn) {
      showOnMapBtn.addEventListener('click', () => {
        const saved = AppStorage.getParkedLocation();
        if (saved) {
          ParkingModule.selectBlockAndShowMap(saved.block);
        }
      });
    }
  },

  renderSavedParkedLocation() {
    const saved = AppStorage.getParkedLocation();
    const content = document.getElementById('saved-loc-content');
    const empty = document.getElementById('saved-loc-empty');
    if (!content || !empty) return;

    if (!saved) {
      content.classList.add('hidden');
      empty.classList.remove('hidden');
    } else {
      content.classList.remove('hidden');
      empty.classList.add('hidden');

      document.getElementById('display-saved-block').textContent = `Block ${saved.block}`;
      document.getElementById('display-saved-slot').textContent = saved.slot;
      document.getElementById('display-saved-vehicle').textContent = saved.vehicle;
      document.getElementById('display-saved-time').textContent = `Parked today at ${saved.timestamp}`;
      document.getElementById('display-saved-notes').textContent = saved.notes;
    }
  },

  setupProfileHandlers() {
    const form = document.getElementById('profile-update-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('profile-input-fullname').value.trim();
        if (fullName) {
          document.getElementById('dash-user-name').textContent = fullName;
          document.getElementById('profile-display-name').textContent = fullName;
          this.showToast('Profile information updated', 'success');
        }
      });
    }
  },

  setupNotificationsHandlers() {
    this.renderNotificationsList();

    const notifBtn = document.getElementById('btn-notif-dropdown');
    const dropdown = document.getElementById('notif-dropdown-menu');
    if (notifBtn && dropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
      });

      document.addEventListener('click', () => dropdown.classList.add('hidden'));
    }

    const markReadBtn = document.getElementById('btn-mark-all-read');
    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => {
        const notifs = AppStorage.getNotifications().map(n => ({ ...n, unread: false }));
        AppStorage.saveNotifications(notifs);
        this.renderNotificationsList();
        this.showToast('All notifications marked as read', 'info');
      });
    }

    const clearAllBtn = document.getElementById('btn-clear-all-notifs');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        AppStorage.saveNotifications([]);
        this.renderNotificationsList();
        this.showToast('Notification center cleared', 'info');
      });
    }
  },

  renderNotificationsList() {
    const list = AppStorage.getNotifications();
    const dropdownList = document.getElementById('dropdown-notif-list');
    const fullList = document.getElementById('notifications-full-list');
    const dotBadge = document.getElementById('top-notif-badge');
    const navBadge = document.getElementById('nav-notif-badge');

    const unreadCount = list.filter(n => n.unread).length;
    if (dotBadge) dotBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    if (navBadge) {
      navBadge.textContent = unreadCount;
      navBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    if (dropdownList) {
      dropdownList.innerHTML = list.slice(0, 4).map(n => `
        <li class="dropdown-item ${n.unread ? 'unread' : ''}">
          <strong>${n.title}</strong>
          <p style="color: #64748B; font-size: 0.75rem; margin: 2px 0;">${n.message}</p>
          <span style="font-size: 0.7rem; color: #94A3B8;">${n.time}</span>
        </li>
      `).join('');
    }

    if (fullList) {
      if (list.length === 0) {
        fullList.innerHTML = `<li class="p-4 text-center" style="color: #94A3B8;">No recent campus security notifications.</li>`;
      } else {
        fullList.innerHTML = list.map(n => `
          <li class="notif-row">
            <div class="notif-icon-circle">🔔</div>
            <div>
              <strong style="font-size: 0.95rem; color: #183153;">${n.title}</strong>
              <p style="font-size: 0.85rem; color: #64748B; margin: 0.2rem 0;">${n.message}</p>
              <span style="font-size: 0.75rem; color: #94A3B8;">${n.time}</span>
            </div>
          </li>
        `).join('');
      }
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }
};

function generateStandaloneSvgQr(payload) {
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  const size = 21;
  let rects = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isCorner1 = r < 7 && c < 7;
      const isCorner2 = r < 7 && c >= size - 7;
      const isCorner3 = r >= size - 7 && c < 7;
      let isBlack = false;

      if (isCorner1 || isCorner2 || isCorner3) {
        const lr = r < 7 ? r : r - (size - 7);
        const lc = c < 7 ? c : (c >= size - 7 ? c - (size - 7) : c);
        if (lr === 0 || lr === 6 || lc === 0 || lc === 6) isBlack = true;
        else if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) isBlack = true;
        else isBlack = false;
      } else {
        const val = Math.abs(Math.sin((r * size + c) + hash));
        isBlack = val > 0.45;
      }

      if (isBlack) {
        rects += `<rect x="${c * 8}" y="${r * 8}" width="8" height="8" fill="#183153"/>`;
      }
    }
  }
  return `<svg viewBox="0 0 ${size * 8} ${size * 8}" width="160" height="160" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}

document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});