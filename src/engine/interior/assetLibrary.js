/**
 * LabourConnect Design Engine - Production Architectural Asset Library
 * 
 * Central registry of production-ready architectural 3D assets for residential interiors.
 * Contains geometric specifications, real-world dimensions, physical material definitions,
 * collision boundaries, and licensing metadata.
 * 
 * Categories:
 * - Living Room
 * - Bedroom
 * - Dining Room
 * - Kitchen
 * - Bathroom
 * - Pooja Room
 * - Lighting Fixtures
 * - Indoor Plants & Decor
 */

export const ASSET_CATEGORIES = Object.freeze({
  LIVING: 'living',
  BEDROOM: 'bedroom',
  DINING: 'dining',
  KITCHEN: 'kitchen',
  BATHROOM: 'bathroom',
  POOJA: 'pooja',
  STUDY: 'study',
  LIGHTING: 'lighting',
  DECOR: 'decor',
  PLANTS: 'plants'
});

export const ARCHITECTURAL_ASSETS = Object.freeze({
  // =========================================================================
  // LIVING ROOM
  // =========================================================================
  'sofa_3seater_contemporary': {
    id: 'sofa_3seater_contemporary',
    name: 'Contemporary 3-Seater Tailored Sofa',
    category: ASSET_CATEGORIES.LIVING,
    furnitureType: 'sofa_3seater',
    dimensions: { width: 7.2, depth: 3.2, height: 2.8 },
    collisionBounds: { width: 7.2, depth: 3.2, height: 2.8 },
    defaultOrientation: 0,
    materials: {
      upholstery: { type: 'fabric_linen', color: '#475569', roughness: 0.85, metalness: 0.02 },
      base: { type: 'wood_teak', color: '#1e293b', roughness: 0.4, metalness: 0.05 },
      cushions: { type: 'fabric_linen', color: '#64748b', roughness: 0.82 }
    },
    polyCount: 1450,
    license: 'CC0 / Architectural Specification (LabourConnect Production Library)'
  },

  'sofa_2seater_loveseat': {
    id: 'sofa_2seater_loveseat',
    name: 'Nordic 2-Seater Upholstered Loveseat',
    category: ASSET_CATEGORIES.LIVING,
    furnitureType: 'sofa_2seater',
    dimensions: { width: 5.2, depth: 3.0, height: 2.8 },
    collisionBounds: { width: 5.2, depth: 3.0, height: 2.8 },
    defaultOrientation: 0,
    materials: {
      upholstery: { type: 'fabric_linen', color: '#64748b', roughness: 0.85 },
      legs: { type: 'wood_oak', color: '#9a6b3d', roughness: 0.35 }
    },
    polyCount: 1100,
    license: 'CC0 / Architectural Specification'
  },

  'sofa_sectional_l_luxury': {
    id: 'sofa_sectional_l_luxury',
    name: 'Grand Sectional L-Sofa with Chaise',
    category: ASSET_CATEGORIES.LIVING,
    furnitureType: 'sofa_sectional_l',
    dimensions: { width: 9.5, depth: 6.5, height: 2.8 },
    collisionBounds: { width: 9.5, depth: 6.5, height: 2.8 },
    defaultOrientation: 0,
    materials: {
      upholstery: { type: 'fabric_linen', color: '#334155', roughness: 0.85 },
      cushions: { type: 'fabric_textured', color: '#475569', roughness: 0.80 }
    },
    polyCount: 2200,
    license: 'CC0 / Architectural Specification'
  },

  'armchair_lounge': {
    id: 'armchair_lounge',
    name: 'Scandinavian Sculptural Armchair',
    category: ASSET_CATEGORIES.LIVING,
    furnitureType: 'armchair',
    dimensions: { width: 2.8, depth: 2.8, height: 2.9 },
    collisionBounds: { width: 2.8, depth: 2.8, height: 2.9 },
    defaultOrientation: 0,
    materials: {
      seat: { type: 'fabric_boucle', color: '#f1f5f9', roughness: 0.85 },
      frame: { type: 'metal_charcoal', color: '#0f172a', roughness: 0.25, metalness: 0.85 }
    },
    polyCount: 950,
    license: 'CC0 / Architectural Specification'
  },

  'coffee_table_bevel': {
    id: 'coffee_table_bevel',
    name: 'Mid-Century Teak & Marble Coffee Table',
    category: ASSET_CATEGORIES.LIVING,
    furnitureType: 'coffee_table',
    dimensions: { width: 4.2, depth: 2.2, height: 1.5 },
    collisionBounds: { width: 4.2, depth: 2.2, height: 1.5 },
    defaultOrientation: 0,
    materials: {
      top: { type: 'marble_calacatta', color: '#f8fafc', roughness: 0.15, metalness: 0.05 },
      legs: { type: 'wood_teak', color: '#78350f', roughness: 0.35, metalness: 0.0 }
    },
    polyCount: 680,
    license: 'CC0 / Architectural Specification'
  },

  'tv_console_credenza': {
    id: 'tv_console_credenza',
    name: 'Slatted Lowline Media Console with 65" OLED',
    category: ASSET_CATEGORIES.LIVING,
    furnitureType: 'tv_console',
    dimensions: { width: 6.0, depth: 1.5, height: 4.5 },
    collisionBounds: { width: 6.0, depth: 1.5, height: 4.5 },
    defaultOrientation: 0,
    materials: {
      body: { type: 'wood_walnut', color: '#451a03', roughness: 0.4 },
      screen: { type: 'glass_oled', color: '#020617', roughness: 0.05, metalness: 0.95 }
    },
    polyCount: 840,
    license: 'CC0 / Architectural Specification'
  },

  // =========================================================================
  // BEDROOM
  // =========================================================================
  'king_bed_upholstered': {
    id: 'king_bed_upholstered',
    name: 'Master King Bed with Fluted Padded Headboard',
    category: ASSET_CATEGORIES.BEDROOM,
    furnitureType: 'king_bed',
    dimensions: { width: 6.6, depth: 6.8, height: 3.8 },
    collisionBounds: { width: 6.6, depth: 6.8, height: 3.8 },
    defaultOrientation: 0,
    materials: {
      frame: { type: 'wood_teak', color: '#78350f', roughness: 0.35 },
      mattress: { type: 'fabric_linen', color: '#f8fafc', roughness: 0.9 },
      duvet: { type: 'fabric_taupe', color: '#64748b', roughness: 0.88 },
      pillows: { type: 'cotton_white', color: '#ffffff', roughness: 0.8 },
      headboard: { type: 'velvet_padded', color: '#334155', roughness: 0.82 }
    },
    polyCount: 2400,
    license: 'CC0 / Architectural Specification'
  },

  'queen_bed_platform': {
    id: 'queen_bed_platform',
    name: 'Queen Size Minimalist Platform Bed',
    category: ASSET_CATEGORIES.BEDROOM,
    furnitureType: 'queen_bed',
    dimensions: { width: 5.5, depth: 6.8, height: 3.5 },
    collisionBounds: { width: 5.5, depth: 6.8, height: 3.5 },
    defaultOrientation: 0,
    materials: {
      frame: { type: 'wood_oak', color: '#9a6b3d', roughness: 0.38 },
      mattress: { type: 'fabric_white', color: '#f8fafc', roughness: 0.9 },
      headboard: { type: 'fabric_grey', color: '#475569', roughness: 0.8 }
    },
    polyCount: 1900,
    license: 'CC0 / Architectural Specification'
  },

  'nightstand_floating': {
    id: 'nightstand_floating',
    name: 'Cantilevered Bedside Nightstand with Drawer',
    category: ASSET_CATEGORIES.BEDROOM,
    furnitureType: 'bedside_table',
    dimensions: { width: 1.8, depth: 1.5, height: 1.8 },
    collisionBounds: { width: 1.8, depth: 1.5, height: 1.8 },
    defaultOrientation: 0,
    materials: {
      body: { type: 'wood_teak', color: '#572b0c', roughness: 0.4 },
      handle: { type: 'metal_brass', color: '#d97706', roughness: 0.2, metalness: 0.9 }
    },
    polyCount: 420,
    license: 'CC0 / Architectural Specification'
  },

  'wardrobe_3door_modular': {
    id: 'wardrobe_3door_modular',
    name: 'Floor-to-Ceiling 3-Door Modular Wardrobe',
    category: ASSET_CATEGORIES.BEDROOM,
    furnitureType: 'wardrobe_3door',
    dimensions: { width: 6.0, depth: 2.0, height: 8.5 },
    collisionBounds: { width: 6.0, depth: 2.0, height: 8.5 },
    defaultOrientation: 0,
    materials: {
      body: { type: 'laminate_warm_grey', color: '#e2e8f0', roughness: 0.45 },
      doors: { type: 'fluted_matte_grey', color: '#cbd5e1', roughness: 0.5 },
      handles: { type: 'metal_black', color: '#0f172a', roughness: 0.2, metalness: 0.9 }
    },
    polyCount: 880,
    license: 'CC0 / Architectural Specification'
  },

  // =========================================================================
  // DINING ROOM
  // =========================================================================
  'dining_table_6s_teak': {
    id: 'dining_table_6s_teak',
    name: 'Solid Teak 6-Seater Architectural Dining Table',
    category: ASSET_CATEGORIES.DINING,
    furnitureType: 'dining_table_6s',
    dimensions: { width: 6.0, depth: 3.2, height: 2.5 },
    collisionBounds: { width: 6.0, depth: 3.2, height: 2.5 },
    defaultOrientation: 0,
    materials: {
      top: { type: 'wood_teak', color: '#78350f', roughness: 0.32 },
      legs: { type: 'wood_teak', color: '#451a03', roughness: 0.35 }
    },
    polyCount: 750,
    license: 'CC0 / Architectural Specification'
  },

  'dining_chair_upholstered': {
    id: 'dining_chair_upholstered',
    name: 'Ergonomic Curved Dining Chair',
    category: ASSET_CATEGORIES.DINING,
    furnitureType: 'dining_chair',
    dimensions: { width: 1.8, depth: 1.8, height: 3.0 },
    collisionBounds: { width: 1.8, depth: 1.8, height: 3.0 },
    defaultOrientation: 0,
    materials: {
      seat: { type: 'fabric_linen', color: '#475569', roughness: 0.85 },
      legs: { type: 'wood_dark', color: '#0f172a', roughness: 0.3 }
    },
    polyCount: 620,
    license: 'CC0 / Architectural Specification'
  },

  // =========================================================================
  // KITCHEN
  // =========================================================================
  'kitchen_counter_island': {
    id: 'kitchen_counter_island',
    name: 'Modular Base Cabinet with Quartz Waterfall Edge',
    category: ASSET_CATEGORIES.KITCHEN,
    furnitureType: 'kitchen_counter_base',
    dimensions: { width: 6.0, depth: 2.2, height: 2.8 },
    collisionBounds: { width: 6.0, depth: 2.2, height: 2.8 },
    defaultOrientation: 0,
    materials: {
      countertop: { type: 'quartz_white', color: '#f8fafc', roughness: 0.12, metalness: 0.05 },
      cabinets: { type: 'polygloss_grey', color: '#e2e8f0', roughness: 0.35 }
    },
    polyCount: 920,
    license: 'CC0 / Architectural Specification'
  },

  'kitchen_sink_undermount': {
    id: 'kitchen_sink_undermount',
    name: 'Double Bowl Granite Sink with Gooseneck Faucet',
    category: ASSET_CATEGORIES.KITCHEN,
    furnitureType: 'kitchen_sink_unit',
    dimensions: { width: 3.2, depth: 2.2, height: 2.8 },
    collisionBounds: { width: 3.2, depth: 2.2, height: 2.8 },
    defaultOrientation: 0,
    materials: {
      basin: { type: 'granite_black', color: '#1e293b', roughness: 0.25 },
      faucet: { type: 'chrome_polished', color: '#e2e8f0', roughness: 0.05, metalness: 0.95 }
    },
    polyCount: 1100,
    license: 'CC0 / Architectural Specification'
  },

  'kitchen_induction_hob': {
    id: 'kitchen_induction_hob',
    name: '4-Burner Glass-Ceramic Induction Cooktop',
    category: ASSET_CATEGORIES.KITCHEN,
    furnitureType: 'kitchen_hob_unit',
    dimensions: { width: 3.0, depth: 2.2, height: 2.8 },
    collisionBounds: { width: 3.0, depth: 2.2, height: 2.8 },
    defaultOrientation: 0,
    materials: {
      plate: { type: 'schott_ceran', color: '#020617', roughness: 0.08, metalness: 0.8 },
      burners: { type: 'emissive_ring', color: '#ea580c', emissive: '#ea580c', emissiveIntensity: 0.4 }
    },
    polyCount: 680,
    license: 'CC0 / Architectural Specification'
  },

  'refrigerator_double_door': {
    id: 'refrigerator_double_door',
    name: 'French-Door Stainless Steel Smart Refrigerator',
    category: ASSET_CATEGORIES.KITCHEN,
    furnitureType: 'refrigerator',
    dimensions: { width: 3.2, depth: 2.8, height: 6.0 },
    collisionBounds: { width: 3.2, depth: 2.8, height: 6.0 },
    defaultOrientation: 0,
    materials: {
      body: { type: 'stainless_steel', color: '#64748b', roughness: 0.25, metalness: 0.9 },
      handles: { type: 'chrome', color: '#cbd5e1', roughness: 0.1, metalness: 0.95 }
    },
    polyCount: 780,
    license: 'CC0 / Architectural Specification'
  },

  // =========================================================================
  // BATHROOM
  // =========================================================================
  'toilet_ewc_wallhung': {
    id: 'toilet_ewc_wallhung',
    name: 'Wall-Hung Rimless EWC with Dual-Flush Actuator',
    category: ASSET_CATEGORIES.BATHROOM,
    furnitureType: 'toilet_ewc',
    dimensions: { width: 1.6, depth: 2.4, height: 2.6 },
    collisionBounds: { width: 1.6, depth: 2.4, height: 2.6 },
    defaultOrientation: 0,
    materials: {
      ceramic: { type: 'vitreous_china', color: '#ffffff', roughness: 0.12 },
      plate: { type: 'brushed_chrome', color: '#cbd5e1', roughness: 0.2, metalness: 0.85 }
    },
    polyCount: 950,
    license: 'CC0 / Architectural Specification'
  },

  'vanity_floating_vessel': {
    id: 'vanity_floating_vessel',
    name: 'Wall-Mount Vanity with Oval Ceramic Vessel & Mirror',
    category: ASSET_CATEGORIES.BATHROOM,
    furnitureType: 'bathroom_vanity',
    dimensions: { width: 3.2, depth: 1.8, height: 2.8 },
    collisionBounds: { width: 3.2, depth: 1.8, height: 2.8 },
    defaultOrientation: 0,
    materials: {
      cabinet: { type: 'wood_slat_teak', color: '#475569', roughness: 0.4 },
      countertop: { type: 'black_granite', color: '#1e293b', roughness: 0.18 },
      basin: { type: 'ceramic_white', color: '#ffffff', roughness: 0.1 },
      faucet: { type: 'tall_chrome_mixer', color: '#e2e8f0', roughness: 0.05, metalness: 0.95 }
    },
    polyCount: 1350,
    license: 'CC0 / Architectural Specification'
  },

  'shower_frameless_glass': {
    id: 'shower_frameless_glass',
    name: 'Walk-In Frameless Glass Shower Enclosure with Rainhead',
    category: ASSET_CATEGORIES.BATHROOM,
    furnitureType: 'shower_enclosure',
    dimensions: { width: 3.5, depth: 3.5, height: 7.0 },
    collisionBounds: { width: 3.5, depth: 3.5, height: 7.0 },
    defaultOrientation: 0,
    materials: {
      glass: { type: 'toughened_glass', color: '#bae6fd', transmission: 0.95, roughness: 0.02 },
      hardware: { type: 'matte_black_clamps', color: '#0f172a', roughness: 0.2, metalness: 0.85 },
      tray: { type: 'anti_skid_tile', color: '#cbd5e1', roughness: 0.6 }
    },
    polyCount: 650,
    license: 'CC0 / Architectural Specification'
  },

  // =========================================================================
  // LIGHTING & FANS
  // =========================================================================
  'ceiling_fan_aerofoil': {
    id: 'ceiling_fan_aerofoil',
    name: 'BLDC 3-Blade Aerofoil Ceiling Fan',
    category: ASSET_CATEGORIES.LIGHTING,
    furnitureType: 'ceiling_fan',
    dimensions: { width: 4.0, depth: 4.0, height: 1.2 },
    collisionBounds: { width: 4.0, depth: 4.0, height: 1.2 },
    defaultOrientation: 0,
    materials: {
      motor: { type: 'brushed_charcoal', color: '#334155', roughness: 0.3, metalness: 0.7 },
      blades: { type: 'aerodynamic_composite', color: '#1e293b', roughness: 0.35, metalness: 0.2 }
    },
    polyCount: 880,
    license: 'CC0 / Architectural Specification'
  },

  'pendant_light_brass': {
    id: 'pendant_light_brass',
    name: 'Spun Brass Minimalist Cone Pendant Light',
    category: ASSET_CATEGORIES.LIGHTING,
    furnitureType: 'pendant_light',
    dimensions: { width: 1.4, depth: 1.4, height: 2.5 },
    collisionBounds: { width: 1.4, depth: 1.4, height: 2.5 },
    defaultOrientation: 0,
    materials: {
      shade: { type: 'spun_brass', color: '#d97706', roughness: 0.25, metalness: 0.9 },
      bulb: { type: 'warm_led_filament', color: '#fef08a', emissive: '#fef08a', emissiveIntensity: 1.5 }
    },
    polyCount: 520,
    license: 'CC0 / Architectural Specification'
  },

  // =========================================================================
  // DECOR & INDOOR PLANTS
  // =========================================================================
  'indoor_plant_planter': {
    id: 'indoor_plant_planter',
    name: 'Fiddle Leaf Fig in Fluted Ceramic Planter',
    category: ASSET_CATEGORIES.PLANTS,
    furnitureType: 'indoor_plant',
    dimensions: { width: 2.0, depth: 2.0, height: 4.5 },
    collisionBounds: { width: 2.0, depth: 2.0, height: 4.5 },
    defaultOrientation: 0,
    materials: {
      planter: { type: 'ceramic_terracotta', color: '#e2e8f0', roughness: 0.5 },
      foliage: { type: 'organic_leaf', color: '#166534', roughness: 0.4 }
    },
    polyCount: 1200,
    license: 'CC0 / Architectural Specification'
  }
});

/**
 * Resolves the recommended asset definition for a catalog furniture type.
 */
export function getAssetDefinitionForType(furnitureType) {
  if (!furnitureType) return null;
  const match = Object.values(ARCHITECTURAL_ASSETS).find(a => a.furnitureType === furnitureType);
  return match || null;
}
