/**
 * LPU CAMPUS NAVIGATION SYSTEM
 * Turn-by-turn guidance and dynamic vector route rendering across university avenues.
 */

const NavigationModule = {
  init() {
    this.setupEventListeners();
    this.renderNavigationMap('Main Gate 1', 15);
  },

  setupEventListeners() {
    const form = document.getElementById('route-planner-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const origin = document.getElementById('nav-origin').value;
        const dest = document.getElementById('nav-destination').value;
        this.calculateAndRenderRoute(origin, dest);
      });
    }
  },

  calculateAndRenderRoute(origin, destBlock) {
    const route = LPU_INITIAL_DATA.navigationRoutes[origin] || LPU_INITIAL_DATA.navigationRoutes['Main Gate 1'];

    document.getElementById('metric-dist').textContent = route.distance;
    document.getElementById('metric-time').textContent = route.time;

    const list = document.getElementById('directions-steps-list');
    list.innerHTML = '';
    route.steps.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step.replace('assigned parking bay', `Block ${destBlock} Parking Bay`);
      list.appendChild(li);
    });

    this.renderNavigationMap(origin, destBlock);
    window.App.showToast(`Optimal Route Calculated to Block ${destBlock}`, 'success');
  },

  renderNavigationMap(origin, destBlock) {
    const holder = document.getElementById('campus-map-svg-holder');
    if (!holder) return;

    holder.innerHTML = `
      <svg viewBox="0 0 700 440" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background: #F8FAFC;">
        <defs>
          <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="700" height="440" fill="url(#campusGrid)"/>

        <!-- Main Campus Avenues -->
        <path d="M 50 220 L 650 220" stroke="#CBD5E1" stroke-width="26" stroke-linecap="round"/>
        <path d="M 350 40 L 350 400" stroke="#CBD5E1" stroke-width="26" stroke-linecap="round"/>
        <path d="M 180 100 L 520 340" stroke="#E2E8F0" stroke-width="14" stroke-linecap="round"/>

        <!-- University Landmarks -->
        <rect x="80" y="80" width="100" height="70" rx="8" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2"/>
        <text x="130" y="120" font-size="11" font-weight="700" fill="#183153" text-anchor="middle">Gate 1 Plaza</text>

        <rect x="520" y="80" width="110" height="70" rx="8" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2"/>
        <text x="575" y="120" font-size="11" font-weight="700" fill="#183153" text-anchor="middle">Uni-Mall Central</text>

        <rect x="280" y="270" width="140" height="90" rx="8" fill="#183153" stroke="#0F1F35" stroke-width="2"/>
        <text x="350" y="315" font-size="13" font-weight="700" fill="#FFFFFF" text-anchor="middle">Block ${destBlock}</text>
        <text x="350" y="335" font-size="10" fill="#93C5FD" text-anchor="middle">PARKING ZONE</text>

        <!-- Route Path Line -->
        <path d="M 125 150 Q 180 220 350 220 L 350 270" fill="none" stroke="#2563EB" stroke-width="6" stroke-dasharray="8 6" stroke-linecap="round"/>

        <!-- Start Marker -->
        <circle cx="125" cy="150" r="10" fill="#16A34A" stroke="#FFFFFF" stroke-width="3"/>
        <text x="125" y="180" font-size="11" font-weight="700" fill="#16A34A" text-anchor="middle">${origin}</text>

        <!-- End Destination Marker -->
        <circle cx="350" cy="270" r="12" fill="#DC2626" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="350" cy="270" r="4" fill="#FFFFFF"/>
      </svg>
    `;
  }
};