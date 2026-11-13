/**
 * LPU PARKING ENGINE
 * Interactive lot floorplans, bay allocation, and availability grids for Blocks 15–35.
 */

const ParkingModule = {
  currentBlock: 15,
  currentFilter: 'all',
  zoomLevel: 1,

  init() {
    this.populateBlockDropdowns();
    this.renderDashboardOverview();
    this.renderFullBlocksGrid();
    this.renderGarageMap(this.currentBlock);
    this.setupEventListeners();
  },

  populateBlockDropdowns() {
    const selects = [
      document.getElementById('map-block-selector'),
      document.getElementById('save-block-select'),
      document.getElementById('nav-destination'),
      document.getElementById('admin-block-select')
    ];

    selects.forEach(select => {
      if (!select) return;
      select.innerHTML = '';
      LPU_INITIAL_DATA.blocks.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.number;
        opt.textContent = `Block ${b.number} - ${b.name.split('(')[1] ? b.name.split('(')[1].replace(')', '') : ''}`;
        select.appendChild(opt);
      });
    });
  },

  getBlockMetrics(blockNum) {
    const allSlots = AppStorage.getSlots();
    const blockSlots = allSlots.filter(s => s.block === parseInt(blockNum));
    const total = blockSlots.length || 1;
    const available = blockSlots.filter(s => s.status === 'available').length;
    const occupied = blockSlots.filter(s => s.status === 'occupied').length;
    const reserved = blockSlots.filter(s => s.status === 'reserved').length;
    const pct = Math.round((available / total) * 100);

    return { total, available, occupied, reserved, pct };
  },

  renderDashboardOverview() {
    const container = document.getElementById('dash-blocks-overview');
    if (!container) return;
    container.innerHTML = '';

    LPU_INITIAL_DATA.blocks.slice(0, 10).forEach(b => {
      const m = this.getBlockMetrics(b.number);
      const card = document.createElement('div');
      card.className = 'mini-block-card';
      let colorClass = '#16A34A';
      if (m.pct < 30) colorClass = '#DC2626';
      else if (m.pct < 70) colorClass = '#D97706';

      card.innerHTML = `
        <div class="mini-block-name">Block ${b.number}</div>
        <div class="mini-block-pct" style="color: ${colorClass}">${m.available} Free</div>
        <div class="progress-bar-wrap">
          <div class="progress-fill" style="width: ${m.pct}%; background-color: ${colorClass};"></div>
        </div>
      `;
      card.addEventListener('click', () => {
        this.selectBlockAndShowMap(b.number);
      });
      container.appendChild(card);
    });
  },

  renderFullBlocksGrid(filterText = '') {
    const container = document.getElementById('full-blocks-grid');
    if (!container) return;
    container.innerHTML = '';

    const filtered = LPU_INITIAL_DATA.blocks.filter(b => {
      const q = filterText.toLowerCase();
      return b.number.toString().includes(q) || b.name.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state-box col-span-3"><p>No campus blocks matched "${filterText}".</p></div>`;
      return;
    }

    filtered.forEach(b => {
      const m = this.getBlockMetrics(b.number);
      let badgeClass = 'status-high';
      let badgeLabel = `${m.pct}% Available`;
      let barColor = '#16A34A';

      if (m.pct < 30) {
        badgeClass = 'status-low';
        badgeLabel = 'High Occupancy';
        barColor = '#DC2626';
      } else if (m.pct < 70) {
        badgeClass = 'status-med';
        badgeLabel = 'Moderate';
        barColor = '#D97706';
      }

      const card = document.createElement('div');
      card.className = 'block-card';
      card.innerHTML = `
        <div class="block-header-row">
          <h3 class="block-name">Block ${b.number}</h3>
          <span class="block-badge-status ${badgeClass}">${badgeLabel}</span>
        </div>
        <p style="font-size: 0.8rem; color: #64748B; margin-bottom: 0.75rem;">${b.name}</p>
        <div class="block-stats-row">
          <span>Available: <strong style="color: #16A34A;">${m.available}</strong></span>
          <span>Occupied: <strong>${m.occupied}</strong></span>
          <span>Total: <strong>${m.total}</strong></span>
        </div>
        <div class="block-progress-container">
          <div class="progress-fill" style="width: ${m.pct}%; background: ${barColor};"></div>
        </div>
        <div class="block-action-footer">
          <span>Zones: ${b.zones.join(', ')}</span>
          <span>Open Lot Map →</span>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectBlockAndShowMap(b.number);
      });
      container.appendChild(card);
    });
  },

  selectBlockAndShowMap(blockNumber) {
    this.currentBlock = parseInt(blockNumber);
    const selector = document.getElementById('map-block-selector');
    if (selector) selector.value = this.currentBlock;

    window.App.switchView('map');
    this.renderGarageMap(this.currentBlock);
  },

  renderGarageMap(blockNumber) {
    const canvas = document.getElementById('garage-canvas');
    const title = document.getElementById('map-lot-title');
    const subtitle = document.getElementById('map-lot-sub');
    if (!canvas) return;

    const blockObj = LPU_INITIAL_DATA.blocks.find(b => b.number === parseInt(blockNumber)) || LPU_INITIAL_DATA.blocks[0];
    if (title) title.textContent = `Block ${blockObj.number} Designated Parking Bay`;
    if (subtitle) subtitle.textContent = `${blockObj.name} • Zones: ${blockObj.zones.join(' | ')}`;

    const allSlots = AppStorage.getSlots().filter(s => s.block === parseInt(blockNumber));

    let visibleSlots = allSlots;
    if (this.currentFilter === 'available') visibleSlots = allSlots.filter(s => s.status === 'available');
    else if (this.currentFilter === 'occupied') visibleSlots = allSlots.filter(s => s.status === 'occupied');
    else if (this.currentFilter === 'reserved') visibleSlots = allSlots.filter(s => s.status === 'reserved');
    else if (this.currentFilter === '4w') visibleSlots = allSlots.filter(s => s.vehicleType === '4w');
    else if (this.currentFilter === '2w') visibleSlots = allSlots.filter(s => s.vehicleType === '2w');

    const mid = Math.ceil(allSlots.length / 2);
    const northSlots = allSlots.slice(0, mid);
    const southSlots = allSlots.slice(mid);

    const renderBay = (s) => {
      const isFilteredOut = !visibleSlots.some(v => v.slotId === s.slotId);
      const opacityStyle = isFilteredOut ? 'opacity: 0.2; pointer-events: none;' : '';
      let statusClass = 'status-avail';
      let statusLabel = 'Available';

      if (s.status === 'occupied') {
        statusClass = 'status-occ';
        statusLabel = 'Occupied';
      } else if (s.status === 'reserved') {
        statusClass = 'status-res';
        statusLabel = 'Reserved';
      }

      return `
        <div class="parking-bay ${statusClass}" data-slot-id="${s.slotId}" style="${opacityStyle}">
          <div class="bay-id">${s.slotId}</div>
          <div class="bay-type-icon">${s.vehicleType === '2w' ? '🛵 2-Wheeler' : '🚗 4-Wheeler'}</div>
          <div class="bay-status-label">${statusLabel}</div>
        </div>
      `;
    };

    canvas.innerHTML = `
      <div class="garage-layout">
        <div style="font-size: 0.75rem; color: #94A3B8; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
          NORTH BAY (ZONE A)
        </div>
        <div class="slots-row">
          ${northSlots.map(renderBay).join('')}
        </div>

        <div class="driving-lane">
          <span>⬆ CAMPUS DRIVING AISLE • SPEED LIMIT 20 KM/H ⬇</span>
        </div>

        <div style="font-size: 0.75rem; color: #94A3B8; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
          SOUTH BAY (ZONE B / EV)
        </div>
        <div class="slots-row">
          ${southSlots.map(renderBay).join('')}
        </div>
      </div>
    `;

    canvas.querySelectorAll('.parking-bay').forEach(el => {
      el.addEventListener('click', () => {
        const slotId = el.getAttribute('data-slot-id');
        this.openSlotDrawer(slotId);
      });
    });
  },

  openSlotDrawer(slotId) {
    const slots = AppStorage.getSlots();
    const slot = slots.find(s => s.slotId === slotId);
    if (!slot) return;

    const drawer = document.getElementById('slot-detail-drawer');
    const badge = document.getElementById('drawer-slot-badge');
    const blockEl = document.getElementById('drawer-meta-block');
    const zoneEl = document.getElementById('drawer-meta-zone');
    const compatEl = document.getElementById('drawer-meta-compat');
    const statusEl = document.getElementById('drawer-meta-status');
    const formWrap = document.getElementById('drawer-booking-form-wrap');
    const occupiedMsg = document.getElementById('drawer-occupied-msg');

    badge.textContent = slot.slotId;
    blockEl.textContent = `Block ${slot.block}`;
    zoneEl.textContent = slot.zone;
    compatEl.textContent = slot.vehicleType === '2w' ? 'Two-Wheeler (Motorbike/Scooter)' : 'Four-Wheeler / EV';

    if (slot.status === 'available') {
      statusEl.innerHTML = `<span class="status-pill status-avail">Available Now</span>`;
      formWrap.classList.remove('hidden');
      occupiedMsg.classList.add('hidden');
      window.BookingModule.prepareBookingDrawer(slot);
    } else {
      statusEl.innerHTML = `<span class="status-pill ${slot.status === 'occupied' ? 'status-occ' : 'status-res'}">${slot.status.toUpperCase()}</span>`;
      formWrap.classList.add('hidden');
      occupiedMsg.classList.remove('hidden');
    }

    drawer.classList.remove('hidden');
  },

  closeSlotDrawer() {
    const drawer = document.getElementById('slot-detail-drawer');
    if (drawer) drawer.classList.add('hidden');
  },

  setupEventListeners() {
    const selector = document.getElementById('map-block-selector');
    if (selector) {
      selector.addEventListener('change', (e) => {
        this.currentBlock = parseInt(e.target.value);
        this.renderGarageMap(this.currentBlock);
      });
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.getAttribute('data-filter');
        this.renderGarageMap(this.currentBlock);
      });
    });

    const zoomIn = document.getElementById('map-zoom-in');
    const zoomOut = document.getElementById('map-zoom-out');
    const zoomReset = document.getElementById('map-zoom-reset');
    const canvas = document.getElementById('garage-canvas');

    if (zoomIn && canvas) {
      zoomIn.addEventListener('click', () => {
        this.zoomLevel = Math.min(this.zoomLevel + 0.15, 1.6);
        canvas.style.transform = `scale(${this.zoomLevel})`;
      });
      zoomOut.addEventListener('click', () => {
        this.zoomLevel = Math.max(this.zoomLevel - 0.15, 0.7);
        canvas.style.transform = `scale(${this.zoomLevel})`;
      });
      zoomReset.addEventListener('click', () => {
        this.zoomLevel = 1;
        canvas.style.transform = 'scale(1)';
      });
    }

    const closeBtn = document.getElementById('btn-close-drawer');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeSlotDrawer());
    }

    const blockFilterInput = document.getElementById('block-filter-input');
    if (blockFilterInput) {
      blockFilterInput.addEventListener('input', (e) => {
        this.renderFullBlocksGrid(e.target.value);
      });
    }
  }
};