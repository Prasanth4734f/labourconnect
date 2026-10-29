/**
 * LabourConnect Design Engine - Deterministic Lighting & Shading Engine (Sprint 3, Task S3-T04)
 * 
 * Provides physically motivated, deterministic solar daylight simulation and face-orientation
 * shading for procedural 3D architectural models.
 * 
 * Features:
 * - Diurnal Solar Cycle: Computes continuous solar altitude, azimuth, and 3D directional vectors
 *   across 24 hours (Dawn, Midday, Golden Hour, Twilight, Night) with orientation offset.
 * - Tri-Planar Face Shading: Distinct handling for upward-facing (roofs/slabs), downward-facing
 *   (ceilings/soffits), and vertical (walls/openings) surfaces.
 * - Blinn-Phong Specular & Diffuse Model: Accounts for material roughness, metalness, and shininess.
 * - Color Modulation: Deterministic RGB scaling with clamped tonal contrast preventing blowouts
 *   or pitch-black surfaces.
 * - Purely Mathematical: 100% reproducible with seeds/inputs, zero random values, zero external APIs.
 */

// =============================================================================
// 1. LIGHTING PRESETS & DIURNAL CONFIGURATION
// =============================================================================

export const LIGHTING_PRESETS = Object.freeze({
  DAWN: 'dawn',               // 06:30 AM - Warm sunrise, low altitude, amber horizon
  MIDDAY: 'midday',           // 12:00 PM - Crisp overhead tropical sun, high contrast
  GOLDEN_HOUR: 'golden_hour', // 05:45 PM - Warm sunset, long directional shadows
  TWILIGHT: 'twilight',       // 07:00 PM - Indigo sky, diffuse twilight, interior glow
  NIGHT: 'night',             // 09:00 PM - Architectural moonlight & night illumination
  STUDIO_NEUTRAL: 'studio'    // Fixed 3-point architectural studio lighting
});

export const ORIENTATION_OFFSETS = Object.freeze({
  East: 0,
  North: Math.PI / 2,
  West: Math.PI,
  South: (3 * Math.PI) / 2
});

// =============================================================================
// 2. SOLAR POSITION & DIRECTIONAL VECTOR CALCULATION
// =============================================================================

/**
 * Calculates the 3D unit sun vector and daylight parameters for a given solar time and plot orientation.
 * 
 * Coordinate Convention (Right-Handed):
 * - X: East-West axis (Width)
 * - Y: Vertical elevation Up
 * - Z: North-South axis (Depth)
 * 
 * @param {number} solarTime - Decimal hours from 0.0 to 24.0 (e.g. 12.0 = noon, 17.75 = 5:45 PM)
 * @param {string} [facing='East'] - Site plot orientation ('East', 'North', 'West', 'South')
 * @returns {Object} Solar daylight simulation parameters
 */
