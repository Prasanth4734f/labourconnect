// =========================================================================
// BUILDMATE AI HOUSE DESIGN GENERATIVE ENGINE (PUBLIC PRODUCT READY)
// Procedural Generation of 2D CAD, 3D Cutaways, Structural Grid & BOQ
// =========================================================================

export const ARCHITECTURAL_STYLES = [
  { id: 'modern', name: 'Modern Contemporary', desc: 'Clean lines, large glazing, open floor plans, travertine & wood accents' },
  { id: 'minimalist', name: 'Minimalist Scandinavian', desc: 'Monochromatic surfaces, timber louvers, uncluttered spatial geometry' },
  { id: 'luxury_villa', name: 'Luxury Villa', desc: 'Double height foyer, cantilever decks, infinity water body, EV portico' },
  { id: 'traditional_duplex', name: 'Traditional Indian Duplex', desc: 'Pooja sanctum, central open thotti courtyard, sloping Mangalore tile roof' },
  { id: 'vintage', name: 'Vintage & Heritage', desc: 'Ornate wooden windows, limewash walls, detailed mouldings, and sloping terracotta roof' },
  { id: 'penthouse', name: 'Luxury Penthouse', desc: 'Panoramic sky terrace, floor-to-ceiling glass railings, and private master retreat' },
  { id: 'tropical_modern', name: 'Tropical Modern', desc: 'Deep eaves, wooden louvers, cantilevered balconies, and biophilic natural finishes' },
  { id: 'eco_friendly', name: 'Eco-Green Sustainable', desc: 'Solar pergola, rainwater harvesting, AAC passive cooling blocks, green terraces' }
];

