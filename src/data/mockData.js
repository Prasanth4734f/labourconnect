// ==========================================
// LABOURCONNECT 2.0 - MASTER STATE & DATA STORE
// Master Blueprint Schema
// ==========================================

export const SKILLED_WORKERS = [
  {
    id: 'wrk-1',
    name: 'Ravi Kumar',
    trade: 'Mason',
    category: 'mason',
    experienceYears: 8,
    dailyRate: 1100,
    unit: 'per day (8 hrs)',
    city: 'Chennai',
    area: 'Velachery & OMR',
    verified: true,
    rating: 4.8,
    reviewsCount: 42,
    completedJobs: 24,
    availability: 'Available Immediately',
    phone: '+91 98401 23456',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    skills: ['Brickwork', 'Plastering', 'Concrete', 'Foundation', '9" Wire-cut Walls'],
    gangSize: 'Gang of 6 to 10 Available',
    bio: 'Dedicated master mason with 8 years of hands-on structural brickwork and RCC foundation casting across high-end villas.'
  },
  {
    id: 'wrk-2',
    name: 'Nagaraju Master Mason',
    trade: 'Mason',
    category: 'mason',
    experienceYears: 18,
    dailyRate: 1250,
    unit: 'per day',
    city: 'Bengaluru / Mysuru',
    area: 'Whitefield & Electronic City',
    verified: true,
    rating: 4.95,
    reviewsCount: 84,
    completedJobs: 112,
    availability: 'Available Immediately',
    phone: '+91 98450 44120',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    skills: ['RCC Column Casting', 'Stone Masonry', 'Arch Framing', 'Rat-trap Bond'],
    gangSize: 'Gang of 8 to 12 Available',
    bio: 'Specialist in high-precision structural RCC casting, rat-trap bond brickwork, and heritage stone arches with 18+ years on luxury duplexes.'
  },
  {
    id: 'wrk-3',
    name: 'Suresh Kumar',
    trade: 'Electrician',
    category: 'electrician',
    experienceYears: 12,
    dailyRate: 1050,
    unit: 'per day',
    city: 'Chennai',
    area: 'Anna Nagar & OMR',
    verified: true,
    rating: 4.92,
    reviewsCount: 62,
    completedJobs: 95,
    availability: 'Available Today',
    phone: '+91 94441 22890',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    skills: ['Concealed PVC Conduits', '3-Phase DB Dressing', 'Smart Automation', 'Inverter Wiring'],
    gangSize: 'Solo or 4-Man Crew',
    bio: "Government 'A' Grade licensed wireman. Expert in 3-phase load calculation, Havells smart distribution panels, and concealed slab conduit routing."
  },
  {
    id: 'wrk-4',
    name: 'Manjunath Plumber',
    trade: 'Plumber',
    category: 'plumber',
    experienceYears: 14,
    dailyRate: 1000,
    unit: 'per day',
    city: 'Bengaluru',
    area: 'Indiranagar & Koramangala',
    verified: true,
    rating: 4.88,
    reviewsCount: 54,
    completedJobs: 78,
    availability: 'Available Tomorrow',
    phone: '+91 97312 88410',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    skills: ['CPVC / UPVC Hot-Cold Lines', 'Concealed Diverters', 'Drainage Sump Connections', 'Solar Water Lines'],
    gangSize: '3-Man Crew',
    bio: 'Ashirvad & Supreme certified plumbing specialist. 100% leak-tested concealed pressure lines with hydrostatic test pump verification.'
  },
  {
    id: 'wrk-5',
    name: 'Babu Acharya',
    trade: 'Carpenter',
    category: 'carpenter',
    experienceYears: 20,
    dailyRate: 1350,
    unit: 'per day',
    city: 'Hyderabad',
    area: 'Gachibowli & Jubilee Hills',
    verified: true,
    rating: 4.98,
    reviewsCount: 96,
    completedJobs: 130,
    availability: 'Available Immediately',
    phone: '+91 99882 11044',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    skills: ['Teak Wood Main Doors', 'Century Plywood Wardrobes', 'False Ceilings', 'Fluted Wall Louvers'],
    gangSize: 'Gang of 8 Available',
    bio: 'Heritage and contemporary woodwork craftsman. Specialized in solid Burma teak carving, CNC fluted panel installations, and soft-close modular kitchens.'
  },
  {
    id: 'wrk-6',
    name: 'Ramesh Painter',
    trade: 'Painter',
    category: 'painter',
    experienceYears: 10,
    dailyRate: 950,
    unit: 'per day',
    city: 'Chennai',
    area: 'Adyar & T. Nagar',
    verified: true,
    rating: 4.85,
    reviewsCount: 47,
    completedJobs: 82,
    availability: 'Available Today',
    phone: '+91 98410 77332',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    skills: ['Apex Ultima Weatherproof', 'Royale Luxury Interior', 'Wall Putty 3-Coat Mirror Finish', 'Texture Spray'],
    gangSize: '5-Man Crew',
    bio: 'Asian Paints certified applicator with airless spray guns and orbital sanding machines for zero-dust mirror-smooth wall finishes.'
  },
  {
    id: 'wrk-7',
    name: 'Mohan Fabricator',
    trade: 'Welder',
    category: 'welder',
    experienceYears: 11,
    dailyRate: 1100,
    unit: 'per day',
    city: 'Chennai',
    area: 'Guindy & Ambattur',
    verified: true,
    rating: 4.89,
    reviewsCount: 39,
    completedJobs: 65,
    availability: 'Available Today',
    phone: '+91 94451 90812',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    skills: ['MS/SS Staircase Railings', 'Main Sliding Gate Fabrication', 'Polycarbonate Pergola Sheds', 'Laser Cut Jaali'],
    gangSize: '3-Man Crew',
    bio: 'Argon & MIG welding expert. Heavy duty structural steel truss welding, safety grills, and CNC laser decorative panels.'
  },
  {
    id: 'wrk-8',
    name: 'Karthik Tile Layer',
    trade: 'Tile Worker',
    category: 'tile_worker',
    experienceYears: 13,
    dailyRate: 1150,
    unit: 'per day',
    city: 'Bengaluru / Hyderabad',
    area: 'All Areas',
    verified: true,
    rating: 4.93,
    reviewsCount: 58,
    completedJobs: 91,
    availability: 'Available Immediately',
    phone: '+91 96112 55901',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    skills: ['4x2 Large Vitrified GVT', 'Italian Marble Mirror Polish', 'Epoxy Grouting', 'Staircase Granite Nosing'],
    gangSize: '4-Man Crew',
    bio: 'Laser-level precision tiling specialist. Zero-lip tile leveling spacers and stain-proof epoxy grout application.'
  },
  {
    id: 'wrk-9',
    name: 'Anand & Gang',
    trade: 'General Labour',
    category: 'general_labour',
    experienceYears: 7,
    dailyRate: 750,
    unit: 'per worker / day',
    city: 'Chennai',
    area: 'All Zones',
    verified: true,
    rating: 4.78,
    reviewsCount: 33,
    completedJobs: 50,
    availability: 'Available Immediately',
    phone: '+91 98409 11223',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    skills: ['Site Debris Clearance', 'Material Shifting', 'Concrete Curing Assistance', 'Excavation Support'],
    gangSize: 'Crew of 10-15 Available',
    bio: 'Reliable general helpers for concrete pouring days, unloading heavy cement & steel trucks, site backfilling, and continuous 14-day water curing.'
  }
];

