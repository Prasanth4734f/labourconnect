/**
 * LabourConnect Design Engine - Procedural Furniture Catalog (Sprint 4, Task S4-T02)
 * 
 * Central catalog of parametric furniture definitions, standard residential dimensions,
 * component hierarchies, material assignments, and realistic Indian market base costs.
 * 
 * Supports full residential room taxonomy:
 * - Living Room / Hall
 * - Bedroom / Master Bedroom
 * - Kitchen & Kitchen Islands
 * - Dining Room
 * - Bathroom & En-suites
 * - Pooja Room
 * - Study / Home Office
 * - Balcony / Sit-Out Verandah
 * - Utility / Laundry
 */

export const FURNITURE_CATEGORIES = Object.freeze({
  LIVING: 'living',
  BEDROOM: 'bedroom',
  DINING: 'dining',
  KITCHEN: 'kitchen',
  BATHROOM: 'bathroom',
  POOJA: 'pooja',
  STUDY: 'study',
  OUTDOOR: 'outdoor',
  UTILITY: 'utility'
});

export const FURNITURE_TYPES = Object.freeze({
  // Bedroom
  KING_BED: 'king_bed',
  QUEEN_BED: 'queen_bed',
  SINGLE_BED: 'single_bed',
  BEDSIDE_TABLE: 'bedside_table',
  WARDROBE_4DOOR: 'wardrobe_4door',
  WARDROBE_3DOOR: 'wardrobe_3door',
  WARDROBE_2DOOR: 'wardrobe_2door',
  DRESSER: 'dresser',

  // Living
  SOFA_3SEATER: 'sofa_3seater',
  SOFA_2SEATER: 'sofa_2seater',
  SOFA_SECTIONAL_L: 'sofa_sectional_l',
  ARMCHAIR: 'armchair',
  COFFEE_TABLE: 'coffee_table',
  TV_CONSOLE: 'tv_console',
  SIDE_TABLE: 'side_table',

  // Dining
  DINING_TABLE_6S: 'dining_table_6s',
  DINING_TABLE_4S: 'dining_table_4s',
  DINING_CHAIR: 'dining_chair',

  // Kitchen
  KITCHEN_COUNTER_BASE: 'kitchen_counter_base',
  KITCHEN_SINK_UNIT: 'kitchen_sink_unit',
  KITCHEN_HOB_UNIT: 'kitchen_hob_unit',
  REFRIGERATOR: 'refrigerator',
  KITCHEN_ISLAND: 'kitchen_island',

  // Bathroom
  TOILET_EWC: 'toilet_ewc',
  BATHROOM_VANITY: 'bathroom_vanity',
  SHOWER_ENCLOSURE: 'shower_enclosure',

  // Pooja
  POOJA_MANDIR: 'pooja_mandir',

  // Study
  STUDY_DESK: 'study_desk',
  OFFICE_CHAIR: 'office_chair',
  BOOKSHELF: 'bookshelf',

  // Outdoor / Balcony
  OUTDOOR_CHAIR: 'outdoor_chair',
  OUTDOOR_TABLE: 'outdoor_table',
  SUN_LOUNGER: 'sun_lounger',
  ROUND_STOOL: 'round_stool',
  POTTED_SHRUB: 'potted_shrub',
  SLATTED_DIVIDER: 'slatted_divider',
  DESK_LAPTOP: 'desk_laptop',

  // Utility
  WASHING_MACHINE: 'washing_machine'
});

/**
 * Parametric specifications for each furniture type:
 * - defaultDimensions: { width (along local X), depth (along local Z), height (along local Y) } in feet
 * - minRoomClearance: required circulation buffer around the object in feet
 * - baseRateInr: estimated cost in Indian Rupees (Q3 2026 baseline)
 * - components: sub-elements used for recognizable 3D mesh building
 * - materials: default color/material specifications
 */