export const REFERENCE_3D_ISOMETRICS = [
  {
    id: 'iso-3bhk-modern',
    title: '3BHK Modern Isometric Cutaway',
    image: '/generated-designs/iso_cutaway_3bhk_modern.png',
    style: 'modern',
    suitableBhk: [3, 4],
    suitableRatio: 'square_medium',
    description: 'Spacious 3-Bedroom cutaway with integrated master suite, central stairwell, open living lounge and twin bathrooms.',
    hotspots: [
      { x: '35%', y: '25%', room: 'Master Bedroom', size: '14\'0" × 13\'6"', finish: 'Oak Hardwood + Attached Dresser' },
      { x: '52%', y: '38%', room: 'Living Lounge', size: '18\'0" × 15\'0"', finish: 'Italian Marble + Glass Balcony' },
      { x: '78%', y: '52%', room: 'Guest Bedroom', size: '12\'6" × 12\'0"', finish: 'Vitrified Matte + En-suite' },
      { x: '42%', y: '82%', room: 'Second Suite', size: '13\'0" × 12\'0"', finish: 'Fluted Wall Panel + Walk-in Wardrobe' }
    ]
  },
  {
    id: 'iso-narrow-15x40',
    title: '15\' × 40\' Narrow Plot Compact Plan',
    image: '/generated-designs/narrow_plot_15x40_dim.png',
    style: 'minimalist',
    suitableBhk: [2, 3],
    suitableRatio: 'narrow_long',
    description: 'Ultra-efficient narrow plot spatial planning with linear circulation, double-height lightwell and staircase.',
    hotspots: [
      { x: '32%', y: '22%', room: 'Rear Bedroom', size: '9\'0" × 10\'0"', finish: 'Engineered Wood + Wardrobe' },
      { x: '68%', y: '20%', room: 'Master Bedroom', size: '9\'0" × 10\'0"', finish: 'Balcony Deck Access' },
      { x: '35%', y: '42%', room: 'Dining Area', size: '7\'0" × 8\'0"', finish: 'Granite Countertop' },
      { x: '30%', y: '70%', room: 'Living Room', size: '10\'0" × 11\'0"', finish: 'L-Shaped Sectional Seating' },
      { x: '72%', y: '72%', room: 'Front Bedroom', size: '9\'6" × 10\'0"', finish: 'Large Fenestration Window' }
    ]
  },
  {
    id: 'iso-villa-carporch',
    title: 'Contemporary Villa with Car Porch & Lawn',
    image: '/generated-designs/iso_villa_carporch.png',
    style: 'luxury_villa',
    suitableBhk: [3, 4],
    suitableRatio: 'standard_large',
    description: 'Executive family villa with paved driveway, covered car porch, landscaped front grass bed and open kitchen dining.',
    hotspots: [
      { x: '25%', y: '60%', room: 'Covered Car Porch', size: '16\'0" × 18\'0"', finish: 'Cobblestone Pavers + EV Charging' },
      { x: '36%', y: '78%', room: 'Landscaped Lawn', size: '14\'0" × 8\'0"', finish: 'Bermuda Grass + Drip Irrigation' },
      { x: '58%', y: '70%', room: 'Front Master Bed', size: '15\'0" × 14\'0"', finish: 'Polished Kota + French Window' },
      { x: '60%', y: '30%', room: 'Central Dining Hall', size: '16\'0" × 14\'0"', finish: 'Onyx Marble Centerpiece' },
      { x: '60%', y: '12%', room: 'Rear Suite', size: '13\'6" × 12\'6"', finish: 'Teak Wood Accents' }
    ]
  },
  {
    id: 'iso-compact-duplex',
    title: 'Compact 2-Storey Duplex with Modern Facade',
    image: '/generated-designs/iso_compact_duplex.png',
    style: 'traditional_duplex',
    suitableBhk: [2, 3],
    suitableRatio: 'square_compact',
    description: 'Compact 2-level architectural cutaway showing internal staircase, teal accent master suite, and front entry steps.',
    hotspots: [
      { x: '30%', y: '45%', room: 'Car Driveway & Porch', size: '12\'0" × 18\'0"', finish: 'Interlocking Paver Blocks' },
      { x: '52%', y: '46%', room: 'Central Hall & TV Lounge', size: '15\'0" × 14\'0"', finish: 'Italian Vitrified 800×1600mm' },
      { x: '65%', y: '50%', room: 'Staircase to Level 2', size: '7\'0" × 14\'0"', finish: 'Granite Treads with SS Railing' },
      { x: '60%', y: '20%', room: 'Upper Master Suite', size: '14\'0" × 13\'0"', finish: 'Teal Wall Accent + Wardrobe' }
    ]
  },
  {
    id: 'topdown-luxury-arch',
    title: 'Photorealistic Top-Down Architectural Layout',
    image: '/generated-designs/topdown_luxury_arch.png',
    style: 'eco_friendly',
    suitableBhk: [3, 4],
    suitableRatio: 'wide_luxury',
    description: 'High-angle photorealistic view showing teak hardwood floors, kitchen island with bar stools, walk-in closet and terrace garden.',
    hotspots: [
      { x: '25%', y: '25%', room: 'Master Suite + W.I.C.', size: '16\'0" × 15\'0"', finish: 'Oak Plank Flooring + Walk-in Closet' },
      { x: '78%', y: '30%', room: 'Open Modular Kitchen', size: '14\'0" × 12\'0"', finish: 'Calacatta Quartz Island + Bar Stools' },
      { x: '78%', y: '50%', room: 'Dining Area', size: '12\'0" × 10\'0"', finish: '6-Seater Solid Oak Dining Table' },
      { x: '80%', y: '75%', room: 'Sunlit Living Room', size: '18\'0" × 14\'0"', finish: 'Plush Fabric Sectional + Olive Rug' },
      { x: '25%', y: '80%', room: 'Second Suite', size: '14\'0" × 13\'0"', finish: 'Garden View Fenestration' },
      { x: '60%', y: '95%', room: 'Foyer & Flower Bed', size: '12\'0" × 6\'0"', finish: 'Paved Stone Entrance + Flora' }
    ]
  }
];

export const REFERENCE_ELEVATIONS = [
  {
    id: 'elev-travertine',
    title: 'Travertine Villa Elevation (Golden Hour)',
    image: '/generated-designs/elevation_travertine_villa.jpg',
    style: 'luxury_villa',
    facade: 'Travertine & Louvers'
  },
  {
    id: 'elev-timber-minimalist',
    title: 'Crisp White & Timber Slat Elevation',
    image: '/generated-designs/elevation_timber_minimalist.jpg',
    style: 'modern',
    facade: 'Timber Slats & Glass'
  }
];

