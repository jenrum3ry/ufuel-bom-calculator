/**
 * Tank Shell (Body) Calculation Logic
 *
 * Calculates steel requirements for cylindrical tank shell/body.
 *
 * Dimension roles:
 *   Sheet LENGTH = wraps around the circumference (π × D + 1.5" ring seam)
 *   Sheet WIDTH  = axial extent of one course/ring along the tank length
 *
 * Multiple courses are stacked along the tank axis with 1.5" lap seams between them.
 * Head fit-up adds 1" per end (+2" total), reducing the raw axial steel needed.
 */

import { thicknessInInches, standardWidths, standardLengths, calculateWeight } from './weightTable.js';
import { findOptimalSheetCombination, calculateEffectiveLength } from './wasteOptimizer.js';

/**
 * Calculate the Outer Diameter (OD) of the tank
 * OD = Tank Inner Diameter + (2 × Thickness)
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
 * Calculate the required sheet length for one ring (circumference + ring seam allowance)
 * @param {number} tankDiameter - Inner diameter in inches
 * @returns {number} Required sheet length in inches
 */
export function calculateRequiredSheetLength(tankDiameter) {
  return Math.PI * tankDiameter + 1.5; // circumference + 1.5" ring seam
}

/**
 * Find the minimum available standard length that covers the required sheet length
 * @param {number} requiredLength - Minimum sheet length needed in inches
 * @param {number[]} availableLengths - Available sheet lengths in inches
 * @returns {number|null} Minimum suitable length, or null if none available
 */
export function findMinimumSheetLength(requiredLength, availableLengths = standardLengths) {
  const sorted = [...availableLengths].sort((a, b) => a - b);
  for (const length of sorted) {
    if (length >= requiredLength) {
      return length;
    }
  }
  return null; // No suitable length found (tank diameter too large for available stock)
}

/**
 * Calculate full shell requirements
 *
 * @param {Object} params - Calculation parameters
 * @param {number} params.tankDiameter - Tank inner diameter in inches
 * @param {number} params.tankLength - Tank axial length in inches
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
  availableLengths = standardLengths
}) {
  // Step 1: Calculate OD (for reference / head sizing)
  const od = calculateOD(tankDiameter, thickness);

  // Step 2: Determine required sheet length (circumference + 1.5" ring seam)
  const requiredSheetLength = calculateRequiredSheetLength(tankDiameter);
  const orderedSheetLength = findMinimumSheetLength(requiredSheetLength, availableLengths);

  if (!orderedSheetLength) {
    return {
      error: 'No available sheet length is large enough for the tank circumference. Tank diameter may be too large for standard stock.',
      od,
      requiredSheetLength
    };
  }

  const circumferenceCut = Math.round(requiredSheetLength * 10) / 10; // actual cut length per ring
  const lengthWastePerSheet = orderedSheetLength - circumferenceCut;

  // Step 3: Find optimal sheet WIDTH combination to cover tank axial length
  // headAdjustment = 2" (1" per end from 3" head skirt pushed in 2")
  const optimalCombination = findOptimalSheetCombination(tankLength, availableWidths, 2);

  // Step 4: Calculate number of courses and effective axial coverage
  const numCourses = optimalCombination.sheets.reduce((sum, s) => sum + s.count, 0);
  const effectiveAxial = calculateEffectiveLength(tankLength, numCourses, 2);

  // Step 5: Calculate axial waste
  const totalRawAxial = optimalCombination.totalLength;
  const axialWaste = totalRawAxial - effectiveAxial;
  const axialWastePercent = totalRawAxial > 0 ? (axialWaste / totalRawAxial) * 100 : 0;

  // Step 6: Calculate weight — each course is one sheet of [courseWidth × orderedSheetLength]
  let totalWeight = 0;
  const sheetDetails = [];

  for (const course of optimalCombination.sheets) {
    const weight = calculateWeight(course.length, orderedSheetLength, thickness);
    totalWeight += weight * course.count;
    sheetDetails.push({
      width: course.length,
      length: orderedSheetLength,
      cutLength: circumferenceCut,
      count: course.count,
      weight: weight * course.count
    });
  }

  return {
    od,
    circumference: Math.PI * tankDiameter,
    requiredSheetLength,
    orderedSheetLength,
    circumferenceCut,
    lengthWastePerSheet,
    tankLength,
    numCourses,
    optimalCombination: optimalCombination.sheets,
    combinationDescription: optimalCombination.description,
    totalRawAxial,
    effectiveAxial,
    axialWaste,
    axialWastePercent,
    totalWeight,
    sheetDetails
  };
}
