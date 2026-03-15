/**
 * Steel Weight Table (Placa de Rollo reference)
 * All weights in kg, indexed by thickness and sheet dimensions
 *
 * Source: Supplier reference image for Placa de Rollo
 * Only 1/4" (6.3mm) thickness is used.
 */

// Weight per sheet in kg, indexed by thickness (inches) and dimensions (WxL in feet)
export const weightTable = {
  '1/4': {
    '3x8': 112,
    '3x10': 140,
    '4x8': 150,
    '4x10': 187,
    '5x10': 234,
    '5x20': 468,
    '6x20': 562,
    '8x20': 749
  }
};

// Weight per square meter by thickness (kg/m²)
export const kgPerSqMeter = {
  '1/4': 50.38
};

// Standard available sheet widths in inches
export const standardWidths = [36, 48, 60, 72, 96];

// Standard available sheet lengths in inches
export const standardLengths = [96, 120, 240, 480, 560];

// Thickness values in inches (decimal for calculations)
export const thicknessInInches = {
  '1/4': 0.25
};

// Thickness values in mm
export const thicknessInMm = {
  '1/4': 6.3
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
 * Return the subset of widths that the supplier stocks in a sheet
 * long enough for the required circumference length.
 *
 * @param {number} requiredLengthInches - Minimum sheet length needed
 * @param {string} thickness - e.g. '1/4'
 * @returns {number[]} Array of valid widths in inches, sorted ascending
 */
export function getAvailableWidthsForLength(requiredLengthInches, thickness = '1/4') {
  const table = weightTable[thickness] || {};
  const validWidths = new Set();
  for (const key of Object.keys(table)) {
    const [wFt, lFt] = key.split('x').map(Number);
    if (lFt * 12 >= requiredLengthInches) {
      validWidths.add(wFt * 12);
    }
  }
  return [...validWidths].sort((a, b) => a - b);
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