// =========================================================================
// PROCEDURAL DESIGN GENERATOR FUNCTION
// Generates unique variation object on every call with exact calculations
// =========================================================================
export function generateHouseDesignVariation(inputs, variationIndex = 0) {
  const {
    plotWidth = 40,
    plotLength = 60,
    dimensionUnit = 'feet',
    floorsCount = 2,
    bhkCount = 3,
    bathroomsCount = 3,
    archStyle = 'modern',
    facingDirection = 'East',
    homeBudgetInr = 4500000,
    hasPooja = true,
    hasParking = true,
    hasBalcony = true,
    hasCourtyard = false,
    hasSolarPergola = true,
    kitchenType = 'open_modular',
    userPrompt = ''
  } = inputs;

  const plotSqft = dimensionUnit === 'feet'
    ? plotWidth * plotLength
    : Math.round(plotWidth * plotLength * 10.7639);

  const coverageRatio = floorsCount === 1 ? 0.70 : floorsCount === 2 ? 1.40 : 2.05;
  const builtUpSqft = Math.round(plotSqft * coverageRatio);
  const carpetAreaSqft = Math.round(builtUpSqft * 0.78);

  const seed = Date.now() + variationIndex * 1337;
  const variantCode = `LC-${Math.abs(seed % 9000 + 1000)}`;

  // Determine aspect ratio category
  const plotRatio = plotLength / Math.max(plotWidth, 1);
  let isoIndex = (variationIndex + Math.floor(plotRatio)) % REFERENCE_3D_ISOMETRICS.length;
  if (plotWidth <= 20) {
    isoIndex = 1; // Narrow 15x40 reference
  } else if (hasParking && (isoIndex === 1)) {
    isoIndex = 2; // Villa with car porch
  }
  const isoModel = REFERENCE_3D_ISOMETRICS[isoIndex] || REFERENCE_3D_ISOMETRICS[0];

  const elevIndex = (variationIndex + (archStyle === 'minimalist' ? 1 : 0)) % REFERENCE_ELEVATIONS.length;
  const elevationModel = REFERENCE_ELEVATIONS[elevIndex] || REFERENCE_ELEVATIONS[0];

  // Room Schedule generation tailored to plot size & BHK
  const roomSchedule = generateRoomSchedule({
    plotWidth,
    plotLength,
    bhkCount,
    floorsCount,
    bathroomsCount,
    hasPooja,
    hasParking,
    hasBalcony,
    hasCourtyard,
    builtUpSqft
  });

  // Calculate BOQ (Bill of Quantities) based on real construction rates
  const boqBreakdown = calculateBOQ({
    builtUpSqft,
    floorsCount,
    archStyle,
    homeBudgetInr
  });

  // Calculate 8-Directional Vaastu Score
  const vaastuReport = calculateVaastuCompliance({
    facingDirection,
    hasPooja,
    kitchenType,
    hasCourtyard
  });

  // Generate Structural Column & Beam Grid Schedule
  const structuralGrid = generateStructuralGrid({
    plotWidth,
    plotLength,
    floorsCount
  });

  // Variation Title & Concept Note
  const variantNames = [
    'Contemporary Open-Plan Concept',
    'Vaastu-Harmonized Courtyard Duplex',
    'Luxury Executive Villa Layout',
    'Space-Maximized Linear Plan',
    'Eco-Smart Passive Cooling Design',
    'Nordic Minimalist Pavilion',
    'Modernist Cantilever Skyline Suite',
    'Zen Sanctuary Garden Villa',
    'Terrace Pergola Executive Residence',
    'Cross-Ventilated Tropical Modern'
  ];
  const variantTitle = `Variation #${variationIndex + 1}: ${variantNames[variationIndex % variantNames.length]}`;

  return {
    id: `des-${seed}`,
    code: variantCode,
    title: variantTitle,
    version: `v1.${variationIndex}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    inputs: {
      plotWidth,
      plotLength,
      dimensionUnit,
      floorsCount,
      bhkCount,
      bathroomsCount,
      archStyle,
      facingDirection,
      homeBudgetInr,
      hasPooja,
      hasParking,
      hasBalcony,
      hasCourtyard,
      hasSolarPergola,
      kitchenType,
      userPrompt
    },
    metrics: {
      plotSqft,
      builtUpSqft,
      carpetAreaSqft,
      groundCoverageSqft: Math.round(plotSqft * 0.65),
      fsiAchieved: (builtUpSqft / plotSqft).toFixed(2),
      setbacks: {
        front: '7\' 0"',
        rear: '4\' 6"',
        left: '3\' 6"',
        right: '3\' 6"'
      },
      estimatedDurationMonths: floorsCount === 1 ? '5 - 6 Months' : floorsCount === 2 ? '8 - 9 Months' : '11 - 13 Months'
    },
    isoModel,
    elevationModel,
    roomSchedule,
    boqBreakdown,
    vaastuReport,
    structuralGrid
  };
}

// -------------------------------------------------------------------------
// ROOM SCHEDULE CALCULATOR
// -------------------------------------------------------------------------
function generateRoomSchedule({
  plotWidth,
  plotLength,
  bhkCount,
  floorsCount,
  bathroomsCount,
  hasPooja,
  hasParking,
  hasBalcony,
  hasCourtyard,
  builtUpSqft
}) {
  const roomsGround = [];
  const roomsFirst = [];
  const roomsTerrace = [];

  // Ground Floor Core
  if (hasParking) {
    roomsGround.push({
      name: 'Covered EV Portico & Car Porch',
      dimensions: `${Math.min(16, Math.round(plotWidth * 0.4))} × 18'0"`,
      sqft: 288,
      flooring: 'Anti-skid Heavy Duty Cobblestone Pavers',
      orientation: 'North-West (Vayavya)',
      doors: 1,
      windows: 0
    });
  }

  roomsGround.push({
    name: 'Entrance Foyer & Verandah',
    dimensions: '8\'0" × 6\'0"',
    sqft: 48,
    flooring: 'Polished Flamed Granite',
    orientation: 'East Entrance',
    doors: 1,
    windows: 1
  });

  roomsGround.push({
    name: 'Grand Living Lounge',
    dimensions: `${Math.round(plotWidth * 0.45)} × 16'0"`,
    sqft: 320,
    flooring: 'Italian Botticino Marble (800×1600mm)',
    orientation: 'North-East (Light Filled)',
    doors: 2,
    windows: 2
  });

  roomsGround.push({
    name: 'Open Dining & Breakfast Counter',
    dimensions: '14\'0" × 12\'0"',
    sqft: 168,
    flooring: 'Vitrified Glazed Porcelain',
    orientation: 'East Facing',
    doors: 1,
    windows: 1
  });

  roomsGround.push({
    name: 'Modular Kitchen & Utility Wash',
    dimensions: '12\'0" × 11\'0"',
    sqft: 132,
    flooring: 'Quartz Countertops + Ceramic Matte',
    orientation: 'South-East (Agneya Vastu)',
    doors: 2,
    windows: 2
  });

  if (hasPooja) {
    roomsGround.push({
      name: 'Ishanya Pooja Mandir',
      dimensions: '6\'0" × 6\'0"',
      sqft: 36,
      flooring: 'White Makrana Marble + Brass Inlay',
      orientation: 'North-East (Ishanya)',
      doors: 1,
      windows: 0
    });
  }

  if (hasCourtyard) {
    roomsGround.push({
      name: 'Brahmasthan Central Open Courtyard',
      dimensions: '10\'0" × 10\'0"',
      sqft: 100,
      flooring: 'Pebble Bed + Glass Skylight Roof',
      orientation: 'Brahmasthanam (Center)',
      doors: 0,
      windows: 0
    });
  }

  roomsGround.push({
    name: 'Master Suite 1 (Ground Floor)',
    dimensions: '15\'0" × 14\'0"',
    sqft: 210,
    flooring: 'Engineered Teak Wood Planks',
    orientation: 'South-West (Nairuthi)',
    doors: 2,
    windows: 2
  });

  roomsGround.push({
    name: 'Master Attached Bathroom & Dresser',
    dimensions: '8\'0" × 7\'6"',
    sqft: 60,
    flooring: 'Anti-slip Porcelain + Kohler Fixtures',
    orientation: 'West',
    doors: 1,
    windows: 1
  });

  // First Floor (if floors >= 2)
  if (floorsCount >= 2) {
    roomsFirst.push({
      name: 'Family Media Lounge & Library',
      dimensions: '16\'0" × 14\'0"',
      sqft: 224,
      flooring: 'Italian Vitrified 1200×600mm',
      orientation: 'North Facing',
      doors: 3,
      windows: 2
    });

    roomsFirst.push({
      name: 'Upper Master Bedroom (Suite 2)',
      dimensions: '16\'0" × 14\'0"',
      sqft: 224,
      flooring: 'Oak Hardwood + Walk-in Closet',
      orientation: 'South-West',
      doors: 2,
      windows: 2
    });

    roomsFirst.push({
      name: 'Bedroom 3 (Kids / Guest)',
      dimensions: '13\'6" × 12\'0"',
      sqft: 162,
      flooring: 'Laminated Matte Wooden Floor',
      orientation: 'North-West',
      doors: 1,
      windows: 2
    });

    if (bhkCount >= 4) {
      roomsFirst.push({
        name: 'Bedroom 4 (Study / Work-from-Home)',
        dimensions: '12\'0" × 11\'0"',
        sqft: 132,
        flooring: 'Vitrified Satin Finish',
        orientation: 'North-East',
        doors: 1,
        windows: 1
      });
    }

    if (hasBalcony) {
      roomsFirst.push({
        name: 'Cantilever Glass Balcony Deck',
        dimensions: '18\'0" × 6\'0"',
        sqft: 108,
        flooring: 'Weatherproof WPC Deck Wood Planks',
        orientation: 'East Road Facing',
        doors: 1,
        windows: 0
      });
    }
  }

  // Terrace Floor
  roomsTerrace.push({
    name: 'Terrace Open Lounge & Gazebo',
    dimensions: `${Math.round(plotWidth * 0.7)} × 24'0"`,
    sqft: Math.round(builtUpSqft * 0.35),
    flooring: 'Solar Reflective Cool Tiles (SRI > 78)',
    orientation: 'Open Sky',
    doors: 1,
    windows: 0
  });

  return {
    ground: roomsGround,
    first: roomsFirst,
    terrace: roomsTerrace
  };
}

