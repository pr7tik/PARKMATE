/**
 * js/parking.js
 * LPU INTERACTIVE PARKING ENGINE: IoT Radar Grid, Architectural Floorplans with Gates & Drawer Controller.
 */

const ParkingModule = {
  currentBlock: 15,
  currentFilter: 'all',
  zoomLevel: 1,
  selectedSlot: null,

  init() {
    this.populateBlockDropdowns();
    this.renderDashboardOverview();
    this.renderFullBlocksGrid();
    this.renderGarageMap(this.currentBlock);
    this.setupEventListeners();
  },

  populateBlockDropdowns() {
    const regularSelects = [
      document.getElementById('map-block-selector'),
      document.getElementById('save-block-select'),
      document.getElementById('nav-destination'),
      document.getElementById('admin-block-select')
    ];

    regularSelects.forEach(select => {
      if (!select) return;
      select.innerHTML = '';
      if (typeof LPU_INITIAL_DATA !== 'undefined' && LPU_INITIAL_DATA.blocks) {
        LPU_INITIAL_DATA.blocks.forEach(b => {
          const opt = document.createElement('option');
          opt.value = b.number;
          const cleanName = b.name.split('(')[1] ? b.name.split('(')[1].replace(')', '') : b.name;
          opt.textContent = `Block ${b.number} - ${cleanName}`;
          select.appendChild(opt);
        });
      }
    });

    // Populate the "Find Parking" filter dropdown with default "All Blocks"
    const findParkingSelect = document.getElementById('find-parking-block-select');
    if (findParkingSelect && typeof LPU_INITIAL_DATA !== 'undefined' && LPU_INITIAL_DATA.blocks) {
      findParkingSelect.innerHTML = '<option value="all">All Blocks (15–35)</option>';
      LPU_INITIAL_DATA.blocks.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.number;
        const cleanName = b.name.split('(')[1] ? b.name.split('(')[1].replace(')', '') : b.name;
        opt.textContent = `Block ${b.number} - ${cleanName}`;
        findParkingSelect.appendChild(opt);
      });
    }
  },

  getBlockMetrics(blockNum) {
    const allSlots = (typeof AppStorage !== 'undefined' && AppStorage.getSlots) ? AppStorage.getSlots() : [];
    const blockSlots = allSlots.filter(s => s.block === parseInt(blockNum));
    const total = blockSlots.length || 1;
    const available = blockSlots.filter(s => s.status === 'available').length;
    const occupied = blockSlots.filter(s => s.status === 'occupied').length;
    const reserved = blockSlots.filter(s => s.status === 'reserved').length;
    const pct = Math.round((available / total) * 100);

    return { total, available, occupied, reserved, pct, slots: blockSlots };
  },

  renderDashboardOverview() {
    const container = document.getElementById('dash-blocks-overview');
    if (!container || typeof LPU_INITIAL_DATA === 'undefined') return;
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

  renderFullBlocksGrid(filterText = '', sortBy = 'number-asc', selectedBlock = 'all') {
    const container = document.getElementById('full-blocks-grid');
    if (!container || typeof LPU_INITIAL_DATA === 'undefined') return;
    container.innerHTML = '';

    // Auto-detect selectedBlock if not explicitly passed
    if (selectedBlock === 'all') {
      const dropdown = document.getElementById('find-parking-block-select');
      if (dropdown && dropdown.value) selectedBlock = dropdown.value;
    }

    let blocks = LPU_INITIAL_DATA.blocks.filter(b => {
      const q = filterText.toLowerCase();
      const matchesSearch = b.number.toString().includes(q) || b.name.toLowerCase().includes(q);
      const matchesBlock = (selectedBlock === 'all' || !selectedBlock) ? true : b.number === parseInt(selectedBlock);
      return matchesSearch && matchesBlock;
    });

    if (sortBy === 'avail-desc') {
      blocks.sort((a, b) => this.getBlockMetrics(b.number).pct - this.getBlockMetrics(a.number).pct);
    } else if (sortBy === 'avail-asc') {
      blocks.sort((a, b) => this.getBlockMetrics(a.number).pct - this.getBlockMetrics(b.number).pct);
    } else {
      blocks.sort((a, b) => a.number - b.number);
    }

    if (blocks.length === 0) {
      container.innerHTML = `<div class="empty-state-box col-span-3"><p style="color: #64748B;">No parking blocks match your selection.</p></div>`;
      return;
    }

    blocks.forEach(b => {
      const m = this.getBlockMetrics(b.number);

      let pulseColor = 'green';
      let statusLabel = `${m.available} Free Bays`;
      let barColor = '#16A34A';

      if (m.pct < 30) {
        pulseColor = 'red';
        statusLabel = 'Filling Fast';
        barColor = '#DC2626';
      } else if (m.pct < 70) {
        pulseColor = 'amber';
        statusLabel = 'Moderate';
        barColor = '#D97706';
      }

      const radarBaysHtml = m.slots.slice(0, 16).map(s => {
        let state = 'avail';
        if (s.status === 'occupied') state = 'occ';
        else if (s.status === 'reserved') state = 'res';
        return `<span class="radar-bay ${state}" title="${s.slotId}: ${s.status}"></span>`;
      }).join('');

      const isEv = b.zones && b.zones.some(z => z.toLowerCase().includes('ev'));
      const tagsHtml = `
        <span class="feat-tag">🏢 ${(b.zones || []).join(' • ')}</span>
        ${isEv ? '<span class="feat-tag ev">⚡ EV Fast Charge</span>' : ''}
        <span class="feat-tag">🛵 2W / 🚗 4W</span>
      `;

      const cleanDeptName = b.name.includes('(')
        ? b.name.substring(b.name.indexOf('(') + 1, b.name.lastIndexOf(')'))
        : b.name;

      const card = document.createElement('div');
      card.className = 'block-card';
      card.innerHTML = `
        <div class="block-card-header">
          <div class="block-id-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
              <line x1="9" y1="22" x2="9" y2="22.01"></line>
              <line x1="15" y1="22" x2="15" y2="22.01"></line>
              <line x1="9" y1="6" x2="9" y2="6.01"></line>
              <line x1="15" y1="6" x2="15" y2="6.01"></line>
              <line x1="9" y1="10" x2="9" y2="10.01"></line>
              <line x1="15" y1="10" x2="15" y2="10.01"></line>
              <line x1="9" y1="14" x2="9" y2="14.01"></line>
              <line x1="15" y1="14" x2="15" y2="14.01"></line>
            </svg>
            <span>BLOCK ${b.number}</span>
          </div>
          <div class="live-pulse-badge ${pulseColor}">
            <span class="pulse-dot"></span>
            <span>${statusLabel}</span>
          </div>
        </div>

        <h3 class="block-dept-title">${cleanDeptName}</h3>

        <div class="mini-radar-surface">
          <div class="mini-radar-top">
            <span>Live Radar Matrix</span>
            <span>${m.available}/${m.total} Open</span>
          </div>
          <div class="mini-slot-grid-preview">
            ${radarBaysHtml}
          </div>
        </div>

        <div class="block-capsules-row">
          <div class="stat-capsule">
            <span class="capsule-lbl">Available</span>
            <span class="capsule-val green">${m.available}</span>
          </div>
          <div class="stat-capsule">
            <span class="capsule-lbl">Occupied</span>
            <span class="capsule-val slate">${m.occupied}</span>
          </div>
          <div class="stat-capsule">
            <span class="capsule-lbl">Capacity</span>
            <span class="capsule-val muted">${m.total}</span>
          </div>
        </div>

        <div class="block-progress-wrap">
          <div class="block-progress-bg">
            <div class="block-progress-fill" style="width: ${m.pct}%; background: ${barColor};"></div>
          </div>
        </div>

        <div class="block-features-wrap">
          ${tagsHtml}
        </div>

        <div class="card-action-bar">
          <span>Enter Lot Floorplan</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
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

    if (window.App && typeof window.App.switchView === 'function') {
      window.App.switchView('map');
    }
    this.renderGarageMap(this.currentBlock);
  },

  renderGarageMap(blockNumber) {
    const canvas = document.getElementById('garage-canvas');
    const title = document.getElementById('map-lot-title');
    const subtitle = document.getElementById('map-lot-sub');
    if (!canvas) return;

    const blockObj = (typeof LPU_INITIAL_DATA !== 'undefined' && LPU_INITIAL_DATA.blocks)
      ? LPU_INITIAL_DATA.blocks.find(b => b.number === parseInt(blockNumber)) || LPU_INITIAL_DATA.blocks[0]
      : { number: blockNumber, name: `Block ${blockNumber}`, zones: ['Zone A', 'Zone B', 'EV Lane'] };

    if (title) title.textContent = `Block ${blockObj.number} Designated Parking Bay`;
    if (subtitle) subtitle.textContent = `${blockObj.name} • Zones: ${(blockObj.zones || []).join(' | ')}`;

    const allSlots = (typeof AppStorage !== 'undefined' && AppStorage.getSlots)
      ? AppStorage.getSlots().filter(s => s.block === parseInt(blockNumber))
      : [];

    let visibleSlots = allSlots;
    if (this.currentFilter === 'available') visibleSlots = allSlots.filter(s => s.status === 'available');
    else if (this.currentFilter === 'occupied') visibleSlots = allSlots.filter(s => s.status === 'occupied');
    else if (this.currentFilter === 'reserved') visibleSlots = allSlots.filter(s => s.status === 'reserved');
    else if (this.currentFilter === '4w') visibleSlots = allSlots.filter(s => s.vehicleType === '4w');
    else if (this.currentFilter === '2w') visibleSlots = allSlots.filter(s => s.vehicleType === '2w');

    const mid = Math.ceil(allSlots.length / 2);
    const northSlots = allSlots.slice(0, mid);
    const southSlots = allSlots.slice(mid);

    const northRow1 = northSlots.slice(0, 8);
    const northRow2 = northSlots.slice(8);
    const southRow1 = southSlots.slice(0, 8);
    const southRow2 = southSlots.slice(8);

    const renderStall = (s) => {
      const isFilteredOut = !visibleSlots.some(v => v.slotId === s.slotId);
      const opacityStyle = isFilteredOut ? 'opacity: 0.15; pointer-events: none;' : '';
      
      let statusClass = 'stall-available';
      let statusLabel = 'Available';
      let dotColor = '#22C55E';

      if (s.status === 'occupied') {
        statusClass = 'stall-occupied';
        statusLabel = 'Occupied';
        dotColor = '#EF4444';
      } else if (s.status === 'reserved') {
        statusClass = 'stall-reserved';
        statusLabel = 'Reserved';
        dotColor = '#F59E0B';
      }

      const isEv = (s.zone && s.zone.toLowerCase().includes('ev')) || s.slotId.endsWith('-P001');
      const is2w = s.vehicleType === '2w';

      return `
        <div class="lot-stall ${statusClass} ${isEv ? 'is-ev-stall' : ''} ${is2w ? 'is-2w-stall' : ''}" 
             data-slot-id="${s.slotId}" 
             style="${opacityStyle}">
          <div class="stall-tire-stopper"></div>
          <div class="stall-content">
            <div class="stall-id-tag">${s.slotId}</div>
            <div class="stall-type-badge">
              ${isEv ? '⚡ EV Fast' : (is2w ? '🛵 2-Wheeler' : '🚗 4-Wheeler')}
            </div>
            <div class="stall-status-indicator">
              <span class="status-dot-mini" style="background:${dotColor}"></span>
              <span class="status-text-mini">${statusLabel}</span>
            </div>
          </div>
          <div class="stall-entry-line"></div>
        </div>
      `;
    };

    const northAvail = northSlots.filter(s => s.status === 'available').length;
    const southAvail = southSlots.filter(s => s.status === 'available').length;

    canvas.innerHTML = `
      <div class="lot-compound-container">
        <!-- GATE 1 ENTRY -->
        <div class="gate-portal gate-entry">
          <div class="gate-booth-roof">
            <div class="gate-led-status pulsing-green"></div>
            <div class="gate-sign-main">GATE 1</div>
            <div class="gate-sign-sub">CAMPUS INGRESS</div>
          </div>
          <div class="gate-barrier-mechanism">
            <div class="barrier-post"></div>
            <div class="barrier-arm-entry"></div>
          </div>
          <div class="entry-road-approach">
            <div class="approach-arrow">➔</div>
            <span class="approach-label">IN</span>
          </div>
          <div class="anpr-sensor-pill">ANPR CAMERA</div>
        </div>

        <!-- MAIN YARD -->
        <div class="lot-asphalt-yard">
          <div class="compound-curb-edge curb-top"></div>

          <!-- NORTH BAY -->
          <div class="bay-block-section north-bay">
            <div class="bay-title-stripe">
              <div class="bay-label-group">
                <span class="bay-pill">ZONE A</span>
                <span class="bay-heading-text">NORTH BAY (ACADEMIC &amp; FACULTY QUAD)</span>
              </div>
              <span class="bay-metric-badge">${northAvail} / ${northSlots.length} BAYS AVAILABLE</span>
            </div>

            <div class="stall-grid-row grid-cols-8">
              ${northRow1.map(renderStall).join('')}
            </div>

            ${northRow2.length > 0 ? `
              <div class="stall-grid-row grid-cols-secondary">
                ${northRow2.map(renderStall).join('')}
              </div>
            ` : ''}
          </div>

          <!-- CENTRAL AISLE -->
          <div class="central-driving-aisle">
            <div class="zebra-crossing crossing-start"></div>
            <div class="aisle-lane-markings">
              <div class="lane-flow west-bound">
                <span class="lane-dir-arrow">◀</span>
                <span class="lane-stencil">⬆ CAMPUS DRIVING AISLE • SPEED LIMIT 20 KM/H ⬇</span>
              </div>
              <div class="centerline-yellow-dashed"></div>
              <div class="lane-flow east-bound">
                <span class="lane-stencil">SLOW • PEDESTRIANS &amp; ELECTRIC RECHARGE ZONE</span>
                <span class="lane-dir-arrow">▶</span>
              </div>
            </div>
            <div class="zebra-crossing crossing-end"></div>
          </div>

          <!-- SOUTH BAY -->
          <div class="bay-block-section south-bay">
            <div class="stall-grid-row grid-cols-8">
              ${southRow1.map(renderStall).join('')}
            </div>

            ${southRow2.length > 0 ? `
              <div class="stall-grid-row grid-cols-secondary">
                ${southRow2.map(renderStall).join('')}
              </div>
            ` : ''}

            <div class="bay-title-stripe south-stripe">
              <div class="bay-label-group">
                <span class="bay-pill ev-pill">ZONE B / EV</span>
                <span class="bay-heading-text">SOUTH BAY (STUDENT &amp; EV CHARGE LANES)</span>
              </div>
              <span class="bay-metric-badge">${southAvail} / ${southSlots.length} BAYS AVAILABLE</span>
            </div>
          </div>

          <div class="compound-curb-edge curb-bottom"></div>
        </div>

        <!-- GATE 2 EXIT -->
        <div class="gate-portal gate-exit">
          <div class="gate-booth-roof">
            <div class="gate-led-status pulsing-green"></div>
            <div class="gate-sign-main">GATE 2</div>
            <div class="gate-sign-sub">RING ROAD OUT</div>
          </div>
          <div class="gate-barrier-mechanism">
            <div class="barrier-arm-exit"></div>
            <div class="barrier-post"></div>
          </div>
          <div class="entry-road-approach">
            <div class="approach-arrow">➔</div>
            <span class="approach-label">OUT</span>
          </div>
          <div class="anpr-sensor-pill">AUTO EXIT</div>
        </div>
      </div>
    `;

    canvas.querySelectorAll('.lot-stall').forEach(el => {
      el.addEventListener('click', () => {
        const slotId = el.getAttribute('data-slot-id');
        this.openSlotDrawer(slotId);
      });
    });
  },

  openSlotDrawer(slotId) {
    const slots = (typeof AppStorage !== 'undefined' && AppStorage.getSlots) ? AppStorage.getSlots() : [];
    const slot = slots.find(s => s.slotId === slotId);
    if (!slot) return;

    this.selectedSlot = slot;

    const drawer = document.getElementById('slot-detail-drawer');
    const badge = document.getElementById('drawer-slot-badge');
    const blockEl = document.getElementById('drawer-meta-block');
    const zoneEl = document.getElementById('drawer-meta-zone');
    const compatEl = document.getElementById('drawer-meta-compat');
    const statusEl = document.getElementById('drawer-meta-status');
    const formWrap = document.getElementById('drawer-booking-form-wrap');
    const occupiedMsg = document.getElementById('drawer-occupied-msg');

    if (drawer) drawer.classList.remove('hidden');

    if (badge) badge.textContent = slot.slotId;
    if (blockEl) blockEl.textContent = `Block ${slot.block}`;
    if (zoneEl) zoneEl.textContent = slot.zone || 'Zone A';
    if (compatEl) compatEl.textContent = slot.vehicleType === '2w' ? 'Two-Wheeler (Motorbike/Scooter)' : 'Four-Wheeler / EV';

    if (slot.status === 'available') {
      if (statusEl) {
        statusEl.innerHTML = `<span class="status-pill status-avail" style="background:#DCFCE7; color:#16A34A; padding:3px 10px; border-radius:12px; font-weight:700;">Available Now</span>`;
      }
      if (occupiedMsg) occupiedMsg.classList.add('hidden');
      if (formWrap) formWrap.classList.remove('hidden');

      const dateInput = document.getElementById('book-date');
      if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.min = today;
      }

      const timeInput = document.getElementById('book-time');
      if (timeInput && !timeInput.value) {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hh}:${mm}`;
      }

      const vehSelect = document.getElementById('book-vehicle-select');
      if (vehSelect) {
        vehSelect.innerHTML = '';
        const userVehicles = (typeof AppStorage !== 'undefined' && AppStorage.getVehicles)
          ? AppStorage.getVehicles()
          : [];

        if (userVehicles && userVehicles.length > 0) {
          userVehicles.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.regNumber;
            opt.textContent = `${v.regNumber} (${v.model || (v.type === '2w' ? 'Bike' : 'Car')})`;
            vehSelect.appendChild(opt);
          });
        } else {
          const opt = document.createElement('option');
          opt.value = 'PB 08 XX 0000';
          opt.textContent = 'PB 08 XX 0000 (Default Campus Pass)';
          vehSelect.appendChild(opt);
        }
      }

      if (window.BookingModule && typeof window.BookingModule.prepareBookingDrawer === 'function') {
        try {
          window.BookingModule.prepareBookingDrawer(slot);
        } catch (e) {
          console.warn('BookingModule.prepareBookingDrawer warning (handled safely):', e);
        }
      }
    } else {
      if (statusEl) {
        const pillBg = slot.status === 'occupied' ? '#FEE2E2' : '#FEF3C7';
        const pillColor = slot.status === 'occupied' ? '#DC2626' : '#D97706';
        statusEl.innerHTML = `<span class="status-pill ${slot.status === 'occupied' ? 'status-occ' : 'status-res'}" style="background:${pillBg}; color:${pillColor}; padding:3px 10px; border-radius:12px; font-weight:700;">${slot.status.toUpperCase()}</span>`;
      }
      if (formWrap) formWrap.classList.add('hidden');
      if (occupiedMsg) occupiedMsg.classList.remove('hidden');
    }
  },

  handleBookingSubmit() {
    if (!this.selectedSlot) return;

    const dateVal = document.getElementById('book-date')?.value || new Date().toISOString().split('T')[0];
    const timeVal = document.getElementById('book-time')?.value || '10:00';
    const durVal = document.getElementById('book-duration')?.value || '2';
    const vehVal = document.getElementById('book-vehicle-select')?.value || 'PB 08 XX 0000';

    const bookingId = `LPU-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      id: bookingId,
      bookingId: bookingId,
      slotId: this.selectedSlot.slotId,
      block: this.selectedSlot.block,
      zone: this.selectedSlot.zone || 'Zone A',
      date: dateVal,
      arrivalTime: timeVal,
      duration: `${durVal} Hours`,
      vehicle: vehVal,
      userId: (window.App && window.App.currentUser) ? window.App.currentUser : '12629947',
      status: 'active'
    };

    if (typeof AppStorage !== 'undefined') {
      const allSlots = AppStorage.getSlots();
      const s = allSlots.find(item => item.slotId === this.selectedSlot.slotId);
      if (s) {
        s.status = 'occupied';
        AppStorage.saveSlots(allSlots);
      }

      const allBookings = AppStorage.getBookings ? AppStorage.getBookings() : [];
      allBookings.unshift(newBooking);
      if (AppStorage.saveBookings) AppStorage.saveBookings(allBookings);
    }

    if (window.App && typeof window.App.showToast === 'function') {
      window.App.showToast(`Gate Pass Confirmed for Slot ${this.selectedSlot.slotId}!`, 'success');
      window.App.updateDashboardKpis();
    }

    this.closeSlotDrawer();
    this.renderGarageMap(this.currentBlock);
    this.renderFullBlocksGrid();
    this.renderDashboardOverview();

    const qrModal = document.getElementById('modal-qr');
    const detailsBox = document.getElementById('modal-pass-details');
    const qrCanvas = document.getElementById('qr-code-canvas-holder');

    if (qrModal) {
      if (detailsBox) {
        detailsBox.innerHTML = `
          <div style="font-size:0.85rem; margin-top:0.75rem; color:#183153; line-height:1.6;">
            <strong>Booking Ref:</strong> ${bookingId}<br>
            <strong>Bay Slot:</strong> ${newBooking.slotId} (Block ${newBooking.block})<br>
            <strong>Date & Time:</strong> ${dateVal} • ${timeVal}<br>
            <strong>Vehicle:</strong> ${vehVal}
          </div>
        `;
      }
      if (qrCanvas && typeof generateStandaloneSvgQr === 'function') {
        qrCanvas.innerHTML = generateStandaloneSvgQr(bookingId);
      }
      qrModal.classList.remove('hidden');
    }
  },

  closeSlotDrawer() {
    const drawer = document.getElementById('slot-detail-drawer');
    if (drawer) drawer.classList.add('hidden');
    this.selectedSlot = null;
  },

  setupEventListeners() {
    const selector = document.getElementById('map-block-selector');
    if (selector) {
      selector.addEventListener('change', (e) => {
        this.currentBlock = parseInt(e.target.value);
        this.renderGarageMap(this.currentBlock);
      });
    }

    // Filter by block in "Find Parking" page
    const findBlockSelect = document.getElementById('find-parking-block-select');
    const blockFilterInput = document.getElementById('block-filter-input');
    const blockSortSelect = document.getElementById('block-sort-select');

    const triggerFindParkingFilter = () => {
      const searchVal = blockFilterInput ? blockFilterInput.value : '';
      const sortVal = blockSortSelect ? blockSortSelect.value : 'number-asc';
      const blockVal = findBlockSelect ? findBlockSelect.value : 'all';
      this.renderFullBlocksGrid(searchVal, sortVal, blockVal);
    };

    if (findBlockSelect) {
      findBlockSelect.addEventListener('change', triggerFindParkingFilter);
    }

    if (blockFilterInput) {
      blockFilterInput.addEventListener('input', triggerFindParkingFilter);
    }

    if (blockSortSelect) {
      blockSortSelect.addEventListener('change', triggerFindParkingFilter);
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

    const proceedBtn = document.getElementById('btn-proceed-booking');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        this.handleBookingSubmit();
      });
    }
  }
};