export const CONSULTING_ENGINEERS = [
  {
    id: 'eng-1',
    name: 'Er. Rajesh Varma, M.Tech',
    role: 'Civil / Structural Engineer',
    company: 'Varma Structural Consultants',
    licenseNo: 'COA/2014/68421 • PWD Grade 1',
    verified: true,
    rating: 4.95,
    reviewsCount: 52,
    experienceYears: 14,
    completedProjects: 76,
    city: 'Chennai',
    speciality: 'Earthquake-Resistant RCC Framing & Luxury Duplexes',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    feePerSqft: 28,
    availability: 'Accepting Projects'
  },
  {
    id: 'eng-2',
    name: 'Er. Ananya Swaminathan, B.Arch',
    role: 'Architect',
    company: 'Gandharva Heritage & Modern Designs',
    licenseNo: 'CA/2016/79104 • IGBC Certified',
    verified: true,
    rating: 4.98,
    reviewsCount: 64,
    experienceYears: 11,
    completedProjects: 58,
    city: 'Chennai / Coimbatore',
    speciality: 'Biophilic Design, Natural Cross-Ventilation & Vaastu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    feePerSqft: 32,
    availability: 'Accepting Projects'
  },
  {
    id: 'eng-3',
    name: 'Er. Karthikeyan Sundaram',
    role: 'Structural Engineer',
    company: 'Sundaram & Associates Structurals',
    licenseNo: 'SEC/2012/91024',
    verified: true,
    rating: 4.9,
    reviewsCount: 41,
    experienceYears: 16,
    completedProjects: 92,
    city: 'Chennai',
    speciality: 'Soil Bearing Capacity & Deep Raft Foundations',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    feePerSqft: 25,
    availability: 'Available for Site Visits'
  }
];