export function calculateSunPosition(solarTime = 12.0, facing = 'East') {
  const numTime = Number(solarTime);
  const t = Math.max(0, Math.min(24, !isNaN(numTime) ? numTime : 12.0));
  const orientationOffset = ORIENTATION_OFFSETS[facing] || 0;

  // Day/Night determination (Tropical India daylight roughly 06:00 to 18:30)
  const isDaylight = t >= 6.0 && t <= 18.5;

  let altitudeRad = 0;
  let azimuthRad = 0;
  let sunIntensity = 1.0;
  let ambientIntensity = 0.85;
  let sunColor = '#ffffff';
  let ambientColor = '#e2e8f0';
  let skyGlow = 0.0;
  let interiorGlow = 0.0;
  let presetName = LIGHTING_PRESETS.MIDDAY;

  if (t < 6.0 || t > 20.0) {
    // Night
    presetName = LIGHTING_PRESETS.NIGHT;
    altitudeRad = -0.3; // Below horizon
    azimuthRad = Math.PI;
    sunIntensity = 0.25; // Moon / architectural ambient
    ambientIntensity = 0.35;
    sunColor = '#93c5fd';
    ambientColor = '#1e293b';
    interiorGlow = 0.95;
  } else if (t >= 6.0 && t <= 7.5) {
    // Dawn / Sunrise
    presetName = LIGHTING_PRESETS.DAWN;
    const progress = (t - 6.0) / 1.5;
    altitudeRad = 0.10 + progress * 0.25; // 6° to 20°
    azimuthRad = (progress * 0.3) + orientationOffset;
    sunIntensity = 0.85;
    ambientIntensity = 0.65;
    sunColor = '#fde047';
    ambientColor = '#fed7aa';
    skyGlow = 0.40;
    interiorGlow = 0.30;
  } else if (t > 7.5 && t < 16.5) {
    // Midday
    presetName = LIGHTING_PRESETS.MIDDAY;
    const midProgress = (t - 7.5) / 9.0;
    altitudeRad = 0.35 + Math.sin(midProgress * Math.PI) * 0.85; // Peak ~70° at noon
    azimuthRad = (midProgress * Math.PI) + orientationOffset;
    sunIntensity = 1.15;
    ambientIntensity = 0.90;
    sunColor = '#ffffff';
    ambientColor = '#f8fafc';
    skyGlow = 0.10;
    interiorGlow = 0.0;
  } else if (t >= 16.5 && t <= 18.5) {
    // Golden Hour / Sunset
    presetName = LIGHTING_PRESETS.GOLDEN_HOUR;
    const progress = (t - 16.5) / 2.0;
    altitudeRad = 0.35 * (1.0 - progress) + 0.08; // 20° down to 5°
    azimuthRad = Math.PI * 0.8 + orientationOffset;
    sunIntensity = 1.05;
    ambientIntensity = 0.72;
    sunColor = '#fbbf24';
    ambientColor = '#fdba74';
    skyGlow = 0.60;
    interiorGlow = 0.45;
  } else {
    // Twilight (18.5 to 20.0)
    presetName = LIGHTING_PRESETS.TWILIGHT;
    const progress = (t - 18.5) / 1.5;
    altitudeRad = 0.05 * (1.0 - progress) - 0.15;
    azimuthRad = Math.PI + orientationOffset;
    sunIntensity = 0.40;
    ambientIntensity = 0.45;
    sunColor = '#a5b4fc';
    ambientColor = '#334155';
    skyGlow = 0.30;
    interiorGlow = 0.80;
  }

  // Convert spherical (altitude, azimuth) to Cartesian unit vector (Y-Up)
  const cosAlt = Math.cos(altitudeRad);
  const sinAlt = Math.sin(altitudeRad);
  const cosAz = Math.cos(azimuthRad);
  const sinAz = Math.sin(azimuthRad);

  const lx = cosAlt * sinAz;
  const ly = Math.max(0.12, sinAlt); // Maintain minimum positive elevation for directional fill
  const lz = -cosAlt * cosAz;

  // Normalize
  const len = Math.hypot(lx, ly, lz) || 1.0;
  const sunVector = [
    Number((lx / len).toFixed(4)),
    Number((ly / len).toFixed(4)),
    Number((lz / len).toFixed(4))
  ];

  return {
    preset: presetName,
    solarTime: t,
    isDaylight,
    sunVector,
    altitudeDegrees: Number(((altitudeRad * 180) / Math.PI).toFixed(1)),
    azimuthDegrees: Number(((azimuthRad * 180) / Math.PI).toFixed(1)),
    sunIntensity,
    ambientIntensity,
    sunColor,
    ambientColor,
    skyGlow,
    interiorGlow
  };
}

// =============================================================================
// 3. COLOR MATH & TONAL MODULATION
// =============================================================================

/**
 * Parses a hex color string into [r, g, b] integer components (0-255).
 * 
 * @param {string} hex
 * @returns {number[]}
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return [200, 200, 200];
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return [200, 200, 200];
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [200, 200, 200];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Converts [r, g, b] components (0-255) to a formatted hex string.
 * 
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
export function rgbToHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = v => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Multiplies a hex color by a brightness scaling factor deterministically.
 * Clamps result safely within [0, 255] to prevent blowouts or clipping.
 * 
 * @param {string} hexColor
 * @param {number} factor - Brightness multiplier (e.g. 0.8 for shade, 1.2 for highlight)
 * @returns {string} Shaded hex color
 */
export function modulateHexColor(hexColor, factor) {
  const [r, g, b] = hexToRgb(hexColor);
  const f = Math.max(0.15, Math.min(1.85, Number(factor) || 1.0));
  return rgbToHex(r * f, g * f, b * f);
}

