/**
 * LabourConnect Design Engine - Regional Indian Construction Rate Catalog
 * 
 * Provides traceable, regional market construction rates indexed across
 * 10 major Indian metropolitan and tier-2 zones with explicit provenance tracking.
 */

export const RATE_PROVENANCE = {
  SOURCED: 'SOURCED',               // Verified from published CPWD / state PWD schedule of rates
  CONFIGURED: 'CONFIGURED',         // System configured baseline rate
  ASSUMED_DEFAULT: 'ASSUMED_DEFAULT', // National average assumption
  USER_OVERRIDE: 'USER_OVERRIDE',   // User customized unit rate
  UNAVAILABLE: 'UNAVAILABLE'       // Item rate not available
};

export const RATE_CONFIDENCE = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  PROVISIONAL: 'PROVISIONAL'
};

/**
 * Regional City Cost Indices (relative to national CPWD baseline 1.00)
 * Derived from state GST logistics, local sand/aggregate quarry distances,
 * and regional skilled labour wage schedules (Q3 2026 Index).
 */
export const REGIONAL_CITY_FACTORS = {
  'Bengaluru': { factor: 1.00, state: 'Karnataka', zone: 'South', label: 'Bengaluru (Karnataka)' },
  'Chennai': { factor: 0.98, state: 'Tamil Nadu', zone: 'South', label: 'Chennai (Tamil Nadu)' },
  'Hyderabad': { factor: 0.97, state: 'Telangana', zone: 'South', label: 'Hyderabad (Telangana)' },
  'Mumbai': { factor: 1.14, state: 'Maharashtra', zone: 'West', label: 'Mumbai (Maharashtra)' },
  'Delhi-NCR': { factor: 1.03, state: 'Delhi/NCR', zone: 'North', label: 'Delhi-NCR (North)' },
  'Pune': { factor: 1.05, state: 'Maharashtra', zone: 'West', label: 'Pune (Maharashtra)' },
  'Kolkata': { factor: 0.94, state: 'West Bengal', zone: 'East', label: 'Kolkata (West Bengal)' },
  'Kochi': { factor: 1.02, state: 'Kerala', zone: 'South', label: 'Kochi (Kerala)' },
  'Ahmedabad': { factor: 0.96, state: 'Gujarat', zone: 'West', label: 'Ahmedabad (Gujarat)' },
  'DEFAULT_NATIONAL': { factor: 1.00, state: 'All-India', zone: 'National', label: 'National Average (CPWD Base)' }
};

/**
 * Master Regional Construction Items Rate Catalog (Base INR Rates for 2026-Q3)
 */
