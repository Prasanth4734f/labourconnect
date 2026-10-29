/**
 * LabourConnect Design Engine - Structured Requirement Parser
 * 
 * Implements deterministic prompt requirement extraction conforming to S1-T06:
 * - Extracts plot width, plot length, input units, floors, bedrooms, bathrooms,
 *   living room, kitchen, parking, balcony, and user constraints.
 * - Supports digits (1, 2, 3...) and English words (one, two, three, four, five...).
 * - Distinguishes 5 requirement states:
 *   1. EXPLICIT: Directly provided by user in prompt or structured input.
 *   2. INFERRED: Derived logically from keywords (e.g. duplex -> 2 floors).
 *   3. DEFAULT: Standard residential assumptions applied when not specified.
 *   4. MISSING: Essential fields that cannot be invented without user input.
 *   5. CONTRADICTORY: Directly conflicting user instructions.
 * - Detects and flags unsupported architectural requests (e.g., skyscrapers, helipads, commercial).
 * - Never invents missing plot dimensions or silently overwrites explicit inputs.
 */

export const REQUIREMENT_SOURCE = {
  EXPLICIT: 'EXPLICIT',
  INFERRED: 'INFERRED',
  DEFAULT: 'DEFAULT',
  MISSING: 'MISSING'
};

const WORD_TO_NUM = {
  zero: 0,
  one: 1,
  single: 1,
  two: 2,
  double: 2,
  three: 3,
  triple: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10
};

function parseNumOrWord(str) {
  if (!str) return null;
  const s = String(str).trim().toLowerCase();
  if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);
  if (WORD_TO_NUM[s] !== undefined) return WORD_TO_NUM[s];
  return null;
}

const UNSUPPORTED_KEYWORDS = [
  { pattern: /\b(?:skyscraper|high-rise|tower|20\s*floor|15\s*floor|highrise)\b/i, label: 'High-Rise / Skyscraper (>10 storeys)', reason: 'LabourConnect residential engine is calibrated for residential structures up to 10 storeys.' },
  { pattern: /\b(?:helipad|helicopter\s*pad|air\s*strip)\b/i, label: 'Aviation / Helipad Facility', reason: 'Aviation structures require civil aviation authority clearances beyond residential architectural engines.' },
  { pattern: /\b(?:rooftop\s*swimming\s*pool|infinity\s*pool\s*on\s*terrace)\b/i, label: 'Elevated Rooftop Swimming Pool', reason: 'Rooftop hydraulic water mass loads require specialized finite-element hydraulic structural engineering.' },
  { pattern: /\b(?:bunker|nuclear\s*shelter|fallout\s*shelter|bomb\s*shelter)\b/i, label: 'Military / Fallout Bunker', reason: 'Subterranean fortified structures require specialized geotechnical blast resistance engineering.' },
  { pattern: /\b(?:shopping\s*mall|hospital|airport|oil\s*refinery|factory|warehouse)\b/i, label: 'Commercial / Industrial Complex', reason: 'Commercial and industrial zoning codes exceed residential building typology.' },
  { pattern: /\b(?:revolving\s*house|rotating\s*structure|spherical\s*house)\b/i, label: 'Dynamic / Revolving Kinetic Architecture', reason: 'Mechanical kinetic building foundations are not supported in standard residential geometry models.' }
];

/**
 * Parses and normalizes architectural requirements from raw inputs or text prompt
 */