export const FURNITURE_CATALOG = Object.freeze({
  [FURNITURE_TYPES.KING_BED]: Object.freeze({
    type: FURNITURE_TYPES.KING_BED,
    name: 'King Size Bed with Upholstered Headboard',
    category: FURNITURE_CATEGORIES.BEDROOM,
    defaultDimensions: { width: 6.25, depth: 6.75, height: 3.5 }, // 75" x 81" x 42"
    minRoomAreaSqft: 120,
    baseRateInr: 45000,
    components: ['bed_frame', 'mattress', 'headboard', 'pillow_left', 'pillow_right'],
    materials: {
      frame: { color: '#451a03', name: 'Teak Frame' },
      mattress: { color: '#f8fafc', name: 'Orthopedic Mattress' },
      headboard: { color: '#334155', name: 'Charcoal Linen Upholstery' },
      accent: { color: '#0284c7', name: 'Ocean Accent Cushions' }
    }
  }),

  [FURNITURE_TYPES.QUEEN_BED]: Object.freeze({
    type: FURNITURE_TYPES.QUEEN_BED,
    name: 'Queen Size Bed with Wooden Headboard',
    category: FURNITURE_CATEGORIES.BEDROOM,
    defaultDimensions: { width: 5.25, depth: 6.5, height: 3.25 }, // 63" x 78" x 39"
    minRoomAreaSqft: 95,
    baseRateInr: 35000,
    components: ['bed_frame', 'mattress', 'headboard', 'pillow_left', 'pillow_right'],
    materials: {
      frame: { color: '#78350f', name: 'Walnut Finish' },
      mattress: { color: '#f8fafc', name: 'Plush Mattress' },
      headboard: { color: '#78350f', name: 'Solid Wood Headboard' },
      accent: { color: '#d97706', name: 'Amber Cushion Accent' }
    }
  }),

  [FURNITURE_TYPES.SINGLE_BED]: Object.freeze({
    type: FURNITURE_TYPES.SINGLE_BED,
    name: 'Single Platform Bed',
    category: FURNITURE_CATEGORIES.BEDROOM,
    defaultDimensions: { width: 3.25, depth: 6.25, height: 2.75 },
    minRoomAreaSqft: 70,
    baseRateInr: 18000,
    components: ['bed_frame', 'mattress', 'headboard', 'pillow'],
    materials: {
      frame: { color: '#92400e', name: 'Engineered Wood' },
      mattress: { color: '#f8fafc', name: 'Single Mattress' },
      headboard: { color: '#92400e', name: 'Wood Headboard' }
    }
  }),

  [FURNITURE_TYPES.BEDSIDE_TABLE]: Object.freeze({
    type: FURNITURE_TYPES.BEDSIDE_TABLE,
    name: 'Nightstand / Bedside Table',
    category: FURNITURE_CATEGORIES.BEDROOM,
    defaultDimensions: { width: 1.5, depth: 1.5, height: 1.75 },
    minRoomAreaSqft: 100,
    baseRateInr: 6500,
    components: ['table_body', 'table_top', 'drawer_handle'],
    materials: {
      body: { color: '#572b0c', name: 'Polished Timber' },
      handle: { color: '#e2e8f0', name: 'Brushed Brass/Steel' }
    }
  }),

  [FURNITURE_TYPES.WARDROBE_3DOOR]: Object.freeze({
    type: FURNITURE_TYPES.WARDROBE_3DOOR,
    name: '3-Door Modular Wardrobe with Loft',
    category: FURNITURE_CATEGORIES.BEDROOM,
    defaultDimensions: { width: 4.5, depth: 2.0, height: 7.2 },
    minRoomAreaSqft: 90,
    baseRateInr: 42000,
    components: ['wardrobe_body', 'wardrobe_doors', 'handles'],
    materials: {
      body: { color: '#e2e8f0', name: 'MDF Core Body' },
      doors: { color: '#cbd5e1', name: 'Matte Grey Laminate' },
      handle: { color: '#0f172a', name: 'Matte Black Profile Handles' }
    }
  }),

  [FURNITURE_TYPES.WARDROBE_2DOOR]: Object.freeze({
    type: FURNITURE_TYPES.WARDROBE_2DOOR,
    name: '2-Door Compact Wardrobe',
    category: FURNITURE_CATEGORIES.BEDROOM,
    defaultDimensions: { width: 3.2, depth: 2.0, height: 7.0 },
    minRoomAreaSqft: 75,
    baseRateInr: 28000,
    components: ['wardrobe_body', 'wardrobe_doors', 'handles'],
    materials: {
      body: { color: '#f1f5f9', name: 'White Melamine' },
      doors: { color: '#e2e8f0', name: 'Soft Grey Laminate' }
    }
  }),

  [FURNITURE_TYPES.DRESSER]: Object.freeze({
    type: FURNITURE_TYPES.DRESSER,
    name: 'Dressing Console with Vertical Mirror',
    category: FURNITURE_CATEGORIES.BEDROOM,
    defaultDimensions: { width: 2.75, depth: 1.5, height: 5.5 },
    minRoomAreaSqft: 130,
    baseRateInr: 16000,
    components: ['counter_body', 'mirror_pane', 'drawers'],
    materials: {
      body: { color: '#78350f', name: 'Warm Oak' },
      mirror: { color: '#94a3b8', name: 'High-Definition Mirror' }
    }
  }),

  // --- LIVING ROOM ---
  [FURNITURE_TYPES.SOFA_3SEATER]: Object.freeze({
    type: FURNITURE_TYPES.SOFA_3SEATER,
    name: '3-Seater Comfort Sofa',
    category: FURNITURE_CATEGORIES.LIVING,
    defaultDimensions: { width: 6.5, depth: 2.8, height: 2.6 },
    minRoomAreaSqft: 110,
    baseRateInr: 38000,
    components: ['sofa_base', 'cushion_seats', 'backrest', 'armrest_left', 'armrest_right'],
    materials: {
      base: { color: '#334155', name: 'Solid Hardwood & Webbing' },
      fabric: { color: '#475569', name: 'Slate Grey Fabric' },
      cushion: { color: '#64748b', name: 'High-Resilience Foam Cushion' }
    }
  }),

  [FURNITURE_TYPES.SOFA_SECTIONAL_L]: Object.freeze({
    type: FURNITURE_TYPES.SOFA_SECTIONAL_L,
    name: 'L-Shaped Sectional Lounger Sofa',
    category: FURNITURE_CATEGORIES.LIVING,
    defaultDimensions: { width: 7.5, depth: 5.2, height: 2.6 },
    minRoomAreaSqft: 160,
    baseRateInr: 65000,
    components: ['main_run', 'chaise_lounge', 'cushions', 'backrests'],
    materials: {
      base: { color: '#1e293b', name: 'Wood Platform' },
      fabric: { color: '#475569', name: 'Warm Charcoal Linen Fabric' }
    }
  }),

  [FURNITURE_TYPES.ARMCHAIR]: Object.freeze({
    type: FURNITURE_TYPES.ARMCHAIR,
    name: 'Contemporary Lounge Accent Armchair',
    category: FURNITURE_CATEGORIES.LIVING,
    defaultDimensions: { width: 2.6, depth: 2.5, height: 2.7 },
    minRoomAreaSqft: 130,
    baseRateInr: 14000,
    components: ['chair_base', 'seat_cushion', 'backrest'],
    materials: {
      fabric: { color: '#64748b', name: 'Architectural Slate Grey Upholstery' },
      legs: { color: '#0f172a', name: 'Matte Black Steel Legs' }
    }
  }),

  [FURNITURE_TYPES.COFFEE_TABLE]: Object.freeze({
    type: FURNITURE_TYPES.COFFEE_TABLE,
    name: 'Center Coffee Table with Lower Shelf',
    category: FURNITURE_CATEGORIES.LIVING,
    defaultDimensions: { width: 3.5, depth: 2.0, height: 1.4 },
    minRoomAreaSqft: 90,
    baseRateInr: 12000,
    components: ['table_top', 'table_legs', 'bottom_shelf'],
    materials: {
      top: { color: '#1e293b', name: 'Polished Black Marquina Marble' },
      legs: { color: '#b45309', name: 'Solid Teak Legs' }
    }
  }),

  [FURNITURE_TYPES.TV_CONSOLE]: Object.freeze({
    type: FURNITURE_TYPES.TV_CONSOLE,
    name: 'Media Credenza with 55" OLED Display Screen',
    category: FURNITURE_CATEGORIES.LIVING,
    defaultDimensions: { width: 5.5, depth: 1.4, height: 4.2 },
    minRoomAreaSqft: 100,
    baseRateInr: 48000,
    components: ['credenza_base', 'tv_screen', 'soundbar'],
    materials: {
      base: { color: '#334155', name: 'Charcoal Wood Credenza' },
      screen: { color: '#020617', name: 'Gloss Black 4K OLED Panel' }
    }
  }),

  [FURNITURE_TYPES.SIDE_TABLE]: Object.freeze({
    type: FURNITURE_TYPES.SIDE_TABLE,
    name: 'Living Corner Side Table',
    category: FURNITURE_CATEGORIES.LIVING,
    defaultDimensions: { width: 1.5, depth: 1.5, height: 1.8 },
    minRoomAreaSqft: 140,
    baseRateInr: 5500,
    components: ['table_top', 'pedestal'],
    materials: {
      top: { color: '#78350f', name: 'Solid Wood' }
    }
  }),

  // --- DINING ROOM ---
  [FURNITURE_TYPES.DINING_TABLE_6S]: Object.freeze({
    type: FURNITURE_TYPES.DINING_TABLE_6S,
    name: '6-Seater Solid Teak Dining Table',
    category: FURNITURE_CATEGORIES.DINING,
    defaultDimensions: { width: 5.2, depth: 3.2, height: 2.5 },
    minRoomAreaSqft: 100,
    baseRateInr: 45000,
    components: ['table_top', 'table_legs'],
    materials: {
      top: { color: '#78350f', name: 'Polished Natural Teak' },
      legs: { color: '#451a03', name: 'Timber Tapered Legs' }
    }
  }),

  [FURNITURE_TYPES.DINING_TABLE_4S]: Object.freeze({
    type: FURNITURE_TYPES.DINING_TABLE_4S,
    name: '4-Seater Compact Dining Table',
    category: FURNITURE_CATEGORIES.DINING,
    defaultDimensions: { width: 3.5, depth: 3.0, height: 2.5 },
    minRoomAreaSqft: 70,
    baseRateInr: 28000,
    components: ['table_top', 'table_legs'],
    materials: {
      top: { color: '#92400e', name: 'Sheesham Wood Top' }
    }
  }),

  [FURNITURE_TYPES.DINING_CHAIR]: Object.freeze({
    type: FURNITURE_TYPES.DINING_CHAIR,
    name: 'Upholstered Dining Chair',
    category: FURNITURE_CATEGORIES.DINING,
    defaultDimensions: { width: 1.5, depth: 1.5, height: 3.0 },
    minRoomAreaSqft: 60,
    baseRateInr: 5000,
    components: ['seat_slab', 'backrest_panel', 'legs'],
    materials: {
      seat: { color: '#64748b', name: 'Cushioned Seat' },
      frame: { color: '#451a03', name: 'Hardwood Frame' }
    }
  }),

  // --- KITCHEN ---
  [FURNITURE_TYPES.KITCHEN_COUNTER_BASE]: Object.freeze({
    type: FURNITURE_TYPES.KITCHEN_COUNTER_BASE,
    name: 'Modular Kitchen Counter Run with Polished Granite Slab',
    category: FURNITURE_CATEGORIES.KITCHEN,
    defaultDimensions: { width: 8.0, depth: 2.0, height: 2.8 },
    minRoomAreaSqft: 50,
    baseRateInr: 55000,
    components: ['cabinet_base', 'countertop_slab', 'skirting'],
    materials: {
      top: { color: '#0f172a', name: 'Jet-Black Granite Countertop' },
      cabinets: { color: '#f1f5f9', name: 'High-Gloss White Acrylic Cabinets' }
    }
  }),

  [FURNITURE_TYPES.KITCHEN_SINK_UNIT]: Object.freeze({
    type: FURNITURE_TYPES.KITCHEN_SINK_UNIT,
    name: 'Stainless Steel Under-Mount Sink & Chrome Mixer',
    category: FURNITURE_CATEGORIES.KITCHEN,
    defaultDimensions: { width: 2.2, depth: 1.5, height: 0.8 },
    minRoomAreaSqft: 40,
    baseRateInr: 12000,
    components: ['sink_basin', 'faucet'],
    materials: {
      basin: { color: '#94a3b8', name: 'SS 304 Satin Finish' },
      faucet: { color: '#e2e8f0', name: 'Chrome Plated Faucet' }
    }
  }),

  [FURNITURE_TYPES.KITCHEN_HOB_UNIT]: Object.freeze({
    type: FURNITURE_TYPES.KITCHEN_HOB_UNIT,
    name: '4-Burner Toughened Glass Built-In Gas Hob',
    category: FURNITURE_CATEGORIES.KITCHEN,
    defaultDimensions: { width: 2.2, depth: 1.6, height: 0.25 },
    minRoomAreaSqft: 40,
    baseRateInr: 18000,
    components: ['hob_glass_plate', 'burners'],
    materials: {
      plate: { color: '#020617', name: 'Black Toughened Glass' },
      burners: { color: '#b45309', name: 'Forged Brass Burners' }
    }
  }),

  [FURNITURE_TYPES.REFRIGERATOR]: Object.freeze({
    type: FURNITURE_TYPES.REFRIGERATOR,
    name: 'Double-Door Frost-Free Inverter Refrigerator',
    category: FURNITURE_CATEGORIES.KITCHEN,
    defaultDimensions: { width: 2.5, depth: 2.4, height: 5.6 },
    minRoomAreaSqft: 50,
    baseRateInr: 42000,
    components: ['fridge_body', 'freezer_door', 'main_door', 'handles'],
    materials: {
      body: { color: '#64748b', name: 'Metallic Steel Finish' }
    }
  }),

  // --- BATHROOM ---
  [FURNITURE_TYPES.TOILET_EWC]: Object.freeze({
    type: FURNITURE_TYPES.TOILET_EWC,
    name: 'Wall-Hung European Water Closet (EWC) with Concealed Cistern',
    category: FURNITURE_CATEGORIES.BATHROOM,
    defaultDimensions: { width: 1.5, depth: 2.1, height: 2.4 },
    minRoomAreaSqft: 25,
    baseRateInr: 18000,
    components: ['cistern_tank', 'toilet_bowl', 'toilet_lid'],
    materials: {
      ceramic: { color: '#ffffff', name: 'White Vitreous Ceramic' }
    }
  }),

  [FURNITURE_TYPES.BATHROOM_VANITY]: Object.freeze({
    type: FURNITURE_TYPES.BATHROOM_VANITY,
    name: 'Floating Vanity Counter with Countertop Basin',
    category: FURNITURE_CATEGORIES.BATHROOM,
    defaultDimensions: { width: 2.5, depth: 1.5, height: 2.7 },
    minRoomAreaSqft: 30,
    baseRateInr: 16000,
    components: ['vanity_cabinet', 'counter_slab', 'ceramic_basin', 'faucet'],
    materials: {
      cabinet: { color: '#475569', name: 'Waterproof Charcoal PVC' },
      counter: { color: '#1e293b', name: 'Black Granite' },
      basin: { color: '#ffffff', name: 'Ceramic Basin' }
    }
  }),

  [FURNITURE_TYPES.SHOWER_ENCLOSURE]: Object.freeze({
    type: FURNITURE_TYPES.SHOWER_ENCLOSURE,
    name: 'Walk-In Shower Enclosure with Tempered Glass Panel',
    category: FURNITURE_CATEGORIES.BATHROOM,
    defaultDimensions: { width: 3.0, depth: 3.0, height: 6.5 },
    minRoomAreaSqft: 35,
    baseRateInr: 22000,
    components: ['shower_tray', 'glass_partition'],
    materials: {
      tray: { color: '#e2e8f0', name: 'Anti-Skid Tile Base' },
      glass: { color: '#93c5fd', opacity: 0.35, name: '10mm Toughened Glass' }
    }
  }),

  // --- POOJA ROOM ---
  [FURNITURE_TYPES.POOJA_MANDIR]: Object.freeze({
    type: FURNITURE_TYPES.POOJA_MANDIR,
    name: 'Traditional Teak Wood Pooja Mandir with Gopuram Tower',
    category: FURNITURE_CATEGORIES.POOJA,
    defaultDimensions: { width: 2.6, depth: 1.6, height: 4.8 },
    minRoomAreaSqft: 20,
    baseRateInr: 25000,
    components: ['mandir_base', 'altar_shrine', 'gopuram_roof', 'brass_bell_pediment'],
    materials: {
      wood: { color: '#78350f', name: 'Rosewood/Teak' },
      brass: { color: '#fbbf24', name: 'Polished Brass Accents' }
    }
  }),

  // --- STUDY ---
  [FURNITURE_TYPES.STUDY_DESK]: Object.freeze({
    type: FURNITURE_TYPES.STUDY_DESK,
    name: 'Ergonomic Work Desk with Drawer Pedestal',
    category: FURNITURE_CATEGORIES.STUDY,
    defaultDimensions: { width: 4.0, depth: 2.0, height: 2.5 },
    minRoomAreaSqft: 40,
    baseRateInr: 15000,
    components: ['desk_top', 'legs', 'drawer_unit'],
    materials: {
      top: { color: '#92400e', name: 'Warm Oak Desk' },
      frame: { color: '#0f172a', name: 'Black Powder-Coated Metal' }
    }
  }),

  [FURNITURE_TYPES.OFFICE_CHAIR]: Object.freeze({
    type: FURNITURE_TYPES.OFFICE_CHAIR,
    name: 'High-Back Ergonomic Mesh Task Chair',
    category: FURNITURE_CATEGORIES.STUDY,
    defaultDimensions: { width: 1.8, depth: 1.8, height: 3.2 },
    minRoomAreaSqft: 30,
    baseRateInr: 9500,
    components: ['chair_base', 'seat_cushion', 'mesh_back'],
    materials: {
      mesh: { color: '#1e293b', name: 'Breathable Black Mesh' }
    }
  }),

  [FURNITURE_TYPES.BOOKSHELF]: Object.freeze({
    type: FURNITURE_TYPES.BOOKSHELF,
    name: 'Open Display Bookcase & Shelving Unit',
    category: FURNITURE_CATEGORIES.STUDY,
    defaultDimensions: { width: 3.5, depth: 1.2, height: 6.0 },
    minRoomAreaSqft: 60,
    baseRateInr: 16000,
    components: ['shelf_frame', 'shelves'],
    materials: {
      frame: { color: '#78350f', name: 'Teak Veneer' }
    }
  }),

  // --- BALCONY / OUTDOOR ---
  [FURNITURE_TYPES.OUTDOOR_CHAIR]: Object.freeze({
    type: FURNITURE_TYPES.OUTDOOR_CHAIR,
    name: 'All-Weather Wicker Lounge Armchair',
    category: FURNITURE_CATEGORIES.OUTDOOR,
    defaultDimensions: { width: 2.0, depth: 2.0, height: 2.3 },
    minRoomAreaSqft: 30,
    baseRateInr: 7500,
    components: ['wicker_frame', 'cushion'],
    materials: {
      frame: { color: '#572b0c', name: 'Synthetic Rattan Wicker' },
      cushion: { color: '#f8fafc', name: 'Water-Resistant Cream Cushion' }
    }
  }),

  [FURNITURE_TYPES.OUTDOOR_TABLE]: Object.freeze({
    type: FURNITURE_TYPES.OUTDOOR_TABLE,
    name: 'Modern Teak Outdoor Dining Table with Tableware Dish',
    category: FURNITURE_CATEGORIES.OUTDOOR,
    defaultDimensions: { width: 4.5, depth: 4.5, height: 2.5 },
    minRoomAreaSqft: 35,
    baseRateInr: 18000,
    components: ['table_top', 'table_legs', 'tableware_dish'],
    materials: {
      top: { color: '#854d0e', name: 'Natural Solid Teak' },
      legs: { color: '#78350f', name: 'Solid Teak Legs' },
      dish: { color: '#f8fafc', name: 'White Ceramic Centerpiece Plate' }
    }
  }),

  [FURNITURE_TYPES.SUN_LOUNGER]: Object.freeze({
    type: FURNITURE_TYPES.SUN_LOUNGER,
    name: 'Architectural Terrace Sun Lounger Daybed',
    category: FURNITURE_CATEGORIES.OUTDOOR,
    defaultDimensions: { width: 3.0, depth: 6.0, height: 1.5 },
    minRoomAreaSqft: 40,
    baseRateInr: 22000,
    components: ['lounger_frame', 'cushion', 'headrest_pillow'],
    materials: {
      frame: { color: '#78350f', name: 'Oiled Teak Frame' },
      cushion: { color: '#f1f5f9', name: 'Weatherproof White Linen Fabric' },
      pillow: { color: '#cbd5e1', name: 'Heather Grey Headrest Cushion' }
    }
  }),

  [FURNITURE_TYPES.ROUND_STOOL]: Object.freeze({
    type: FURNITURE_TYPES.ROUND_STOOL,
    name: 'Solid Wood Round Stool / Barstool',
    category: FURNITURE_CATEGORIES.OUTDOOR,
    defaultDimensions: { width: 1.3, depth: 1.3, height: 1.5 },
    minRoomAreaSqft: 15,
    baseRateInr: 3500,
    components: ['stool_seat', 'stool_body'],
    materials: {
      seat: { color: '#92400e', name: 'Turned Warm Teak Seat' }
    }
  }),

  [FURNITURE_TYPES.POTTED_SHRUB]: Object.freeze({
    type: FURNITURE_TYPES.POTTED_SHRUB,
    name: 'Perimeter Spherical Shrub in Architectural Planter',
    category: FURNITURE_CATEGORIES.OUTDOOR,
    defaultDimensions: { width: 1.6, depth: 1.6, height: 2.2 },
    minRoomAreaSqft: 10,
    baseRateInr: 4500,
    components: ['planter_pot', 'foliage_bush'],
    materials: {
      pot: { color: '#94a3b8', name: 'Matte Cast Stone Planter Pot' },
      foliage: { color: '#16a34a', name: 'Lush Green Spherical Bush' }
    }
  }),

  [FURNITURE_TYPES.SLATTED_DIVIDER]: Object.freeze({
    type: FURNITURE_TYPES.SLATTED_DIVIDER,
    name: 'Vertical Timber Louver Acoustic Divider Screen',
    category: FURNITURE_CATEGORIES.BEDROOM,
    defaultDimensions: { width: 0.3, depth: 6.0, height: 7.0 },
    minRoomAreaSqft: 70,
    baseRateInr: 18000,
    components: ['slat_frame', 'vertical_slats'],
    materials: {
      slats: { color: '#854d0e', name: 'Warm Oak Louvers' }
    }
  }),

  [FURNITURE_TYPES.DESK_LAPTOP]: Object.freeze({
    type: FURNITURE_TYPES.DESK_LAPTOP,
    name: 'Executive Workstation Desk with Laptop & Planter',
    category: FURNITURE_CATEGORIES.STUDY,
    defaultDimensions: { width: 4.5, depth: 2.2, height: 2.5 },
    minRoomAreaSqft: 40,
    baseRateInr: 24000,
    components: ['desk_body', 'laptop_base', 'laptop_screen', 'mini_plant'],
    materials: {
      desk: { color: '#854d0e', name: 'Polished Teak Worktop' },
      laptop: { color: '#334155', name: 'Slate Anodized Aluminum Laptop' },
      plant: { color: '#22c55e', name: 'Tabletop Succulent Foliage' }
    }
  }),

  // --- UTILITY ---
  [FURNITURE_TYPES.WASHING_MACHINE]: Object.freeze({
    type: FURNITURE_TYPES.WASHING_MACHINE,
    name: 'Front-Load Automatic Inverter Washing Machine',
    category: FURNITURE_CATEGORIES.UTILITY,
    defaultDimensions: { width: 2.0, depth: 2.0, height: 2.8 },
    minRoomAreaSqft: 20,
    baseRateInr: 32000,
    components: ['machine_body', 'door_drum'],
    materials: {
      body: { color: '#e2e8f0', name: 'Stainless Enamel' }
    }
  })
});