export const BASE_REGIONAL_RATES = {
  // Category 1: Site Preparation & External Works
  'site_clearing': {
    categoryId: 'site_preparation',
    name: 'Site Clearing & Grubbing',
    unit: 'sq.ft',
    baseRate: 4.50,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Mechanical clearing of shrubs, roots, and surface leveling'
  },
  'earthwork_excavation': {
    categoryId: 'site_preparation',
    name: 'Earthwork Excavation in Foundation Trenches',
    unit: 'cu.mtr',
    baseRate: 260.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Excavation in ordinary soil up to 2m depth including stacking'
  },
  'backfilling_compaction': {
    categoryId: 'site_preparation',
    name: 'Backfilling & Mechanical Compaction',
    unit: 'cu.mtr',
    baseRate: 140.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Filling selected excavated earth in plinth & compaction in 15cm layers'
  },
  'compound_wall': {
    categoryId: 'site_preparation',
    name: '5-ft Boundary Compound Wall',
    unit: 'running_ft',
    baseRate: 1150.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '6" solid blockwork with RCC coping and plaster on both sides'
  },
  'entrance_gate': {
    categoryId: 'site_preparation',
    name: 'Heavy-Duty Mild Steel Entrance Gate',
    unit: 'set',
    baseRate: 38000.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '12ft wide x 6ft high MS sliding/swing gate with epoxy primer'
  },
  'driveway_paving': {
    categoryId: 'site_preparation',
    name: 'Heavy-Duty Concrete Paver Blocks',
    unit: 'sq.ft',
    baseRate: 72.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '60mm M30 grade zig-zag interlocking pavers over sand bed'
  },
  'site_drainage': {
    categoryId: 'site_preparation',
    name: 'Peripheral Stormwater Drain & Rainwater Harvesting',
    unit: 'running_ft',
    baseRate: 480.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Brick masonry drain with precast perforated concrete covers'
  },

  // Category 2: Civil Structure
  'concrete_rmc_m25': {
    categoryId: 'civil_structure',
    name: 'M25 Ready-Mix Concrete (RMC)',
    unit: 'cu.mtr',
    baseRate: 5200.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Design mix M25 concrete with transit mixer delivery & boom pumping'
  },
  'steel_fe550d': {
    categoryId: 'civil_structure',
    name: 'Fe550D TMT Reinforcement Steel',
    unit: 'metric_ton',
    baseRate: 62000.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Primary brand (Tata Tiscon/Jindal/SAIL) including bending & binding'
  },
  'brickwork_exterior': {
    categoryId: 'civil_structure',
    name: '9-inch Solid Exterior Masonry Walls',
    unit: 'sq.ft',
    baseRate: 185.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Class-1 kiln burnt red clay bricks / 8" AAC blocks in 1:6 cement mortar'
  },
  'brickwork_interior': {
    categoryId: 'civil_structure',
    name: '4.5-inch Interior Partition Walls',
    unit: 'sq.ft',
    baseRate: 110.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '4.5" half-brick masonry with wire reinforcement at every 3rd course'
  },
  'structural_labour': {
    categoryId: 'civil_structure',
    name: 'RCC Shuttering, Bar Bending & Civil Labour',
    unit: 'sq.ft',
    baseRate: 460.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Steel/ply shuttering, centering, scaffolding, de-shuttering & curing'
  },

  // Category 3: Architectural Finishes
  'internal_plaster_paint': {
    categoryId: 'architectural_finishes',
    name: 'Internal Smooth Plaster & Royal Luxury Paint',
    unit: 'sq.ft',
    baseRate: 58.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '12mm cement plaster + 2 coats Birla white putty + 2 coats Royale emulsion'
  },
  'external_plaster_paint': {
    categoryId: 'architectural_finishes',
    name: 'External Double-Coat Sponge Plaster & Weatherproof Paint',
    unit: 'sq.ft',
    baseRate: 68.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '20mm water-repellent sand-faced plaster + Apex Ultima silicone paint'
  },
  'flooring_vitrified': {
    categoryId: 'architectural_finishes',
    name: 'GVT Vitrified Floor Tiles (800x1600mm)',
    unit: 'sq.ft',
    baseRate: 120.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Glazed vitrified tiles supply, adhesive laying, epoxy grouting'
  },
  'flooring_marble': {
    categoryId: 'architectural_finishes',
    name: 'Italian / Statuario Marble Flooring',
    unit: 'sq.ft',
    baseRate: 280.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Imported marble slab supply, dry-cut, chemical fixing, diamond mirror polish'
  },
  'flooring_wooden': {
    categoryId: 'architectural_finishes',
    name: 'Engineered Teak Hardwood Flooring',
    unit: 'sq.ft',
    baseRate: 220.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '12mm engineered wooden planks over acoustic moisture underlayment'
  },
  'flooring_antiskid': {
    categoryId: 'architectural_finishes',
    name: 'Anti-Skid Ceramic Floor Tiles',
    unit: 'sq.ft',
    baseRate: 95.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'R10 slip-resistant ceramic tiles for bathrooms, utilities & balconies'
  },
  'wall_tiling_dado': {
    categoryId: 'architectural_finishes',
    name: 'Bathroom & Kitchen Wall Dado Tiling',
    unit: 'sq.ft',
    baseRate: 85.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Glazed ceramic designer tiles up to 7ft lintel height'
  },
  'door_flush_teak': {
    categoryId: 'architectural_finishes',
    name: 'Solid Core Teak-Veneer Flush Door',
    unit: 'door',
    baseRate: 9800.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '32mm BWR flush door with African teak frame, SS mortise lock, polish'
  },
  'window_upvc_glazed': {
    categoryId: 'architectural_finishes',
    name: 'UPVC Double-Glazed 3-Track Windows',
    unit: 'sq.ft',
    baseRate: 460.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '3-track UPVC frames with SS mosquito mesh and 5mm acoustic toughened glass'
  },
  'railing_ss_glass': {
    categoryId: 'architectural_finishes',
    name: 'SS 304 & Toughened Glass Balcony Railing',
    unit: 'running_ft',
    baseRate: 1650.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Grade 304 SS posts with 10mm clear toughened glass and top handrail'
  },

  // Category 4: Electrical & Plumbing (MEP)
  'electrical_concealed': {
    categoryId: 'electrical_plumbing',
    name: 'Concealed Copper Wiring & Modular Accessories',
    unit: 'sq.ft',
    baseRate: 145.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Finolex FRLS copper wires, heavy PVC conduits, Legrand/Schneider switches'
  },
  'db_earthing_lightning': {
    categoryId: 'electrical_plumbing',
    name: 'Distribution Board, Earthing & Surge Protection',
    unit: 'set',
    baseRate: 32000.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '8-way 3-phase DB with RCCB/ELCB, dual chemical earthing pits'
  },
  'plumbing_water_drainage': {
    categoryId: 'electrical_plumbing',
    name: 'Internal CPVC Water Supply & SWR Drainage Piping',
    unit: 'sq.ft',
    baseRate: 130.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Astral/Ashirvad CPVC hot & cold lines, PVC soil & rain drainage stacks'
  },
  'overhead_tank_pump': {
    categoryId: 'electrical_plumbing',
    name: '1000L Overhead Water Tank & Automatic Pressure Pump',
    unit: 'set',
    baseRate: 24000.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Sintex triple-layer antibacterial tank with 1HP auto-booster pump'
  },

  // Category 5: Kitchen & Bathroom Fittings
  'kitchen_granite_counter': {
    categoryId: 'kitchen_bathroom_fittings',
    name: 'Black Galaxy Granite Kitchen Platform',
    unit: 'sq.ft',
    baseRate: 210.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '20mm premium jet-black granite with full bullnose moulding & fascia'
  },
  'kitchen_sink_ss': {
    categoryId: 'kitchen_bathroom_fittings',
    name: 'SS 304 Double-Bowl Kitchen Sink & Faucet',
    unit: 'set',
    baseRate: 12500.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Carysil / Nirali heavy gauge satin finish sink with swivel mixer'
  },
  'kitchen_modular_cabinets': {
    categoryId: 'kitchen_bathroom_fittings',
    name: 'Modular Kitchen Cabinets (Base & Wall Units)',
    unit: 'running_ft',
    baseRate: 2800.0,
    provenance: RATE_PROVENANCE.CONFIGURED,
    confidence: RATE_CONFIDENCE.MEDIUM,
    effectiveDate: '2026-Q3',
    notes: 'BWP marine ply carcase with soft-close tandem drawers and acrylic shutters'
  },
  'sanitary_ewc_toilet': {
    categoryId: 'kitchen_bathroom_fittings',
    name: 'Wall-Hung Rimless EWC with Concealed Flush Tank',
    unit: 'unit',
    baseRate: 14500.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Jaquar/Kohler ceramic wall-hung toilet with soft-close seat & Geberit tank'
  },
  'sanitary_shower_set': {
    categoryId: 'kitchen_bathroom_fittings',
    name: 'Thermostatic Divertor & Overhead Rain Shower',
    unit: 'unit',
    baseRate: 9800.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Solid brass body concealed single-lever divertor with 8-inch SS shower'
  },
  'sanitary_basin_tap': {
    categoryId: 'kitchen_bathroom_fittings',
    name: 'Washbasin Counter & Pillar Mixer Tap',
    unit: 'unit',
    baseRate: 6500.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Countertop ceramic basin with high-neck single lever mixer'
  },
  'bathroom_water_heater': {
    categoryId: 'kitchen_bathroom_fittings',
    name: '25-Litre 5-Star Storage Water Geyser',
    unit: 'unit',
    baseRate: 11000.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Glass-lined titanium tank storage geyser with digital temperature display'
  },

  // Category 6: Interior Furnishings (Configurable Allowances for S4-T02 readiness)
  'interior_living_sofa': {
    categoryId: 'interior_furnishings',
    name: 'Living Room 5-Seater Sofa & Coffee Table Set',
    unit: 'set',
    baseRate: 65000.0,
    provenance: RATE_PROVENANCE.CONFIGURED,
    confidence: RATE_CONFIDENCE.PROVISIONAL,
    effectiveDate: '2026-Q3',
    notes: 'High-density foam fabric upholstered modular sofa with oak coffee table'
  },
  'interior_bed_wardrobe': {
    categoryId: 'interior_furnishings',
    name: 'King Bed with Storage & 3-Door Floor-to-Ceiling Wardrobe',
    unit: 'bedroom_set',
    baseRate: 75000.0,
    provenance: RATE_PROVENANCE.CONFIGURED,
    confidence: RATE_CONFIDENCE.PROVISIONAL,
    effectiveDate: '2026-Q3',
    notes: 'Solid teakwood frame king bed with hydraulic storage and laminate wardrobe'
  },
  'interior_dining_set': {
    categoryId: 'interior_furnishings',
    name: '6-Seater Solid Wood Dining Table & Chairs',
    unit: 'set',
    baseRate: 42000.0,
    provenance: RATE_PROVENANCE.CONFIGURED,
    confidence: RATE_CONFIDENCE.PROVISIONAL,
    effectiveDate: '2026-Q3',
    notes: 'Sheesham/Teakwood dining table with upholstered dining chairs'
  },
  'interior_curtains_lighting': {
    categoryId: 'interior_furnishings',
    name: 'Window Curtains, Blinds & Decorative Ceiling Fixtures',
    unit: 'sq.ft',
    baseRate: 65.0,
    provenance: RATE_PROVENANCE.CONFIGURED,
    confidence: RATE_CONFIDENCE.PROVISIONAL,
    effectiveDate: '2026-Q3',
    notes: 'Blackout motorized double drapes and warm-white LED magnetic tracks'
  },

  // Category 7: Landscaping & Outdoor Living (Configurable for S4-T03 readiness)
  'garden_turf_lawn': {
    categoryId: 'landscaping_outdoor',
    name: 'Bermuda Natural Turf Grass Lawn',
    unit: 'sq.ft',
    baseRate: 48.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Red soil preparation, organic manure, carpet grass turf & micro-sprinklers'
  },
  'garden_ornamental_plants': {
    categoryId: 'landscaping_outdoor',
    name: 'Native Ornamental Shrubs, Border Hedges & Trees',
    unit: 'set',
    baseRate: 28000.0,
    provenance: RATE_PROVENANCE.CONFIGURED,
    confidence: RATE_CONFIDENCE.MEDIUM,
    effectiveDate: '2026-Q3',
    notes: 'Frangipani, Areca palms, Ficus hedges, and aromatic flowering plants'
  },
  'garden_walkway_pavers': {
    categoryId: 'landscaping_outdoor',
    name: 'Stepping Stone Garden Walkway',
    unit: 'sq.ft',
    baseRate: 95.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Natural Sadarahalli grey granite stepping slabs set in grass'
  },
  'garden_lighting_outdoor': {
    categoryId: 'landscaping_outdoor',
    name: 'Weatherproof Outdoor LED Garden Lighting Set',
    unit: 'set',
    baseRate: 18500.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'IP65 warm-white bollard pathway lights and tree uplighters with timer'
  },

  // Category 8: Professional & Statutory Fees
  'fee_architectural_design': {
    categoryId: 'professional_statutory_fees',
    name: 'Architectural Working Drawings & 3D Visualization',
    unit: 'sq.ft',
    baseRate: 65.0,
    provenance: RATE_PROVENANCE.CONFIGURED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Comprehensive 2D working drawings, electrical, plumbing & elevation details'
  },
  'fee_structural_engineering': {
    categoryId: 'professional_statutory_fees',
    name: 'Structural Analysis & Stability Certification',
    unit: 'sq.ft',
    baseRate: 25.0,
    provenance: RATE_PROVENANCE.CONFIGURED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'STAAD Pro 3D structural analysis, bar bending schedule, licensed engineer sign-off'
  },
  'fee_municipal_sanction': {
    categoryId: 'professional_statutory_fees',
    name: 'Municipal Plan Sanction & Scrutiny Fees',
    unit: 'sq.ft',
    baseRate: 45.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.MEDIUM,
    effectiveDate: '2026-Q3',
    notes: 'Local municipal corporation plan sanction fees, cess & development charges'
  },
  'fee_soil_test_survey': {
    categoryId: 'professional_statutory_fees',
    name: 'Geotechnical Soil Investigation & Site Contour Survey',
    unit: 'set',
    baseRate: 22000.0,
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: 'Standard penetration test (SPT) boreholes up to 10m depth with lab report'
  },

  // Category 9: Taxes, Transport & Installation
  'contractor_margin': {
    categoryId: 'taxes_transport_installation',
    name: 'Contractor Overhead, Machinery & Site Supervision',
    unit: 'percentage',
    baseRate: 0.10, // 10%
    provenance: RATE_PROVENANCE.CONFIGURED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '10% on direct civil, finishes & MEP works for site engineers & machinery'
  },
  'logistics_transport': {
    categoryId: 'taxes_transport_installation',
    name: 'Material Freight, Handling & Unloading',
    unit: 'percentage',
    baseRate: 0.025, // 2.5%
    provenance: RATE_PROVENANCE.CONFIGURED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '2.5% freight allowance for raw material transit to project site'
  },
  'gst_works_contract': {
    categoryId: 'taxes_transport_installation',
    name: 'Goods & Services Tax (GST) on Works Contract',
    unit: 'percentage',
    baseRate: 0.18, // 18% applied strictly to contractor margin & services, avoiding double tax
    provenance: RATE_PROVENANCE.SOURCED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '18% GST applied strictly to professional fees and contractor execution margin'
  },

  // Category 10: Contingency & Price Escalation
  'unforeseen_contingency': {
    categoryId: 'contingency_escalation',
    name: 'Unforeseen Site Contingency Reserve',
    unit: 'percentage',
    baseRate: 0.05, // 5%
    provenance: RATE_PROVENANCE.CONFIGURED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '5.0% buffer for unexpected site subsurface conditions or scope additions'
  },
  'price_escalation_buffer': {
    categoryId: 'contingency_escalation',
    name: 'Commodity Price Escalation & Inflation Reserve',
    unit: 'percentage',
    baseRate: 0.03, // 3%
    provenance: RATE_PROVENANCE.CONFIGURED,
    confidence: RATE_CONFIDENCE.HIGH,
    effectiveDate: '2026-Q3',
    notes: '3.0% reserve protecting against steel, cement & fuel price fluctuations over 12 months'
  }
};