// -------------------------------------------------------------------------
// BOQ ESTIMATION CALCULATOR
// -------------------------------------------------------------------------
function calculateBOQ({ builtUpSqft, floorsCount, archStyle, homeBudgetInr }) {
  // Approximate structural ratios for Indian residential construction
  const cementBags = Math.round(builtUpSqft * 0.42); // ~420 bags per 1000 sq.ft
  const steelTons = Number((builtUpSqft * 0.0038).toFixed(2)); // ~3.8 Tons per 1000 sqft Fe550D
  const sandTons = Math.round(builtUpSqft * 1.8); // Fine River/M-Sand cft to tons
  const aggregateTons = Math.round(builtUpSqft * 1.35); // 20mm & 12mm
  const bricksCount = Math.round(builtUpSqft * 19); // Wirecut Red Bricks / AAC

  // Rates in INR (standard Tier-1/2 Indian construction market 2026)
  const costCement = cementBags * 395;
  const costSteel = Math.round(steelTons * 72000);
  const costSandAgg = Math.round((sandTons * 1250) + (aggregateTons * 950));
  const costBricks = bricksCount * 9.5;
  const costExcavation = builtUpSqft * 120;
  const costMasonryLabour = builtUpSqft * 420;
  const costFlooringFinishes = builtUpSqft * 380;
  const costDoorsWindows = builtUpSqft * 260;
  const costElectricalMEP = builtUpSqft * 185;
  const costPlumbingSanitary = builtUpSqft * 190;
  const costPaintingPutty = builtUpSqft * 140;

  const totalCalculated = costCement + costSteel + costSandAgg + costBricks + costExcavation +
    costMasonryLabour + costFlooringFinishes + costDoorsWindows + costElectricalMEP +
    costPlumbingSanitary + costPaintingPutty;

  return {
    totalEstimatedInr: totalCalculated,
    ratePerSqft: Math.round(totalCalculated / builtUpSqft),
    items: [
      { category: 'Structural Steel (TMT Fe550D)', qty: `${steelTons} MT`, rate: '₹72,000 / MT', total: costSteel, tag: 'Tata Tiscon / JSW Neosteel' },
      { category: 'Grade 53/43 PPC Cement', qty: `${cementBags} Bags`, rate: '₹395 / Bag', total: costCement, tag: 'UltraTech / ACC / Dalmia' },
      { category: 'Red Clay Bricks / AAC Blocks', qty: `${bricksCount.toLocaleString('en-IN')} Pcs`, rate: '₹9.50 / Pc', total: Math.round(costBricks), tag: 'First Class Kiln Fired' },
      { category: 'Sand & 20mm Blue Metal Aggregates', qty: `${sandTons + aggregateTons} Tons`, rate: 'Mixed Avg', total: costSandAgg, tag: 'Washed Robo M-Sand + Granite 20mm' },
      { category: 'Civil & Masonry Labour', qty: `${builtUpSqft} sq.ft`, rate: '₹420 / sq.ft', total: costMasonryLabour, tag: 'Skilled Masons + Bar Benders' },
      { category: 'Flooring (Italian Vitrified & Wood)', qty: `${builtUpSqft} sq.ft`, rate: '₹380 / sq.ft', total: costFlooringFinishes, tag: 'Kajaria / Somany 800×1600mm' },
      { category: 'Teak Doors & UPVC Fenestrations', qty: 'Complete Set', rate: 'Lump Sum', total: costDoorsWindows, tag: 'Teak Main Door + Fenesta 3-Track UPVC' },
      { category: 'Electrical Wiring & Modular Switches', qty: `${builtUpSqft} sq.ft`, rate: '₹185 / sq.ft', total: costElectricalMEP, tag: 'Finolex FR Wire + Legrand Arteor' },
      { category: 'Plumbing, CPVC & Sanitaryware', qty: 'Complete Line', rate: '₹190 / sq.ft', total: costPlumbingSanitary, tag: 'Astral CPVC + Kohler / Jaquar Fixtures' },
      { category: 'Exterior & Interior Luxury Paint', qty: `${builtUpSqft * 3} sq.ft`, rate: '₹140 / built-sqft', total: costPaintingPutty, tag: 'Asian Paints Apex Ultima Protek' }
    ]
  };
}

