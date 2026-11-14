/**
 * ============================================================================
 * js/navigation.js
 * LPU 600-Acre Detailed Campus GIS Map & Turn-by-Turn Navigation Engine
 * - Pure Google Maps POI markers with hover radius animation (Fixed vanishing bug)
 * - Dynamic Hover-to-Inspect: Info drawer appears and updates instantly on hover
 * - Extensive inter-block pathways, brick-paver trails & organic layout
 * ============================================================================
 */

(function (global) {
  'use strict';

  const MAP_WIDTH = 2600;
  const MAP_HEIGHT = 1750;
  const METERS_PER_PIXEL = 0.72;

  // Google Maps Color Palette for POI Icons
  const CATEGORY_STYLES = {
    academic: {
      label: 'Academic Block',
      badgeBg: '#1A73E8', // Blue
      emoji: '🎓'
    },
    admin: {
      label: 'Admissions & Admin',
      badgeBg: '#7C3AED', // Purple
      emoji: '🏛️'
    },
    food: {
      label: 'Dining & Cafe',
      badgeBg: '#EA580C', // Food Orange
      emoji: '🍔'
    },
    hostel_boys: {
      label: 'Boys Hostel (BH)',
      badgeBg: '#0D9488', // Teal
      emoji: '🏢'
    },
    hostel_girls: {
      label: 'Girls Hostel (GH)',
      badgeBg: '#D81B60', // Rose Pink
      emoji: '🏬'
    },
    amenity: {
      label: 'Facility & Health',
      badgeBg: '#DC2626', // Red
      emoji: '🏥'
    },
    gate: {
      label: 'Campus Gate',
      badgeBg: '#15803D', // Green
      emoji: '🚧'
    }
  };

  // ============================================================================
  // COMPREHENSIVE LPU CAMPUS PLACES DATABASE (46 LOCATIONS)
  // ============================================================================
  const CAMPUS_PLACES = [
    // --- GATES ---
    {
      id: 'Main Gate 1',
      shortLabel: 'Main Gate 1',
      subLabel: 'GT Road NH-44',
      name: 'LPU Main Gate 1 (GT Road NH-44)',
      category: 'gate',
      filterGroup: 'gate',
      x: 1240,
      y: 90,
      w: 150,
      h: 55,
      icon: '🚧',
      zone: 'North GT Road Entry Plaza',
      hours: 'Open 24×7 (Security & ANPR Monitored)',
      nearestBlock: 30,
      desc: 'Primary ceremonial entrance off GT Road (NH-44) with automated boom barriers, security station, and visitor reception.',
      facilities: ['ANPR Boom Barrier', 'Visitor Pass Kiosk', 'Security Station', 'E-Rickshaw Hub']
    },
    {
      id: 'Main Gate 2',
      shortLabel: 'Gate 2',
      subLabel: 'Law Gate',
      name: 'LPU Gate 2 (Law Gate Plaza)',
      category: 'gate',
      filterGroup: 'gate',
      x: 360,
      y: 90,
      w: 145,
      h: 55,
      icon: '🚧',
      zone: 'North-West Law Gate Sector',
      hours: '06:00 AM – 11:00 PM',
      nearestBlock: 20,
      desc: 'Western entry gate connecting Law Gate commercial sector, student housing, and LPU School of Law.',
      facilities: ['Student Turnstiles', 'Two-Wheeler Fast Track', 'Auto Pickup']
    },
    {
      id: 'Gate 3',
      shortLabel: 'Gate 3',
      subLabel: 'Logistics Gate',
      name: 'LPU Gate 3 (East Logistics & Highway Gate)',
      category: 'gate',
      filterGroup: 'gate',
      x: 2180,
      y: 90,
      w: 145,
      h: 55,
      icon: '🚧',
      zone: 'North-East Logistics Sector',
      hours: '06:00 AM – 10:30 PM',
      nearestBlock: 15,
      desc: 'Eastern entrance for university transportation buses and heavy vehicle logistics.',
      facilities: ['Bus Terminal', 'Fleet Bay', '2W/4W Parking']
    },

    // --- NORTH-WEST ACADEMIC QUAD ---
    {
      id: 'Block 20',
      blockNum: 20,
      shortLabel: 'Block 20',
      subLabel: 'LPU School of Law',
      name: 'Block 20 - LPU School of Law',
      category: 'academic',
      filterGroup: 'academic',
      x: 330,
      y: 260,
      w: 145,
      h: 75,
      icon: '⚖️',
      zone: 'North-West Law Gate Sector',
      hours: '08:30 AM – 06:00 PM',
      nearestBlock: 20,
      desc: 'Houses Moot Court auditoriums, Legal Aid Clinic, and extensive judicial case archives.',
      facilities: ['2 Moot Courts', 'Legal Aid Clinic', 'Law Library', 'Dedicated Parking']
    },
    {
      id: 'Block 19',
      blockNum: 19,
      shortLabel: 'Block 19',
      subLabel: 'Mittal School of Business',
      name: 'Block 19 - Mittal School of Business',
      category: 'academic',
      filterGroup: 'academic',
      x: 640,
      y: 280,
      w: 150,
      h: 75,
      icon: '📊',
      zone: 'North-West Business Quad',
      hours: '08:30 AM – 06:30 PM',
      nearestBlock: 19,
      desc: 'ACBSP-accredited business school with executive lecture amphitheatres and live Bloomberg Finance Lab.',
      facilities: ['Bloomberg Terminal Lab', 'Executive Seminar Halls', 'VIP Faculty Parking']
    },
    {
      id: 'Block 21',
      blockNum: 21,
      shortLabel: 'Block 21',
      subLabel: 'Agriculture & Bio',
      name: 'Block 21 - School of Agriculture & Bio-Sciences',
      category: 'academic',
      filterGroup: 'academic',
      x: 310,
      y: 440,
      w: 145,
      h: 75,
      icon: '🌱',
      zone: 'West Research Enclave',
      hours: '08:30 AM – 06:00 PM',
      nearestBlock: 21,
      desc: 'Hydroponics greenhouse labs, soil chemistry testing, and botanical conservatory.',
      facilities: ['Tissue Culture Lab', 'Hydroponics Polyhouse', 'Botanical Conservatory']
    },
    {
      id: 'Block 22',
      blockNum: 22,
      shortLabel: 'Block 22',
      subLabel: 'Pharmaceutical Sciences',
      name: 'Block 22 - School of Pharmaceutical Sciences',
      category: 'academic',
      filterGroup: 'academic',
      x: 580,
      y: 460,
      w: 145,
      h: 75,
      icon: '💊',
      zone: 'West Health Science Wing',
      hours: '08:30 AM – 06:00 PM',
      nearestBlock: 22,
      desc: 'PCI-approved pharmaceutical research building with drug synthesis and cleanroom suites.',
      facilities: ['Drug Synthesis Lab', 'Pharmacology Chambers', 'Cleanroom Suites']
    },

    // --- CENTRAL CIVIC & WELCOME DISTRICT ---
    {
      id: 'Block 30',
      blockNum: 30,
      shortLabel: 'Block 30',
      subLabel: 'Division of Admissions',
      name: 'Block 30 - Division of Admissions & Visitor Center',
      category: 'admin',
      filterGroup: 'admin',
      x: 1090,
      y: 250,
      w: 165,
      h: 85,
      icon: '🏛️',
      zone: 'Central Administration Plaza (Grand Entrance)',
      hours: '08:30 AM – 07:00 PM (All 7 Days)',
      nearestBlock: 30,
      desc: 'Centralized university admissions, counseling hall, document verification desks, and campus visitor centre.',
      facilities: ['Central Admissions Hall', 'Document Verification Desk', 'Visitor VIP Lounge', 'Direct Parking']
    },
    {
      id: 'Block 25',
      blockNum: 25,
      shortLabel: 'Block 25',
      subLabel: 'Student Welfare (DSW)',
      name: 'Block 25 - Division of Student Welfare (DSW)',
      category: 'admin',
      filterGroup: 'admin',
      x: 1420,
      y: 260,
      w: 150,
      h: 75,
      icon: '🤝',
      zone: 'Central Administration Plaza',
      hours: '08:30 AM – 07:00 PM',
      nearestBlock: 25,
      desc: 'Student welfare headquarters, university club offices, cultural affairs, and counseling cell.',
      facilities: ['Student Welfare Helpdesk', 'Club Headquarters', 'Counseling Center']
    },
    {
      id: 'Shanti Devi Auditorium',
      shortLabel: 'Shanti Devi Audi',
      subLabel: 'Auditorium',
      name: 'Shanti Devi Mittal Auditorium',
      category: 'amenity',
      filterGroup: 'amenity',
      x: 1070,
      y: 430,
      w: 165,
      h: 80,
      icon: '🎭',
      zone: 'Central Cultural Avenue',
      hours: '08:30 AM – 09:30 PM',
      nearestBlock: 30,
      desc: 'Air-conditioned 2,500-seat theater auditorium host to convocations, global summits, and musical plays.',
      facilities: ['Acoustic Soundstage', 'VIP Greenrooms', 'VIP Parking']
    },
    {
      id: 'Unipolis',
      shortLabel: 'Unipolis Arena',
      subLabel: 'Mega Amphitheatre',
      name: 'Baldev Raj Mittal Unipolis (Mega Amphitheatre)',
      category: 'amenity',
      filterGroup: 'amenity',
      x: 1450,
      y: 440,
      w: 155,
      h: 85,
      icon: '🎪',
      zone: 'Central Cultural Avenue',
      hours: 'Open Ground (Events Based)',
      nearestBlock: 25,
      desc: 'Canopied open-air mega-arena accommodating over 15,000 students for concerts, fests, and exhibitions.',
      facilities: ['Covered Canopy', 'Concert Stage', 'Ring Road Access']
    },

    // --- NORTH-EAST ENGINEERING QUAD ---
    {
      id: 'Block 15',
      blockNum: 15,
      shortLabel: 'Block 15',
      subLabel: 'Computer Science (CSE)',
      name: 'Block 15 - School of Computer Science & Engineering',
      category: 'academic',
      filterGroup: 'academic',
      x: 1870,
      y: 270,
      w: 145,
      h: 75,
      icon: '💻',
      zone: 'North-East Tech Quad',
      hours: '08:00 AM – 08:00 PM',
      nearestBlock: 15,
      desc: 'Apple Mac Labs, AI/ML research facilities, coding amphitheatre, and advanced computing centers.',
      facilities: ['Apple Mac Lab', 'Basement Parking', 'Coding Arena', 'High-Speed Wi-Fi']
    },
    {
      id: 'Block 16',
      blockNum: 16,
      shortLabel: 'Block 16',
      subLabel: 'Mechanical Engg',
      name: 'Block 16 - School of Mechanical Engineering',
      category: 'academic',
      filterGroup: 'academic',
      x: 2150,
      y: 280,
      w: 140,
      h: 75,
      icon: '⚙️',
      zone: 'North-East Tech Quad',
      hours: '08:00 AM – 06:30 PM',
      nearestBlock: 16,
      desc: 'CAD/CAM design studios, SAE Baja garage, CNC manufacturing bays, and robotics testing workshops.',
      facilities: ['Robotics Bay', 'SAE Baja Garage', '3D Prototyping Lab']
    },
    {
      id: 'Block 18',
      blockNum: 18,
      shortLabel: 'Block 18',
      subLabel: 'Architecture & Design',
      name: 'Block 18 - School of Architecture & Design',
      category: 'academic',
      filterGroup: 'academic',
      x: 1850,
      y: 450,
      w: 140,
      h: 75,
      icon: '📐',
      zone: 'East Creative Wing',
      hours: '08:30 AM – 07:30 PM',
      nearestBlock: 18,
      desc: 'Architectural drafting studios, woodworking and laser-cutting labs, and student design galleries.',
      facilities: ['Drafting Studios', 'Model Making Lab', 'Exhibition Atrium']
    },
    {
      id: 'Block 17',
      blockNum: 17,
      shortLabel: 'Block 17',
      subLabel: 'Civil Engg',
      name: 'Block 17 - School of Civil Engineering',
      category: 'academic',
      filterGroup: 'academic',
      x: 2150,
      y: 450,
      w: 140,
      h: 75,
      icon: '🏗️',
      zone: 'East Engineering Wing',
      hours: '08:30 AM – 06:00 PM',
      nearestBlock: 17,
      desc: 'Concrete technology testing laboratories, structural dynamics wing, and surveying research center.',
      facilities: ['Structural Testing Lab', 'GIS Survey Wing', 'Soil Mechanics Bay']
    },

    // --- CENTRAL PROMENADE, DINING & SHOPPING ---
    {
      id: 'BSS Cafe',
      shortLabel: 'BSS Cafe',
      subLabel: 'Garden Lounge',
      name: 'BSS Cafe & Student Hangout Lounge',
      category: 'food',
      filterGroup: 'food',
      x: 770,
      y: 630,
      w: 125,
      h: 65,
      icon: '☕',
      zone: 'West Academic Garden Spine',
      hours: '08:30 AM – 10:00 PM',
      nearestBlock: 26,
      desc: 'Iconic campus hangout famous for specialty coffees, waffles, pizzas, and open lawn seating.',
      facilities: ['Coffee Bar', 'Open Lawn Seating', 'Live Music Stage']
    },
    {
      id: 'UniMall',
      shortLabel: 'Uni-Mall',
      subLabel: 'Shopping & Cinema',
      name: 'Uni-Mall Central Plaza & Lifestyle Complex',
      category: 'amenity',
      filterGroup: 'amenity',
      x: 1040,
      y: 670,
      w: 165,
      h: 85,
      icon: '🛍️',
      zone: 'Central Lifestyle District',
      hours: '08:00 AM – 10:30 PM',
      nearestBlock: 30,
      desc: 'Three-story retail hub on campus featuring brand stores, bowling alley, multiplex cinema, and salons.',
      facilities: ['Multi-brand Retail', 'Bowling Alley', 'Cinema Multiplex', 'Basement Parking']
    },
    {
      id: 'Main Food Court',
      shortLabel: 'Main Food Court',
      subLabel: 'Central Dining',
      name: 'LPU Main Food Court & Central Dining',
      category: 'food',
      filterGroup: 'food',
      x: 1050,
      y: 860,
      w: 165,
      h: 80,
      icon: '🍔',
      zone: 'Central Food & Dining Promenade',
      hours: '08:00 AM – 11:00 PM',
      nearestBlock: 34,
      desc: 'Multi-cuisine air-conditioned dining hall with Domino’s, Subway, Haldiram’s, and regional food outlets.',
      facilities: ['Air-Conditioned Hall', '20+ Outlets', 'Outdoor Patio Dining']
    },
    {
      id: 'Uni-Health',
      shortLabel: 'Uni-Health',
      subLabel: '24×7 Hospital',
      name: 'Uni-Health (24×7 University Super-Specialty Hospital)',
      category: 'amenity',
      filterGroup: 'amenity',
      x: 1470,
      y: 670,
      w: 155,
      h: 80,
      icon: '🏥',
      zone: 'Central Medical Emergency Zone',
      hours: 'Open 24 Hours (Emergency Services)',
      nearestBlock: 34,
      desc: 'Full-service campus hospital with ICU beds, doctors, in-house pharmacy, and emergency ambulances.',
      facilities: ['24×7 Emergency Ward', 'In-house Pharmacy', 'Pathology Lab', 'Ambulance Bay']
    },
    {
      id: 'Block 34',
      blockNum: 34,
      shortLabel: 'Block 34',
      subLabel: 'Central Library',
      name: 'Block 34 - Central University Library & Knowledge Commons',
      category: 'academic',
      filterGroup: 'academic',
      x: 1370,
      y: 860,
      w: 155,
      h: 80,
      icon: '📚',
      zone: 'Central Academic Commons',
      hours: '07:00 AM – 12:00 Midnight',
      nearestBlock: 34,
      desc: '5-story library landmark housing over 1.5 million volumes, digital repository halls, and 24×7 silent reading areas.',
      facilities: ['24×7 Reading Hall', 'Digital Repository', 'Cyber Commons', 'Underground Parking']
    },
    {
      id: 'Food Square',
      shortLabel: 'Food Square',
      subLabel: 'Eateries Plaza',
      name: 'Food Square & Street Eateries Plaza',
      category: 'food',
      filterGroup: 'food',
      x: 1720,
      y: 660,
      w: 135,
      h: 70,
      icon: '🌮',
      zone: 'East Spine Dining Hub',
      hours: '09:00 AM – 10:30 PM',
      nearestBlock: 33,
      desc: 'Outdoor promenade with juice bars, milkshakes, shawarma, bakery patisserie, and dessert parlours.',
      facilities: ['Outdoor Gazebos', 'Juice & Shake Bars', 'Seating Pergolas']
    },

    // --- EAST TECHNOLOGY & RESEARCH QUAD ---
    {
      id: 'Block 33',
      blockNum: 33,
      shortLabel: 'Block 33',
      subLabel: 'CPE & Placement',
      name: 'Block 33 - Center for Professional Enhancement (CPE)',
      category: 'academic',
      filterGroup: 'academic',
      x: 1980,
      y: 670,
      w: 135,
      h: 75,
      icon: '💼',
      zone: 'East Career Development Quad',
      hours: '08:30 AM – 07:00 PM',
      nearestBlock: 33,
      desc: 'Corporate campus recruitment preparation centers, soft-skills training auditoriums, and interview suites.',
      facilities: ['Mock Interview Suites', 'Aptitude Training Halls', 'Recruiters Lounge']
    },
    {
      id: 'Block 24',
      blockNum: 24,
      shortLabel: 'Block 24',
      subLabel: 'Fashion & Media',
      name: 'Block 24 - School of Fashion Design & Multimedia',
      category: 'academic',
      filterGroup: 'academic',
      x: 2240,
      y: 670,
      w: 135,
      h: 75,
      icon: '👗',
      zone: 'East Creative Arts Hub',
      hours: '08:30 AM – 06:30 PM',
      nearestBlock: 24,
      desc: 'Textile printing laboratories, garment production floors, and fashion runway auditorium.',
      facilities: ['Ramp Walk Arena', 'Textile Printing Mill', 'VFX Chroma Studio']
    },
    {
      id: 'Block 32',
      blockNum: 32,
      shortLabel: 'Block 32',
      subLabel: 'R&D Innovation Hub',
      name: 'Block 32 - Center for Research & Innovation (R&D)',
      category: 'academic',
      filterGroup: 'academic',
      x: 1920,
      y: 860,
      w: 140,
      h: 75,
      icon: '🔬',
      zone: 'East Research & Innovation Quad',
      hours: '08:00 AM – 09:00 PM',
      nearestBlock: 32,
      desc: 'Interdisciplinary high-performance computing clusters, patent filing cell, and central electron microscope facility.',
      facilities: ['SEM/TEM Electron Microscope', 'High Performance Cluster', 'Patent Cell']
    },
    {
      id: 'Block 31',
      blockNum: 31,
      shortLabel: 'Block 31',
      subLabel: 'Chemical & Nano',
      name: 'Block 31 - School of Chemical Engg & Nanotechnology',
      category: 'academic',
      filterGroup: 'academic',
      x: 2200,
      y: 860,
      w: 135,
      h: 75,
      icon: '🧪',
      zone: 'East Applied Sciences Wing',
      hours: '08:30 AM – 06:00 PM',
      nearestBlock: 31,
      desc: 'Nanomaterial synthesis suites, mass transfer operations, and chemical spectroscopy labs.',
      facilities: ['Spectroscopy Lab', 'Polymer Testing Suite', 'Chemical Exhaust Vaults']
    },

    // --- SOUTH-WEST ACADEMIC & MEDIA SECTOR ---
    {
      id: 'Block 26',
      blockNum: 26,
      shortLabel: 'Block 26',
      subLabel: 'Computer Apps (MCA)',
      name: 'Block 26 - School of Computer Applications (MCA/BCA)',
      category: 'academic',
      filterGroup: 'academic',
      x: 420,
      y: 680,
      w: 140,
      h: 75,
      icon: '🖥️',
      zone: 'West Information Tech Quad',
      hours: '08:00 AM – 07:00 PM',
      nearestBlock: 26,
      desc: 'Dedicated applications computing block with cybersecurity testbeds and software development bays.',
      facilities: ['Cybersecurity Lab', 'Database Clusters', 'Project Discussion Bays']
    },
    {
      id: 'Block 27',
      blockNum: 27,
      shortLabel: 'Block 27',
      subLabel: 'Electronics (ECE)',
      name: 'Block 27 - School of Electronics & Electrical Engg',
      category: 'academic',
      filterGroup: 'academic',
      x: 430,
      y: 860,
      w: 140,
      h: 75,
      icon: '⚡',
      zone: 'West Core Engineering Quad',
      hours: '08:30 AM – 06:30 PM',
      nearestBlock: 27,
      desc: 'VLSI circuit design suites, embedded IoT workstations, and power systems simulation labs.',
      facilities: ['VLSI Simulation Center', 'IoT Sensor Lab', 'Power Systems Lab']
    },
    {
      id: 'Block 23',
      blockNum: 23,
      shortLabel: 'Block 23',
      subLabel: 'Education & Hum.',
      name: 'Block 23 - School of Education & Humanities',
      category: 'academic',
      filterGroup: 'academic',
      x: 690,
      y: 860,
      w: 140,
      h: 75,
      icon: '📖',
      zone: 'West Central Academic Wing',
      hours: '08:30 AM – 05:30 PM',
      nearestBlock: 23,
      desc: 'Center for teaching education, psychology labs, and social science seminar rooms.',
      facilities: ['Language Testing Lab', 'Psychology Observation Room', 'Smart Seminar Hall']
    },
    {
      id: 'Block 28',
      blockNum: 28,
      shortLabel: 'Block 28',
      subLabel: 'Journalism & Film',
      name: 'Block 28 - School of Journalism & Film Production',
      category: 'academic',
      filterGroup: 'academic',
      x: 420,
      y: 1060,
      w: 140,
      h: 75,
      icon: '🎥',
      zone: 'South-West Media Complex',
      hours: '08:30 AM – 07:00 PM',
      nearestBlock: 28,
      desc: 'Broadcast TV news studio, digital radio broadcasting station (LPU Radio 90.8 FM), and audio acoustic suites.',
      facilities: ['FM Radio Station', 'Acoustic Audio Suite', 'TV Newsroom']
    },
    {
      id: 'Block 29',
      blockNum: 29,
      shortLabel: 'Block 29',
      subLabel: 'Physical Education',
      name: 'Block 29 - Department of Physical Education & Sports',
      category: 'academic',
      filterGroup: 'academic',
      x: 670,
      y: 1060,
      w: 140,
      h: 75,
      icon: '🏃',
      zone: 'South-West Athletics Quad',
      hours: '06:00 AM – 08:00 PM',
      nearestBlock: 29,
      desc: 'Sports physiology labs, athlete fitness testing suites, coaches bureau, and gymnasium.',
      facilities: ['Athlete Kinesiology Lab', 'Sports Gymnasium', 'Grounds Access']
    },
    {
      id: 'Block 35',
      blockNum: 35,
      shortLabel: 'Block 35',
      subLabel: 'Examination Affairs',
      name: 'Block 35 - University Examination Affairs & Registrar',
      category: 'admin',
      filterGroup: 'admin',
      x: 1040,
      y: 1070,
      w: 160,
      h: 75,
      icon: '📜',
      zone: 'Central Administrative Commons',
      hours: '08:30 AM – 06:00 PM',
      nearestBlock: 35,
      desc: 'Controller of Examinations, degree disbursement, migration certificates, and registrar secretariat.',
      facilities: ['Exam Verification Desks', 'Registrar Secretariat', 'Transcript Vault']
    },

    // --- SPORTS STADIUM COMPLEX ---
    {
      id: 'Indoor Stadium',
      shortLabel: 'Indoor Stadium',
      subLabel: 'Olympic Aquatic Arena',
      name: 'Olympic Indoor Sports Arena & Aquatic Complex',
      category: 'amenity',
      filterGroup: 'amenity',
      x: 1370,
      y: 1070,
      w: 155,
      h: 80,
      icon: '🏊',
      zone: 'South Sports Complex',
      hours: '06:00 AM – 09:30 PM',
      nearestBlock: 35,
      desc: 'Olympic-size 50m swimming pool, 12 badminton courts, squash courts, basketball arena, and shooting range.',
      facilities: ['Olympic Pool', 'Badminton Courts', 'Squash Courts']
    },
    {
      id: 'Athletic Ground',
      shortLabel: 'Athletic Ground',
      subLabel: 'Track & Helipad',
      name: 'University Athletic Track & Helipad Stadium',
      category: 'amenity',
      filterGroup: 'amenity',
      x: 1670,
      y: 1060,
      w: 155,
      h: 80,
      icon: '🏟️',
      zone: 'South-East Sports Field',
      hours: '05:30 AM – 08:30 PM',
      nearestBlock: 31,
      desc: '400m 8-lane synthetic track, international cricket/football turf, pavilion stands, and campus VVIP helipad.',
      facilities: ['400m Synthetic Track', 'Cricket Pavilion', 'VVIP Helipad']
    },

    // --- BOYS HOSTELS (SCATTERED) ---
    {
      id: 'BH-1',
      shortLabel: 'BH-1',
      subLabel: 'Boys Hostel',
      name: 'Boys Hostel 1 (BH-1)',
      category: 'hostel_boys',
      filterGroup: 'hostel',
      x: 310,
      y: 1320,
      w: 115,
      h: 75,
      icon: '🏢',
      zone: 'West Residential Quad',
      hours: 'Resident Access 24×7 (Curfew 10:00 PM)',
      nearestBlock: 28,
      desc: 'Boys accommodation with in-house dining mess, indoor badminton court, gym, and laundromat.',
      facilities: ['Mess Dining', 'Gymnasium', 'Laundromat', 'Bike Parking']
    },
    {
      id: 'BH-2',
      shortLabel: 'BH-2',
      subLabel: 'Boys Hostel',
      name: 'Boys Hostel 2 (BH-2)',
      category: 'hostel_boys',
      filterGroup: 'hostel',
      x: 520,
      y: 1420,
      w: 115,
      h: 75,
      icon: '🏢',
      zone: 'West Residential Quad',
      hours: 'Resident Access 24×7 (Curfew 10:00 PM)',
      nearestBlock: 29,
      desc: 'Features study reading rooms, high-speed Wi-Fi, salon, and table tennis recreation room.',
      facilities: ['Study Commons', 'Tuck Shop', 'Table Tennis Arena']
    },
    {
      id: 'BH-3',
      shortLabel: 'BH-3',
      subLabel: 'Boys Hostel',
      name: 'Boys Hostel 3 (BH-3)',
      category: 'hostel_boys',
      filterGroup: 'hostel',
      x: 340,
      y: 1540,
      w: 115,
      h: 75,
      icon: '🏢',
      zone: 'West Residential Quad',
      hours: 'Resident Access 24×7 (Curfew 10:00 PM)',
      nearestBlock: 29,
      desc: 'Air-cooled and AC hostel rooms with attached dining mess, night canteen, and recreational garden.',
      facilities: ['Night Canteen', 'Hostel Mess', 'Bicycle Stands']
    },
    {
      id: 'BH-4',
      shortLabel: 'BH-4',
      subLabel: 'Boys Hostel',
      name: 'Boys Hostel 4 (BH-4)',
      category: 'hostel_boys',
      filterGroup: 'hostel',
      x: 840,
      y: 1340,
      w: 115,
      h: 75,
      icon: '🏢',
      zone: 'Central-South Residential Sector',
      hours: 'Resident Access 24×7 (Curfew 10:00 PM)',
      nearestBlock: 35,
      desc: 'Boys accommodation with adjacent football turf, grocery store, and stationery print shop.',
      facilities: ['Turf Access', 'Stationery Shop', 'Mess Hall']
    },
    {
      id: 'BH-5',
      shortLabel: 'BH-5',
      subLabel: 'Boys Hostel',
      name: 'Boys Hostel 5 (BH-5)',
      category: 'hostel_boys',
      filterGroup: 'hostel',
      x: 1080,
      y: 1410,
      w: 115,
      h: 75,
      icon: '🏢',
      zone: 'Central-South Residential Sector',
      hours: 'Resident Access 24×7 (Curfew 10:00 PM)',
      nearestBlock: 35,
      desc: 'Apartment-style living with air-conditioned study cubicles, gym equipment, and rooftop terrace.',
      facilities: ['Fitness Center', 'Study Cubicles', 'Laundry Drop-off']
    },
    {
      id: 'BH-6',
      shortLabel: 'BH-6',
      subLabel: 'Boys Hostel',
      name: 'Boys Hostel 6 (BH-6)',
      category: 'hostel_boys',
      filterGroup: 'hostel',
      x: 880,
      y: 1550,
      w: 115,
      h: 75,
      icon: '🏢',
      zone: 'Central-South Residential Sector',
      hours: 'Resident Access 24×7 (Curfew 10:00 PM)',
      nearestBlock: 34,
      desc: 'Located convenient to the Olympic sports complex and indoor stadium with round-the-clock power and water.',
      facilities: ['Mess Hall', 'Basketball Half-Court', '2W Parking Bay']
    },
    {
      id: 'BH-7',
      shortLabel: 'BH-7',
      subLabel: 'Boys Hostel',
      name: 'Boys Hostel 7 (BH-7)',
      category: 'hostel_boys',
      filterGroup: 'hostel',
      x: 1190,
      y: 1560,
      w: 115,
      h: 75,
      icon: '🏢',
      zone: 'Central-South Residential Sector',
      hours: 'Resident Access 24×7 (Curfew 10:00 PM)',
      nearestBlock: 31,
      desc: 'Premium boys hostel with lift elevators, biometric gate turnstiles, and modern dining mess.',
      facilities: ['Biometric Gates', 'Elevator Access', 'Mess Dining']
    },

    // --- GIRLS HOSTELS (SCATTERED) ---
    {
      id: 'GH-1',
      shortLabel: 'GH-1',
      subLabel: 'Girls Hostel',
      name: 'Girls Hostel 1 (GH-1 Complex)',
      category: 'hostel_girls',
      filterGroup: 'hostel',
      x: 1880,
      y: 1360,
      w: 125,
      h: 75,
      icon: '🏬',
      zone: 'East Residential Sanctuary',
      hours: 'Resident Access (Biometric Entry • Curfew 07:30 PM)',
      nearestBlock: 31,
      desc: 'Gated female residence with 24×7 security, indoor gym, beauty salon, and multi-cuisine dining hall.',
      facilities: ['Dedicated Women Mess', 'In-house Salon', 'Gym & Yoga Studio']
    },
    {
      id: 'GH-2',
      shortLabel: 'GH-2',
      subLabel: 'Girls Hostel',
      name: 'Girls Hostel 2 (GH-2 Complex)',
      category: 'hostel_girls',
      filterGroup: 'hostel',
      x: 2160,
      y: 1410,
      w: 125,
      h: 75,
      icon: '🏬',
      zone: 'East Residential Sanctuary',
      hours: 'Resident Access (Biometric Entry • Curfew 07:30 PM)',
      nearestBlock: 18,
      desc: 'Air-conditioned rooms, courtyard gardens, quiet study rooms, and departmental grocery store.',
      facilities: ['Courtyard Garden', 'Departmental Store', 'Mess Hall']
    },
    {
      id: 'GH-3',
      shortLabel: 'GH-3',
      subLabel: 'Girls Hostel',
      name: 'Girls Hostel 3 (GH-3 Complex)',
      category: 'hostel_girls',
      filterGroup: 'hostel',
      x: 1980,
      y: 1550,
      w: 125,
      h: 75,
      icon: '🏬',
      zone: 'East Residential Sanctuary',
      hours: 'Resident Access (Biometric Entry • Curfew 07:30 PM)',
      nearestBlock: 17,
      desc: 'High-rise residence with rooftop recreation track, cafeteria, and 24×7 infirmary nurse desk.',
      facilities: ['Infirmary Nurse', 'Hostel Cafeteria', 'Laundromat']
    }
  ];

  // ============================================================================
  // NAVIGATION MODULE
  // ============================================================================
  const NavigationModule = {
    places: CAMPUS_PLACES,
    activeOrigin: 'Main Gate 1',
    activeDest: 'Block 30',
    activeMode: 'walk',
    activeCategory: 'all',
    selectedPlaceId: null,

    transform: {
      scale: 0.85,
      x: -380,
      y: -80,
      minScale: 0.45,
      maxScale: 2.8
    },
    isPanning: false,
    panStart: { x: 0, y: 0 },
    panOrigin: { x: 0, y: 0 },

    init() {
      this.cacheDom();
      this.populateSelectDropdowns();
      this.bindEvents();
      this.renderCampusMap();
      this.calculateAndRenderRoute(this.activeOrigin, this.activeDest);
    },

    cacheDom() {
      this.dom = {
        viewport: document.getElementById('cnav-viewport'),
        canvas: document.getElementById('cnav-canvas'),
        svgHolder: document.getElementById('campus-map-svg-holder'),
        zoomInBtn: document.getElementById('cnav-zoom-in'),
        zoomOutBtn: document.getElementById('cnav-zoom-out'),
        zoomResetBtn: document.getElementById('cnav-zoom-reset'),
        zoomFitBtn: document.getElementById('cnav-zoom-fit'),
        zoomLevelText: document.getElementById('cnav-zoom-level'),
        originSelect: document.getElementById('nav-origin'),
        destSelect: document.getElementById('nav-destination'),
        routeForm: document.getElementById('route-planner-form'),
        swapRouteBtn: document.getElementById('btn-swap-route'),
        metricDist: document.getElementById('metric-dist'),
        metricTime: document.getElementById('metric-time'),
        metricModeLbl: document.getElementById('metric-mode-lbl'),
        metricParking: document.getElementById('metric-parking'),
        stepsList: document.getElementById('directions-steps-list'),
        viaTag: document.getElementById('cnav-via-tag'),
        modeBtns: document.querySelectorAll('.cnav-mode-btn'),
        catPills: document.getElementById('cnav-category-filters'),
        searchInput: document.getElementById('cnav-place-search'),
        searchResults: document.getElementById('cnav-search-results'),

        // Inspector Drawer
        inspector: document.getElementById('cnav-place-inspector'),
        closeInspectorBtn: document.getElementById('btn-close-inspector'),
        inspIcon: document.getElementById('insp-cat-icon'),
        inspCatLabel: document.getElementById('insp-cat-label'),
        inspTitle: document.getElementById('insp-title'),
        inspDesc: document.getElementById('insp-desc'),
        inspZone: document.getElementById('insp-zone'),
        inspHours: document.getElementById('insp-hours'),
        inspParkingBay: document.getElementById('insp-parking-bay'),
        inspParkingStatus: document.getElementById('insp-parking-status'),
        inspTags: document.getElementById('insp-tags'),
        inspBtnSetDest: document.getElementById('btn-insp-set-dest'),
        inspBtnSetStart: document.getElementById('btn-insp-set-start'),
        inspBtnOpenLot: document.getElementById('btn-insp-open-lot')
      };
    },

    populateSelectDropdowns() {
      if (!this.dom.originSelect || !this.dom.destSelect) return;

      const makeOptions = (selectedId) => {
        return this.places
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((p) => `<option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${p.name}</option>`)
          .join('');
      };

      this.dom.originSelect.innerHTML = makeOptions(this.activeOrigin);
      this.dom.destSelect.innerHTML = makeOptions(this.activeDest);
    },

    bindEvents() {
      if (this.dom.routeForm) {
        this.dom.routeForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.activeOrigin = this.dom.originSelect.value;
          this.activeDest = this.dom.destSelect.value;
          this.calculateAndRenderRoute(this.activeOrigin, this.activeDest);
        });
      }

      if (this.dom.swapRouteBtn) {
        this.dom.swapRouteBtn.addEventListener('click', () => {
          const temp = this.dom.originSelect.value;
          this.dom.originSelect.value = this.dom.destSelect.value;
          this.dom.destSelect.value = temp;
          this.activeOrigin = this.dom.originSelect.value;
          this.activeDest = this.dom.destSelect.value;
          this.calculateAndRenderRoute(this.activeOrigin, this.activeDest);
        });
      }

      this.dom.modeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.modeBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeMode = btn.dataset.mode || 'walk';
          this.calculateAndRenderRoute(this.activeOrigin, this.activeDest);
        });
      });

      if (this.dom.catPills) {
        this.dom.catPills.addEventListener('click', (e) => {
          const btn = e.target.closest('.cnav-cat-btn');
          if (!btn) return;
          this.dom.catPills.querySelectorAll('.cnav-cat-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeCategory = btn.dataset.category || 'all';
          this.applyCategoryFilter();
        });
      }

      if (this.dom.zoomInBtn) {
        this.dom.zoomInBtn.addEventListener('click', () => this.zoomAroundCenter(1.25));
      }
      if (this.dom.zoomOutBtn) {
        this.dom.zoomOutBtn.addEventListener('click', () => this.zoomAroundCenter(0.8));
      }
      if (this.dom.zoomResetBtn) {
        this.dom.zoomResetBtn.addEventListener('click', () => this.resetMapView());
      }
      if (this.dom.zoomFitBtn) {
        this.dom.zoomFitBtn.addEventListener('click', () => this.fitActiveRoute());
      }

      if (this.dom.viewport) {
        this.dom.viewport.addEventListener(
          'wheel',
          (e) => {
            e.preventDefault();
            const rect = this.dom.viewport.getBoundingClientRect();
            const cursorX = e.clientX - rect.left;
            const cursorY = e.clientY - rect.top;
            const factor = e.deltaY < 0 ? 1.15 : 0.87;
            this.zoomAtPoint(factor, cursorX, cursorY);
          },
          { passive: false }
        );

        this.dom.viewport.addEventListener('mousedown', (e) => {
          if (e.button === 0 || e.button === 2) {
            this.isPanning = true;
            this.panStart.x = e.clientX;
            this.panStart.y = e.clientY;
            this.panOrigin.x = this.transform.x;
            this.panOrigin.y = this.transform.y;
            this.dom.viewport.classList.add('is-panning');
          }
        });

        this.dom.viewport.addEventListener('contextmenu', (e) => {
          e.preventDefault();
        });
      }

      window.addEventListener('mousemove', (e) => {
        if (!this.isPanning) return;
        const dx = e.clientX - this.panStart.x;
        const dy = e.clientY - this.panStart.y;
        this.transform.x = this.panOrigin.x + dx;
        this.transform.y = this.panOrigin.y + dy;
        this.applyTransform();
      });

      window.addEventListener('mouseup', (e) => {
        if (this.isPanning) {
          this.isPanning = false;
          if (this.dom.viewport) this.dom.viewport.classList.remove('is-panning');
        }
      });

      if (this.dom.searchInput) {
        this.dom.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.addEventListener('click', (e) => {
          if (!e.target.closest('.cnav-search-wrap') && this.dom.searchResults) {
            this.dom.searchResults.classList.add('hidden');
          }
        });
      }

      if (this.dom.closeInspectorBtn) {
        this.dom.closeInspectorBtn.addEventListener('click', () => this.hideInspector());
      }

      if (this.dom.inspBtnSetDest) {
        this.dom.inspBtnSetDest.addEventListener('click', () => {
          if (!this.selectedPlaceId) return;
          this.dom.destSelect.value = this.selectedPlaceId;
          this.activeDest = this.selectedPlaceId;
          this.calculateAndRenderRoute(this.activeOrigin, this.activeDest);
        });
      }

      if (this.dom.inspBtnSetStart) {
        this.dom.inspBtnSetStart.addEventListener('click', () => {
          if (!this.selectedPlaceId) return;
          this.dom.originSelect.value = this.selectedPlaceId;
          this.activeOrigin = this.selectedPlaceId;
          this.calculateAndRenderRoute(this.activeOrigin, this.activeDest);
        });
      }

      if (this.dom.inspBtnOpenLot) {
        this.dom.inspBtnOpenLot.addEventListener('click', () => {
          const place = this.getPlaceById(this.selectedPlaceId);
          if (place && place.nearestBlock && global.App && typeof global.App.switchView === 'function') {
            global.App.switchView('map');
            const blockSelect = document.getElementById('map-block-selector');
            if (blockSelect) {
              blockSelect.value = place.nearestBlock;
              blockSelect.dispatchEvent(new Event('change'));
            }
          }
        });
      }
    },

    // ==========================================================================
    // MAP RENDERING: PURE GOOGLE MAPS POIs + EXTENSIVE INTER-BLOCK PATHWAYS
    // ==========================================================================
    renderCampusMap() {
      if (!this.dom.svgHolder) return;

      const nodesMarkup = this.places
        .map((p) => {
          const style = CATEGORY_STYLES[p.category] || CATEGORY_STYLES.academic;
          const isSelected = p.id === this.selectedPlaceId;
          const cx = Math.round(p.x + p.w / 2);
          const cy = Math.round(p.y + p.h / 2);

          return `
          <g class="campus-node-group ${isSelected ? 'selected-node' : ''}" 
             id="node-${this.sanitizeId(p.id)}" 
             data-id="${p.id}" 
             data-category="${p.category}"
             data-filtergroup="${p.filterGroup}">
            
            <!-- Invisible click/hover bounding box (Ensures easy hover & click) -->
            <rect x="${cx - 55}" y="${cy - 26}" width="110" height="66" rx="8" fill="transparent" cursor="pointer"/>

            <!-- Pure Google Maps Circular POI Pin (Fixed: uses SVG r/stroke transitions, never disappears on hover) -->
            <g class="gmap-poi-circle" transform="translate(${cx}, ${cy - 10})">
              <circle r="15" fill="${style.badgeBg}" stroke="#FFFFFF" stroke-width="2.5" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.3))"/>
              <text text-anchor="middle" dy="4.5" font-size="13" fill="#FFFFFF">${p.icon}</text>
            </g>

            <!-- Google Maps Text Label with White Halo -->
            <text class="gmap-label" x="${cx}" y="${cy + 18}">
              ${this.escapeHtml(p.shortLabel)}
            </text>
            
            ${
              p.subLabel
                ? `<text class="gmap-sublabel" x="${cx}" y="${cy + 30}">${this.escapeHtml(p.subLabel)}</text>`
                : ''
            }
          </g>
        `;
        })
        .join('');

      this.dom.svgHolder.innerHTML = `
        <svg viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <style>
            .campus-node-group {
              cursor: pointer;
            }

            /* STABLE HOVER: Animates radius & stroke-width directly without transform jumping */
            .gmap-poi-circle circle {
              transition: r 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), 
                          stroke-width 0.2s ease, 
                          filter 0.2s ease;
            }
            .campus-node-group:hover .gmap-poi-circle circle {
              r: 18.5px;
              stroke-width: 3.5px;
              filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45));
            }
            .campus-node-group.selected-node .gmap-poi-circle circle {
              r: 19.5px;
              stroke: #2563EB;
              stroke-width: 4px;
              filter: drop-shadow(0 0 12px rgba(37, 99, 235, 0.8));
            }

            .gmap-label {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 11px;
              font-weight: 700;
              fill: #0F172A;
              text-anchor: middle;
              paint-order: stroke fill;
              stroke: #FFFFFF;
              stroke-width: 3.5px;
              stroke-linecap: round;
              stroke-linejoin: round;
              pointer-events: none;
              user-select: none;
              letter-spacing: -0.01em;
              transition: fill 0.2s ease;
            }
            .campus-node-group:hover .gmap-label {
              fill: #1D4ED8;
            }

            .gmap-sublabel {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 9px;
              font-weight: 600;
              fill: #475569;
              text-anchor: middle;
              paint-order: stroke fill;
              stroke: #FFFFFF;
              stroke-width: 2.5px;
              stroke-linecap: round;
              stroke-linejoin: round;
              pointer-events: none;
              user-select: none;
            }

            .campus-node-group.dimmed {
              opacity: 0.15;
              pointer-events: none;
            }
          </style>

          <defs>
            <pattern id="campusGridPattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#CBD5E1" stroke-width="0.8" opacity="0.3"/>
              <circle cx="30" cy="30" r="1.5" fill="#94A3B8" opacity="0.25"/>
            </pattern>
          </defs>

          <!-- 1. BASE CAMPUS TERRAIN -->
          <rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="#E2E8F0"/>
          <rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="url(#campusGridPattern)"/>

          <!-- 2. ORGANIC GREEN PARKS & BOTANICAL LAWNS -->
          <!-- Law Gate Botanical Garden -->
          <path d="M 220 220 C 320 170, 520 190, 570 240 C 620 300, 580 400, 520 420 C 420 450, 240 400, 220 220 Z" fill="#DCFCE7" opacity="0.85"/>
          
          <!-- Mittal Business Quad Lawn -->
          <rect x="600" y="230" width="230" height="160" rx="22" fill="#DCFCE7" opacity="0.8"/>
          
          <!-- Central University Grand Lawn (Admissions to Library) -->
          <path d="M 960 190 C 1150 170, 1420 170, 1620 200 C 1680 320, 1660 560, 1620 620 C 1460 640, 1080 640, 960 580 C 920 450, 920 310, 960 190 Z" fill="#E8F5E9" stroke="#C8E6C9" stroke-width="2"/>
          <circle cx="1300" cy="380" r="48" fill="#C8E6C9" opacity="0.6"/>

          <!-- Engineering Quad Park -->
          <rect x="1800" y="210" width="550" height="350" rx="30" fill="#E8F2E4" stroke="#D1E4CB" stroke-width="2"/>

          <!-- Central Park Lagoon & Fountains -->
          <path d="M 840 750 Q 1300 780 1760 750 Q 1820 890 1680 970 Q 1300 1030 920 970 Q 800 880 840 750 Z" fill="#D1FAE5" stroke="#A7F3D0" stroke-width="2"/>
          <!-- Water Lake in Central Park -->
          <path d="M 1190 830 Q 1300 800 1400 830 Q 1430 900 1380 940 Q 1280 965 1210 930 Z" fill="#BAE6FD" stroke="#38BDF8" stroke-width="3"/>
          <circle cx="1300" cy="880" r="10" fill="#0284C7"/>
          <text x="1300" y="874" font-size="8" font-weight="800" fill="#0369A1" text-anchor="middle">FOUNTAIN</text>

          <!-- BSS Garden Park -->
          <circle cx="830" cy="660" r="85" fill="#DCFCE7" opacity="0.8"/>

          <!-- West Hostels Residential Lawn & Volleyball Sand Court -->
          <path d="M 240 1250 C 400 1190, 690 1230, 730 1350 C 750 1480, 670 1670, 480 1690 C 310 1710, 220 1560, 240 1250 Z" fill="#E0F2FE" opacity="0.75"/>
          <rect x="420" y="1480" width="70" height="42" rx="4" fill="#FEF08A" stroke="#EAB308" stroke-width="2"/>
          <line x1="455" y1="1480" x2="455" y2="1522" stroke="#FFFFFF" stroke-width="2"/>
          <text x="455" y="1505" font-size="7" font-weight="800" fill="#A16207" text-anchor="middle">VOLLEYBALL</text>

          <!-- Central-South Boys Hostels Sports Park & Basketball Court -->
          <path d="M 780 1270 Q 1310 1250 1350 1410 Q 1350 1670 1040 1690 Q 760 1660 780 1270 Z" fill="#F0FDF4" stroke="#DCFCE7" stroke-width="2"/>
          <rect x="1010" y="1480" width="60" height="40" rx="3" fill="#FB923C" stroke="#EA580C" stroke-width="2"/>
          <circle cx="1040" cy="1500" r="8" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
          <text x="1040" y="1503" font-size="6.5" font-weight="800" fill="#FFFFFF" text-anchor="middle">HOOPS</text>

          <!-- Girls Hostel Rose Garden Sanctuary -->
          <path d="M 1780 1270 C 2000 1230, 2340 1250, 2380 1430 C 2400 1600, 2250 1690, 2040 1690 C 1830 1690, 1760 1520, 1780 1270 Z" fill="#FCE7F3" opacity="0.8"/>
          <circle cx="2080" cy="1460" r="50" fill="#FBCFE8" opacity="0.6"/>
          <text x="2080" y="1463" font-size="8" font-weight="800" fill="#BE185D" text-anchor="middle">ROSE GARDEN</text>

          <!-- 3. SPORTS RUNNING TRACK (400M SYNTHETIC TRACK) -->
          <g transform="translate(1650, 1040)">
            <rect x="0" y="0" width="190" height="120" rx="60" fill="#F87171" stroke="#EF4444" stroke-width="3"/>
            <rect x="10" y="10" width="170" height="100" rx="50" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="8 6"/>
            <rect x="25" y="25" width="140" height="70" rx="35" fill="#22C55E" stroke="#16A34A" stroke-width="2"/>
            <circle cx="95" cy="60" r="18" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
            <text x="95" y="64" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">H</text>
          </g>

          <!-- 4. THOROUGHFARE ROADS & ROUNDABOUT -->
          <!-- NH-44 Grand Trunk Road -->
          <path d="M 50 120 L 2550 120" stroke="#475569" stroke-width="42" stroke-linecap="round"/>
          <path d="M 50 120 L 2550 120" stroke="#F8FAFC" stroke-width="3" stroke-dasharray="24 16"/>
          <text x="1300" y="78" font-size="13" font-weight="800" fill="#475569" letter-spacing="0.1em" text-anchor="middle">
            NATIONAL HIGHWAY 44 • JALANDHAR–DELHI GT ROAD (LPU MAIN FRONTAGE)
          </text>

          <!-- Primary Ring Roads -->
          <path d="M 280 200 L 2320 200" stroke="#94A3B8" stroke-width="28" stroke-linecap="round"/>
          <path d="M 280 200 L 2320 200" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="14 10"/>

          <!-- Central Spine Avenue with Grand Roundabout -->
          <path d="M 260 740 L 1220 740" stroke="#94A3B8" stroke-width="30" stroke-linecap="round"/>
          <path d="M 1380 740 L 2340 740" stroke="#94A3B8" stroke-width="30" stroke-linecap="round"/>
          <path d="M 260 740 L 2340 740" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="14 10"/>

          <circle cx="1300" cy="740" r="55" fill="none" stroke="#94A3B8" stroke-width="30"/>
          <circle cx="1300" cy="740" r="55" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="12 8"/>
          <circle cx="1300" cy="740" r="38" fill="#10B981" stroke="#059669" stroke-width="3"/>
          <circle cx="1300" cy="740" r="14" fill="#047857"/>

          <!-- South Residential Promenade -->
          <path d="M 260 1220 C 600 1240, 1100 1210, 1600 1230 C 1900 1250, 2200 1220, 2360 1220" stroke="#94A3B8" stroke-width="28" stroke-linecap="round" fill="none"/>
          <path d="M 260 1220 C 600 1240, 1100 1210, 1600 1230 C 1900 1250, 2200 1220, 2360 1220" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="14 10" fill="none"/>

          <!-- North-South Arterial Connectors -->
          <path d="M 510 120 L 510 1220" stroke="#94A3B8" stroke-width="26" stroke-linecap="round"/>
          <path d="M 1300 120 L 1300 685" stroke="#94A3B8" stroke-width="34" stroke-linecap="round"/>
          <path d="M 1300 795 L 1300 1660" stroke="#94A3B8" stroke-width="30" stroke-linecap="round"/>
          <path d="M 2050 120 L 2050 1220" stroke="#94A3B8" stroke-width="26" stroke-linecap="round"/>

          <!-- 5. EXTENSIVE INTER-BLOCK PATHWAYS & BRICK PAVER WALKS -->
          <!-- Law (Block 20) to Agri (Block 21) -->
          <path d="M 400 300 L 380 470" stroke="#CBD5E1" stroke-width="7" stroke-linecap="round"/>
          <!-- Agri (Block 21) to MCA (Block 26) -->
          <path d="M 380 470 Q 420 580 490 710" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" fill="none"/>
          <!-- MCA (Block 26) to ECE (Block 27) -->
          <path d="M 490 710 L 500 890" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <!-- ECE (Block 27) to Journalism (Block 28) -->
          <path d="M 500 890 L 490 1090" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <!-- Journalism (Block 28) to Physical Ed (Block 29) -->
          <path d="M 490 1090 L 740 1090" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <!-- Physical Ed (Block 29) to Education (Block 23) -->
          <path d="M 740 1090 L 760 890" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <!-- Education (Block 23) to ECE (Block 27) cross walk -->
          <path d="M 760 890 L 500 890" stroke="#CBD5E1" stroke-width="7" stroke-dasharray="6 4"/>
          <!-- Education (Block 23) to Main Food Court connection -->
          <path d="M 760 890 Q 940 900 1130 900" stroke="#FDBA74" stroke-width="8" stroke-dasharray="4 4" fill="none"/>
          <!-- Business (Block 19) to Pharma (Block 22) -->
          <path d="M 715 315 L 650 495" stroke="#CBD5E1" stroke-width="7" stroke-linecap="round"/>
          <!-- Pharma (Block 22) to BSS Cafe -->
          <path d="M 650 495 Q 730 560 830 660" stroke="#FDBA74" stroke-width="8" stroke-linecap="round" fill="none"/>
          <!-- BSS Cafe to Uni-Mall walk -->
          <path d="M 830 660 Q 980 680 1120 710" stroke="#FDBA74" stroke-width="8" stroke-dasharray="4 4" fill="none"/>

          <!-- Admissions (Block 30) to Auditorium -->
          <path d="M 1170 290 L 1150 470" stroke="#CBD5E1" stroke-width="9" stroke-linecap="round"/>
          <!-- Auditorium to Uni-Mall -->
          <path d="M 1150 470 L 1120 710" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <!-- Student Welfare (Block 25) to Unipolis -->
          <path d="M 1495 295 L 1525 480" stroke="#CBD5E1" stroke-width="9" stroke-linecap="round"/>
          <!-- Unipolis to Uni-Health -->
          <path d="M 1525 480 L 1545 710" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <!-- Uni-Mall to Main Food Court direct walk -->
          <path d="M 1120 710 L 1130 900" stroke="#CBD5E1" stroke-width="10" stroke-linecap="round"/>
          <!-- Uni-Health to Central Library (Block 34) -->
          <path d="M 1545 710 L 1445 900" stroke="#CBD5E1" stroke-width="9" stroke-linecap="round"/>
          <!-- Library (Block 34) to Main Food Court promenade -->
          <path d="M 1445 900 L 1130 900" stroke="#FDBA74" stroke-width="9" stroke-linecap="round"/>
          <!-- Main Food Court to Examination (Block 35) -->
          <path d="M 1130 900 L 1120 1105" stroke="#CBD5E1" stroke-width="9" stroke-linecap="round"/>
          <!-- Library to Indoor Stadium -->
          <path d="M 1445 900 L 1445 1110" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <!-- Examination (Block 35) to Indoor Stadium -->
          <path d="M 1120 1105 L 1445 1110" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <!-- Indoor Stadium to Athletic Ground -->
          <path d="M 1445 1110 L 1745 1100" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>

          <!-- East Quad Pathways -->
          <path d="M 1940 305 L 2220 315" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <path d="M 1940 305 L 1920 485" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <path d="M 2220 315 L 2220 485" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <path d="M 1920 485 L 2220 485" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <path d="M 1920 485 L 2045 705" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <path d="M 2045 705 L 1785 695" stroke="#FDBA74" stroke-width="8" stroke-linecap="round"/>
          <path d="M 1785 695 Q 1660 700 1545 710" stroke="#FDBA74" stroke-width="8" stroke-dasharray="5 4" fill="none"/>
          <path d="M 2045 705 L 2305 705" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <path d="M 2045 705 L 1990 895" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <path d="M 1990 895 L 2265 895" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
          <path d="M 1990 895 Q 1700 900 1445 900" stroke="#CBD5E1" stroke-width="8" stroke-dasharray="6 4" fill="none"/>
          <path d="M 2265 895 Q 2000 1020 1745 1100" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" fill="none"/>

          <!-- Residential Hostel Pathways -->
          <path d="M 365 1355 Q 460 1440 575 1455" stroke="#CBD5E1" stroke-width="7" fill="none"/>
          <path d="M 575 1455 Q 500 1540 395 1575" stroke="#CBD5E1" stroke-width="7" fill="none"/>
          <path d="M 395 1575 L 420 1480" stroke="#FEF08A" stroke-width="6" stroke-dasharray="4 4"/>
          <path d="M 895 1375 Q 1020 1430 1135 1445" stroke="#CBD5E1" stroke-width="7" fill="none"/>
          <path d="M 1135 1445 Q 1050 1540 935 1585" stroke="#CBD5E1" stroke-width="7" fill="none"/>
          <path d="M 935 1585 L 1245 1595" stroke="#CBD5E1" stroke-width="7" fill="none"/>
          <path d="M 1040 1480 L 1040 1445" stroke="#CBD5E1" stroke-width="6"/>
          <path d="M 1940 1395 Q 2080 1440 2220 1445" stroke="#F472B6" stroke-width="6" stroke-dasharray="5 4" fill="none"/>
          <path d="M 2220 1445 Q 2150 1540 2040 1585" stroke="#F472B6" stroke-width="6" stroke-dasharray="5 4" fill="none"/>

          <!-- 6. ZEBRA CROSSWALKS -->
          <line x1="1280" y1="170" x2="1320" y2="170" stroke="#FFFFFF" stroke-width="16" stroke-dasharray="4 3"/>
          <line x1="490" y1="170" x2="530" y2="170" stroke="#FFFFFF" stroke-width="16" stroke-dasharray="4 3"/>

          <!-- 7. NATURE TREES -->
          <circle cx="280" cy="170" r="14" fill="#22C55E" opacity="0.65"/>
          <circle cx="720" cy="170" r="12" fill="#16A34A" opacity="0.7"/>
          <circle cx="1500" cy="170" r="13" fill="#15803D" opacity="0.7"/>
          <circle cx="2280" cy="170" r="14" fill="#16A34A" opacity="0.7"/>
          <circle cx="890" cy="620" r="16" fill="#16A34A" opacity="0.8"/>
          <circle cx="1220" cy="660" r="14" fill="#15803D" opacity="0.75"/>
          <circle cx="1380" cy="660" r="14" fill="#16A34A" opacity="0.75"/>
          <circle cx="1660" cy="800" r="15" fill="#22C55E" opacity="0.75"/>
          <circle cx="260" cy="1420" r="15" fill="#16A34A" opacity="0.75"/>
          <circle cx="700" cy="1460" r="14" fill="#22C55E" opacity="0.75"/>
          <circle cx="1330" cy="1480" r="15" fill="#16A34A" opacity="0.75"/>
          <circle cx="1820" cy="1460" r="14" fill="#F472B6" opacity="0.7"/>
          <circle cx="2300" cy="1520" r="16" fill="#16A34A" opacity="0.75"/>

          <!-- 8. ACTIVE NAVIGATION ROUTE LAYER -->
          <g id="campus-route-layer"></g>

          <!-- 9. PLACES & POI CIRCLES LAYER (PURE FLOATING POI) -->
          <g id="campus-nodes-layer">
            ${nodesMarkup}
          </g>

          <!-- 10. START / DESTINATION PINS LAYER -->
          <g id="campus-pins-layer"></g>
        </svg>
      `;

      // Attach Node Hover & Click Handlers
      const nodeElements = this.dom.svgHolder.querySelectorAll('.campus-node-group');
      nodeElements.forEach((el) => {
        const placeId = el.dataset.id;

        // Dynamic Hover: show info card on mouse hover without moving the map
        el.addEventListener('mouseenter', () => {
          this.showPlaceInfo(placeId, false);
        });

        // Click: shows info and smoothly pans/centers the map
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showPlaceInfo(placeId, true);
        });
      });

      this.applyTransform();
    },

    // ==========================================================================
    // ROUTE CALCULATION & CURVED PATH DRAWING
    // ==========================================================================
    calculateAndRenderRoute(originId, destId) {
      const startPlace = this.getPlaceById(originId) || this.places[0];
      const endPlace = this.getPlaceById(destId) || this.places[1];

      const startCenter = { x: Math.round(startPlace.x + startPlace.w / 2), y: Math.round(startPlace.y + startPlace.h / 2) };
      const endCenter = { x: Math.round(endPlace.x + endPlace.w / 2), y: Math.round(endPlace.y + endPlace.h / 2) };

      const dx = Math.abs(endCenter.x - startCenter.x);
      const dy = Math.abs(endCenter.y - startCenter.y);
      const straightDistMeters = Math.round(Math.hypot(dx, dy) * METERS_PER_PIXEL);
      const routeDistMeters = Math.max(80, Math.round(straightDistMeters * 1.18));

      let timeText = '';
      if (this.activeMode === 'walk') {
        const mins = Math.max(1, Math.round(routeDistMeters / 75));
        timeText = `${mins} min${mins > 1 ? 's' : ''}`;
        if (this.dom.metricModeLbl) this.dom.metricModeLbl.textContent = 'Walking Time';
      } else if (this.activeMode === 'drive') {
        const mins = Math.max(1, Math.round(routeDistMeters / 280));
        timeText = `${mins} min${mins > 1 ? 's' : ''}`;
        if (this.dom.metricModeLbl) this.dom.metricModeLbl.textContent = 'Driving Time';
      } else {
        const mins = Math.max(1, Math.round(routeDistMeters / 160));
        timeText = `${mins} min${mins > 1 ? 's' : ''}`;
        if (this.dom.metricModeLbl) this.dom.metricModeLbl.textContent = 'E-Rickshaw Time';
      }

      if (this.dom.metricDist) this.dom.metricDist.textContent = `${routeDistMeters} m`;
      if (this.dom.metricTime) this.dom.metricTime.textContent = timeText;
      if (this.dom.metricParking) {
        this.dom.metricParking.textContent = endPlace.nearestBlock ? `Block ${endPlace.nearestBlock}` : 'Zone Entry Bay';
      }

      this.renderTurnByTurnSteps(startPlace, endPlace, routeDistMeters);
      this.drawRoutePath(startCenter, endCenter, startPlace, endPlace);
    },

    renderTurnByTurnSteps(start, end, totalDist) {
      if (!this.dom.stepsList) return;

      const steps = [];
      steps.push(`Start from <strong>${this.escapeHtml(start.name)}</strong> (${start.zone}).`);

      if (start.y < 600 && end.y >= 600) {
        steps.push(`Head southward past <strong>Central Boulevard &amp; Roundabout</strong>.`);
      } else if (start.y >= 600 && end.y < 600) {
        steps.push(`Walk northward along the <strong>Central Botanical Promenade</strong>.`);
      }

      if (end.category.startsWith('hostel')) {
        steps.push(`Follow garden trails into the <strong>Residential Quadrangle (${end.shortLabel})</strong>.`);
      } else if (end.category === 'academic') {
        steps.push(`Follow signage toward <strong>Academic Complex (Block ${end.blockNum || ''})</strong>.`);
      }

      if (end.nearestBlock) {
        steps.push(`Designated parking bay available at <strong>Block ${end.nearestBlock}</strong>.`);
      }

      steps.push(`Arrive safely at <strong>${this.escapeHtml(end.name)}</strong>.`);

      this.dom.stepsList.innerHTML = steps
        .map(
          (s, idx) => `
        <li>
          <span class="cnav-step-num">${idx + 1}</span>
          <div>${s}</div>
        </li>
      `
        )
        .join('');

      if (this.dom.viaTag) {
        this.dom.viaTag.textContent = `Via Central Spine Avenue (${totalDist} m)`;
      }
    },

    drawRoutePath(start, end, startPlace, endPlace) {
      const routeLayer = document.getElementById('campus-route-layer');
      const pinsLayer = document.getElementById('campus-pins-layer');
      if (!routeLayer || !pinsLayer) return;

      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const controlY = start.y === end.y ? start.y - 60 : midY;

      const pathData = `M ${start.x} ${start.y} Q ${midX} ${controlY} ${end.x} ${end.y}`;

      routeLayer.innerHTML = `
        <path d="${pathData}" fill="none" stroke="#93C5FD" stroke-width="14" stroke-linecap="round" opacity="0.65"/>
        <path d="${pathData}" fill="none" stroke="#2563EB" stroke-width="6" stroke-linecap="round"/>
        <path class="route-path-animated" d="${pathData}" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      `;

      pinsLayer.innerHTML = `
        <!-- Origin Green Pin -->
        <g transform="translate(${start.x}, ${start.y})">
          <circle r="16" fill="#16A34A" stroke="#FFFFFF" stroke-width="3.5" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.3))"/>
          <text text-anchor="middle" dy="4.5" font-size="11" font-weight="900" fill="#FFFFFF">A</text>
        </g>

        <!-- Destination Red Pin -->
        <g transform="translate(${end.x}, ${end.y})">
          <circle r="18" fill="#DC2626" stroke="#FFFFFF" stroke-width="4" filter="drop-shadow(0 3px 8px rgba(220,38,38,0.5))"/>
          <circle r="5.5" fill="#FFFFFF"/>
        </g>
      `;
    },

    // ==========================================================================
    // PLACE INSPECTOR (CALLED ON HOVER & ON CLICK)
    // ==========================================================================
    showPlaceInfo(placeId, autoPan = false) {
      const place = this.getPlaceById(placeId);
      if (!place) return;

      this.selectedPlaceId = place.id;

      const allNodes = this.dom.svgHolder.querySelectorAll('.campus-node-group');
      allNodes.forEach((n) => n.classList.remove('selected-node'));
      const activeNode = document.getElementById(`node-${this.sanitizeId(place.id)}`);
      if (activeNode) activeNode.classList.add('selected-node');

      const style = CATEGORY_STYLES[place.category] || CATEGORY_STYLES.academic;
      if (this.dom.inspIcon) this.dom.inspIcon.textContent = place.icon;
      if (this.dom.inspCatLabel) this.dom.inspCatLabel.textContent = style.label;
      if (this.dom.inspTitle) this.dom.inspTitle.textContent = place.name;
      if (this.dom.inspDesc) this.dom.inspDesc.textContent = place.desc;
      if (this.dom.inspZone) this.dom.inspZone.textContent = place.zone;
      if (this.dom.inspHours) this.dom.inspHours.textContent = place.hours;

      if (this.dom.inspParkingBay) {
        this.dom.inspParkingBay.textContent = place.nearestBlock ? `Block ${place.nearestBlock} Parking Lot` : 'Main Visitor Bay';
      }

      if (this.dom.inspParkingStatus) {
        this.dom.inspParkingStatus.textContent = place.nearestBlock ? 'Live ANPR Monitoring' : 'Open Visitor Lot';
        this.dom.inspParkingStatus.className = 'text-green';
      }

      if (this.dom.inspTags) {
        this.dom.inspTags.innerHTML = (place.facilities || [])
          .map((f) => `<span class="cnav-tag-pill">${this.escapeHtml(f)}</span>`)
          .join('');
      }

      if (this.dom.inspBtnOpenLot) {
        if (place.nearestBlock) {
          this.dom.inspBtnOpenLot.style.display = 'block';
          this.dom.inspBtnOpenLot.textContent = `🅿️ Inspect Block ${place.nearestBlock} Parking Bay`;
        } else {
          this.dom.inspBtnOpenLot.style.display = 'none';
        }
      }

      if (this.dom.inspector) {
        this.dom.inspector.classList.remove('hidden');
      }

      if (autoPan) {
        this.panToPoint(place.x + place.w / 2, place.y + place.h / 2);
      }
    },

    hideInspector() {
      if (this.dom.inspector) this.dom.inspector.classList.add('hidden');
      this.selectedPlaceId = null;
      const allNodes = this.dom.svgHolder.querySelectorAll('.campus-node-group');
      allNodes.forEach((n) => n.classList.remove('selected-node'));
    },

    // ==========================================================================
    // PAN & ZOOM MATH ENGINE
    // ==========================================================================
    zoomAtPoint(factor, clientX, clientY) {
      const oldScale = this.transform.scale;
      let newScale = oldScale * factor;
      newScale = Math.max(this.transform.minScale, Math.min(this.transform.maxScale, newScale));

      this.transform.x = clientX - (clientX - this.transform.x) * (newScale / oldScale);
      this.transform.y = clientY - (clientY - this.transform.y) * (newScale / oldScale);
      this.transform.scale = newScale;

      this.applyTransform();
    },

    zoomAroundCenter(factor) {
      if (!this.dom.viewport) return;
      const rect = this.dom.viewport.getBoundingClientRect();
      this.zoomAtPoint(factor, rect.width / 2, rect.height / 2);
    },

    panToPoint(mapX, mapY) {
      if (!this.dom.viewport) return;
      const rect = this.dom.viewport.getBoundingClientRect();
      this.transform.x = rect.width / 2 - mapX * this.transform.scale;
      this.transform.y = rect.height / 2 - mapY * this.transform.scale;
      this.applyTransform();
    },

    resetMapView() {
      this.transform.scale = 0.85;
      this.transform.x = -380;
      this.transform.y = -80;
      this.applyTransform();
    },

    fitActiveRoute() {
      const start = this.getPlaceById(this.activeOrigin);
      const end = this.getPlaceById(this.activeDest);
      if (!start || !end || !this.dom.viewport) return;

      const minX = Math.min(start.x, end.x) - 150;
      const maxX = Math.max(start.x + start.w, end.x + end.w) + 150;
      const minY = Math.min(start.y, end.y) - 150;
      const maxY = Math.max(start.y + start.h, end.y + end.h) + 150;

      const boxW = maxX - minX;
      const boxH = maxY - minY;
      const rect = this.dom.viewport.getBoundingClientRect();

      const scale = Math.max(0.5, Math.min(1.8, Math.min(rect.width / boxW, rect.height / boxH)));
      this.transform.scale = scale;
      this.transform.x = rect.width / 2 - (minX + boxW / 2) * scale;
      this.transform.y = rect.height / 2 - (minY + boxH / 2) * scale;

      this.applyTransform();
    },

    applyTransform() {
      if (!this.dom.canvas) return;
      this.dom.canvas.style.transform = `translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`;
      if (this.dom.zoomLevelText) {
        this.dom.zoomLevelText.textContent = `${Math.round(this.transform.scale * 100)}%`;
      }
    },

    // ==========================================================================
    // FILTERING & SEARCH
    // ==========================================================================
    applyCategoryFilter() {
      const allNodes = this.dom.svgHolder.querySelectorAll('.campus-node-group');
      allNodes.forEach((node) => {
        const group = node.dataset.filtergroup;
        if (this.activeCategory === 'all' || group === this.activeCategory) {
          node.classList.remove('dimmed');
        } else {
          node.classList.add('dimmed');
        }
      });
    },

    handleSearch(query) {
      const resultsBox = this.dom.searchResults;
      if (!resultsBox) return;

      const q = query.trim().toLowerCase();
      if (!q) {
        resultsBox.classList.add('hidden');
        resultsBox.innerHTML = '';
        return;
      }

      const matches = this.places.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortLabel.toLowerCase().includes(q) ||
          (p.subLabel && p.subLabel.toLowerCase().includes(q)) ||
          p.zone.toLowerCase().includes(q) ||
          (p.blockNum && `block ${p.blockNum}`.includes(q))
      );

      if (!matches.length) {
        resultsBox.innerHTML = `<div class="cnav-search-item" style="color:#64748B;">No places found for "${this.escapeHtml(query)}"</div>`;
        resultsBox.classList.remove('hidden');
        return;
      }

      resultsBox.innerHTML = matches
        .map(
          (m) => `
        <div class="cnav-search-item" data-id="${m.id}">
          <div style="display:flex;align-items:center;gap:0.45rem;">
            <span>${m.icon}</span>
            <strong>${this.escapeHtml(m.shortLabel)}</strong>
          </div>
          <span style="font-size:0.7rem;color:#64748B;">${this.escapeHtml(m.subLabel || m.zone)}</span>
        </div>
      `
        )
        .join('');

      resultsBox.classList.remove('hidden');

      resultsBox.querySelectorAll('.cnav-search-item').forEach((item) => {
        item.addEventListener('click', () => {
          const id = item.dataset.id;
          if (id) {
            resultsBox.classList.add('hidden');
            this.showPlaceInfo(id, true);
          }
        });
      });
    },

    // ==========================================================================
    // UTILITIES
    // ==========================================================================
    getPlaceById(id) {
      return this.places.find((p) => p.id === id || String(p.blockNum) === String(id));
    },

    sanitizeId(id) {
      return String(id).replace(/[^a-zA-Z0-9]/g, '-');
    },

    escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  };

  global.NavigationModule = NavigationModule;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NavigationModule.init());
  } else {
    NavigationModule.init();
  }
})(window);