export const EQUIPMENT_RENTALS = [
  {
    id: 'eq-1',
    name: 'JCB 3DX Super Backhoe Loader',
    type: 'Excavator & Earthmover',
    category: 'earthmoving',
    hourlyRate: 1450,
    dailyRate: 10500,
    operatorIncluded: true,
    dieselOption: 'Included with Operator',
    specs: '0.24 m³ Excavator bucket, 1.0 m³ Shovel, Max digging depth 4.77m',
    supplierName: 'Prabhu Heavy Earthmovers',
    status: 'Ready on Site',
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=400&q=80',
    location: 'Chennai (Delivers within 3 hrs)',
    availability: 'Immediate'
  },
  {
    id: 'eq-2',
    name: '10/7 CFT Hydraulic Concrete Mixer + 60ft Winch',
    type: 'Concrete Mixer & Tower',
    category: 'concrete',
    hourlyRate: 650,
    dailyRate: 4800,
    operatorIncluded: true,
    dieselOption: 'Electric 3-Phase or Diesel',
    specs: 'Batch 280L unmixed / 200L mixed with wire-rope hoisting tower up to 4 floors',
    supplierName: 'Metro Infra Rentals',
    status: 'Available Immediately',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
    location: 'Chennai / Chengalpattu',
    availability: 'Available'
  },
  {
    id: 'eq-3',
    name: 'Mobile Hydraulic Crane (12 Ton Capacity)',
    type: 'Crane',
    category: 'crane',
    hourlyRate: 2200,
    dailyRate: 16000,
    operatorIncluded: true,
    dieselOption: 'Diesel & Operator included',
    specs: '12-ton pick and carry hydraulic crane with 3-section telescoping boom up to 32ft',
    supplierName: 'Southern Heavy Lifters',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=400&q=80',
    location: 'Chennai All Zones',
    availability: 'Booking Open'
  },
  {
    id: 'eq-4',
    name: 'Cuplock / H-Frame Heavy Steel Scaffolding (5,000 Sq.Ft)',
    type: 'Scaffolding & Props',
    category: 'scaffolding',
    hourlyRate: 0,
    dailyRate: 3500,
    operatorIncluded: false,
    dieselOption: 'Standard Weekly / Daily Rental',
    specs: 'High tensile steel pipes, base jacks, ledger blades, walking platforms & safety nets',
    supplierName: 'Apex Scaffolding Solutions',
    status: 'Delivery in 4 Hours',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    location: 'Chennai / OMR',
    availability: 'In Stock'
  }
];

