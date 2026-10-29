/**
 * promptArchitectureAnalyzer.js
 * Advanced Natural Language Architectural Prompt Parser & Requirement Extraction Engine.
 * Extracts BHK, Architectural Style, Floors, Plot Dimensions, Facing Direction,
 * Budget, and Special Amenities. Categorizes each as explicitly extracted vs optional/defaulted.
 */

export function analyzeArchitecturalPrompt(rawPrompt = '') {
  const text = (rawPrompt || '').trim();
  const lower = text.toLowerCase();

  // 1. BHK DETECTION (1 to 6 BHK, Studio, Villa, Duplex, Mansion)
  let bhk = 3;
  let bhkExtracted = false;
  let bhkSnippet = '';

  const bhkMatch = lower.match(/(\d+)\s*(?:bhk|bedroom|bed|br\b|bed\s*room)/i);
  if (bhkMatch) {
    bhk = Math.min(6, Math.max(1, parseInt(bhkMatch[1], 10)));
    bhkExtracted = true;
    bhkSnippet = bhkMatch[0];
  } else if (lower.includes('1rk') || lower.includes('micro') || lower.includes('studio') || lower.includes('tiny')) {
    bhk = 1;
    bhkExtracted = true;
    bhkSnippet = 'Micro 1RK / Studio';
  } else if (lower.includes('villa') || lower.includes('mansion') || lower.includes('penthouse')) {
    bhk = 4;
    bhkExtracted = true;
    bhkSnippet = 'Luxury Villa (4BHK)';
  } else if (lower.includes('duplex')) {
    bhk = 3;
    bhkExtracted = true;
    bhkSnippet = 'Duplex (3BHK)';
  }

  // 2. FLOORS / STOREYS DETECTION (1 to 4 floors, G+1, G+2, etc.)
  let floors = 2;
  let floorsExtracted = false;
  let floorsSnippet = '';

  const gPlusMatch = lower.match(/g\s*\+\s*(\d+)/i);
  const floorMatch = lower.match(/(\d+)\s*(?:floor|storey|story|storeys|stories|level|levels)/i);

  if (gPlusMatch) {
    const extraFloors = parseInt(gPlusMatch[1], 10);
    floors = Math.min(4, Math.max(1, 1 + extraFloors));
    floorsExtracted = true;
    floorsSnippet = `G+${extraFloors} (${floors} Floors)`;
  } else if (floorMatch) {
    floors = Math.min(4, Math.max(1, parseInt(floorMatch[1], 10)));
    floorsExtracted = true;
    floorsSnippet = floorMatch[0];
  } else if (lower.includes('single floor') || lower.includes('single storey') || lower.includes('ground floor only') || lower.includes('one floor')) {
    floors = 1;
    floorsExtracted = true;
    floorsSnippet = 'Single Storey (Ground Floor)';
  } else if (lower.includes('two storey') || lower.includes('two floor') || lower.includes('duplex') || lower.includes('double storey')) {
    floors = 2;
    floorsExtracted = true;
    floorsSnippet = 'Two Storey Duplex';
  } else if (lower.includes('three storey') || lower.includes('three floor') || lower.includes('triplex')) {
    floors = 3;
    floorsExtracted = true;
    floorsSnippet = 'Three Storey Triplex';
  }

  // 3. PLOT DIMENSIONS & AREA DETECTION
  let plotWidth = 40;
  let plotLength = 60;
  let plotExtracted = false;
  let plotSnippet = '';

  const dimMatch = lower.match(/(\d{2,3})\s*(?:x|×|\*|by)\s*(\d{2,3})\s*(?:ft|feet|sqft)?/i);
  const sqftMatch = lower.match(/(\d{3,5})\s*(?:sq\.?\s*ft|sqft|square\s*feet)/i);
  const centsMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:cents?|cent)/i);
  const acreMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:-|–)?\s*(?:acres?|acre)\b/i);

  if (dimMatch) {
    const val1 = parseInt(dimMatch[1], 10);
    const val2 = parseInt(dimMatch[2], 10);
    plotWidth = Math.min(val1, val2);
    plotLength = Math.max(val1, val2);
    plotExtracted = true;
    plotSnippet = `${plotWidth} × ${plotLength} ft`;
  } else if (acreMatch) {
    const acreVal = parseFloat(acreMatch[1]);
    const sqft = Math.round(acreVal * 43560);
    plotWidth = Math.round(Math.sqrt(sqft / 1.4));
    plotLength = Math.round(sqft / plotWidth);
    plotExtracted = true;
    plotSnippet = `${acreVal} Acre (~${sqft} sq.ft, ${plotWidth}×${plotLength} ft)`;
  } else if (centsMatch) {
    const cents = parseFloat(centsMatch[1]);
    const sqft = Math.round(cents * 435.6);
    plotWidth = Math.round(Math.sqrt(sqft * 0.6));
    plotLength = Math.round(sqft / plotWidth);
    plotExtracted = true;
    plotSnippet = `${cents} Cents (~${sqft} sq.ft, ${plotWidth}×${plotLength} ft)`;
  } else if (sqftMatch) {
    const sqft = parseInt(sqftMatch[1], 10);
    plotWidth = Math.round(Math.sqrt(sqft * 0.6));
    plotLength = Math.round(sqft / plotWidth);
    plotExtracted = true;
    plotSnippet = `${sqft} sq.ft (${plotWidth}×${plotLength} ft)`;
  }

  // 3B. BATHROOM DETECTION (1 to 6 bathrooms)
  let bathrooms = 3;
  let bathroomsExtracted = false;
  let bathroomsSnippet = '';
  const bathMatch = lower.match(/(\d+|one|two|three|four|five|six)\s*(?:baths?|bathrooms?|toilets?|washrooms?)/i);
  if (bathMatch) {
    const wordMap = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
    bathrooms = wordMap[bathMatch[1].toLowerCase()] || parseInt(bathMatch[1], 10);
    bathroomsExtracted = true;
    bathroomsSnippet = `${bathrooms} Bathrooms`;
  }

  // 4. ARCHITECTURAL STYLE DETECTION
  let style = 'modern';
  let styleName = 'Modern Contemporary';
  let styleExtracted = false;
  let styleSnippet = '';

  if (lower.includes('vintage') || lower.includes('antique') || lower.includes('colonial') || lower.includes('victorian')) {
    style = 'vintage';
    styleName = 'Vintage Indian Heritage';
    styleExtracted = true;
    styleSnippet = 'Vintage Indian Architecture';
  } else if (lower.includes('kerala') || lower.includes('traditional') || lower.includes('chettinad') || lower.includes('thotti') || lower.includes('heritage') || lower.includes('mangalore')) {
    style = 'traditional_duplex';
    styleName = 'Traditional Indian / Kerala Heritage';
    styleExtracted = true;
    styleSnippet = 'Traditional Indian / Kerala Style';
  } else if (lower.includes('minimalist') || lower.includes('scandinavian') || lower.includes('zen') || lower.includes('japandi')) {
    style = 'minimalist';
    styleName = 'Minimalist Scandinavian';
    styleExtracted = true;
    styleSnippet = 'Minimalist Scandinavian';
  } else if (lower.includes('luxury') || lower.includes('villa') || lower.includes('mansion') || lower.includes('cantilever') || lower.includes('travertine')) {
    style = 'luxury_villa';
    styleName = 'Luxury Contemporary Villa';
    styleExtracted = true;
    styleSnippet = 'Luxury Villa Architecture';
  } else if (lower.includes('eco') || lower.includes('sustainable') || lower.includes('green') || lower.includes('solar') || lower.includes('rainwater') || lower.includes('brick')) {
    style = 'eco_friendly';
    styleName = 'Eco-Green Sustainable';
    styleExtracted = true;
    styleSnippet = 'Eco-Green Sustainable Architecture';
  } else if (lower.includes('modern') || lower.includes('contemporary') || lower.includes('glass') || lower.includes('geometric')) {
    style = 'modern';
    styleName = 'Modern Contemporary';
    styleExtracted = true;
    styleSnippet = 'Modern Contemporary';
  }

  // 5. FACING DIRECTION (East, North, West, South, North-East)
  let facing = 'East';
  let facingExtracted = false;
  let facingSnippet = '';

  if (lower.includes('north-east') || lower.includes('northeast') || lower.includes('ishanya')) {
    facing = 'North-East';
    facingExtracted = true;
    facingSnippet = 'North-East (Ishanya)';
  } else if (lower.includes('north') || lower.includes('kuber')) {
    facing = 'North';
    facingExtracted = true;
    facingSnippet = 'North Facing (Kuber)';
  } else if (lower.includes('east') || lower.includes('surya') || lower.includes('purva')) {
    facing = 'East';
    facingExtracted = true;
    facingSnippet = 'East Facing (Surya)';
  } else if (lower.includes('west') || lower.includes('varuna')) {
    facing = 'West';
    facingExtracted = true;
    facingSnippet = 'West Facing (Varuna)';
  } else if (lower.includes('south') || lower.includes('dakshin')) {
    facing = 'South';
    facingExtracted = true;
    facingSnippet = 'South Facing';
  }

  // 6. BUDGET EXTRACTION
  let budgetInr = 4500000;
  let budgetExtracted = false;
  let budgetSnippet = '';

  const croreMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)/i);
  const lakhMatch = lower.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lakh|lac|lacs|l\b)/i);
  const numericRupeeMatch = lower.match(/(?:₹|rs\.?|inr)\s*(\d{5,9})/i);

  if (croreMatch) {
    const cr = parseFloat(croreMatch[1]);
    budgetInr = Math.round(cr * 10000000);
    budgetExtracted = true;
    budgetSnippet = `₹${cr} Crore (₹${budgetInr.toLocaleString('en-IN')})`;
  } else if (lakhMatch) {
    const lk = parseFloat(lakhMatch[1]);
    budgetInr = Math.round(lk * 100000);
    budgetExtracted = true;
    budgetSnippet = `₹${lk} Lakhs (₹${budgetInr.toLocaleString('en-IN')})`;
  } else if (numericRupeeMatch) {
    budgetInr = parseInt(numericRupeeMatch[1], 10);
    budgetExtracted = true;
    budgetSnippet = `₹${budgetInr.toLocaleString('en-IN')}`;
  }

  // 7. SPECIAL AMENITIES EXTRACTION
  const hasPooja = lower.includes('pooja') || lower.includes('mandir') || lower.includes('prayer') || lower.includes('sanctum');
  const hasParking = lower.includes('parking') || lower.includes('car') || lower.includes('porch') || lower.includes('portico') || lower.includes('garage') || lower.includes('ev');
  const hasBalcony = lower.includes('balcony') || lower.includes('deck') || lower.includes('terrace');
  const hasCourtyard = lower.includes('courtyard') || lower.includes('thotti') || lower.includes('aangan') || lower.includes('skylight');
  const hasSolar = lower.includes('solar') || lower.includes('pergola') || lower.includes('rooftop solar') || lower.includes('panel');
  const hasGarden = lower.includes('garden') || lower.includes('lawn') || lower.includes('landscape') || lower.includes('plants');

  // Calculate built-up area
  const plotSqft = plotWidth * plotLength;
  const coverageRatio = floors === 1 ? 0.70 : floors === 2 ? 1.40 : floors === 3 ? 2.05 : 2.60;
  const builtUpSqft = Math.round(plotSqft * coverageRatio);
  const carpetAreaSqft = Math.round(builtUpSqft * 0.78);

  return {
    rawPrompt: text,
    bhk: {
      value: bhk,
      isExplicit: bhkExtracted,
      snippet: bhkSnippet,
      label: `${bhk} BHK`
    },
    floors: {
      value: floors,
      isExplicit: floorsExtracted,
      snippet: floorsSnippet,
      label: floors === 1 ? 'Single Floor (Ground)' : floors === 2 ? '2 Floors (Duplex G+1)' : `${floors} Floors (G+${floors - 1})`
    },
    bathrooms: {
      value: bathrooms,
      isExplicit: bathroomsExtracted,
      snippet: bathroomsSnippet,
      label: `${bathrooms} Bathrooms`
    },
    plot: {
      width: plotWidth,
      length: plotLength,
      areaSqft: plotSqft,
      isExplicit: plotExtracted,
      snippet: plotSnippet,
      label: `${plotWidth} × ${plotLength} ft (${plotSqft.toLocaleString('en-IN')} sq.ft)`
    },
    style: {
      value: style,
      name: styleName,
      isExplicit: styleExtracted,
      snippet: styleSnippet,
      label: styleName
    },
    facing: {
      value: facing,
      isExplicit: facingExtracted,
      snippet: facingSnippet,
      label: `${facing} Facing`
    },
    budget: {
      value: budgetInr,
      isExplicit: budgetExtracted,
      snippet: budgetSnippet,
      formatted: `₹${(budgetInr / 100000).toFixed(1)} Lakhs`
    },
    amenities: {
      hasPooja: { value: hasPooja, isExplicit: hasPooja, label: 'Dedicated Pooja Room' },
      hasParking: { value: hasParking, isExplicit: hasParking, label: 'Covered Car Porch & EV Bay' },
      hasBalcony: { value: hasBalcony, isExplicit: hasBalcony, label: 'Cantilever Balcony Deck' },
      hasCourtyard: { value: hasCourtyard, isExplicit: hasCourtyard, label: 'Central Open Courtyard' },
      hasSolar: { value: hasSolar, isExplicit: hasSolar, label: 'Solar Rooftop Pergola' },
      hasGarden: { value: hasGarden || true, isExplicit: hasGarden, label: 'Landscaped Lawn & Garden' }
    },
    metrics: {
      plotSqft,
      builtUpSqft,
      carpetAreaSqft,
      groundCoverageSqft: Math.round(plotSqft * 0.65),
      fsi: (builtUpSqft / plotSqft).toFixed(2),
      estimatedMonths: floors === 1 ? '5 - 6 Months' : floors === 2 ? '8 - 9 Months' : '11 - 13 Months'
    }
  };
}
