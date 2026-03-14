/**
 * Waste Optimizer
 *
 * Finds the optimal combination of steel sheets to cover a required length
 * with minimum waste, accounting for seam allowances
 */

import { standardLengths } from './weightTable.js';

/**
 * Calculate the effective length needed including seam allowances
 * Formula: required = tank_length + (num_sections - 1)
 *
 * @param {number} tankLength - Tank length in inches
 * @param {number} numSections - Number of sheet sections
 * @returns {number} Effective length needed in inches
 */
export function calculateEffectiveLength(tankLength, numSections) {
  return tankLength + Math.max(0, numSections - 1);
}

/**
 * Find the optimal sheet combination (least waste)
 * Accounts for seam allowances when using multiple sheets
 *
 * @param {number} tankLength - Tank length in inches (raw, before seam allowance)
 * @param {number[]} availableLengths - Available sheet lengths in inches
 * @returns {Object} Optimal combination with details
 */
export function findOptimalSheetCombination(tankLength, availableLengths = standardLengths) {
  const sorted = [...availableLengths].sort((a, b) => a - b);

  // First, check if a single sheet can cover it (no seam allowance needed)
  for (const length of sorted) {
    if (length >= tankLength) {
      return {
        sheets: [{ length, count: 1 }],
        totalLength: length,
        waste: length - tankLength,
        description: `1 x ${length}"`
      };
    }
  }

  // Need multiple sheets - find optimal combination accounting for seam allowances
  const combinations = findAllCombinationsWithSeams(tankLength, availableLengths, 8);

  if (combinations.length === 0) {
    // Fallback: use largest sheet and calculate how many needed
    const largest = Math.max(...availableLengths);
    const count = Math.ceil(tankLength / (largest - 1)) + 1; // Account for seams
    const effectiveRequired = calculateEffectiveLength(tankLength, count);
    const totalLength = largest * count;
    return {
      sheets: [{ length: largest, count }],
      totalLength,
      waste: totalLength - effectiveRequired,
      description: `${count} x ${largest}"`
    };
  }

  // Get the best combination (least waste)
  const best = combinations[0];

  // Group sheets by length for cleaner output
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
 * Find all combinations that can cover the tank length including seam allowances
 *
 * @param {number} tankLength - Raw tank length in inches
 * @param {number[]} availableLengths - Available sheet lengths in inches
 * @param {number} maxSheets - Maximum number of sheets to consider
 * @returns {Object[]} Array of valid combinations sorted by waste (ascending)
 */
function findAllCombinationsWithSeams(tankLength, availableLengths = standardLengths, maxSheets = 8) {
  const combinations = [];
  const sorted = [...availableLengths].sort((a, b) => b - a); // Sort descending

  // Try all combinations up to maxSheets
  function findCombos(currentCombo, startIdx) {
    const numSheets = currentCombo.length;
    if (numSheets > maxSheets) return;

    // Calculate current total and required length with seams
    const currentTotal = currentCombo.reduce((sum, len) => sum + len, 0);
    const effectiveRequired = calculateEffectiveLength(tankLength, numSheets);

    // If we've met or exceeded the requirement, record this combination
    if (currentTotal >= effectiveRequired && numSheets > 0) {
      combinations.push({
        sheets: [...currentCombo],
        totalLength: currentTotal,
        effectiveRequired,
        waste: currentTotal - effectiveRequired
      });
      // Don't return - keep looking for potentially better combinations
    }

    // If we haven't met the requirement yet, try adding more sheets
    if (currentTotal < effectiveRequired || numSheets === 0) {
      for (let i = startIdx; i < sorted.length; i++) {
        currentCombo.push(sorted[i]);
        findCombos(currentCombo, i); // Allow same length again
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
 * Group an array of sheet lengths into counts
 * @param {number[]} sheets - Array of sheet lengths
 * @returns {Object[]} Array of {length, count} objects
 */
function groupSheets(sheets) {
  const counts = {};

  for (const length of sheets) {
    counts[length] = (counts[length] || 0) + 1;
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
 * Each interior seam requires 1" overlap
 *
 * @param {number} numSheets - Number of sheets
 * @returns {number} Seam allowance in inches
 */
export function calculateSeamAllowance(numSheets) {
  return Math.max(0, numSheets - 1);
}