export const MATERIAL_PROVIDERS = [
  {
    id: 'mat-prov-1',
    company: 'Sri Balaji Building Materials & Cements',
    category: 'Cement & Sand',
    verification: 'GST Verified • Authorized UltraTech Dealer',
    serviceArea: 'Chennai & Suburbs (Same-day Delivery)',
    rating: 4.9,
    products: [
      { name: 'UltraTech Super 53 Grade Cement', price: '₹385 / bag (50kg)', min: '50 bags' },
      { name: 'Double Washed M-Sand (RCC Grade)', price: '₹52 / cu.ft', min: '400 cu.ft' },
      { name: '20mm Crushed Blue Metal Aggregate', price: '₹42 / cu.ft', min: '400 cu.ft' }
    ],
    contact: '+91 98401 55678',
    delivery: 'Free within 15 km on bulk loads'
  },
  {
    id: 'mat-prov-2',
    company: 'Venkateshwara Steels & TMT Alloys',
    category: 'Steel & Rebar',
    verification: 'Authorized Tata Tiscon Primary Distributor',
    serviceArea: 'Tamil Nadu & South India',
    rating: 4.95,
    products: [
      { name: 'Tata Tiscon 550D Super Ductile Rebar', price: '₹68,500 / metric tonne', min: '1 tonne' },
      { name: 'Jindal Panther Fe 550D TMT', price: '₹65,200 / metric tonne', min: '1 tonne' },
      { name: 'Binding Wire (18 Gauge Galvanized)', price: '₹95 / kg', min: '25 kg' }
    ],
    contact: '+91 94440 98123',
    delivery: 'Crane-unloaded flatbed delivery'
  },
  {
    id: 'mat-prov-3',
    company: 'Malabar Red Bricks & Clay Works',
    category: 'Bricks & Blocks',
    verification: 'Government Certified Kiln Producer',
    serviceArea: 'Chennai / Kanchipuram / Tiruvallur',
    rating: 4.82,
    products: [
      { name: 'Class-1 Standard Wire-Cut Red Bricks', price: '₹11.50 / piece', min: '3,000 pcs' },
      { name: 'Aerated Autoclaved Concrete (AAC) Blocks 8"', price: '₹62 / block', min: '400 blocks' },
      { name: 'Solid Concrete Foundation Blocks 6"', price: '₹38 / block', min: '500 blocks' }
    ],
    contact: '+91 97908 33455',
    delivery: 'Tractor trailer site drop'
  },
  {
    id: 'mat-prov-4',
    company: 'Kajaria Grand & Royale Tiles Gallery',
    category: 'Tiles & Sanitary',
    verification: 'Official Premium Studio Partner',
    serviceArea: 'Chennai & Pondicherry',
    rating: 4.88,
    products: [
      { name: '4x2 Glazed Vitrified Tiles (GVT Mirror)', price: '₹68 / sq.ft', min: '300 sq.ft' },
      { name: 'Anti-Skid Bathroom Flooring Tiles 2x2', price: '₹48 / sq.ft', min: '150 sq.ft' },
      { name: 'Stainproof Epoxy Grout 5kg Bucket', price: '₹1,250 / bucket', min: '1 unit' }
    ],
    contact: '+91 98412 99001',
    delivery: 'Crated zero-breakage transport'
  }
];

