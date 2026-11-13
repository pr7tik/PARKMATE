/**
 * LPU RESERVATION MODULE
 * Multi-tab scheduling flow, QR gate access verification, and booking management.
 */

const BookingModule = {
  currentSlot: null,
  activeTab: 'all',

  init() {
    this.renderMyBookings();
    this.setupEventListeners();
  },

  prepareBookingDrawer(slot) {
    this.currentSlot = slot;
    const dateInput = document.getElementById('book-date');
    const timeInput = document.getElementById('book-time');
    const vehSelect = document.getElementById('book-vehicle-select');

    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;

    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    timeInput.value = now.toTimeString().slice(0, 5);

    const vehicles = AppStorage.getVehicles();
    vehSelect.innerHTML = '';
    vehicles.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.regNumber;
      opt.textContent = `${v.regNumber} (${v.type === '2w' ? '2-Wheeler' : '4-Wheeler'})`;
      vehSelect.appendChild(opt);
    });

    if (vehicles.length === 0) {
      const opt = document.createElement('option');
      opt.value = 'PB 08 LPU 0001';
      opt.textContent = 'PB 08 LPU 0001 (Temporary Pass)';
      vehSelect.appendChild(opt);
    }
  },

  setupEventListeners() {
    const proceedBtn = document.getElementById('btn-proceed-booking');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        this.handleProceedToBookingNewTab();
      });
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.getAttribute('data-tab');
        this.renderMyBookings();
      });
    });

    const confirmCancelBtn = document.getElementById('btn-confirm-cancel-booking');
    if (confirmCancelBtn) {
      confirmCancelBtn.addEventListener('click', () => {
        const bookingId = confirmCancelBtn.getAttribute('data-target-booking');
        this.executeCancelBooking(bookingId);
      });
    }
  },

  handleProceedToBookingNewTab() {
    if (!this.currentSlot) return;

    const dateVal = document.getElementById('book-date').value;
    const timeVal = document.getElementById('book-time').value;
    const durationVal = document.getElementById('book-duration').value;
    const vehRegVal = document.getElementById('book-vehicle-select').value;

    if (!dateVal || !timeVal) {
      window.App.showToast('Please select reservation date and arrival time', 'error');
      return;
    }

    const [hrs, mins] = timeVal.split(':').map(Number);
    const depDate = new Date();
    depDate.setHours(hrs + parseInt(durationVal), mins);
    const departureTimeStr = depDate.toTimeString().slice(0, 5);

    const pendingData = {
      block: this.currentSlot.block,
      slotId: this.currentSlot.slotId,
      zone: this.currentSlot.zone,
      vehicleType: this.currentSlot.vehicleType,
      date: dateVal,
      arrivalTime: timeVal,
      departureTime: departureTimeStr,
      duration: durationVal,
      vehicleReg: vehRegVal
    };

    localStorage.setItem(AppStorage.KEYS.PENDING, JSON.stringify(pendingData));
    ParkingModule.closeSlotDrawer();

    window.open('booking-confirmation.html', '_blank');
    window.App.showToast('Opening official booking verification in a new window...', 'success');
  },

  renderMyBookings() {
    const container = document.getElementById('bookings-list');
    if (!container) return;
    container.innerHTML = '';

    const allBookings = AppStorage.getBookings();
    const activeCount = allBookings.filter(b => b.status === 'active').length;
    const cancelledCount = allBookings.filter(b => b.status === 'cancelled').length;

    const countTabAll = document.getElementById('count-tab-all');
    const countTabActive = document.getElementById('count-tab-active');
    const countTabUpcoming = document.getElementById('count-tab-upcoming');
    const countTabCancelled = document.getElementById('count-tab-cancelled');

    if (countTabAll) countTabAll.textContent = allBookings.length;
    if (countTabActive) countTabActive.textContent = activeCount;
    if (countTabUpcoming) countTabUpcoming.textContent = activeCount;
    if (countTabCancelled) countTabCancelled.textContent = cancelledCount;

    let filtered = allBookings;
    if (this.activeTab === 'active' || this.activeTab === 'upcoming') {
      filtered = allBookings.filter(b => b.status === 'active');
    } else if (this.activeTab === 'cancelled') {
      filtered = allBookings.filter(b => b.status === 'cancelled');
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box col-span-3">
          <div class="empty-icon">🎟️</div>
          <h4>No Bookings Found</h4>
          <p>You have no ${this.activeTab} parking permits registered under your University ID.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(b => {
      const card = document.createElement('div');
      card.className = 'booking-card';

      const isActive = b.status === 'active';
      const statusBadge = isActive
        ? `<span class="status-pill status-avail">CONFIRMED PASS</span>`
        : `<span class="status-pill status-occ">CANCELLED</span>`;

      card.innerHTML = `
        <div class="booking-card-header">
          <span class="booking-id-tag">#${b.id}</span>
          ${statusBadge}
        </div>
        <div class="booking-card-body">
          <div class="meta-item">
            <span class="meta-label">Campus Block</span>
            <span class="meta-val">Block ${b.block}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Bay Slot</span>
            <span class="meta-val" style="color: #2563EB;">${b.slotId}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Date &amp; Time</span>
            <span class="meta-val">${b.date} • ${b.arrivalTime}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Vehicle</span>
            <span class="meta-val">${b.vehicleReg}</span>
          </div>
        </div>
        <div class="booking-card-actions">
          <button class="btn btn-sm btn-outline flex-1 btn-view-pass" data-id="${b.id}">
            Gate QR Pass
          </button>
          ${isActive ? `
            <button class="btn btn-sm btn-outline text-red btn-trigger-cancel" data-id="${b.id}">
              Cancel Pass
            </button>
          ` : ''}
        </div>
      `;

      container.appendChild(card);
    });

    container.querySelectorAll('.btn-view-pass').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openGatePassModal(id);
      });
    });

    container.querySelectorAll('.btn-trigger-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openCancelConfirmModal(id);
      });
    });
  },

  openGatePassModal(bookingId) {
    const booking = AppStorage.getBookings().find(b => b.id === bookingId);
    if (!booking) return;

    const modal = document.getElementById('modal-qr');
    const qrHolder = document.getElementById('qr-code-canvas-holder');
    const details = document.getElementById('modal-pass-details');

    qrHolder.innerHTML = generateStandaloneSvgQr(`LPU-PARK:${booking.id}:${booking.slotId}:${booking.vehicleReg}`);
    details.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
        <span>Pass ID:</span> <strong>#${booking.id}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
        <span>Reserved Bay:</span> <strong>${booking.slotId} (Block ${booking.block})</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
        <span>Registered Vehicle:</span> <strong>${booking.vehicleReg}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Permit Window:</span> <strong>${booking.date} • ${booking.arrivalTime} - ${booking.departureTime}</strong>
      </div>
    `;

    modal.classList.remove('hidden');
  },

  openCancelConfirmModal(bookingId) {
    const modal = document.getElementById('modal-cancel');
    const idLabel = document.getElementById('cancel-modal-booking-id');
    const confirmBtn = document.getElementById('btn-confirm-cancel-booking');

    idLabel.textContent = '#' + bookingId;
    confirmBtn.setAttribute('data-target-booking', bookingId);
    modal.classList.remove('hidden');
  },

  executeCancelBooking(bookingId) {
    const bookings = AppStorage.getBookings();
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return;

    target.status = 'cancelled';
    AppStorage.saveBookings(bookings);

    AppStorage.updateSlotStatus(target.slotId, 'available');

    AppStorage.addNotification({
      title: `Booking Cancelled: ${target.slotId}`,
      message: `Your reservation #${target.id} at Block ${target.block} was revoked. Slot is released back to campus pool.`,
      type: 'warning'
    });

    document.getElementById('modal-cancel').classList.add('hidden');
    window.App.showToast(`Pass #${bookingId} has been revoked`, 'info');

    this.renderMyBookings();
    ParkingModule.renderGarageMap(ParkingModule.currentBlock);
    ParkingModule.renderDashboardOverview();
    ParkingModule.renderFullBlocksGrid();
    window.App.updateDashboardKpis();
  }
};