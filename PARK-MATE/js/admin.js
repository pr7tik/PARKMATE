/**
 * LPU CAMPUS ADMIN & ESTATE MANAGEMENT
 * Real-time barrier control, slot override, and university-wide reservation ledger.
 */

const AdminModule = {
  selectedBlock: 15,

  init() {
    this.setupEventListeners();
  },

  renderAdminView() {
    this.renderSlotToggles(this.selectedBlock);
    this.renderReservationsTable();
  },

  setupEventListeners() {
    const blockSelect = document.getElementById('admin-block-select');
    if (blockSelect) {
      blockSelect.addEventListener('change', (e) => {
        this.selectedBlock = parseInt(e.target.value);
        this.renderSlotToggles(this.selectedBlock);
      });
    }

    const refreshBtn = document.getElementById('btn-admin-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.renderReservationsTable();
        window.App.showToast('Campus reservation ledger refreshed', 'info');
      });
    }
  },

  renderSlotToggles(blockNum) {
    const container = document.getElementById('admin-slots-table');
    if (!container) return;
    container.innerHTML = '';

    const blockSlots = AppStorage.getSlots().filter(s => s.block === parseInt(blockNum));

    blockSlots.forEach(slot => {
      const pill = document.createElement('div');
      let statusClass = 'avail';
      if (slot.status === 'occupied') statusClass = 'occ';
      else if (slot.status === 'reserved') statusClass = 'res';

      pill.className = `admin-slot-pill ${statusClass}`;
      pill.textContent = slot.slotId.replace(`B${blockNum}-`, '');
      pill.title = `Current status: ${slot.status.toUpperCase()} (Click to toggle)`;

      pill.addEventListener('click', () => {
        let nextStatus = 'occupied';
        if (slot.status === 'occupied') nextStatus = 'reserved';
        else if (slot.status === 'reserved') nextStatus = 'available';

        AppStorage.updateSlotStatus(slot.slotId, nextStatus);
        this.renderSlotToggles(blockNum);
        ParkingModule.renderDashboardOverview();
        ParkingModule.renderFullBlocksGrid();
        window.App.updateDashboardKpis();
        window.App.showToast(`Updated ${slot.slotId} to ${nextStatus.toUpperCase()}`, 'info');
      });

      container.appendChild(pill);
    });
  },

  renderReservationsTable() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const bookings = AppStorage.getBookings();

    if (bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 2rem; color: #94A3B8;">No active reservations recorded.</td></tr>`;
      return;
    }

    bookings.forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>#${b.id}</strong></td>
        <td>${b.userId}</td>
        <td>Block ${b.block}</td>
        <td>${b.slotId}</td>
        <td><span class="status-pill ${b.status === 'active' ? 'status-avail' : 'status-occ'}">${b.status.toUpperCase()}</span></td>
        <td>
          ${b.status === 'active' ? `<button class="btn btn-sm btn-outline text-red admin-cancel-btn" data-id="${b.id}">Revoke Permit</button>` : `<span style="color:#94A3B8; font-size:0.75rem;">Archived</span>`}
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.admin-cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        BookingModule.executeCancelBooking(id);
        this.renderReservationsTable();
      });
    });
  }
};