export const LOAN_PROVIDERS = [
  {
    id: 'loan-1',
    bankName: 'HDFC Bank Home & Construction Loans',
    loanType: 'Self-Construction / Plot + Construction',
    interestRate: '8.45% - 9.15% p.a.',
    tenure: 'Up to 30 Years',
    maxFunding: 'Up to 80% of estimate',
    eligibility: 'Salaried (Min ₹40k/mo) or Self-Employed (2-Yr ITR)',
    docsRequired: ['Approved Building Plan', 'Stage-wise Engineer Estimate', 'Patta / Land Title', 'Last 3 Yrs ITR'],
    disbursementMode: 'Stage-wise Escrow linked to site inspection',
    tag: 'Fastest 72h Sanction'
  },
  {
    id: 'loan-2',
    bankName: 'State Bank of India (SBI Realty Loan)',
    loanType: 'SBI Ghar Nirman Construction Loan',
    interestRate: '8.40% - 8.90% p.a.',
    tenure: 'Up to 30 Years',
    maxFunding: 'Up to 85% of total budget',
    eligibility: 'Indian Citizens with CIBIL Score 750+',
    docsRequired: ['Land Deed', 'Panchayat / Corporation Approval', 'Civil Engineer Cost Sheet', '6 Mo Bank Statement'],
    disbursementMode: 'Direct tranche release against architect completion certificates',
    tag: 'Lowest Interest Rate'
  },
  {
    id: 'loan-3',
    bankName: 'ICICI Bank Construction Express',
    loanType: 'Home Extension & Independent House Loan',
    interestRate: '8.60% - 9.30% p.a.',
    tenure: 'Up to 25 Years',
    maxFunding: 'Up to 80% of construction value',
    eligibility: 'Salaried / Professionals with CIBIL 720+',
    docsRequired: ['Architect Blueprint', 'LabourConnect Stage Milestone Report', 'Salary Slips'],
    disbursementMode: 'Instant digital tranche release through LabourConnect escrow API',
    tag: 'LabourConnect Pre-Approved'
  }
];