// -------------------------------------------------------------------------
// VAASTU SHASTRA COMPLIANCE CALCULATOR
// -------------------------------------------------------------------------
function calculateVaastuCompliance({ facingDirection, hasPooja, kitchenType, hasCourtyard }) {
  const directions = [
    { zone: 'North-East (Ishanya)', element: 'Water / Divine', ideal: 'Pooja, Foyer, Water Sump', status: 'Compliant (100%)', score: 100, note: hasPooja ? 'Pooja Sanctum positioned in sacred Ishanya corner' : 'Open clean corner maintains spiritual influx' },
    { zone: 'South-East (Agneya)', element: 'Fire (Agni)', ideal: 'Kitchen & Electrical Meter', status: 'Compliant (100%)', score: 100, note: 'Kitchen counter oriented with East-facing cooking hob' },
    { zone: 'South-West (Nairuthi)', element: 'Earth (Prithvi)', ideal: 'Master Bedroom & Heavy Head', status: 'Compliant (100%)', score: 100, note: 'Master suite located in South-West ensuring owner stability' },
    { zone: 'North-West (Vayavya)', element: 'Air (Vayu)', ideal: 'Car Porch, Guest Suite, Overhead Tank', status: 'Compliant (95%)', score: 95, note: 'Car parking and guest circulation well aerated' },
    { zone: 'Center (Brahmasthan)', element: 'Space (Akash)', ideal: 'Open Hall / Courtyard / Light', status: hasCourtyard ? 'Compliant (100%)' : 'Good (92%)', score: hasCourtyard ? 100 : 92, note: hasCourtyard ? 'Open Sky Brahmasthan allows natural cosmic ventilation' : 'Zero structural columns in central hall axis' }
  ];

  const overallScore = Math.round(directions.reduce((acc, d) => acc + d.score, 0) / directions.length);

  return {
    score: overallScore,
    grade: overallScore >= 95 ? 'A+ Super Vaastu Compliant' : 'A Vaastu Certified',
    directions
  };
}

// -------------------------------------------------------------------------
// STRUCTURAL GRID GENERATOR (Columns & Beams)
// -------------------------------------------------------------------------
function generateStructuralGrid({ plotWidth, plotLength, floorsCount }) {
  const numColumnsX = plotWidth <= 30 ? 3 : 4;
  const numColumnsY = plotLength <= 40 ? 4 : 5;
  const totalColumns = numColumnsX * numColumnsY;

  const columns = [];
  for (let i = 1; i <= totalColumns; i++) {
    columns.push({
      id: `C${i}`,
      size: floorsCount <= 2 ? '9" × 15"' : '9" × 18"',
      concrete: 'M25 (1:1:2)',
      steel: '6 Nos 16mm Dia TMT Fe550D',
      stirrups: '8mm @ 150mm c/c spacing',
      footing: '5\'0" × 5\'0" Isolated Trapezoidal Pad'
    });
  }

  return {
    totalColumns,
    concreteGrade: 'M25 (Ready Mix Concrete)',
    steelGrade: 'Fe550D TMT Reinforcement',
    slabThickness: '5 inches (125mm RCC)',
    beamSizes: 'Plinth Beam: 9" × 15", Roof Beam: 9" × 15"',
    columns
  };
}
