/**
 * ============================================================================
 * js/navigation.js
 * LPU 600-Acre Interactive Campus GIS Map & Turn-by-Turn Navigation Engine
 * Google Maps Style POI Markers & Clean Typography (No text-wrapping card boxes)
 * ============================================================================
 */

(function (global) {
  'use strict';

  const MAP_WIDTH = 2600;
  const MAP_HEIGHT = 1750;
  const METERS_PER_PIXEL = 0.72; // Realistic campus scale ratio

  // Google Maps Color Palette for POI Icons
  const CATEGORY_STYLES = {
    academic: {
      label: 'Academic',
      badgeBg: '#1A73E8', // Google Blue
      textColor: '#1E293B',
      emoji: '🎓'
    },
    admin: {
      label: 'Admissions & Admin',
      badgeBg: '#7C3AED', // Purple
      textColor: '#1E293B',
      emoji: '🏛️'
    },
    food: {
      label: 'Dining & Cafe',
      badgeBg: '#E65100', // Google Food Orange
      textColor: '#1E293B',
      emoji: '🍔'
    },
    hostel_boys: {
      label: 'Boys Hostel',
      badgeBg: '#0D9488', // Teal
      textColor: '#1E293B',
      emoji: '🏢'
    },
    hostel_girls: {
      label: 'Girls Hostel',
      badgeBg: '#D81B60', // Rose Pink
      textColor: '#1E293B',
      emoji: '🏬'
    },
    amenity: {
      label: 'Facility / Health',
      badgeBg: '#D93025', // Google Red
      textColor: '#1E293B',
      emoji: '🏥'
    },
    gate: {
      label: 'Campus Gate',
      badgeBg: '#188038', // Google Green
      textColor: '#1E293B',
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
      y: 110,
      w: 150,
      h: 55,
      icon: '🚧',
      zone: 'North GT Road Entry Plaza',
      hours: 'Open 24×7 (Security & ANPR Monitored)',
      nearestBlock: 30,
      desc: 'Primary ceremonial entrance off GT Road (NH-44) with security control, visitor pass desks, and e-rickshaw terminal.',
      facilities: ['ANPR Boom Barrier', 'Visitor Pass Kiosk', 'Security Desk', 'E-Rickshaw Hub']
    },
    {
      id: 'Main Gate 2',
      shortLabel: 'Gate 2',
      subLabel: 'Law Gate',
      name: 'LPU Gate 2 (Law Gate Plaza)',
      category: 'gate',
      filterGroup: 'gate',
      x: 440,
      y: 110,
      w: 145,
      h: 55,
      icon: '🚧',
      zone: 'North-West Law Gate Sector',
      hours: '06:00 AM – 11:00 PM',
      nearestBlock: 20,
      desc: 'Western entry gate connecting Law Gate market and LPU School of Law (Block 20).',
      facilities: ['Student Turnstiles', 'Two-Wheeler Lane', 'Auto Pickup']
    },
    {
      id: 'Gate 3',
      shortLabel: 'Gate 3',
      subLabel: 'Logistics Gate',
      name: 'LPU Gate 3 (East Logistics & Highway Gate)',
      category: 'gate',
      filterGroup: 'gate',
      x: 2150,
      y: 110,
      w: 145,
      h: 55,
      icon: '🚧',
      zone: 'North-East Logistics Sector',
      hours: '06:00 AM – 10:30 PM',
      nearestBlock: 15,
      desc: 'Eastern gateway for university transport buses and quick access to Engineering Blocks 15–18.',
      facilities: ['Bus Terminal', 'Fleet Bay', '2W/4W Parking']
    },

    // --- ACADEMIC & ADMIN BLOCKS (15 TO 35) ---
    {
      id: 'Block 15',
      blockNum: 15,
      shortLabel: 'Block 15',
      subLabel: 'Computer Science (CSE)',
      name: 'Block 15 - School of Computer Science & Engineering',
      category: 'academic',
      filterGroup: 'academic',
      x: 1850,
      y: 310,
      w: 135,
      h: 75,
      icon: '💻',
      zone: 'North-East Tech Quad',
      hours: '08:00 AM – 08:00 PM',
      nearestBlock: 15,
      desc: 'Apple Mac Labs, AI/ML research facilities, coding amphitheatre, and smart classrooms.',
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
      x: 2080,
      y: 310,
      w: 135,
      h: 75,
      icon: '⚙️',
      zone: 'North-East Tech Quad',
      hours: '08:00 AM – 06:30 PM',
      nearestBlock: 16,
      desc: 'CAD/CAM design studios, SAE Baja garage, CNC manufacturing bays, and robotics testing workshops.',
      facilities: ['Robotics Bay', 'SAE Baja Garage', '3D Prototyping Lab']
    },
    {
      id: 'Block 17',
      blockNum: 17,
      shortLabel: 'Block 17',
      subLabel: 'Civil Engg',
      name: 'Block 17 - School of Civil Engineering',
      category: 'academic',
      filterGroup: 'academic',
      x: 2080,
      y: 470,
      w: 135,
      h: 75,
      icon: '🏗️',
      zone: 'East Engineering Wing',
      hours: '08:30 AM – 06:00 PM',
      nearestBlock: 17,
      desc: 'Concrete technology testing laboratories, structural dynamics wing, and surveying research center.',
      facilities: ['Structural Testing Lab', 'GIS Survey Wing', 'Soil Mechanics Bay']
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
      y: 470,
      w: 135,
      h: 75,
      icon: '📐',
      zone: 'East Creative Wing',
      hours: '08:30 AM – 07:30 PM',
      nearestBlock: 18,
      desc: 'Architectural drafting studios, woodworking and laser-cutting labs, and student design galleries.',
      facilities: ['Drafting Studios', 'Model Making Lab', 'Exhibition Atrium']
    },
    {
      id: 'Block 19',
      blockNum: 19,
      shortLabel: 'Block 19',
      subLabel: 'Mittal School of Business',
      name: 'Block 19 - Mittal School of Business',
      category: 'academic',
      filterGroup: 'academic',
      x: 770,
      y: 310,
      w: 140,
      h: 75,
      icon: '📊',
      zone: 'North-West Business Quad',
      hours: '08:30 AM – 06:30 PM',
      nearestBlock: 19,
      desc: 'ACBSP-accredited business school with executive lecture halls and Bloomberg Finance Lab.',
      facilities: ['Bloomberg Terminal Lab', 'Executive Seminar Halls', 'VIP Faculty Parking']
    },
    {
      id: 'Block 20',
      blockNum: 20,
      shortLabel: 'Block 20',
      subLabel: 'LPU School of Law',
      name: 'Block 20 - LPU School of Law',
      category: 'academic',
      filterGroup: 'academic',
      x: 480,
      y: 310,
      w: 140,
      h: 75,
      icon: '⚖️',
      zone: 'North-West Law Gate Sector',
      hours: '08:30 AM – 06:00 PM',
      nearestBlock: 20,
      desc: 'Houses Moot Court auditoriums, Legal Aid Clinic, and extensive legal case archives.',
      facilities: ['2 Moot Courts', 'Legal Aid Clinic', 'Law Library', 'Dedicated Parking']
    },
    {
      id: 'Block 21',
      blockNum: 21,
      shortLabel: 'Block 21',
      subLabel: 'Agriculture & Bio',
      name: 'Block 21 - School of Agriculture & Bio-Sciences',
      category: 'academic',
      filterGroup: 'academic',
      x: 480,
      y: 470,
      w: 140,
      h: 75,
      icon: '🌱',
      zone: 'West Research Enclave',
      hours: '08:30 AM – 06:00 PM',
      nearestBlock: 21,
      desc: 'Hydroponics greenhouse labs, soil chemistry testing, and plant tissue culture chambers.',
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
      x: 770,
      y: 470,
      w: 140,
      h: 75,
      icon: '💊',
      zone: 'West Health Science Wing',
      hours: '08:30 AM – 06:00 PM',
      nearestBlock: 22,
      desc: 'PCI-approved pharmaceutical research building with drug synthesis and cleanroom suites.',
      facilities: ['Drug Synthesis Lab', 'Pharmacology Chambers', 'Direct Pharmacy Access']
    },
    {
      id: 'Block 23',
      blockNum: 23,
      shortLabel: 'Block 23',
      subLabel: 'Education & Humanities',
      name: 'Block 23 - School of Education & Humanities',
      category: 'academic',
      filterGroup: 'academic',
      x: 770,
      y: 850,
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
      id: 'Block 24',
      blockNum: 24,
      shortLabel: 'Block 24',
      subLabel: 'Fashion & Multimedia',
      name: 'Block 24 - School of Fashion Design & Multimedia',
      category: 'academic',
      filterGroup: 'academic',
      x: 2080,
      y: 690,
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
      id: 'Block 25',
      blockNum: 25,
      shortLabel: 'Block 25',
      subLabel: 'Student Welfare (DSW)',
      name: 'Block 25 - Division of Student Welfare (DSW)',
      category: 'admin',
      filterGroup: 'admin',
      x: 1380,
      y: 310,
      w: 150,
      h: 75,
      icon: '🤝',
      zone: 'Central Administration Plaza',
      hours: '08:30 AM – 07:00 PM',
      nearestBlock: 25,
      desc: 'Student welfare headquarters, university club offices, and student grievance & counseling cell.',
      facilities: ['Student Welfare Helpdesk', 'Club Headquarters', 'Counseling Center']
    },
    {
      id: 'Block 26',
      blockNum: 26,
      shortLabel: 'Block 26',
      subLabel: 'Computer Apps (MCA)',
      name: 'Block 26 - School of Computer Applications (MCA/BCA)',
      category: 'academic',
      filterGroup: 'academic',
      x: 500,
      y: 690,
      w: 140,
      h: 75,
      icon: '🖥️',
      zone: 'West Information Tech Quad',
      hours: '08:00 AM – 07:00 PM',
      nearestBlock: 26,
      desc: 'Dedicated applications computing block featuring cybersecurity testbeds and full-stack software development bays.',
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
      x: 500,
      y: 850,
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
      id: 'Block 28',
      blockNum: 28,
      shortLabel: 'Block 28',
      subLabel: 'Journalism & Film',
      name: 'Block 28 - School of Journalism & Film Production',
      category: 'academic',
      filterGroup: 'academic',
      x: 500,
      y: 1040,
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
      x: 770,
      y: 1040,
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
      id: 'Block 30',
      blockNum: 30,
      shortLabel: 'Block 30',
      subLabel: 'Division of Admissions',
      name: 'Block 30 - Division of Admissions & Visitor Center',
      category: 'admin',
      filterGroup: 'admin',
      x: 1110,
      y: 310,
      w: 160,
      h: 80,
      icon: '🏛️',
      zone: 'Central Administration Plaza (Grand Entrance)',
      hours: '08:30 AM – 07:00 PM (All 7 Days)',
      nearestBlock: 30,
      desc: 'Centralized university admissions, counseling hall, document verification desks, and campus visitor centre.',
      facilities: ['Central Admissions Hall', 'Document Verification Desk', 'Visitor VIP Lounge', 'Direct Parking']
    },
    {
      id: 'Block 31',
      blockNum: 31,
      shortLabel: 'Block 31',
      subLabel: 'Chemical & Nano',
      name: 'Block 31 - School of Chemical Engg & Nanotechnology',
      category: 'academic',
      filterGroup: 'academic',
      x: 1850,
      y: 1040,
      w: 135,
      h: 75,
      icon: '🧪',
      zone: 'East Applied Sciences Wing',
      hours: '08:30 AM – 06:00 PM',
      nearestBlock: 31,
      desc: 'Nanomaterial synthesis suites, mass transfer operations, and chemical spectroscopy labs.',
      facilities: ['Spectroscopy Lab', 'Polymer Testing Suite', 'Chemical Exhaust Vaults']
    },
    {
      id: 'Block 32',
      blockNum: 32,
      shortLabel: 'Block 32',
      subLabel: 'R&D Innovation Hub',
      name: 'Block 32 - Center for Research & Innovation (R&D)',
      category: 'academic',
      filterGroup: 'academic',
      x: 1850,
      y: 850,
      w: 135,
      h: 75,
      icon: '🔬',
      zone: 'East Research & Innovation Quad',
      hours: '08:00 AM – 09:00 PM',
      nearestBlock: 32,
      desc: 'Interdisciplinary high-performance computing clusters, patent filing cell, and central electron microscope facility.',
      facilities: ['SEM/TEM Electron Microscope', 'High Performance Cluster', 'Patent Cell']
    },
    {
      id: 'Block 33',
      blockNum: 33,
      shortLabel: 'Block 33',
      subLabel: 'CPE & Placement',
      name: 'Block 33 - Center for Professional Enhancement (CPE)',
      category: 'academic',
      filterGroup: 'academic',
      x: 1850,
      y: 690,
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
      id: 'Block 34',
      blockNum: 34,
      shortLabel: 'Block 34',
      subLabel: 'Central Library',
      name: 'Block 34 - Central University Library & Knowledge Commons',
      category: 'academic',
      filterGroup: 'academic',
      x: 1380,
      y: 850,
      w: 150,
      h: 80,
      icon: '📚',
      zone: 'Central Academic Commons',
      hours: '07:00 AM – 12:00 Midnight',
      nearestBlock: 34,
      desc: '5-story library landmark housing over 1.5 million volumes, digital repository halls, and 24×7 silent reading areas.',
      facilities: ['24×7 Reading Hall', 'Digital Repository', 'Cyber Commons', 'Underground Parking']
    },
    {
      id: 'Block 35',
      blockNum: 35,
      shortLabel: 'Block 35',
      subLabel: 'Examination & Registration',
      name: 'Block 35 - University Examination Affairs & Registration',
      category: 'admin',
      filterGroup: 'admin',
      x: 1110,
      y: 1040,
      w: 160,
      h: 75,
      icon: '📜',
      zone: 'Central Administrative Commons',
      hours: '08:30 AM – 06:00 PM',
      nearestBlock: 35,
      desc: 'Controller of Examinations, degree disbursement, migration certificates, and Registration secretariat.',
      facilities: ['Exam Verification Desks', 'Registration Secretariat', 'Transcript Vault']
    },

    // --- FOOD COURTS, CAFES & SOCIAL HUBS ---
    {
      id: 'UniMall',
      shortLabel: 'Uni-Mall',
      subLabel: 'Shopping & Cinema',
      name: 'Uni-Mall Central Plaza & Lifestyle Complex',
      category: 'amenity',
      filterGroup: 'amenity',
      x: 1110,
      y: 690,
      w: 160,
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
      x: 1110,
      y: 850,
      w: 160,
      h: 80,
      icon: '🍔',
      zone: 'Central Food & Dining Promenade',
      hours: '08:00 AM – 11:00 PM',
      nearestBlock: 34,
      desc: 'Multi-cuisine air-conditioned dining hall with Domino’s, Subway, Haldiram’s, and regional food outlets.',
      facilities: ['Air-Conditioned Hall', '20+ Outlets', 'Outdoor Patio Dining']
    },
    {
      id: 'BSS Cafe',
      shortLabel: 'BSS Cafe',
      subLabel: 'Student Lounge',
      name: 'BSS Cafe & Student Hangout Lounge',
      category: 'food',
      filterGroup: 'food',
      x: 820,
      y: 690,
      w: 125,
      h: 65,
      icon: '☕',
      zone: 'West Academic Garden Spine',
      hours: '08:30 AM – 10:00 PM',
      nearestBlock: 26,
      desc: 'Iconic campus hangout famous for specialty coffees, waffles, woodfired pizzas, and live acoustic music.',
      facilities: ['Coffee Bar', 'Open Lawn Seating', 'Live Music Stage']
    },
    {
      id: 'Food Square',
      shortLabel: 'Food Square',
      subLabel: 'Eateries Plaza',
      name: 'Food Square & Street Eateries Plaza',
      category: 'food',
      filterGroup: 'food',
      x: 1620,
      y: 690,
      w: 135,
      h: 70,
      icon: '🌮',
      zone: 'East Spine Dining Hub',
      hours: '09:00 AM – 10:30 PM',
      nearestBlock: 33,
      desc: 'Outdoor promenade with juice bars, milkshakes, shawarma, bakery patisserie, and dessert parlours.',
      facilities: ['Outdoor Gazebos', 'Juice & Shake Bars', 'Seating Pergolas']
    },
    {
      id: 'Uni-Health',
      shortLabel: 'Uni-Health',
      subLabel: '24×7 Hospital',
      name: 'Uni-Health (24×7 University Super-Specialty Hospital)',
      category: 'amenity',
      filterGroup: 'amenity',
      x: 1380,
      y: 690,
      w: 150,
      h: 80,
      icon: '🏥',
      zone: 'Central Medical Emergency Zone',
      hours: 'Open 24 Hours (Emergency Services)',
      nearestBlock: 34,
      desc: 'Full-service campus hospital with ICU beds, doctors, in-house pharmacy, and emergency ambulances.',
      facilities: ['24×7 Emergency Ward', 'In-house Pharmacy', 'Pathology Lab', 'Ambulance Bay']
    },

    // --- BOYS HOSTELS (BH-1 TO BH-7) ---
    {
      id: 'BH-1',
      shortLabel: 'BH-1',
      subLabel: 'Boys Hostel',
      name: 'Boys Hostel 1 (BH-1)',
      category: 'hostel_boys',
      filterGroup: 'hostel',
      x: 360,
      y: 1380,
      w: 110,
      h: 75,
      icon: '🏢',
      zone: 'West Residential Sector',
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
      y: 1380,
      w: 110,
      h: 75,
      icon: '🏢',
      zone: 'West Residential Sector',
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
      x: 680,
      y: 1380,
      w: 110,
      h: 75,
      icon: '🏢',
      zone: 'West Residential Sector',
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
      x: 940,
      y: 1380,
      w: 110,
      h: 75,
      icon: '🏢',
      zone: 'Central South Residential Spine',
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
      x: 1100,
      y: 1380,
      w: 110,
      h: 75,
      icon: '🏢',
      zone: 'Central South Residential Spine',
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
      x: 1360,
      y: 1380,
      w: 110,
      h: 75,
      icon: '🏢',
      zone: 'South-East Residential Sector',
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
      x: 1520,
      y: 1380,
      w: 110,
      h: 75,
      icon: '🏢',
      zone: 'South-East Residential Sector',
      hours: 'Resident Access 24×7 (Curfew 10:00 PM)',
      nearestBlock: 31,
      desc: 'Premium boys hostel with lift elevators, biometric gate turnstiles, and modern dining mess.',
      facilities: ['Biometric Gates', 'Elevator Access', 'Mess Dining']
    },

    // --- GIRLS HOSTELS (GH-1 TO GH-3) ---
    {
      id: 'GH-1',
      shortLabel: 'GH-1',
      subLabel: 'Girls Hostel',
      name: 'Girls Hostel 1 (GH-1 Complex)',
      category: 'hostel_girls',
      filterGroup: 'hostel',
      x: 1820,
      y: 1380,
      w: 120,
      h: 75,
      icon: '🏬',
      zone: 'East Residential Sanctuary (Secure Zone)',
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
      x: 2000,
      y: 1380,
      w: 120,
      h: 75,
      icon: '🏬',
      zone: 'East Residential Sanctuary (Secure Zone)',
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
      x: 2180,
      y: 1380,
      w: 120,
      h: 75,
      icon: '🏬',
      zone: 'East Residential Sanctuary (Secure Zone)',
      hours: 'Resident Access (Biometric Entry • Curfew 07:30 PM)',
      nearestBlock: 17,
      desc: 'High-rise residence with rooftop recreation track, cafeteria, and 24×7 infirmary nurse desk.',
      facilities: ['Infirmary Nurse', 'Hostel Cafeteria', 'Laundromat']
    },

    // --- AUDITORIUMS & STADIUMS ---
    {
      id: 'Shanti Devi Auditorium',
      shortLabel: 'Shanti Devi Audi',
      subLabel: 'Auditorium',
      name: 'Shanti Devi Mittal Auditorium',
      category: 'amenity',
      filterGroup: 'amenity',
      x: 1110,
      y: 470,
      w: 160,
      h: 80,
      icon: '🎭',
      zone: 'Central Cultural Avenue',
      hours: '08:30 AM – 09:30 PM',
      nearestBlock: 30,
      desc: 'Air-conditioned 2,500-seat theater auditorium host to convocations, global summits, and cultural plays.',
      facilities: ['Acoustic Soundstage', 'VIP Greenrooms', 'VIP Parking']
    },
    {
      id: 'Unipolis',
      shortLabel: 'Unipolis Arena',
      subLabel: 'Mega Amphitheatre',
      name: 'Baldev Raj Mittal Unipolis (Mega Amphitheatre)',
      category: 'amenity',
      filterGroup: 'amenity',
      x: 1380,
      y: 470,
      w: 150,
      h: 80,
      icon: '🎪',
      zone: 'Central Cultural Avenue',
      hours: 'Open Ground (Events Based)',
      nearestBlock: 25,
      desc: 'Canopied mega-arena accommodating over 15,000 students for concerts, youth festivals, and expos.',
      facilities: ['Covered Canopy', 'Concert Stage', 'Ring Road Access']
    },
    {
      id: 'Indoor Stadium',
      shortLabel: 'Indoor Stadium',
      subLabel: 'Olympic Aquatic Arena',
      name: 'Olympic Indoor Sports Arena & Aquatic Complex',
      category: 'amenity',
      filterGroup: 'amenity',
      x: 1380,
      y: 1040,
      w: 150,
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
      x: 1620,
      y: 1040,
      w: 145,
      h: 80,
      icon: '🏟️',
      zone: 'South-East Sports Field',
      hours: '05:30 AM – 08:30 PM',
      nearestBlock: 31,
      desc: '400m 8-lane synthetic track, cricket turf, pavilion stands, and campus VVIP helipad.',
      facilities: ['400m Synthetic Track', 'Cricket Pavilion', 'VVIP Helipad']
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

    // Pan & Zoom Engine State
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

      // Mouse Wheel Zoom centered at cursor
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

        // Pan with Left Click (button 0) OR Right Click (button 2)
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

        // Suppress browser context menu on right click inside viewport
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
    // MAP RENDERING: GOOGLE MAPS STYLE POI CIRCLES & HALO TEXT
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
            
            <!-- 1. Architectural Building Footprint on Ground -->
            <rect class="gmap-building-shape" 
                  x="${p.x}" y="${p.y}" 
                  width="${p.w}" height="${p.h}" 
                  rx="6"/>

            <!-- 2. Small Circular Logo Badge (Google Maps Pin) -->
            <g class="gmap-poi-circle" transform="translate(${cx}, ${cy - 10})">
              <circle r="14" fill="${style.badgeBg}" stroke="#FFFFFF" stroke-width="2.5" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.25))"/>
              <text text-anchor="middle" dy="4.5" font-size="13" fill="#FFFFFF">${p.icon}</text>
            </g>

            <!-- 3. Google Maps Style Text (No surrounding card, crisp white halo) -->
            <text class="gmap-label" x="${cx}" y="${cy + 17}">
              ${this.escapeHtml(p.shortLabel)}
            </text>
            
            <!-- Secondary Subtitle (e.g. "School of Law" or "Central Library") -->
            ${
              p.subLabel
                ? `<text class="gmap-sublabel" x="${cx}" y="${cy + 29}">${this.escapeHtml(p.subLabel)}</text>`
                : ''
            }
          </g>
        `;
        })
        .join('');

      this.dom.svgHolder.innerHTML = `
        <svg viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <style>
            /* Google Maps Vector Styles */
            .gmap-building-shape {
              fill: #FFFFFF;
              stroke: #CBD5E1;
              stroke-width: 1.5px;
              opacity: 0.88;
              transition: fill 0.2s, stroke 0.2s;
              cursor: pointer;
            }
            .campus-node-group:hover .gmap-building-shape {
              fill: #F8FAFC;
              stroke: #3B82F6;
              stroke-width: 2.5px;
            }
            .campus-node-group.selected-node .gmap-building-shape {
              fill: #EFF6FF !important;
              stroke: #2563EB !important;
              stroke-width: 3px !important;
            }

            .gmap-poi-circle {
              transform-box: fill-box;
              transform-origin: center;
              transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
              cursor: pointer;
            }
            .campus-node-group:hover .gmap-poi-circle {
              transform: scale(1.22);
            }
            .campus-node-group.selected-node .gmap-poi-circle {
              transform: scale(1.28);
            }

            /* Google Maps Text Halo: paint-order allows the text stroke to form a crisp border without hiding the letter */
            .gmap-label {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 11.5px;
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
            }

            .gmap-sublabel {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 9.5px;
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
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#CBD5E1" stroke-width="0.8" opacity="0.35"/>
              <circle cx="30" cy="30" r="1.5" fill="#94A3B8" opacity="0.35"/>
            </pattern>
          </defs>

          <!-- 1. BASE CAMPUS TERRAIN & LANDSCAPING -->
          <rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="#E2E8F0"/>
          <rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="url(#campusGridPattern)"/>

          <!-- Campus Green Lawn Belt -->
          <rect x="260" y="220" width="2080" height="1350" rx="36" fill="#E8F2E4" stroke="#D1E4CB" stroke-width="2.5"/>
          <rect x="740" y="600" width="1120" height="420" rx="24" fill="#DEF0D8" stroke="#C7E2BE" stroke-width="2"/>
          
          <!-- Central Water Canal & Fountain -->
          <path d="M 280 620 L 2300 620" stroke="#BAE6FD" stroke-width="22" stroke-linecap="round"/>
          <path d="M 1300 240 L 1300 1520" stroke="#BAE6FD" stroke-width="20" stroke-linecap="round"/>
          <circle cx="1300" cy="620" r="38" fill="#7DD3FC" stroke="#38BDF8" stroke-width="4"/>
          <circle cx="1300" cy="620" r="16" fill="#0284C7"/>

          <!-- 2. THOROUGHFARES & CAMPUS AVENUES -->
          <!-- NH-44 Grand Trunk Road (Top Road) -->
          <path d="M 50 140 L 2550 140" stroke="#64748B" stroke-width="42" stroke-linecap="round"/>
          <path d="M 50 140 L 2550 140" stroke="#F8FAFC" stroke-width="3" stroke-dasharray="24 16"/>
          <text x="1300" y="96" font-size="13" font-weight="800" fill="#475569" letter-spacing="0.1em" text-anchor="middle">
            NATIONAL HIGHWAY 44 • JALANDHAR–DELHI GT ROAD (LPU MAIN FRONTAGE)
          </text>

          <!-- Academic North Boulevard -->
          <path d="M 280 240 L 2320 240" stroke="#94A3B8" stroke-width="30" stroke-linecap="round"/>
          <path d="M 280 240 L 2320 240" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="14 10"/>

          <!-- Central Spine Avenue -->
          <path d="M 280 780 L 2320 780" stroke="#94A3B8" stroke-width="32" stroke-linecap="round"/>
          <path d="M 280 780 L 2320 780" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="14 10"/>

          <!-- South Residential Promenade -->
          <path d="M 280 1260 L 2320 1260" stroke="#94A3B8" stroke-width="30" stroke-linecap="round"/>
          <path d="M 280 1260 L 2320 1260" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="14 10"/>

          <!-- North-South Connecting Crossings -->
          <path d="M 680 140 L 680 1520" stroke="#94A3B8" stroke-width="28" stroke-linecap="round"/>
          <path d="M 1300 140 L 1300 1520" stroke="#94A3B8" stroke-width="34" stroke-linecap="round"/>
          <path d="M 1780 140 L 1780 1520" stroke="#94A3B8" stroke-width="28" stroke-linecap="round"/>
          <path d="M 2300 140 L 2300 1520" stroke="#94A3B8" stroke-width="26" stroke-linecap="round"/>

          <!-- 3. SPORTS STADIUM TURF & HELIPAD -->
          <rect x="1605" y="1025" width="170" height="105" rx="12" fill="#86EFAC" stroke="#16A34A" stroke-width="2.5"/>
          <circle cx="1690" cy="1077" r="28" fill="none" stroke="#FFFFFF" stroke-width="3"/>
          <text x="1690" y="1084" font-size="17" font-weight="900" fill="#FFFFFF" text-anchor="middle">H</text>

          <!-- 4. ACTIVE DYNAMIC NAVIGATION ROUTE PATH LAYER -->
          <g id="campus-route-layer"></g>

          <!-- 5. PLACES & POI CIRCLES LAYER -->
          <g id="campus-nodes-layer">
            ${nodesMarkup}
          </g>

          <!-- 6. START / DESTINATION PINS LAYER -->
          <g id="campus-pins-layer"></g>
        </svg>
      `;

      // Attach Node Click Handlers
      const nodeElements = this.dom.svgHolder.querySelectorAll('.campus-node-group');
      nodeElements.forEach((el) => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const placeId = el.dataset.id;
          this.handleNodeClick(placeId);
        });
      });

      this.applyTransform();
    },

    // ==========================================================================
    // ROUTE CALCULATION
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

      if (start.y < 500 && end.y >= 500) {
        steps.push(`Walk south along <strong>Academic North Boulevard</strong> toward Central Spine.`);
      } else if (start.y >= 500 && end.y < 500) {
        steps.push(`Proceed northward past <strong>Uni-Mall Central Plaza</strong>.`);
      }

      if (end.category.startsWith('hostel')) {
        steps.push(`Head southward into the <strong>Student Residential Sector</strong>.`);
      } else if (end.category === 'academic') {
        steps.push(`Follow avenue signage toward <strong>Academic Wing (Block ${end.blockNum || ''})</strong>.`);
      }

      if (end.nearestBlock) {
        steps.push(`Parking authorized at <strong>Block ${end.nearestBlock} Bay</strong>.`);
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
        this.dom.viaTag.textContent = `Via Central Avenue (${totalDist} m)`;
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
        <path d="${pathData}" fill="none" stroke="#93C5FD" stroke-width="14" stroke-linecap="round" opacity="0.6"/>
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
    // PLACE INSPECTOR
    // ==========================================================================
    handleNodeClick(placeId) {
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
        this.dom.inspParkingStatus.textContent = place.nearestBlock ? 'Live Monitoring Active' : 'Open Visitor Lot';
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

      this.panToPoint(place.x + place.w / 2, place.y + place.h / 2);
    },

    hideInspector() {
      if (this.dom.inspector) this.dom.inspector.classList.add('hidden');
      this.selectedPlaceId = null;
      const allNodes = this.dom.svgHolder.querySelectorAll('.campus-node-group');
      allNodes.forEach((n) => n.classList.remove('selected-node'));
    },

    // ==========================================================================
    // PAN & ZOOM MATH
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
            this.handleNodeClick(id);
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