/**
 * Resolves an item unit rate based on city and user overrides
 */
export function resolveRegionalRate(itemKey, city = 'Bengaluru', userOverrides = {}) {
  const itemDef = BASE_REGIONAL_RATES[itemKey];
  if (!itemDef) {
    return {
      itemKey,
      unitRate: 0,
      provenance: RATE_PROVENANCE.UNAVAILABLE,
      confidence: RATE_CONFIDENCE.PROVISIONAL,
      error: `Unknown rate item key: ${itemKey}`
    };
  }

  // Check explicit user override first
  if (userOverrides && typeof userOverrides[itemKey] === 'number' && userOverrides[itemKey] > 0) {
    return {
      ...itemDef,
      itemKey,
      unitRate: userOverrides[itemKey],
      provenance: RATE_PROVENANCE.USER_OVERRIDE,
      cityUsed: city,
      isOverridden: true
    };
  }

  // Resolve city adjustment factor
  const cityInfo = REGIONAL_CITY_FACTORS[city] || REGIONAL_CITY_FACTORS['DEFAULT_NATIONAL'];
  const isCityKnown = Boolean(REGIONAL_CITY_FACTORS[city]);
  const factor = cityInfo.factor || 1.0;

  // Percentage-based items (GST, margin, contingency) do not scale with city factor
  const isPercentage = itemDef.unit === 'percentage';
  const unitRate = isPercentage ? itemDef.baseRate : Math.round(itemDef.baseRate * factor * 100) / 100;

  return {
    ...itemDef,
    itemKey,
    unitRate,
    cityUsed: isCityKnown ? city : 'DEFAULT_NATIONAL',
    provenance: isCityKnown ? itemDef.provenance : RATE_PROVENANCE.ASSUMED_DEFAULT,
    isFallbackCity: !isCityKnown,
    factorApplied: isPercentage ? 1.0 : factor
  };
}

/**
 * Returns list of supported cities
 */
export function getSupportedCities() {
  return Object.keys(REGIONAL_CITY_FACTORS);
}
