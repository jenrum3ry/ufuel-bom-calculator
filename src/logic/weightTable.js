/**
 * Steel Weight Table (Placa de Rollo reference)
 * All weights in kg, indexed by thickness and sheet dimensions
 *
 * Source: Supplier reference image for Placa de Rollo
 */

// Weight per sheet in kg, indexed by thickness (inches) and dimensions (WxL in feet)
export const weightTable = {
  '3/16': {
    '3x8': 84,
    '3x10': 105,
    '4x8': 112,
    '4x10': 140,
    '4x40': 562,
    '5x10': 176,
    '5x20': 351,
    '6x20': 427,
    '8x20': 562
  },
  '1/4': {
    '3x8': 112,
    '3x10': 140,
    '4x8': 150,
    '4x10': 187,
    '4x40': 702,
    '5x10': 234,
    '5x20': 468,
    '6x20': 562,
    '8x20': 749
  },
  '5/16': {
    '3x8': 140,
    '3x10': 175,
    '4x8': 187,
    '4x10': 234,
    '4x40': 877,
    '5x10': 293,
    '5x20': 585,
    '6x20': 702,
    '8x20': 936
  },
  '3/8': {
    '3x8': 168,
    '3x10': 210,
    '4x8': 224,
    '4x10': 281,
    '4x40': 1053,
    '5x10': 351,
    '5x20': 702,
    '6x20': 842,
    '8x20': 1123
  },
  '1/2': {
    '3x8': 225,
    '3x10': 281,
    '4x8': 300,
    '4x10': 374,
    '4x40': 1404,
    '5x10': 468,
    '5x20': 936,
    '6x20': 1123,
    '8x20': 1498
  }
};

// Weight per square meter by thickness (kg/m²)
export const kgPerSqMeter = {
  '3/16': 37.75,
  '1/4': 50.24,
  '5/16': 62.57,
  '3/8': 75.25,
  '1/2': 101.04
};

// Standard available sheet widths in inches
export const standardWidths = [36, 48, 60, 72, 96];

// Standard available sheet lengths in inches
export const standardLengths = [96, 120, 240, 480, 560];

// Thickness values in inches (decimal for calculations)
export const thicknessInInches = {
  '3/16': 0.1875,
  '1/4': 0.25,
  '5/16': 0.3125,
  '3/8': 0.375,
  '1/2': 0.5
};

// Thickness values in mm
export const thicknessInMm = {
  '3/16': 4.8,
  '1/4': 6.35,
  '5/16': 7.9,
  '3/8': 9.5,
  '1/2': 12.7
};

/**
 * Calculate weight for a given sheet size and thickness
 * @param {number} widthInches - Sheet width in inches
 * @param {number} lengthInches - Sheet length in inches
 * @param {string} thickness - Thickness as fraction string (e.g., '1/4')
 * @returns {number} Weight in kg
 */
export function calculateWeight(widthInches, lengthInches, thickness) {
  // Convert inches to meters
  const widthMeters = widthInches * 0.0254;
  const lengthMeters = lengthInches * 0.0254;

  // Calculate area in square meters
  const areaSqM = widthMeters * lengthMeters;

  // Get kg/m² for the thickness
  const kgPerM2 = kgPerSqMeter[thickness];

  if (!kgPerM2) {
    throw new Error(`Unknown thickness: ${thickness}`);
  }

  // Calculate and return weight
  return areaSqM * kgPerM2;
}

/**
 * Look up weight from the standard table if available, otherwise calculate
 * @param {number} widthFeet - Sheet width in feet
 * @param {number} lengthFeet - Sheet length in feet
 * @param {string} thickness - Thickness as fraction string
 * @returns {number} Weight in kg
 */
export function getSheetWeight(widthFeet, lengthFeet, thickness) {
  const key = `${widthFeet}x${lengthFeet}`;

  // Try to get from lookup table first
  if (weightTable[thickness] && weightTable[thickness][key]) {
    return weightTable[thickness][key];
  }

  // Otherwise calculate from kg/m²
  const widthInches = widthFeet * 12;
  const lengthInches = lengthFeet * 12;
  return calculateWeight(widthInches, lengthInches, thickness);
}
