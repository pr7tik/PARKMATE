/**
 * LPU CAMPUS MOBILITY INFRASTRUCTURE
 * Master Configuration: Academic Blocks 15–35, Parking Bays, Official University Records.
 */

const LPU_INITIAL_DATA = {
  university: 'Lovely Professional University',
  campus: 'Phagwara, Punjab, India',

  // University Academic Blocks 15 through 35
  blocks: [
    { number: 15, name: 'Block 15 (School of Computer Science & Engineering)', zones: ['Zone A', 'Zone B', 'EV Lane'], totalSlots: 24 },
    { number: 16, name: 'Block 16 (Mittal School of Business)', zones: ['Zone A', 'Zone B'], totalSlots: 20 },
    { number: 17, name: 'Block 17 (School of Architecture & Design)', zones: ['Zone A'], totalSlots: 16 },
    { number: 18, name: 'Block 18 (School of Fashion Design)', zones: ['Zone A', 'Zone B'], totalSlots: 20 },
    { number: 19, name: 'Block 19 (School of Law)', zones: ['Zone A', 'Zone B'], totalSlots: 22 },
    { number: 20, name: 'Block 20 (School of Agriculture)', zones: ['Zone A', 'Zone B'], totalSlots: 20 },
    { number: 21, name: 'Block 21 (Polytechnic & Central Workshop)', zones: ['Zone A'], totalSlots: 16 },
    { number: 22, name: 'Block 22 (School of Mechanical Engineering)', zones: ['Zone A', 'Zone B'], totalSlots: 24 },
    { number: 23, name: 'Block 23 (School of Civil Engineering)', zones: ['Zone A'], totalSlots: 16 },
    { number: 24, name: 'Block 24 (School of Electronics & Electrical)', zones: ['Zone A', 'Zone B'], totalSlots: 20 },
    { number: 25, name: 'Block 25 (School of Bio-Engineering & Biosciences)', zones: ['Zone A', 'Zone B', 'EV Lane'], totalSlots: 24 },
    { number: 26, name: 'Block 26 (School of Education)', zones: ['Zone A'], totalSlots: 16 },
    { number: 27, name: 'Block 27 (School of Pharmaceutical Sciences)', zones: ['Zone A', 'Zone B'], totalSlots: 20 },
    { number: 28, name: 'Block 28 (School of Physiotherapy & Paramedical)', zones: ['Zone A'], totalSlots: 18 },
    { number: 29, name: 'Block 29 (School of Arts and Languages)', zones: ['Zone A', 'Zone B'], totalSlots: 20 },
    { number: 30, name: 'Block 30 (School of Hotel Management & Tourism)', zones: ['Zone A'], totalSlots: 16 },
    { number: 31, name: 'Block 31 (School of Allied Medical Sciences)', zones: ['Zone A', 'Zone B'], totalSlots: 20 },
    { number: 32, name: 'Block 32 (Examination & Research Directorate)', zones: ['Zone A', 'Zone B', 'Faculty Bay'], totalSlots: 24 },
    { number: 33, name: 'Block 33 (Division of Student Welfare & Cultural Affairs)', zones: ['Zone A', 'Zone B'], totalSlots: 22 },
    { number: 34, name: 'Block 34 (Central University Library & Learning Resource)', zones: ['Zone A', 'Zone B', 'Zone C'], totalSlots: 28 },
    { number: 35, name: 'Block 35 (Incubation, Research & Entrepreneurship Hub)', zones: ['Zone A', 'Zone B'], totalSlots: 20 }
  ],

  // Generates slots with realistic real-world occupancy ratios
  generateDefaultSlots() {
    const slots = [];
    this.blocks.forEach(block => {
      for (let i = 1; i <= block.totalSlots; i++) {
        const paddedNum = String(i).padStart(3, '0');
        const slotId = `B${block.number}-P${paddedNum}`;
        
        let vehicleType = '4w';
        let zone = 'Zone A';

        if (i > 16) zone = 'Zone B';
        if (i % 5 === 0) vehicleType = '2w';
        if (i === 1) zone = 'EV Fast Charge';

        let status = 'available';
        const seed = (block.number * 9 + i * 17) % 100;
        if (seed < 32) status = 'occupied';
        else if (seed < 44) status = 'reserved';

        slots.push({
          slotId,
          block: block.number,
          zone,
          vehicleType,
          status
        });
      }
    });
    return slots;
  },

  // Official Registered Student and Faculty Vehicles
  defaultVehicles: [
    { regNumber: 'PB 08 CC 4821', type: '4w', model: 'Honda City i-VTEC (White)' },
    { regNumber: 'PB 10 BY 1902', type: '2w', model: 'Royal Enfield Classic 350' },
    { regNumber: 'CH 01 BW 7714', type: '4w', model: 'Hyundai Creta SX' }
  ],

  // Realistic Initial System Bookings (Populates the Admin Table & User Records)
  defaultBookings: [
    {
      id: 'LPU-PRK-849102',
      userId: '12019482',
      block: 15,
      slotId: 'B15-P001',
      zone: 'EV Fast Charge',
      vehicleReg: 'PB 08 CC 4821',
      vehicleType: '4w',
      date: new Date().toISOString().split('T')[0],
      arrivalTime: '09:00',
      departureTime: '17:00',
      duration: '8',
      status: 'active',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'LPU-PRK-381944',
      userId: 'LPU_FACULTY_104',
      block: 15,
      slotId: 'B15-P008',
      zone: 'Zone A',
      vehicleReg: 'CH 01 BW 7714',
      vehicleType: '4w',
      date: new Date().toISOString().split('T')[0],
      arrivalTime: '08:30',
      departureTime: '16:30',
      duration: '8',
      status: 'active',
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'LPU-PRK-912048',
      userId: '11904321',
      block: 34,
      slotId: 'B34-P005',
      zone: 'Zone A',
      vehicleReg: 'PB 10 BY 1902',
      vehicleType: '2w',
      date: new Date().toISOString().split('T')[0],
      arrivalTime: '10:00',
      departureTime: '14:00',
      duration: '4',
      status: 'active',
      createdAt: new Date(Date.now() - 1800000).toISOString()
    }
  ],

  // Official Campus Notifications
  defaultNotifications: [
    { id: 'notif-1', title: 'Gate 1 ANPR Camera Active', message: 'Automated License Plate Readers are operational at Main Gate 1 (GT Road).', time: '10 mins ago', unread: true },
    { id: 'notif-2', title: 'Block 34 Central Library Availability', message: 'Zone B designated study parking bays are now open for academic hours.', time: '45 mins ago', unread: true },
    { id: 'notif-3', title: 'Campus Traffic Advisory', message: 'Strict speed limit of 20 km/h enforced across all academic ring roads.', time: '2 hours ago', unread: false }
  ],

  // Campus Navigation Routing
  navigationRoutes: {
    'Main Gate 1': { distance: '650 m', time: '8 mins walk', steps: ['Exit Gate 1 security onto Grand Campus Boulevard', 'Proceed past Uni-Mall towards the Academic Ring Road', 'Turn right at Block 22 roundabout', 'Arrive at assigned parking bay entrance'] },
    'Main Gate 2': { distance: '450 m', time: '6 mins walk', steps: ['Enter Gate 2 (Law Gate)', 'Proceed straight past Block 19 Law Lawn', 'Turn left toward Blocks 15–18 zone', 'Verify pass at automated barrier'] },
    'UniMall': { distance: '300 m', time: '4 mins walk', steps: ['Exit Uni-Mall North Plaza', 'Follow designated pedestrian pathway towards Block 25', 'Reach targeted parking lane barrier'] },
    'Shanti Devi Auditorium': { distance: '550 m', time: '7 mins walk', steps: ['Cross the Central Auditorium Quadrangle', 'Follow the perimeter avenue towards Block 32', 'Arrive at designated parking structure'] },
    'Central Library': { distance: '200 m', time: '3 mins walk', steps: ['From Block 34 entrance, proceed to the West bays', 'Locate the assigned slot on floor marking'] }
  }
};