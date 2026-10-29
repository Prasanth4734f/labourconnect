/**
 * LabourConnect Design Engine - Requirement Interpreter
 * 
 * Transforms natural-language architectural prompts and UI inputs into
 * a validated, structured requirement specification.
 * Identifies missing critical details and detects unfeasible or impossible constraints.
 */

import { parseStructuredRequirements, REQUIREMENT_SOURCE } from './structuredRequirementParser.js';

export function interpretRequirements(rawInputs = {}) {
  const isStringInput = typeof rawInputs === 'string';
  const inputsObj = isStringInput ? { userPrompt: rawInputs, prompt: rawInputs } : (rawInputs || {});
  const prompt = (inputsObj.userPrompt || inputsObj.prompt || '').trim();
  const clarificationNeeded = [];
  const warnings = [];
  const explicitKeys = new Set();

  // 0. Run structured requirement parser first to extract prompt-derived parameters
  const parsedReq = parseStructuredRequirements({
    ...inputsObj,
    userPrompt: prompt,
    prompt: prompt
  }, { allowDefaultPlot: true });

  if (parsedReq.warnings && parsedReq.warnings.length > 0) {
    for (const w of parsedReq.warnings) {
      if (!warnings.includes(w)) {
        warnings.push(w);
      }
    }
  }

  // 1. Plot Dimensions
  let width = Number(inputsObj.plotWidth);
  let length = Number(inputsObj.plotLength);
  const unit = inputsObj.dimensionUnit === 'metres' ? 'metres' : 'feet';

  // Use parsed plot dimensions if explicitly or inferred from prompt
  if (parsedReq.requirements?.plotWidth && parsedReq.requirements?.plotLength) {
    if (parsedReq.provenance.plotWidth === REQUIREMENT_SOURCE.EXPLICIT || parsedReq.provenance.plotWidth === REQUIREMENT_SOURCE.INFERRED) {
      width = parsedReq.requirements.plotWidth;
      length = parsedReq.requirements.plotLength;
      explicitKeys.add('plot');
    }
  }

  // Extract from prompt if not specified or to detect explicit overrides
  const dimRegex = /(\d+)\s*(?:x|×|by|\*)\s*(\d+)\s*(?:ft|feet|m|mtrs|metres)?/i;
  const dimMatch = prompt.match(dimRegex);
  if (dimMatch) {
    explicitKeys.add('plot');
    width = parseInt(dimMatch[1], 10);
    length = parseInt(dimMatch[2], 10);
  }

  // Ensure length >= width convention
  if (width && length && width > length) {
    const temp = width;
    width = length;
    length = temp;
  }

  width = width || 40;
  length = length || 60;

  // Convert metres to feet internally for consistent geometric solver calculations
  const plotWidthFt = unit === 'metres' ? Math.round(width * 3.28084) : width;
  const plotLengthFt = unit === 'metres' ? Math.round(length * 3.28084) : length;
  const plotAreaSqft = plotWidthFt * plotLengthFt;

  // 2. BHK & Bedrooms
  let bhk = Number(rawInputs.bhkCount);
  if (parsedReq.requirements?.requiredBedrooms && parsedReq.provenance.requiredBedrooms === REQUIREMENT_SOURCE.EXPLICIT) {
    bhk = parsedReq.requirements.requiredBedrooms;
    explicitKeys.add('bhk');
  }
  const bhkMatch = prompt.match(/(\d+)\s*(?:bhk|bedroom|bed|rk)/i);
  if (bhkMatch) {
    explicitKeys.add('bhk');
    bhk = parseInt(bhkMatch[1], 10);
  }
  bhk = bhk || 3;

  // 3. Floors
  let floors = Number(rawInputs.floorsCount);
  if (parsedReq.requirements?.floorsCount && (parsedReq.provenance.floorsCount === REQUIREMENT_SOURCE.EXPLICIT || parsedReq.provenance.floorsCount === REQUIREMENT_SOURCE.INFERRED)) {
    floors = parsedReq.requirements.floorsCount;
    explicitKeys.add('floors');
  }
  const floorMatch = prompt.match(/(?:(\d+)\s*(?:storey|story|floor|level)|single\s*floor|ground\s*only|g\s*\+\s*(\d+)|duplex|triplex)/i);
  if (floorMatch) {
    explicitKeys.add('floors');
    if (/single\s*floor|ground\s*only/i.test(floorMatch[0])) floors = 1;
    else if (/duplex/i.test(floorMatch[0])) floors = 2;
    else if (/triplex/i.test(floorMatch[0])) floors = 3;
    else if (floorMatch[1]) floors = parseInt(floorMatch[1], 10);
    else if (floorMatch[2]) floors = parseInt(floorMatch[2], 10) + 1;
  }
  floors = floors || (bhk >= 4 ? 2 : 2);

  // 4. Bathrooms
  let bathrooms = Number(rawInputs.bathroomsCount);
  if (!bathrooms && parsedReq.requirements?.requiredBathrooms && parsedReq.provenance.requiredBathrooms === REQUIREMENT_SOURCE.EXPLICIT) {
    bathrooms = parsedReq.requirements.requiredBathrooms;
    explicitKeys.add('bathrooms');
  }
  bathrooms = bathrooms || Math.min(bhk, floors + (bhk > 2 ? 1 : 0));

  // 5. Facing Direction
  let facing = rawInputs.facingDirection || 'East';
  const facingMatch = prompt.match(/(north|south|east|west|north-east|north-west|south-east|south-west)\s*facing/i);
  if (facingMatch) {
    explicitKeys.add('facing');
    facing = facingMatch[1].charAt(0).toUpperCase() + facingMatch[1].slice(1).toLowerCase();
  }

  // 6. Architectural Style
  let style = rawInputs.archStyle || 'modern';
  if (parsedReq.requirements?.archStyle && parsedReq.provenance.archStyle === REQUIREMENT_SOURCE.EXPLICIT) {
    style = parsedReq.requirements.archStyle;
    explicitKeys.add('style');
  } else if (/vintage|colonial|victorian|antique/i.test(prompt)) {
    style = 'vintage';
    explicitKeys.add('style');
  } else if (/minimalist|scandinavian/i.test(prompt)) {
    style = 'minimalist';
    explicitKeys.add('style');
  } else if (/villa|luxury|mansion/i.test(prompt)) {
    style = 'luxury_villa';
    explicitKeys.add('style');
  } else if (/traditional|kerala|chettinad|heritage/i.test(prompt)) {
    style = 'traditional_duplex';
    explicitKeys.add('style');
  } else if (/eco|sustainable|green|passive/i.test(prompt)) {
    style = 'eco_friendly';
    explicitKeys.add('style');
  }

  // 7. Amenities (Unified with structured requirement parser contract)
  const am = inputsObj.amenities || {};

  const hasPooja = parsedReq.provenance.pooja === REQUIREMENT_SOURCE.EXPLICIT
    ? Boolean(parsedReq.requirements.pooja)
    : (am.hasPooja !== undefined 
      ? Boolean(am.hasPooja) 
      : (inputsObj.hasPooja !== undefined 
        ? Boolean(inputsObj.hasPooja) 
        : (rawInputs.pooja !== undefined 
          ? Boolean(rawInputs.pooja) 
          : false)));

  const hasParking = parsedReq.provenance.parking === REQUIREMENT_SOURCE.EXPLICIT
    ? Boolean(parsedReq.requirements.parking)
    : (am.hasParking !== undefined 
      ? Boolean(am.hasParking) 
      : (rawInputs.hasParking !== undefined 
        ? Boolean(rawInputs.hasParking) 
        : (rawInputs.parking !== undefined 
          ? Boolean(rawInputs.parking) 
          : false)));

  const hasBalcony = parsedReq.provenance.balcony === REQUIREMENT_SOURCE.EXPLICIT
    ? Boolean(parsedReq.requirements.balcony)
    : (am.hasBalcony !== undefined 
      ? Boolean(am.hasBalcony) 
      : (rawInputs.hasBalcony !== undefined 
        ? Boolean(rawInputs.hasBalcony) 
        : (rawInputs.balcony !== undefined 
          ? Boolean(rawInputs.balcony) 
          : false)));

  if (parsedReq.provenance.pooja === REQUIREMENT_SOURCE.EXPLICIT) explicitKeys.add('pooja');
  if (parsedReq.provenance.parking === REQUIREMENT_SOURCE.EXPLICIT) explicitKeys.add('parking');
  if (parsedReq.provenance.balcony === REQUIREMENT_SOURCE.EXPLICIT) explicitKeys.add('balcony');

  const hasCourtyard = am.hasCourtyard !== undefined ? am.hasCourtyard : (rawInputs.hasCourtyard !== undefined ? rawInputs.hasCourtyard : (/courtyard|thotti|atrium/i.test(prompt) && !/no\s*courtyard|without\s*courtyard/i.test(prompt)));
  const hasSolarPergola = am.hasSolarPergola !== undefined ? am.hasSolarPergola : (rawInputs.hasSolarPergola !== undefined ? rawInputs.hasSolarPergola : (/solar|pergola|pv/i.test(prompt) && !/no\s*solar|without\s*solar/i.test(prompt)));
  const kitchenType = rawInputs.kitchenType || am.kitchenType || (/open\s*kitchen/i.test(prompt) ? 'open_modular' : 'closed_traditional');

  // 8. Budget (INR)
  let budget = Number(rawInputs.homeBudgetInr);
  const budgetMatch = prompt.match(/(?:rs\.?|₹|inr)\s*([\d,.]+)\s*(lakh|lacs?|cr|crore|k)?/i);
  if (budgetMatch) {
    explicitKeys.add('budget');
    const val = parseFloat(budgetMatch[1].replace(/,/g, ''));
    const mult = (budgetMatch[2] || '').toLowerCase();
    if (mult.startsWith('cr')) budget = Math.round(val * 10000000);
    else if (mult.startsWith('l')) budget = Math.round(val * 100000);
    else if (mult.startsWith('k')) budget = Math.round(val * 1000);
    else budget = Math.round(val);
  }
  budget = budget || (plotAreaSqft * floors * 2200);

  // 9. FEASIBILITY & IMPOSSIBLE CONSTRAINT CHECKING
  // Minimum plot width for residential construction in standard codes is 12 ft
  if (plotWidthFt < 12 || plotLengthFt < 15) {
    return {
      success: false,
      isFeasible: false,
      errors: [
        `Plot dimensions of ${plotWidthFt}×${plotLengthFt} ft (${plotAreaSqft} sq.ft) are too small for habitable construction. Minimum required plot is 15×20 ft.`
      ],
      clarificationNeeded: ['Please verify plot boundaries or confirm micro-pod dimensions.']
    };
  }

  // Minimum required carpet area per BHK
  // 1BHK: ~300 sq.ft, 2BHK: ~600 sq.ft, 3BHK: ~900 sq.ft, 4BHK: ~1300 sq.ft, 5BHK: ~1700 sq.ft
  const minRequiredCarpet = bhk === 1 ? 280 : bhk === 2 ? 550 : bhk === 3 ? 850 : bhk === 4 ? 1200 : 1600;
  // Maximum buildable footprint with setbacks: approximately 70% coverage per floor
  const maxBuildableFootprint = plotAreaSqft * 0.70;
  const maxTotalBuildable = maxBuildableFootprint * floors;

  if (minRequiredCarpet > maxTotalBuildable) {
    return {
      success: false,
      isFeasible: false,
      errors: [
        `Cannot fit a ${bhk}BHK home on a ${plotWidthFt}×${plotLengthFt} ft plot with only ${floors} floor(s).`,
        `Minimum buildable area required for a ${bhk}BHK is ${minRequiredCarpet} sq.ft, but the maximum buildable area across ${floors} floor(s) is only ${Math.round(maxTotalBuildable)} sq.ft.`
      ],
      clarificationNeeded: [
        `Increase the floor count to at least ${Math.ceil(minRequiredCarpet / maxBuildableFootprint)} floors, or reduce the bedroom count to ${Math.max(1, Math.floor(maxTotalBuildable / 320))} BHK.`
      ]
    };
  }

  // Budget reality check
  const minCivilCost = maxBuildableFootprint * 0.85 * floors * 1500;
  if (budget < minCivilCost && budget > 0 && !prompt.toLowerCase().includes('micro') && !prompt.toLowerCase().includes('low cost')) {
    warnings.push(`Budget of ₹${(budget/100000).toFixed(1)} Lakhs may be tight for a ${bhk}BHK with ${floors} floors (Standard civil cost starts at ₹${Math.round(minCivilCost/100000)} Lakhs).`);
  }

  return {
    success: true,
    isFeasible: true,
    warnings,
    clarificationNeeded,
    specs: {
      buildingType: parsedReq.requirements?.buildingType || (
        /penthouse/i.test(prompt) ? 'penthouse' :
        /luxury\s*(?:villa|mansion|home|residence)|luxury\s*villa/i.test(prompt) ? 'luxury_home' :
        /villa/i.test(prompt) ? 'villa' :
        /multi[- ]storey|apartment|flats|residential\s*building/i.test(prompt) || floors >= 4 ? 'apartment_building' :
        /commercial|office|clinic|studio|institution/i.test(prompt) ? 'commercial_institutional' : 'residential_house'
      ),
      plotWidth: plotWidthFt,
      plotLength: plotLengthFt,
      plotAreaSqft,
      dimensionUnit: 'feet',
      floorsCount: floors,
      bhkCount: bhk,
      bathroomsCount: bathrooms,
      archStyle: style,
      rooflineStyle: parsedReq.requirements?.rooflineStyle || (
        /pitched|slop(?:ing|ed)\s*roof|mangalore|kerala\s*roof/i.test(prompt) ? 'sloping_pitched' :
        /pergola|trellis/i.test(prompt) ? 'pergola_terrace' :
        /stepped|pier/i.test(prompt) ? 'stepped_parapet' :
        /flat\s*roof|flat\s*terrace|rooftop\s*terrace/i.test(prompt) ? 'flat_terrace' :
        (style === 'vintage' || style === 'traditional_duplex' || style === 'traditional_indian') ? 'sloping_pitched' :
        (style === 'penthouse' || /terrace/i.test(prompt)) ? 'flat_terrace' : 'flat_terrace'
      ),
      facingDirection: facing,
      homeBudgetInr: budget,
      hasGarden: parsedReq.requirements?.hasGarden || (/garden|lawn|landscap/i.test(prompt) && !/no\s*garden/i.test(prompt)),
      furnitureStyle: parsedReq.requirements?.furnitureStyle || (/vintage|antique|heritage/i.test(prompt) ? 'vintage_indian' : 'standard'),
      hasTerrace: parsedReq.requirements?.hasTerrace || false,
      amenities: {
        hasPooja,
        hasParking,
        hasBalcony,
        hasCourtyard,
        hasSolarPergola,
        hasGarden: parsedReq.requirements?.hasGarden || (/garden|lawn|landscap/i.test(prompt) && !/no\s*garden/i.test(prompt)),
        kitchenType
      },
      userPrompt: prompt,
      explicitKeys: Array.from(explicitKeys)
    }
  };
}