/**
 * Returns the catalog definition for a furniture type
 */
export function getFurnitureDefinition(type) {
  return FURNITURE_CATALOG[type] || null;
}

/**
 * Maps canonical room types to primary furniture assignments
 */
export function getRecommendedFurnitureForRoom(roomType, roomAreaSqft) {
  const normType = (roomType || '').toLowerCase();
  
  if (normType.includes('master')) {
    const list = [FURNITURE_TYPES.KING_BED, FURNITURE_TYPES.BEDSIDE_TABLE, FURNITURE_TYPES.WARDROBE_3DOOR];
    if (roomAreaSqft >= 140) list.push(FURNITURE_TYPES.DRESSER);
    return list;
  }
  
  if (normType.includes('bed')) {
    const list = [FURNITURE_TYPES.QUEEN_BED, FURNITURE_TYPES.BEDSIDE_TABLE, FURNITURE_TYPES.WARDROBE_2DOOR];
    return list;
  }

  if (normType.includes('living') || normType.includes('hall')) {
    const list = [FURNITURE_TYPES.SOFA_3SEATER, FURNITURE_TYPES.COFFEE_TABLE, FURNITURE_TYPES.TV_CONSOLE];
    if (roomAreaSqft >= 150) list.push(FURNITURE_TYPES.ARMCHAIR);
    return list;
  }

  if (normType.includes('dining')) {
    return roomAreaSqft >= 100 
      ? [FURNITURE_TYPES.DINING_TABLE_6S]
      : [FURNITURE_TYPES.DINING_TABLE_4S];
  }

  if (normType.includes('kitchen')) {
    return [
      FURNITURE_TYPES.KITCHEN_COUNTER_BASE,
      FURNITURE_TYPES.KITCHEN_SINK_UNIT,
      FURNITURE_TYPES.KITCHEN_HOB_UNIT,
      FURNITURE_TYPES.REFRIGERATOR
    ];
  }

  if (normType.includes('bath') || normType.includes('toilet')) {
    const list = [FURNITURE_TYPES.TOILET_EWC, FURNITURE_TYPES.BATHROOM_VANITY];
    if (roomAreaSqft >= 35) list.push(FURNITURE_TYPES.SHOWER_ENCLOSURE);
    return list;
  }

  if (normType.includes('pooja') || normType.includes('mandir')) {
    return [FURNITURE_TYPES.POOJA_MANDIR];
  }

  if (normType.includes('study') || normType.includes('office')) {
    return [FURNITURE_TYPES.STUDY_DESK, FURNITURE_TYPES.OFFICE_CHAIR, FURNITURE_TYPES.BOOKSHELF];
  }

  if (normType.includes('balcony') || normType.includes('portico') || normType.includes('verandah')) {
    return [FURNITURE_TYPES.OUTDOOR_CHAIR, FURNITURE_TYPES.OUTDOOR_TABLE];
  }

  if (normType.includes('utility')) {
    return [FURNITURE_TYPES.WASHING_MACHINE];
  }

  return [];
}