export const MASTER_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Chennai Residence',
    subtitle: 'Residential • 2 Floor • 3BHK',
    location: 'Velachery, Chennai',
    plotDimensions: '30 × 40 ft',
    plotAreaSqft: 1200,
    builtUpAreaSqft: 2150,
    floors: 2,
    bedrooms: 3,
    bathrooms: 3,
    parking: '1 Car + 2 Bikes',
    balcony: 'East Facing 8x5 ft',
    estimatedCost: '₹32,40,000',
    spentCost: '₹20,40,000',
    progressPercent: 64,
    currentPhase: 'First Floor RCC Slab & Shuttering',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    designVersion: 'V3',
    costBreakdown: {
      total: 3240000,
      structure: 1420000,
      materials: 960000,
      labour: 580000,
      electrical: 110000,
      plumbing: 90000,
      finishing: 80000
    },
    materialsRequired: [
      { item: 'Cement (UltraTech 53 Grade)', quantity: '420 bags', cost: '₹1,61,700', status: 'Delivered (320 bags)' },
      { item: 'Steel Rebar (Tata Tiscon 550D)', quantity: '4.2 tonnes', cost: '₹2,87,700', status: 'Delivered (4.2 T)' },
      { item: 'Wire-Cut Red Bricks', quantity: '18,500 pcs', cost: '₹2,12,750', status: 'In Transit (8,000 pcs)' },
      { item: 'Double Washed M-Sand', quantity: '52 m³ (1,840 cu.ft)', cost: '₹95,680', status: 'On Site' },
      { item: '20mm Blue Metal Aggregate', quantity: '38 m³ (1,340 cu.ft)', cost: '₹56,280', status: 'On Site' },
      { item: 'GVT Vitrified Tiles', quantity: '1,240 sq.ft', cost: '₹84,320', status: 'Awaiting Flooring Phase' },
      { item: 'Asian Paints Apex & Royale', quantity: '3,200 sq.ft area', cost: '₹48,000', status: 'Awaiting Finishing' }
    ],
    phases: [
      { name: 'Foundation & Footings', status: 'done', progress: 100, date: '12 Sep 2026', inspector: 'Er. Rajesh Varma' },
      { name: 'Plinth Beam & Anti-Termite', status: 'done', progress: 100, date: '24 Sep 2026', inspector: 'Er. Rajesh Varma' },
      { name: 'Ground Floor Columns & Walls', status: 'done', progress: 100, date: '01 Oct 2026', inspector: 'Er. Rajesh Varma' },
      { name: 'First Floor RCC Slab', status: 'in_progress', progress: 65, date: 'In Progress (Target Oct 08)', inspector: 'Er. Rajesh Varma' },
      { name: 'Brick Partitions & Plastering', status: 'pending', progress: 0, date: 'Est. Oct 20', inspector: 'Pending' },
      { name: 'Concealed MEP (Electrical & Plumbing)', status: 'pending', progress: 0, date: 'Est. Nov 05', inspector: 'Pending' },
      { name: 'Flooring & Tiling', status: 'pending', progress: 0, date: 'Est. Nov 22', inspector: 'Pending' },
      { name: 'Painting & Final Handover', status: 'pending', progress: 0, date: 'Est. Dec 10', inspector: 'Pending' }
    ],
    team: [
      { role: 'Customer / Owner', name: 'Prasanth Kumar', phone: '+91 98400 11223', status: 'Active' },
      { role: 'Consulting Engineer', name: 'Er. Rajesh Varma', company: 'Varma Structural', status: 'Inspecting Weekly' },
      { role: 'Lead Mason Contractor', name: 'Ravi Kumar & Gang (10 workers)', phone: '+91 98401 23456', status: 'On Site' },
      { role: 'Licensed Wireman', name: 'Suresh Kumar', phone: '+91 94441 22890', status: 'Scheduled for MEP' },
      { role: 'Material Supplier', name: 'Sri Balaji Materials', phone: '+91 98401 55678', status: 'Active Dispatches' }
    ],
    siteUpdates: [
      {
        id: 'up-1',
        title: 'First Floor Slab Shuttering Props & Cover Blocks Verified',
        date: 'Today, 10:30 AM',
        author: 'Er. Rajesh Varma (Engineer)',
        photos: [
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80'
        ],
        notes: 'Laser level check passed. Reinforcement steel 16mm/12mm tied at 150mm c/c with 25mm concrete cover blocks placed.'
      },
      {
        id: 'up-2',
        title: 'Plinth Beam Curing & Ground Floor Masonry Completed',
        date: '28 Sep 2026',
        author: 'Ravi Kumar (Mason)',
        photos: [
          'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=500&q=80'
        ],
        notes: 'All outer 9 inch brick walls raised to lintel height. Chajjas casted with waterproof chemical compound.'
      }
    ]
  },
  {
    id: 'proj-2',
    title: 'Bengaluru Commercial Complex',
    subtitle: 'Commercial • G+3 Floor • 4,800 sq.ft',
    location: 'Whitefield, Bengaluru',
    plotDimensions: '40 × 60 ft',
    plotAreaSqft: 2400,
    builtUpAreaSqft: 4800,
    floors: 4,
    bedrooms: 0,
    bathrooms: 6,
    parking: 'Basement 6 Cars + 12 Bikes',
    balcony: 'Glass Facade Balconies',
    estimatedCost: '₹95,00,000',
    spentCost: '₹30,40,000',
    progressPercent: 32,
    currentPhase: 'Ground Floor Column & Beam Reinforcement',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    designVersion: 'V2',
    costBreakdown: {
      total: 9500000,
      structure: 4500000,
      materials: 2800000,
      labour: 1400000,
      electrical: 350000,
      plumbing: 250000,
      finishing: 200000
    },
    materialsRequired: [
      { item: 'Cement (ACC 53 Grade)', quantity: '1,200 bags', cost: '₹4,50,000', status: 'Delivered (600 bags)' },
      { item: 'Steel Rebar Fe 550D', quantity: '14.5 tonnes', cost: '₹9,86,000', status: 'Delivered (14.5 T)' },
      { item: 'AAC Blocks 8"', quantity: '4,200 blocks', cost: '₹2,60,400', status: 'Pending Delivery' }
    ],
    phases: [
      { name: 'Basement Excavation & Raft Foundation', status: 'done', progress: 100, date: '15 Aug 2026', inspector: 'Er. Karthikeyan' },
      { name: 'Retaining Walls & Basement Slab', status: 'done', progress: 100, date: '10 Sep 2026', inspector: 'Er. Karthikeyan' },
      { name: 'Ground Floor Columns & Beams', status: 'in_progress', progress: 55, date: 'In Progress', inspector: 'Er. Karthikeyan' },
      { name: 'First to Third Floor RCC Frames', status: 'pending', progress: 0, date: 'Est. Nov 2026', inspector: 'Pending' }
    ],
    team: [
      { role: 'Owner', name: 'Kiran Reddy', phone: '+91 99000 44556', status: 'Active' },
      { role: 'Consulting Engineer', name: 'Er. Karthikeyan', company: 'Sundaram Structurals', status: 'Site Lead' }
    ],
    siteUpdates: []
  }
];

