/**
 * Tank Shell (Body) Calculation Logic
 *
 * Calculates steel requirements for cylindrical tank shell/body
 */

import { thicknessInInches, standardWidths, calculateWeight } from './weightTable.js';
import { findOptimalSheetCombination, calculateEffectiveLength } from './wasteOptimizer.js';

/**
 * Calculate the Outer Diameter (OD) of the tank
 * OD = Tank Diameter + (2 × Thickness)
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
 * Calculate the circumference of the tank (for reference)
 * @param {number} od - Outer diameter in inches
 * @returns {number} Circumference in inches
 */
export function calculateCircumference(od) {
  return Math.PI * od;
}

/**
 * Find the minimum required sheet width that can accommodate the OD
 * @param {number} od - Outer diameter in inches
 * @param {number[]} availableWidths - Available sheet widths in inches
 * @returns {number|null} Minimum suitable width, or null if none available
 */
export function findMinimumSheetWidth(od, availableWidths = standardWidths) {
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
 * Calculate full shell requirements
 *
 * @param {Object} params - Calculation parameters
 * @param {number} params.tankDiameter - Tank inner diameter in inches
 * @param {number} params.tankLength - Tank length in inches
 * @param {string} params.thickness - Steel thickness as fraction string
 * @param {number[]} params.availableWidths - Available sheet widths in inches
 * @param {number[]} params.availableLengths - Available sheet lengths in inches
 * @returns {Object} Shell calculation results
 */
export function calculateShell({
  tankDiameter,
  tankLength,
  thickness,
  availableWidths = standardWidths,
  availableLengths
}) {
  // Step 1: Calculate OD
  const od = calculateOD(tankDiameter, thickness);

  // Step 2: Find minimum sheet width
  const requiredSheetWidth = findMinimumSheetWidth(od, availableWidths);

  if (!requiredSheetWidth) {
    return {
      error: 'No available sheet width is large enough for the tank OD',
      od,
      requiredWidth: od
    };
  }

  // Step 3: Find optimal sheet combination for length (includes seam allowance handling)
  const optimalCombination = findOptimalSheetCombination(tankLength, availableLengths);

  // Step 4: Calculate number of sections for the effective required length
  const numSections = optimalCombination.sheets.reduce((sum, s) => sum + s.count, 0);
  const requiredLength = calculateEffectiveLength(tankLength, numSections);

  // Step 5: Calculate waste
  const totalRawLength = optimalCombination.totalLength;
  const waste = totalRawLength - requiredLength;
  const wastePercent = totalRawLength > 0 ? (waste / totalRawLength) * 100 : 0;

  // Step 6: Calculate weight
  // Each sheet has the same width but different lengths
  let totalWeight = 0;
  const sheetDetails = [];

  for (const sheet of optimalCombination.sheets) {
    const weight = calculateWeight(requiredSheetWidth, sheet.length, thickness);
    totalWeight += weight * sheet.count;
    sheetDetails.push({
      width: requiredSheetWidth,
      length: sheet.length,
      count: sheet.count,
      weight: weight * sheet.count
    });
  }

  return {
    od,
    circumference: calculateCircumference(od),
    requiredSheetWidth,
    requiredLength,
    tankLength,
    numSections,
    optimalCombination: optimalCombination.sheets,
    combinationDescription: optimalCombination.description,
    totalRawLength,
    waste,
    wastePercent,
    totalWeight,
    sheetDetails
  };
}