// =============================================================================
// 4. TRI-PLANAR FACE SHADING ENGINE
// =============================================================================

/**
 * Calculates deterministic shading factor and resulting rendered color for a polygon face.
 * 
 * Shading Rules:
 * - Upward Faces (normal Y > 0.5): Horizontal roof surfaces, slab tops, tread tops.
 *   Receive sky ambient irradiance + direct sun if altitude > 0.
 * - Downward Faces (normal Y < -0.5): Slab soffits, balcony undersides, chajja undersides.
 *   Receive diffuse bounce ambient only, shaded darker to ground the architecture.
 * - Vertical Faces (|normal Y| <= 0.5): Exterior and interior walls, window frames, parapets.
 *   Receive directional Lambertian cosine light based on normal dot light vector.
 * 
 * @param {number[]} normal - Surface normal unit vector [nx, ny, nz]
 * @param {Object} material - Validated material definition from materialCatalog
 * @param {Object} lighting - Lighting configuration from calculateSunPosition
 * @param {Object} [options={}] - Optional camera/view vector overrides
 * @returns {Object} Shading results
 */
export function calculateFaceShading(normal = [0, 1, 0], material = {}, lighting = {}, options = {}) {
  const nx = normal[0] || 0;
  const ny = normal[1] || 0;
  const nz = normal[2] || 0;

  const sunVec = lighting.sunVector || [0.577, 0.577, -0.577];
  const sunIntensity = lighting.sunIntensity !== undefined ? lighting.sunIntensity : 1.0;
  const ambientIntensity = lighting.ambientIntensity !== undefined ? lighting.ambientIntensity : 0.85;

  const ka = material.ambientCoeff !== undefined ? material.ambientCoeff : 0.35;
  const kd = material.diffuseCoeff !== undefined ? material.diffuseCoeff : 0.65;
  const ks = material.specularCoeff !== undefined ? material.specularCoeff : 0.15;
  const roughness = material.roughness !== undefined ? material.roughness : 0.75;
  const shininess = material.shininess || 16;
  const baseColor = material.baseColor || '#cbd5e1';

  // Tri-planar surface classification
  const isUpward = ny > 0.5;
  const isDownward = ny < -0.5;
  const isVertical = !isUpward && !isDownward;

  // 1. Ambient Irradiance Component
  let ambientScale = 1.0;
  if (isUpward) {
    ambientScale = 1.20; // Skylight direct irradiance
  } else if (isDownward) {
    ambientScale = 0.65; // Occluded undersides / soffits
  } else {
    ambientScale = 0.95; // Vertical walls
  }
  const iAmbient = ka * ambientIntensity * ambientScale;

  // 2. Diffuse Lambertian Component (N . L)
  const dotNL = nx * sunVec[0] + ny * sunVec[1] + nz * sunVec[2];
  const lambertian = Math.max(0, dotNL);
  const iDiffuse = kd * lambertian * sunIntensity;

  // 3. Specular Highlight (Blinn-Phong Approximation)
  // Standard camera view vector toward model center
  const viewVec = options.viewVector || [0.35, 0.65, 0.67];
  const hx = sunVec[0] + viewVec[0];
  const hy = sunVec[1] + viewVec[1];
  const hz = sunVec[2] + viewVec[2];
  const hLen = Math.hypot(hx, hy, hz) || 1.0;
  const dotNH = Math.max(0, (nx * hx + ny * hy + nz * hz) / hLen);

  const specularFactor = Math.pow(dotNH, shininess);
  const iSpecular = ks * (1.0 - roughness) * specularFactor * sunIntensity;

  // 4. Combined Shading Factor
  const rawFactor = iAmbient + iDiffuse + iSpecular;
  // Stable contrast boundaries: never completely pitch black (< 0.22) and never blown out (> 1.45)
  const shadingFactor = Number(Math.max(0.22, Math.min(1.45, rawFactor)).toFixed(3));

  // Modulated Face Color
  const shadedColor = modulateHexColor(baseColor, shadingFactor);

  return {
    shadingFactor,
    shadedColor,
    isUpward,
    isDownward,
    isVertical,
    components: {
      ambient: Number(iAmbient.toFixed(3)),
      diffuse: Number(iDiffuse.toFixed(3)),
      specular: Number(iSpecular.toFixed(3))
    }
  };
}