export const INITIAL_PROJECTS = MASTER_PROJECTS;
export const DAILY_MATERIAL_PRICES = MATERIAL_PROVIDERS[0].products;
export const LABOUR_GANGS = SKILLED_WORKERS;
export const HEAVY_EQUIPMENT = EQUIPMENT_RENTALS;
export const VERIFIED_ENGINEERS = CONSULTING_ENGINEERS;
export const ARCHITECTURAL_STYLES = [
  { id: 'vintage_traditional', name: 'Vintage Traditional Heritage', estCostPerSqft: 2250 },
  { id: 'modern_minimalist', name: 'Modern Minimalist Contemporary', estCostPerSqft: 2450 },
  { id: 'eco_sustainable', name: 'Eco-Sustainable Biophilic', estCostPerSqft: 2050 }
];
export const SAMPLE_CHAT_MESSAGES = [
  {
    id: 'msg-1',
    senderRole: 'engineer',
    senderName: 'Er. Rajesh Varma',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    time: '10:15 AM',
    text: 'Site inspection completed for Ground Floor Column Shuttering. Cover blocks (25mm) verified. Ready for concrete mixer batching.',
    attachment: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'msg-2',
    senderRole: 'worker',
    senderName: 'Ravi Kumar (Mason)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    time: '10:22 AM',
    text: '10-man gang is on site. 10/7 concrete mixer and needle vibrators are set up. Starting slab pour at 11:00 AM.',
    attachment: null
  },
  {
    id: 'msg-3',
    senderRole: 'supplier',
    senderName: 'Sri Balaji Building Materials',
    avatar: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=200&q=80',
    time: '10:30 AM',
    text: 'Dispatch confirmed: 150 bags UltraTech 53 Grade Cement truck delivered to site.',
    attachment: null
  },
  {
    id: 'msg-4',
    senderRole: 'customer',
    senderName: 'Prasanth Kumar (Owner)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    time: '10:35 AM',
    text: 'Excellent progress! Phase escrow payout is verified. Proceed with the concrete pour.',
    attachment: null
  }
];

export const BANK_LOANS = [
  {
    id: 'bank-sbi',
    name: 'State Bank of India',
    bankName: 'SBI Realty Home Construction Loan',
    interestRate: '8.40%',
    maxTenure: 30,
    maxFunding: 'Up to 90% of Total BOQ',
    tag: 'Lowest Floating Rate',
    loanType: 'Individual Plot + Villa Construction',
    eligibility: 'Salaried min ₹40,000/mo or Self-Employed with 2 yrs ITR',
    disbursementMode: 'Direct Stage Escrow Tranches (4-6 Stages based on Engineer Certificates)',
    minIncome: 40000,
    processingFee: '0.35% (Max ₹10,000 + GST)',
    features: ['Zero Prepayment Penalty', 'Special Women Concession 0.05%', 'Overdraft Facility Available']
  },
  {
    id: 'bank-hdfc',
    name: 'HDFC Bank',
    bankName: 'HDFC Home Extension & Construction Loan',
    interestRate: '8.65%',
    maxTenure: 25,
    maxFunding: 'Up to 85% of Total BOQ',
    tag: 'Fast Track Approval in 48h',
    loanType: 'Independent House & Custom Duplex Construction',
    eligibility: 'Min CIBIL Score 720+, Salaried/Business owners',
    disbursementMode: 'Direct Milestone Digital Payouts through LabourConnect Escrow',
    minIncome: 50000,
    processingFee: '0.50% + GST',
    features: ['Pre-approved Land Valuation', 'Dedicated Relationship Officer', 'Flexible Tranche Drawdowns']
  },
  {
    id: 'bank-icici',
    name: 'ICICI Bank',
    bankName: 'ICICI Smart Build Stage-Disbursement Loan',
    interestRate: '8.75%',
    maxTenure: 30,
    maxFunding: 'Up to 80% of Approved Project Budget',
    tag: 'Digital Approval',
    loanType: 'Residential Ground+1 to G+3 Floor Builds',
    eligibility: 'Resident & NRI Property Owners with clear land title',
    disbursementMode: 'Instant QR/UPI Release to Vendors & Labour Contractor Gangs',
    minIncome: 45000,
    processingFee: '0.40% + GST',
    features: ['Instant Sanction Letter', 'Doorstep Document Verification', 'Insurance Bundle Protection']
  }
];