export function parseStructuredRequirements(rawInput, options = {}) {
  const isString = typeof rawInput === 'string';
  const prompt = (isString ? rawInput : (rawInput?.userPrompt || rawInput?.prompt || '')).trim();
  const lowerPrompt = prompt.toLowerCase();
  const obj = (!isString && typeof rawInput === 'object' && rawInput !== null) ? rawInput : {};

  const provenance = {};
  const missingInformation = [];
  const contradictions = [];
  const unsupportedRequests = [];
  const warnings = [];
  const errors = [];
  const userConstraints = [];

  // -------------------------------------------------------------------------
  // 1. UNSUPPORTED REQUEST DETECTION
  // -------------------------------------------------------------------------
  for (const item of UNSUPPORTED_KEYWORDS) {
    if (item.pattern.test(lowerPrompt)) {
      unsupportedRequests.push({
        request: item.label,
        reason: item.reason
      });
      errors.push(`Unsupported architectural request: ${item.label}. ${item.reason}`);
    }
  }

  // -------------------------------------------------------------------------
  // 2. PLOT DIMENSIONS & UNITS
  // -------------------------------------------------------------------------
  let plotWidth = null;
  let plotLength = null;
  let inputUnits = 'feet'; // standard default

  // Check structured input first
  if (typeof obj.plotWidth === 'number' && isFinite(obj.plotWidth) && obj.plotWidth > 0) {
    plotWidth = obj.plotWidth;
    provenance.plotWidth = REQUIREMENT_SOURCE.EXPLICIT;
  }
  if (typeof obj.plotLength === 'number' && isFinite(obj.plotLength) && obj.plotLength > 0) {
    plotLength = obj.plotLength;
    provenance.plotLength = REQUIREMENT_SOURCE.EXPLICIT;
  }
  if (obj.inputUnits || obj.dimensionUnit) {
    inputUnits = (obj.inputUnits || obj.dimensionUnit).toLowerCase().includes('m') ? 'metres' : 'feet';
    provenance.inputUnits = REQUIREMENT_SOURCE.EXPLICIT;
  }

  // Extract from prompt
  const dimRegex = /(\d+(?:\.\d+)?)\s*(?:ft|feet|m|mtrs|metres)?\s*(?:x|×|by|\*)\s*(\d+(?:\.\d+)?)\s*(ft|feet|m|mtrs|metres)?/i;
  const dimMatch = prompt.match(dimRegex);

  if (dimMatch) {
    const val1 = parseFloat(dimMatch[1]);
    const val2 = parseFloat(dimMatch[2]);
    const unitCaptured = (dimMatch[3] || '').toLowerCase();
    const promptUnits = unitCaptured.startsWith('m') ? 'metres' : 'feet';

    const promptWidth = Math.min(val1, val2);
    const promptLength = Math.max(val1, val2);

    // Contradiction check: explicit object vs explicit prompt dimensions
    // Handles direct and transposed orientation (e.g. 50x30 wide plot vs 30x50 depth)
    const minPlotDim = (plotWidth !== null && plotLength !== null) ? Math.min(plotWidth, plotLength) : null;
    const maxPlotDim = (plotWidth !== null && plotLength !== null) ? Math.max(plotWidth, plotLength) : null;

    if (minPlotDim !== null && maxPlotDim !== null) {
      if (Math.abs(minPlotDim - promptWidth) > 0.5 || Math.abs(maxPlotDim - promptLength) > 0.5) {
        contradictions.push({
          fields: ['plotWidth', 'plotLength'],
          description: `Plot dimension mismatch: prompt specifies ${val1}×${val2} ${promptUnits}, but input payload specifies ${plotWidth}×${plotLength} ${inputUnits}.`
        });
      }
    } else {
      if (plotWidth !== null && Math.abs(plotWidth - val1) > 0.5 && Math.abs(plotWidth - val2) > 0.5) {
        contradictions.push({
          fields: ['plotWidth'],
          description: `Plot width mismatch: prompt specifies ${val1}×${val2} ${promptUnits}, but input payload specifies ${plotWidth} ${inputUnits}.`
        });
      } else if (plotWidth === null) {
        plotWidth = promptWidth;
        provenance.plotWidth = REQUIREMENT_SOURCE.EXPLICIT;
      }

      if (plotLength !== null && Math.abs(plotLength - val2) > 0.5 && Math.abs(plotLength - val1) > 0.5) {
        contradictions.push({
          fields: ['plotLength'],
          description: `Plot length mismatch: prompt specifies ${val1}×${val2} ${promptUnits}, but input payload specifies ${plotLength} ${inputUnits}.`
        });
      } else if (plotLength === null) {
        plotLength = promptLength;
        provenance.plotLength = REQUIREMENT_SOURCE.EXPLICIT;
      }
    }

    if (!provenance.inputUnits && unitCaptured) {
      inputUnits = promptUnits;
      provenance.inputUnits = REQUIREMENT_SOURCE.EXPLICIT;
    }
  }

  // Cents detection in Indian context (e.g. "3 cents plot")
  const centsMatch = lowerPrompt.match(/(\d+(?:\.\d+)?)\s*(?:cents?|cent)\b/i);
  // Acre detection (e.g. "0.3-acre plot", "0.3 acre", "1 acre")
  const acreMatch = lowerPrompt.match(/(\d+(?:\.\d+)?)\s*(?:-|–)?\s*(?:acres?|acre)\b/i);
  // Explicit sqft area detection (e.g. "1200 sqft plot", "13068 sq.ft")
  const sqftAreaMatch = lowerPrompt.match(/(\d{3,6}(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|square\s*feet)\s*(?:plot|site|land|area)?/i);
  // Square metres area detection (e.g. "1200 sqm", "500 sq m", "500 square metres")
  const sqmAreaMatch = lowerPrompt.match(/(\d{2,5}(?:\.\d+)?)\s*(?:sq\.?\s*m|sqm|square\s*met(?:re|er)s?)\s*(?:plot|site|land|area)?/i);

  if (acreMatch && (plotWidth === null || plotLength === null)) {
    const acreVal = parseFloat(acreMatch[1]);
    const approxSqft = Math.round(acreVal * 43560);
    // Standard residential plot ratio 1:1.4 depth to width
    plotWidth = Math.round(Math.sqrt(approxSqft / 1.4));
    plotLength = Math.round(approxSqft / plotWidth);
    inputUnits = 'feet';
    provenance.plotWidth = REQUIREMENT_SOURCE.INFERRED;
    provenance.plotLength = REQUIREMENT_SOURCE.INFERRED;
    provenance.inputUnits = REQUIREMENT_SOURCE.INFERRED;
    userConstraints.push(`Plot area specified as ${acreVal} Acre (~${approxSqft} sq.ft)`);
  } else if (centsMatch && (plotWidth === null || plotLength === null)) {
    const centsVal = parseFloat(centsMatch[1]);
    const approxSqft = Math.round(centsVal * 435.6);
    // Inferred dimensions assuming standard 1:1.5 urban ratio
    plotWidth = Math.round(Math.sqrt(approxSqft / 1.5));
    plotLength = Math.round(plotWidth * 1.5);
    inputUnits = 'feet';
    provenance.plotWidth = REQUIREMENT_SOURCE.INFERRED;
    provenance.plotLength = REQUIREMENT_SOURCE.INFERRED;
    provenance.inputUnits = REQUIREMENT_SOURCE.INFERRED;
    userConstraints.push(`Plot area specified as ${centsVal} Cents (~${approxSqft} sq.ft)`);
  } else if (sqftAreaMatch && (plotWidth === null || plotLength === null) && !dimMatch) {
    const sqftVal = parseFloat(sqftAreaMatch[1]);
    plotWidth = Math.round(Math.sqrt(sqftVal / 1.4));
    plotLength = Math.round(sqftVal / plotWidth);
    inputUnits = 'feet';
    provenance.plotWidth = REQUIREMENT_SOURCE.INFERRED;
    provenance.plotLength = REQUIREMENT_SOURCE.INFERRED;
    provenance.inputUnits = REQUIREMENT_SOURCE.INFERRED;
    userConstraints.push(`Plot area specified as ${sqftVal} sq.ft`);
  } else if (sqmAreaMatch && (plotWidth === null || plotLength === null) && !dimMatch) {
    const sqmVal = parseFloat(sqmAreaMatch[1]);
    const approxSqft = Math.round(sqmVal * 10.7639);
    plotWidth = Math.round(Math.sqrt(approxSqft / 1.4));
    plotLength = Math.round(approxSqft / plotWidth);
    inputUnits = 'feet';
    provenance.plotWidth = REQUIREMENT_SOURCE.INFERRED;
    provenance.plotLength = REQUIREMENT_SOURCE.INFERRED;
    provenance.inputUnits = REQUIREMENT_SOURCE.INFERRED;
    userConstraints.push(`Plot area specified as ${sqmVal} sq.m (~${approxSqft} sq.ft)`);
  }

  // Reject inventing missing dimensions unless explicitly allowed via option
  if (plotWidth === null || plotLength === null) {
    if (options.allowDefaultPlot) {
      plotWidth = plotWidth || 30;
      plotLength = plotLength || 40;
      provenance.plotWidth = REQUIREMENT_SOURCE.DEFAULT;
      provenance.plotLength = REQUIREMENT_SOURCE.DEFAULT;
      provenance.inputUnits = REQUIREMENT_SOURCE.DEFAULT;
      warnings.push('Plot dimensions not provided; defaulted to standard 30×40 ft plot.');
    } else {
      provenance.plotWidth = REQUIREMENT_SOURCE.MISSING;
      provenance.plotLength = REQUIREMENT_SOURCE.MISSING;
      missingInformation.push({
        field: 'plotDimensions',
        description: 'Plot width and length are required. Please provide plot boundaries (e.g. "30 ft × 40 ft" or "10m × 15m").',
        critical: true
      });
      errors.push('Plot dimensions are missing. Cannot generate design without known plot boundaries.');
    }
  }

  // -------------------------------------------------------------------------
  // 3. NUMBER OF FLOORS
  // -------------------------------------------------------------------------
  let floorsCount = null;
  const floorMatch = lowerPrompt.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:-|–)?\s*(?:floors?|storeys?|stor(?:y|ies)|levels?)\b/i);
  const gPlusMatch = lowerPrompt.match(/\bg\s*\+\s*(\d+)\b/i);

  if (typeof obj.floorsCount === 'number' && isFinite(obj.floorsCount) && obj.floorsCount > 0) {
    floorsCount = obj.floorsCount;
    provenance.floorsCount = REQUIREMENT_SOURCE.EXPLICIT;
  }

  if (gPlusMatch) {
    const val = 1 + parseInt(gPlusMatch[1], 10);
    if (floorsCount !== null && floorsCount !== val) {
      contradictions.push({
        fields: ['floorsCount'],
        description: `Contradictory floor specifications: "G+${gPlusMatch[1]}" (${val} floors) conflicts with specified ${floorsCount} floors.`
      });
    } else {
      floorsCount = val;
      provenance.floorsCount = REQUIREMENT_SOURCE.EXPLICIT;
    }
  } else if (floorMatch) {
    const val = parseNumOrWord(floorMatch[1]);
    if (val !== null) {
      if (floorsCount !== null && floorsCount !== val) {
        contradictions.push({
          fields: ['floorsCount'],
          description: `Contradictory floor specifications: prompt mentions "${floorMatch[0]}" (${val} floors) but payload specifies ${floorsCount} floors.`
        });
      } else {
        floorsCount = val;
        provenance.floorsCount = REQUIREMENT_SOURCE.EXPLICIT;
      }
    }
  }

  // Keyword inferences & regexes
  const singleFloorRegex = /\b(?:single\s*[- ]\s*(?:floor|storey|story)|one\s*[- ]\s*(?:floor|storey|story)|ground\s*floor\s*only)\b/i;
  const multiFloorRegex = /\b(?:duplex|two\s*[- ]\s*(?:floor|storey|story|floors|storeys|stories)|double\s*[- ]\s*storey|g\s*\+\s*[1-9]\d*|triplex|three\s*[- ]\s*(?:floor|storey|story|floors|storeys|stories)|4\s*[- ]\s*(?:storeys|stories|floors)|5\s*[- ]\s*(?:storeys|stories|floors)|five\s*[- ]\s*(?:storeys|stories|floors))\b/i;
  const duplexRegex = /\bduplex\b/i;

  if (floorsCount === null) {
    if (singleFloorRegex.test(lowerPrompt)) {
      floorsCount = 1;
      provenance.floorsCount = REQUIREMENT_SOURCE.EXPLICIT;
    } else if (lowerPrompt.includes('three floor') || lowerPrompt.includes('three storey') || lowerPrompt.includes('triplex')) {
      floorsCount = 3;
      provenance.floorsCount = lowerPrompt.includes('triplex') ? REQUIREMENT_SOURCE.INFERRED : REQUIREMENT_SOURCE.EXPLICIT;
    } else if (multiFloorRegex.test(lowerPrompt)) {
      floorsCount = 2;
      provenance.floorsCount = duplexRegex.test(lowerPrompt) ? REQUIREMENT_SOURCE.INFERRED : REQUIREMENT_SOURCE.EXPLICIT;
    }
  }

  // Contradiction: single floor AND duplex/upper floors in natural language
  if (singleFloorRegex.test(lowerPrompt) && multiFloorRegex.test(lowerPrompt)) {
    if (!contradictions.some(c => c.fields.includes('floorsCount'))) {
      contradictions.push({
        fields: ['floorsCount'],
        description: 'Direct contradiction: prompt requests both a single floor / single storey and a multi-floor / duplex structure.'
      });
    }
  }

  // Contradiction: structured floorsCount vs natural language duplex/multi-floor
  if (typeof obj.floorsCount === 'number') {
    if (obj.floorsCount === 1 && multiFloorRegex.test(lowerPrompt)) {
      if (!contradictions.some(c => c.fields.includes('floorsCount'))) {
        contradictions.push({
          fields: ['floorsCount'],
          description: 'Contradictory floor specifications: structured payload specifies single floor (floorsCount: 1) but prompt requests a multi-floor / duplex structure.'
        });
      }
    } else if (obj.floorsCount > 1 && singleFloorRegex.test(lowerPrompt)) {
      if (!contradictions.some(c => c.fields.includes('floorsCount'))) {
        contradictions.push({
          fields: ['floorsCount'],
          description: `Contradictory floor specifications: structured payload specifies ${obj.floorsCount} floors but prompt requests a single-floor structure.`
        });
      }
    }
  }

  // Default floor count if unspecified
  if (floorsCount === null) {
    floorsCount = 2; // Default residential assumption
    provenance.floorsCount = REQUIREMENT_SOURCE.DEFAULT;
  }

  // Reject unrealistic floor count (>10 floors exceeds low/mid-rise residential engine)
  if (floorsCount > 10) {
    errors.push(`Requested ${floorsCount} floors exceeds residential engine maximum capacity of 10 floors.`);
  }

  // -------------------------------------------------------------------------
  // 4. REQUIRED BEDROOMS & BHK
  // -------------------------------------------------------------------------
  let requiredBedrooms = null;
  const bhkMatch = lowerPrompt.match(/\b(\d+|one|two|three|four|five|six)\s*(?:bhk|bedroom|bed|br\b|bed\s*room)/i);

  const explicitBhkVal = obj.bhkCount !== undefined ? obj.bhkCount : (obj.bhk !== undefined ? obj.bhk : obj.bhkType);
  if (typeof explicitBhkVal === 'number' && isFinite(explicitBhkVal) && explicitBhkVal > 0) {
    requiredBedrooms = explicitBhkVal;
    provenance.requiredBedrooms = REQUIREMENT_SOURCE.EXPLICIT;
  } else if (typeof explicitBhkVal === 'string') {
    const numMatch = explicitBhkVal.match(/(\d+)/);
    if (numMatch) {
      requiredBedrooms = parseInt(numMatch[1], 10);
      provenance.requiredBedrooms = REQUIREMENT_SOURCE.EXPLICIT;
    }
  }

  if (bhkMatch) {
    const val = parseNumOrWord(bhkMatch[1]);
    if (val !== null) {
      if (requiredBedrooms !== null && requiredBedrooms !== val) {
        contradictions.push({
          fields: ['requiredBedrooms', 'bhkCount'],
          description: `Contradictory bedroom specifications: prompt mentions "${bhkMatch[0]}" (${val} bedrooms) but payload specifies ${requiredBedrooms} bedrooms.`
        });
      } else {
        requiredBedrooms = val;
        provenance.requiredBedrooms = REQUIREMENT_SOURCE.EXPLICIT;
      }
    }
  }

  // Keyword bedroom inferences
  if (requiredBedrooms === null) {
    if (lowerPrompt.includes('studio') || lowerPrompt.includes('1rk') || lowerPrompt.includes('tiny house')) {
      requiredBedrooms = 1;
      provenance.requiredBedrooms = REQUIREMENT_SOURCE.INFERRED;
    } else if (lowerPrompt.includes('villa') || lowerPrompt.includes('mansion')) {
      requiredBedrooms = 4;
      provenance.requiredBedrooms = REQUIREMENT_SOURCE.INFERRED;
    } else {
      requiredBedrooms = 3; // Standard 3BHK default
      provenance.requiredBedrooms = REQUIREMENT_SOURCE.DEFAULT;
    }
  }

  // -------------------------------------------------------------------------
  // 5. REQUIRED BATHROOMS
  // -------------------------------------------------------------------------
  let requiredBathrooms = null;
  const bathMatch = lowerPrompt.match(/\b(\d+|zero|one|two|three|four|five|six)\s*(?:bath|bathroom|toilet|washroom)/i);

  if (typeof obj.bathroomsCount === 'number' && isFinite(obj.bathroomsCount) && obj.bathroomsCount >= 0) {
    requiredBathrooms = obj.bathroomsCount;
    provenance.requiredBathrooms = REQUIREMENT_SOURCE.EXPLICIT;
  }

  if (bathMatch) {
    const val = parseNumOrWord(bathMatch[1]);
    if (val !== null) {
      if (requiredBathrooms !== null && requiredBathrooms !== val) {
        contradictions.push({
          fields: ['requiredBathrooms'],
          description: `Contradictory bathroom count: prompt requests ${val} bathrooms, but payload specifies ${requiredBathrooms}.`
        });
      } else {
        requiredBathrooms = val;
        provenance.requiredBathrooms = REQUIREMENT_SOURCE.EXPLICIT;
      }
    }
  }

  if (requiredBathrooms === null) {
    // Standard residential norm: 1 bathroom per floor + en-suite for master
    requiredBathrooms = Math.min(requiredBedrooms, Math.max(1, floorsCount + (requiredBedrooms > 2 ? 1 : 0)));
    provenance.requiredBathrooms = REQUIREMENT_SOURCE.DEFAULT;
  }

  if (requiredBathrooms === 0 && requiredBedrooms >= 2) {
    contradictions.push({
      fields: ['requiredBathrooms'],
      description: 'Sanitary code violation: residential home with bedrooms cannot have 0 bathrooms.'
    });
  }

  // -------------------------------------------------------------------------
  // 6. LIVING ROOM, KITCHEN, PARKING, BALCONY (Negatives checked first!)
  // -------------------------------------------------------------------------
  let livingRoom = true;
  let kitchen = true;
  let parking = false;
  let balcony = false;

  // Living Room
  if (lowerPrompt.includes('no living room') || lowerPrompt.includes('without living room')) {
    livingRoom = false;
    provenance.livingRoom = REQUIREMENT_SOURCE.EXPLICIT;
  } else if (lowerPrompt.includes('living room') || lowerPrompt.includes('living area') || lowerPrompt.includes('lounge') || lowerPrompt.includes('hall')) {
    livingRoom = true;
    provenance.livingRoom = REQUIREMENT_SOURCE.EXPLICIT;
  } else {
    livingRoom = true;
    provenance.livingRoom = REQUIREMENT_SOURCE.DEFAULT;
  }

  // Kitchen
  if (lowerPrompt.includes('no kitchen') || lowerPrompt.includes('without kitchen')) {
    kitchen = false;
    provenance.kitchen = REQUIREMENT_SOURCE.EXPLICIT;
  } else if (lowerPrompt.includes('kitchen') || lowerPrompt.includes('pantry') || lowerPrompt.includes('cooking')) {
    kitchen = true;
    provenance.kitchen = REQUIREMENT_SOURCE.EXPLICIT;
  } else {
    kitchen = true;
    provenance.kitchen = REQUIREMENT_SOURCE.DEFAULT;
  }

  // Parking / Car Porch (Negative checked before positive; structured overrides prompt)
  const parkingInput = obj.hasParking !== undefined 
    ? obj.hasParking 
    : (obj.parking !== undefined 
      ? obj.parking 
      : (obj.amenities?.hasParking !== undefined 
        ? obj.amenities.hasParking 
        : obj.amenities?.parking));
  const parkingNegativeRegex = /(?:no|without|zero|exclude|excluding|do\s*not\s*include|don'?t\s*include)\s*(?:a|the)?\s*(?:car\s*)?(?:parking|car\s*porch|portico|garage|car\s*park)/i;
  const parkingNegativeSuffixRegex = /\b(?:parking|car\s*porch|portico|garage|car\s*park)\s*(?:is\s*)?(?:not\s*required|excluded|disabled)\b/i;
  const hasNegativeParkingMention = parkingNegativeRegex.test(lowerPrompt) || parkingNegativeSuffixRegex.test(lowerPrompt);

  const parkingPositiveRegex = /\b(?:parking|car\s*porch|garage|portico|car\s*park)\b/i;
  const hasPositiveParkingMention = parkingPositiveRegex.test(lowerPrompt) && !hasNegativeParkingMention;

  if (parkingInput !== undefined) {
    parking = Boolean(parkingInput);
    provenance.parking = REQUIREMENT_SOURCE.EXPLICIT;
    if (parking === false && parkingPositiveRegex.test(lowerPrompt) && !hasNegativeParkingMention) {
      warnings.push('Explicit structured input specifies hasParking=false, which takes precedence over prompt mention.');
    } else if (parking === true && hasNegativeParkingMention) {
      warnings.push('Explicit structured input specifies hasParking=true, which takes precedence over negative prompt exclusion.');
    }
  } else if (hasNegativeParkingMention) {
    parking = false;
    provenance.parking = REQUIREMENT_SOURCE.EXPLICIT;
  } else if (hasPositiveParkingMention) {
    parking = true;
    provenance.parking = REQUIREMENT_SOURCE.EXPLICIT;
  } else {
    parking = (plotWidth && plotLength && (plotWidth * plotLength >= 1200)); // Default parking on plots >= 1200 sqft
    provenance.parking = REQUIREMENT_SOURCE.DEFAULT;
  }

  // Balcony (Negative checked before positive; structured overrides prompt)
  const balconyInput = obj.hasBalcony !== undefined 
    ? obj.hasBalcony 
    : (obj.balcony !== undefined 
      ? obj.balcony 
      : (obj.amenities?.hasBalcony !== undefined 
        ? obj.amenities.hasBalcony 
        : obj.amenities?.balcony));
  const balconyNegativeRegex = /(?:no|without|zero|exclude|excluding|do\s*not\s*include|don'?t\s*include)\s*(?:a|the)?\s*(?:balcony|terrace\s*deck|sit-out|verandah)/i;
  const balconyNegativeSuffixRegex = /\b(?:balcony|terrace\s*deck|sit-out|verandah)\s*(?:is\s*)?(?:not\s*required|excluded|disabled)\b/i;
  const hasNegativeBalconyMention = balconyNegativeRegex.test(lowerPrompt) || balconyNegativeSuffixRegex.test(lowerPrompt);

  const balconyPositiveRegex = /\b(?:balcony|terrace\s*deck|sit-out|verandah)\b/i;
  const hasPositiveBalconyMention = balconyPositiveRegex.test(lowerPrompt) && !hasNegativeBalconyMention;

  if (balconyInput !== undefined) {
    balcony = Boolean(balconyInput);
    provenance.balcony = REQUIREMENT_SOURCE.EXPLICIT;
    if (balcony === false && balconyPositiveRegex.test(lowerPrompt) && !hasNegativeBalconyMention) {
      warnings.push('Explicit structured input specifies hasBalcony=false, which takes precedence over prompt mention.');
    } else if (balcony === true && hasNegativeBalconyMention) {
      warnings.push('Explicit structured input specifies hasBalcony=true, which takes precedence over negative prompt exclusion.');
    }
  } else if (hasNegativeBalconyMention) {
    balcony = false;
    provenance.balcony = REQUIREMENT_SOURCE.EXPLICIT;
  } else if (hasPositiveBalconyMention) {
    balcony = true;
    provenance.balcony = REQUIREMENT_SOURCE.EXPLICIT;
  } else {
    balcony = (floorsCount > 1); // Default balcony on multi-floor houses
    provenance.balcony = REQUIREMENT_SOURCE.DEFAULT;
  }

  // Pooja Sanctum / Mandir (Negative checked before positive; structured overrides prompt)
  let pooja = false;
  const poojaInput = obj.hasPooja !== undefined 
    ? obj.hasPooja 
    : (obj.pooja !== undefined 
      ? obj.pooja 
      : (obj.amenities?.hasPooja !== undefined 
        ? obj.amenities.hasPooja 
        : obj.amenities?.pooja));

  // Negative pooja variations:
  // "no pooja", "without pooja", "no mandir", "without mandir",
  // "do not include a pooja room", "don't include a pooja room", "exclude the pooja room", etc.
  const poojaNegativeRegex = /(?:no|without|zero|exclude|excluding|do\s*not\s*include|don'?t\s*include)\s*(?:a|the)?\s*(?:dedicated)?\s*(?:pooja|puja|mandir|prayer)\s*(?:room|sanctum)?/i;
  const poojaNegativeSuffixRegex = /\b(?:pooja|puja|mandir|prayer)\s*(?:room|sanctum)?\s*(?:is\s*)?(?:not\s*required|excluded|disabled)\b/i;
  const hasNegativePoojaMention = poojaNegativeRegex.test(lowerPrompt) || poojaNegativeSuffixRegex.test(lowerPrompt);

  const poojaPositiveRegex = /\b(?:pooja|puja|mandir|prayer)\b/i;
  const hasPositivePoojaMention = poojaPositiveRegex.test(lowerPrompt) && !hasNegativePoojaMention;

  if (poojaInput !== undefined) {
    pooja = Boolean(poojaInput);
    provenance.pooja = REQUIREMENT_SOURCE.EXPLICIT;
    if (pooja === false && poojaPositiveRegex.test(lowerPrompt) && !hasNegativePoojaMention) {
      warnings.push('Explicit structured input specifies hasPooja=false, which takes precedence over prompt mention.');
    } else if (pooja === true && hasNegativePoojaMention) {
      warnings.push('Explicit structured input specifies hasPooja=true, which takes precedence over negative prompt exclusion.');
    }
  } else if (hasNegativePoojaMention) {
    pooja = false;
    provenance.pooja = REQUIREMENT_SOURCE.EXPLICIT;
  } else if (hasPositivePoojaMention) {
    pooja = true;
    provenance.pooja = REQUIREMENT_SOURCE.EXPLICIT;
  } else {
    pooja = false;
    provenance.pooja = REQUIREMENT_SOURCE.DEFAULT;
  }

  if (pooja) {
    userConstraints.push('Include dedicated Ishanya Pooja sanctum');
  }

  // -------------------------------------------------------------------------
  // 7. USER-SPECIFIED CONSTRAINTS (Vastu, Direction, Style)
  // -------------------------------------------------------------------------
  const facingMatch = lowerPrompt.match(/\b(north|south|east|west|north-east|north-west|south-east|south-west)\s*facing\b/i);
  let facingDirection = obj.facingDirection || null;
  if (facingMatch) {
    const fStr = facingMatch[1].charAt(0).toUpperCase() + facingMatch[1].slice(1).toLowerCase();
    facingDirection = fStr;
    provenance.facingDirection = REQUIREMENT_SOURCE.EXPLICIT;
    userConstraints.push(`Facing orientation: ${facingDirection}`);
  } else if (facingDirection) {
    provenance.facingDirection = REQUIREMENT_SOURCE.EXPLICIT;
    userConstraints.push(`Facing orientation: ${facingDirection}`);
  } else {
    facingDirection = 'East'; // Standard default
    provenance.facingDirection = REQUIREMENT_SOURCE.DEFAULT;
  }

  let archStyle = obj.archStyle || 'modern';
  if (/penthouse/i.test(lowerPrompt)) {
    archStyle = 'penthouse';
    provenance.archStyle = REQUIREMENT_SOURCE.EXPLICIT;
    userConstraints.push('Architectural style: Luxury Penthouse with Private Terrace');
  } else if (/vintage|colonial|victorian|antique/i.test(lowerPrompt)) {
    archStyle = 'vintage';
    provenance.archStyle = REQUIREMENT_SOURCE.EXPLICIT;
    userConstraints.push('Architectural style: Vintage Architecture with Wooden Windows & Tiled Roof');
  } else if (/tropical|balinese/i.test(lowerPrompt)) {
    archStyle = 'tropical_modern';
    provenance.archStyle = REQUIREMENT_SOURCE.EXPLICIT;
    userConstraints.push('Architectural style: Tropical Modern with Balconies & Natural Materials');
  } else if (/traditional\s*indian|indian\s*villa|chettinad|kerala|haveli/i.test(lowerPrompt)) {
    archStyle = 'traditional_indian';
    provenance.archStyle = REQUIREMENT_SOURCE.EXPLICIT;
    userConstraints.push('Architectural style: Traditional Indian with Courtyard Integration');
  } else if (/traditional|heritage/i.test(lowerPrompt)) {
    archStyle = 'traditional_duplex';
    provenance.archStyle = REQUIREMENT_SOURCE.EXPLICIT;
    userConstraints.push('Architectural style: Traditional Heritage');
  } else if (/luxury|villa|mansion/i.test(lowerPrompt)) {
    archStyle = 'luxury_villa';
    provenance.archStyle = REQUIREMENT_SOURCE.EXPLICIT;
    userConstraints.push('Architectural style: Luxury Villa');
  } else if (/minimalist|scandinavian/i.test(lowerPrompt)) {
    archStyle = 'minimalist';
    provenance.archStyle = REQUIREMENT_SOURCE.EXPLICIT;
    userConstraints.push('Architectural style: Minimalist Contemporary');
  } else if (/multi[- ]storey|residential building|apartment/i.test(lowerPrompt) || floorsCount >= 4) {
    archStyle = floorsCount >= 4 ? 'multi_storey' : 'modern';
    provenance.archStyle = REQUIREMENT_SOURCE.EXPLICIT;
    userConstraints.push(`Architectural style: Multi-Storey Residential (${floorsCount} Floors)`);
  } else {
    archStyle = obj.archStyle || 'modern';
    provenance.archStyle = obj.archStyle ? REQUIREMENT_SOURCE.EXPLICIT : REQUIREMENT_SOURCE.DEFAULT;
  }

  const hasCourtyard = Boolean(/courtyard|thotti|atrium/i.test(lowerPrompt) || obj.hasCourtyard);
  if (hasCourtyard) {
    userConstraints.push('Include central Brahmasthan courtyard');
  }

  const hasTerrace = Boolean(/terrace|private terrace|rooftop terrace|open deck/i.test(lowerPrompt) || obj.hasTerrace || archStyle === 'penthouse');
  if (hasTerrace) {
    userConstraints.push('Include rooftop or private terrace deck');
  }

  const hasWoodenWindows = Boolean(/wooden window|traditional window|vintage window/i.test(lowerPrompt) || archStyle === 'vintage');
  const hasSlopedRoof = Boolean(/slop(?:ing|ed)\s*roof|pitched\s*roof|tiled\s*roof|mangalore/i.test(lowerPrompt) || archStyle === 'vintage' || archStyle === 'traditional_indian');
  const hasPanoramicGlass = Boolean(/glass railing|panoramic|floor[- ]to[- ]ceiling glass|large window/i.test(lowerPrompt) || archStyle === 'penthouse');

  // Garden & Outdoor Landscaping Extraction
  const gardenNegativeRegex = /(?:no|without|zero|exclude|excluding|do\s*not\s*include|don'?t\s*include)\s*(?:a|the)?\s*(?:garden|lawn|landscaping|outdoor\s*space)/i;
  const gardenPositiveRegex = /\b(?:garden|lawn|landscaping|outdoor\s*living|yard|landscape)\b/i;
  const hasNegativeGarden = gardenNegativeRegex.test(lowerPrompt);
  const hasPositiveGarden = gardenPositiveRegex.test(lowerPrompt) && !hasNegativeGarden;
  let hasGarden = obj.hasGarden !== undefined ? Boolean(obj.hasGarden) : hasPositiveGarden;
  if (hasGarden) {
    userConstraints.push('Include landscaped outdoor garden & lawn living area');
  }

  // Furniture & Interior Style Extraction
  let furnitureStyle = obj.furnitureStyle || 'standard';
  if (/vintage|heritage|antique|traditional|teak|carved/i.test(lowerPrompt)) {
    furnitureStyle = 'vintage_indian';
    userConstraints.push('Interior fit-out: Handcrafted vintage Indian teak wood furniture & traditional furnishings');
  } else if (/minimal|nordic|scandinavian/i.test(lowerPrompt)) {
    furnitureStyle = 'minimalist';
    userConstraints.push('Interior fit-out: Minimalist Scandinavian low-profile furniture');
  } else if (/luxury|italian|plush/i.test(lowerPrompt)) {
    furnitureStyle = 'luxury';
    userConstraints.push('Interior fit-out: Luxury Italian marble and velvet furnishings');
  }

  // Building Type Extraction
  let buildingType = obj.buildingType || 'residential_house';
  if (/penthouse/i.test(lowerPrompt)) {
    buildingType = 'penthouse';
  } else if (/luxury\s*(?:villa|mansion|home|residence)|luxury\s*villa/i.test(lowerPrompt)) {
    buildingType = 'luxury_home';
  } else if (/villa/i.test(lowerPrompt)) {
    buildingType = 'villa';
  } else if (/multi[- ]storey|apartment|flats|residential\s*building/i.test(lowerPrompt) || floorsCount >= 4) {
    buildingType = 'apartment_building';
  } else if (/commercial|office|clinic|studio|institution/i.test(lowerPrompt)) {
    buildingType = 'commercial_institutional';
  }

  // Roofline Style Extraction
  let rooflineStyle = obj.rooflineStyle || obj.roofType || null;
  if (!rooflineStyle) {
    if (/pitched|slop(?:ing|ed)\s*roof|mangalore|kerala\s*roof/i.test(lowerPrompt)) {
      rooflineStyle = 'sloping_pitched';
    } else if (/pergola|trellis/i.test(lowerPrompt)) {
      rooflineStyle = 'pergola_terrace';
    } else if (/stepped|pier/i.test(lowerPrompt)) {
      rooflineStyle = 'stepped_parapet';
    } else if (/flat\s*roof|flat\s*terrace|rooftop\s*terrace/i.test(lowerPrompt)) {
      rooflineStyle = 'flat_terrace';
    } else if (archStyle === 'vintage' || archStyle === 'traditional_indian' || archStyle === 'traditional_duplex') {
      rooflineStyle = 'sloping_pitched';
    } else if (archStyle === 'penthouse' || hasTerrace) {
      rooflineStyle = 'flat_terrace';
    } else {
      rooflineStyle = 'flat_terrace';
    }
  }

  // -------------------------------------------------------------------------
  // 8. FINAL VALIDITY EVALUATION
  // -------------------------------------------------------------------------
  if (contradictions.length > 0) {
    for (const c of contradictions) {
      errors.push(`Contradiction detected: ${c.description}`);
    }
  }

  const isValid = errors.length === 0 && missingInformation.length === 0;

  return {
    valid: isValid,
    requirements: {
      buildingType,
      plotWidth,
      plotLength,
      inputUnits,
      floorsCount,
      requiredBedrooms,
      requiredBathrooms,
      livingRoom,
      kitchen,
      parking,
      balcony,
      pooja,
      facingDirection,
      archStyle,
      rooflineStyle,
      hasGarden,
      furnitureStyle,
      hasTerrace,
      hasCourtyard,
      hasWoodenWindows,
      hasSlopedRoof,
      hasPanoramicGlass,
      userConstraints
    },
    provenance,
    missingInformation,
    contradictions,
    unsupportedRequests,
    errors,
    warnings
  };
}
