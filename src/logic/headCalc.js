/**
 * Tank Head Calculation Logic
 *
 * Calculates steel requirements for circular tank heads (end caps)
 */

import { thicknessInInches, standardWidths, calculateWeight } from './weightTable.js';

/**
 * Calculate the Outer Diameter (OD) of the tank
 * Same formula as shell: OD = Tank Diameter + (2 × Thickness)
 *
 * @param {number} tankDiameter - Inner diameter in inches
 * @param {string} thickness - Thickness as fraction string (e.g., '1/4')
 * @returns {number} Outer diameter in inches
 */
export function calculateOD(tankDiameter, thickness) {
  const thicknessValue = thicknessInInches[thickness];
  if (!thicknessValue) {
    throw new Error(`Unknown thickness: ${thickness}`);
  }
  return tankDiameter + (2 * thicknessValue);
}

/**
 * Find the minimum required sheet width for cutting a circular head
 * Sheet must be at least as wide as the OD
 *
 * @param {number} od - Outer diameter in inches
 * @param {number[]} availableWidths - Available sheet widths in inches
 * @returns {number|null} Minimum suitable width, or null if none available
 */
export function findMinimumSheetWidthForHead(od, availableWidths = standardWidths) {
  // Sort widths in ascending order
  const sorted = [...availableWidths].sort((a, b) => a - b);

  // Find the smallest width that is >= OD
  for (const width of sorted) {
    if (width >= od) {
      return width;
    }
  }

  return null; // No suitable width found
}

/**
 * Calculate the sheet length needed for a head
 * For a circular head, the sheet length must also be >= OD
 * We use a square or near-square sheet for cutting circles
 *
 * @param {number} od - Outer diameter in inches
 * @param {number[]} availableLengths - Available sheet lengths in inches
 * @returns {number|null} Minimum suitable length, or null if none available
 */
export function findMinimumSheetLengthForHead(od, availableLengths) {
  // Sort lengths in ascending order
  const sorted = [...availableLengths].sort((a, b) => a - b);

  // Find the smallest length that is >= OD
  for (const length of sorted) {
    if (length >= od) {
      return length;
    }
  }

  return null;
}

/**
 * Calculate how many heads can be cut from a single sheet
 * For simplicity, assume 1 head per sheet (circular cut)
 * More complex nesting could be implemented later
 *
 * @param {number} sheetWidth - Sheet width in inches
 * @param {number} sheetLength - Sheet length in inches
 * @param {number} od - Head outer diameter in inches
 * @returns {number} Number of heads that can be cut
 */
export function calculateHeadsPerSheet(sheetWidth, sheetLength, od) {
  // Simple calculation: how many OD-sized circles fit
  // In a rectangle, we can fit floor(width/OD) × floor(length/OD) circles
  // But for tanks, typically 1 head per sheet is used for quality
  const headsAcrossWidth = Math.floor(sheetWidth / od);
  const headsAcrossLength = Math.floor(sheetLength / od);

  return headsAcrossWidth * headsAcrossLength;
}

/**
 * Calculate full head requirements
 *
 * @param {Object} params - Calculation parameters
 * @param {number} params.tankDiameter - Tank inner diameter in inches
 * @param {string} params.thickness - Steel thickness as fraction string
 * @param {number} params.numberOfHeads - Number of heads needed (default: 2)
 * @param {number[]} params.availableWidths - Available sheet widths in inches
 * @param {number[]} params.availableLengths - Available sheet lengths in inches
 * @returns {Object} Head calculation results
 */
export function calculateHeads({
  tankDiameter,
  thickness,
  numberOfHeads = 2,
  availableWidths = standardWidths,
  availableLengths
}) {
  // Step 1: Calculate OD
  const od = calculateOD(tankDiameter, thickness);

  // Step 2: Find minimum sheet dimensions
  const requiredSheetWidth = findMinimumSheetWidthForHead(od, availableWidths);
  const requiredSheetLength = findMinimumSheetLengthForHead(od, availableLengths);

  if (!requiredSheetWidth) {
    return {
      error: 'No available sheet width is large enough for the head OD',
      od,
      requiredWidth: od
    };
  }

  if (!requiredSheetLength) {
    return {
      error: 'No available sheet length is large enough for the head OD',
      od,
      requiredLength: od
    };
  }

  // Step 3: Calculate sheets needed
  // For quality, we assume 1 head per sheet section
  // But check if multiple heads can fit
  const headsPerSheet = calculateHeadsPerSheet(requiredSheetWidth, requiredSheetLength, od);
  const sheetsNeeded = Math.ceil(numberOfHeads / headsPerSheet);

  // Step 4: Calculate weight
  const weightPerSheet = calculateWeight(requiredSheetWidth, requiredSheetLength, thickness);
  const totalWeight = weightPerSheet * sheetsNeeded;

  // Step 5: Calculate waste area (approximate)
  // Waste = sheet area - circular head area × heads per sheet
  const sheetArea = requiredSheetWidth * requiredSheetLength;
  const headArea = Math.PI * Math.pow(od / 2, 2);
  const usedAreaPerSheet = headArea * Math.min(headsPerSheet, numberOfHeads);
  const wasteAreaPerSheet = sheetArea - usedAreaPerSheet;
  const wastePercent = (wasteAreaPerSheet / sheetArea) * 100;

  return {
    od,
    requiredSheetWidth,
    requiredSheetLength,
    numberOfHeads,
    headsPerSheet,
    sheetsNeeded,
    sheetDimensions: `${requiredSheetWidth}" x ${requiredSheetLength}"`,
    weightPerSheet,
    totalWeight,
    wastePercent
  };
}