export const INTERIOR_PRESETS = [
  {
    id: 'preset-living',
    title: 'Modern Double-Height Living Lounge',
    roomType: 'Living Room',
    sqft: 280,
    style: 'Modern Luxury Acrylic',
    totalCost: 485000,
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
    boq: [
      { item: 'Italian Botticino Marble Flooring with Brass Inlays', unit: '280 sq.ft', rate: 450, total: 126000 },
      { item: 'Saint-Gobain Gyproc False Ceiling with Philips COB Dimmable LEDs', unit: '280 sq.ft', rate: 165, total: 46200 },
      { item: 'TV Accent Wall: Charcoal Fluted Louvers & Statuario Porcelain Slab', unit: '14 × 10 ft', rate: 850, total: 119000 },
      { item: 'L-Shaped Velvet Recliner Sectional & Nordic Teak Coffee Table', unit: 'Custom Build', rate: 145000, total: 145000 },
      { item: 'Asian Paints Royale Aspira Velvet Finish Paint & Primer', unit: '650 sq.ft area', rate: 75, total: 48800 }
    ]
  },
  {
    id: 'preset-kitchen',
    title: 'Minimalist Modular Kitchen & Island',
    roomType: 'Kitchen',
    sqft: 160,
    style: 'Scandinavian Japandi',
    totalCost: 395000,
    beforeImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
    afterImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
    boq: [
      { item: 'Hettich Sensys Soft-Close Blum Tandembox Drawer Units', unit: '14 Units', rate: 9500, total: 133000 },
      { item: 'Nano-White Crystal Quartz Countertop with Waterfall Edge', unit: '45 sq.ft', rate: 1200, total: 54000 },
      { item: 'Marine Grade BWR Ply with Anti-Fingerprint Matte Laminate', unit: '220 sq.ft', rate: 480, total: 105600 },
      { item: 'Hafele 4-Burner Glass Hob & 1200 m³/hr Curved Chimney', unit: '1 Set', rate: 58000, total: 58000 },
      { item: 'Under-Cabinet Warm LED Profile Light & Task Spots', unit: '6 Strips', rate: 7400, total: 44400 }
    ]
  },
  {
    id: 'preset-bedroom',
    title: 'Master Suite with Walk-In Wardrobe',
    roomType: 'Master Bedroom',
    sqft: 220,
    style: 'Teakwood Heritage',
    totalCost: 360000,
    beforeImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    afterImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=80',
    boq: [
      { item: 'Floor-to-Ceiling 8ft Wardrobe with Tinted Glass & Sensor Lights', unit: '8 × 10 ft', rate: 1850, total: 148000 },
      { item: 'King Size Teak Bedframe with Upholstered Headboard Wall', unit: '1 Unit', rate: 85000, total: 85000 },
      { item: 'Kajaria Spanish Glazed Vitrified Wooden Plank Tiles', unit: '220 sq.ft', rate: 195, total: 42900 },
      { item: 'Acoustic Sound-Dampening Fluted Wood Wall Panelling', unit: '90 sq.ft', rate: 620, total: 55800 },
      { item: 'Designer Bedside Pendant Sconces & Concealed Cove Mood Lights', unit: '1 Set', rate: 28300, total: 28300 }
    ]
  }
];

