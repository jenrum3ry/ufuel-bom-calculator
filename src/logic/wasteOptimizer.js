/**
 * Waste Optimizer
 *
 * Finds the optimal combination of steel sheet widths to cover a required axial
 * tank length with minimum waste, accounting for seam allowances and head fit-up.
 */

import { standardWidths } from './weightTable.js';

/**
 * Calculate the effective raw axial steel needed including seam losses and head adjustment.
 *
 * Each interior seam consumes 1.5" (lap weld overlap).
 * Each end gains 1" because the head skirt (3" lip pushed in 2") extends 1" beyond the shell ring.
 * Net head adjustment = +2" gain (1" per end) = subtract 2" from raw requirement.
 *
 * Formula: tankLength + (numSections - 1) * 1.5 - headAdjustment
 *
 * @param {number} tankLength - Tank axial length in inches
 * @param {number} numSections - Number of sheet courses (rings)
 * @param {number} headAdjustment - Inches gained from head fit-up (default 2)
 * @returns {number} Required raw axial steel in inches
 */
export function calculateEffectiveLength(tankLength, numSections, headAdjustment = 2) {
  return tankLength + Math.max(0, numSections - 1) * 1.5 - headAdjustment;
}

/**
 * Find the optimal sheet width combination (least waste) to cover the tank axial length.
 * Accounts for 1.5" seam allowances and 2" head fit-up adjustment.
 *
 * @param {number} tankLength - Tank axial length in inches (raw, before allowances)
 * @param {number[]} availableWidths - Available sheet widths in inches
 * @param {number} headAdjustment - Inches gained from head fit-up (default 2)
 * @returns {Object} Optimal combination with details
 */
export function findOptimalSheetCombination(tankLength, availableWidths = standardWidths, headAdjustment = 2) {
  const sorted = [...availableWidths].sort((a, b) => a - b);

  // Check if a single sheet can cover it (1 course = no interior seams)
  for (const width of sorted) {
    const effectiveRequired = calculateEffectiveLength(tankLength, 1, headAdjustment);
    if (width >= effectiveRequired) {
      return {
        sheets: [{ length: width, count: 1 }],
        totalLength: width,
        waste: width - effectiveRequired,
        effectiveRequired,
        description: `1 x ${width}"`
      };
    }
  }

  // Need multiple courses — find optimal combination accounting for seam allowances
  const combinations = findAllCombinationsWithSeams(tankLength, availableWidths, 8, headAdjustment);

  if (combinations.length === 0) {
    // Fallback: use largest width and calculate how many needed
    const largest = Math.max(...availableWidths);
    const count = Math.ceil((tankLength + headAdjustment) / (largest - 1.5)) + 1;
    const effectiveRequired = calculateEffectiveLength(tankLength, count, headAdjustment);
    const totalLength = largest * count;
    return {
      sheets: [{ length: largest, count }],
      totalLength,
      waste: totalLength - effectiveRequired,
      effectiveRequired,
      description: `${count} x ${largest}"`
    };
  }

  // Get the best combination (least waste)
  const best = combinations[0];

  // Group sheets by width for cleaner output
  const grouped = groupSheets(best.sheets);

  return {
    sheets: grouped,
    totalLength: best.totalLength,
    waste: best.waste,
    effectiveRequired: best.effectiveRequired,
    description: formatCombination(grouped)
  };
}

/**
 * Find all combinations that can cover the tank axial length including seam allowances
 *
 * @param {number} tankLength - Raw tank axial length in inches
 * @param {number[]} availableWidths - Available sheet widths in inches
 * @param {number} maxSheets - Maximum number of courses to consider
 * @param {number} headAdjustment - Inches gained from head fit-up
 * @returns {Object[]} Array of valid combinations sorted by waste (ascending)
 */
function findAllCombinationsWithSeams(tankLength, availableWidths = standardWidths, maxSheets = 8, headAdjustment = 2) {
  const combinations = [];
  const sorted = [...availableWidths].sort((a, b) => b - a); // Sort descending

  function findCombos(currentCombo, startIdx) {
    const numSheets = currentCombo.length;
    if (numSheets > maxSheets) return;

    const currentTotal = currentCombo.reduce((sum, w) => sum + w, 0);
    const effectiveRequired = calculateEffectiveLength(tankLength, numSheets, headAdjustment);

    if (currentTotal >= effectiveRequired && numSheets > 0) {
      combinations.push({
        sheets: [...currentCombo],
        totalLength: currentTotal,
        effectiveRequired,
        waste: currentTotal - effectiveRequired
      });
      // Don't return — keep looking for better combinations
    }

    if (currentTotal < effectiveRequired || numSheets === 0) {
      for (let i = startIdx; i < sorted.length; i++) {
        currentCombo.push(sorted[i]);
        findCombos(currentCombo, i); // Allow same width again
        currentCombo.pop();
      }
    }
  }

  findCombos([], 0);

  // Sort by waste (ascending), then by fewer sheets
  combinations.sort((a, b) => {
    if (a.waste !== b.waste) return a.waste - b.waste;
    return a.sheets.length - b.sheets.length;
  });

  // Deduplicate combinations with same sheets (different order)
  const seen = new Set();
  const unique = combinations.filter(combo => {
    const key = [...combo.sheets].sort((a, b) => a - b).join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique;
}

/**
 * Group an array of sheet widths into counts
 * @param {number[]} sheets - Array of sheet widths
 * @returns {Object[]} Array of {length, count} objects
 */
function groupSheets(sheets) {
  const counts = {};

  for (const width of sheets) {
    counts[width] = (counts[width] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([length, count]) => ({
      length: parseInt(length),
      count
    }))
    .sort((a, b) => a.length - b.length);
}

/**
 * Format a combination for display
 * @param {Object[]} grouped - Array of {length, count} objects
 * @returns {string} Formatted string like "2 x 48\" + 1 x 60\""
 */
function formatCombination(grouped) {
  return grouped
    .map(({ length, count }) => `${count} x ${length}"`)
    .join(' + ');
}

/**
 * Calculate seam allowance for multiple sheets
 * Each interior seam requires 1.5" overlap
 *
 * @param {number} numSheets - Number of sheets
 * @returns {number} Seam allowance in inches
 */
export function calculateSeamAllowance(numSheets) {
  return Math.max(0, numSheets - 1) * 1.5;
}
