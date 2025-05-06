/**
 * Simulation Service
 * Core logic for simulation calculations
 */

import {
  HouseStatsType,
  PrizeConfig,
  SpinResult
} from '../types/simulation';

/**
 * Result of a prize hit calculation
 */
export interface PrizeHitResult {
  prizeType: string;
  prize: number;
  profit: number;
  isSpecialPrize?: boolean;
  prizeIndex?: number;
}

/**
 * Result of a profit calculation
 */
export interface ProfitResult {
  profit: number;
  commissionAmount: number;
}

/**
 * Calculate which prize was hit based on slot number
 * @param slotNumber - The slot that was hit
 * @param prizeConfigs - Array of prize configurations
 * @param defaultPrize - Default prize value for slots not covered by prize configs
 * @returns Prize hit result containing prize type, value, and profit information
 */
export function determinePrizeHit(
  slotNumber: number,
  prizeConfigs: PrizeConfig[],
  defaultPrize: number
): PrizeHitResult {
  // Track slot allocation
  let slotsSoFar = 0;
  
  // Check if the slot falls within a prize configuration
  for (let i = 0; i < prizeConfigs.length; i++) {
    const config = prizeConfigs[i];
    const configUpperBound = slotsSoFar + config.slots;
    
    if (slotNumber > slotsSoFar && slotNumber <= configUpperBound) {
      return {
        prizeType: config.name,
        prize: config.unitCost,
        profit: 0, // Profit to be calculated later with cost information
        isSpecialPrize: true,
        prizeIndex: i
      };
    }
    
    slotsSoFar = configUpperBound;
  }
  
  // If no specific prize configuration matches, use the default prize
  return {
    prizeType: 'Default Prize',
    prize: defaultPrize,
    profit: 0, // Profit to be calculated later with cost information
    isSpecialPrize: false
  };
}

/**
 * Calculate profit from house perspective
 * @param costPerSpin - Cost per spin
 * @param prizeCost - Cost of the prize
 * @param commissionFee - Platform commission fee percentage
 * @returns Profit result containing profit and commission amount
 */
export function calculateProfit(
  costPerSpin: number,
  prizeCost: number,
  commissionFee: number
): ProfitResult {
  const commissionAmount = (costPerSpin * commissionFee) / 100;
  const adjustedCost = costPerSpin - commissionAmount;
  const profit = adjustedCost - prizeCost;
  
  return {
    profit,
    commissionAmount
  };
}

/**
 * For backward compatibility - redirects to determinePrizeHit
 * @deprecated Use determinePrizeHit instead
 */
export function calculatePrizeHit(
  slotNumber: number,
  prizeConfigs: PrizeConfig[],
  defaultPrize: number,
  costPerSpin: number,
  commissionFee: number
): PrizeHitResult {
  const hitResult = determinePrizeHit(slotNumber, prizeConfigs, defaultPrize);
  const adjustedCost = costPerSpin * (1 - commissionFee / 100);
  hitResult.profit = adjustedCost - hitResult.prize;
  return hitResult;
}

/**
 * Get a valid random slot that hasn't been hit yet
 * @param totalSlots - Total number of slots
 * @param hitSlots - Array of already hit slot numbers
 * @returns A valid slot number
 */
export function getValidRandomSlot(totalSlots: number, hitSlots: number[]): number {
  if (hitSlots.length >= totalSlots) {
    throw new Error('All slots have been hit');
  }
  
  let attempts = 0;
  const maxAttempts = totalSlots * 2; // Prevent infinite loop
  
  while (attempts < maxAttempts) {
    const randomSlot = Math.floor(Math.random() * totalSlots) + 1;
    if (!hitSlots.includes(randomSlot)) {
      return randomSlot;
    }
    attempts++;
  }
  
  // If we're here, we've made too many attempts. Find first available slot systematically
  for (let i = 1; i <= totalSlots; i++) {
    if (!hitSlots.includes(i)) {
      return i;
    }
  }
  
  // This should never happen if hitSlots.length < totalSlots check is working
  throw new Error('Could not find a valid slot');
}

/**
 * Calculate short-term risk based on current earnings and configuration
 * @param stats - House statistics or total earnings number
 * @param avgProfitPerSpin - Average profit per spin or null if no spins
 * @param costPerSpin - Cost per spin
 * @param prizeConfigs - Prize configurations
 * @param defaultPrize - Default prize value
 * @param totalSlots - Total number of slots
 * @param remainingSlots - Number of remaining slots after prize allocations
 * @param simulationMode - Simulation mode ('normal' or 'removeHitSlots')
 * @returns Probability of going negative in the next break
 */
export function calculateShortTermRisk(
  stats: HouseStatsType | number,
  avgProfitPerSpin: number | null,
  costPerSpin: number,
  prizeConfigs: PrizeConfig[],
  defaultPrize: number,
  totalSlots: number,
  remainingSlots: number = 0,
  simulationMode: 'normal' | 'removeHitSlots' = 'normal',
  commissionFee: number = 0
): number {
  // Extract earnings value from either a number or HouseStatsType
  const earnings = typeof stats === 'number' ? stats : stats.totalEarnings;
  if (simulationMode === 'normal') {
    // For normal mode, calculate risk of a single spin pushing earnings negative
    if (earnings <= 0) return 1; // Already negative, risk is 100%
    
    // Calculate the worst-case loss (highest prize payout)
    let worstCasePrize = defaultPrize;
    for (const config of prizeConfigs) {
      if (config.unitCost > worstCasePrize) {
        worstCasePrize = config.unitCost;
      }
    }
    
    // Apply commission fee to the cost per spin
    const adjustedCost = costPerSpin * (1 - (commissionFee / 100));
    const worstCaseProfit = adjustedCost - worstCasePrize;
    
    // If worst case profit is positive, no risk
    if (worstCaseProfit >= 0) return 0;
    
    // Calculate how many worst-case losses would deplete earnings
    const hitsToNegative = Math.ceil(earnings / Math.abs(worstCaseProfit));
    
    // Calculate probability of hitting exact slots with worst payout
    const worstPrizeConfig = prizeConfigs.find(c => c.unitCost === worstCasePrize);
    const worstPrizeSlotCount = worstPrizeConfig?.slots || 0;
    const probabilityOfWorstCase = worstPrizeSlotCount / totalSlots;
    
    // Return probability of consecutive hits depleting earnings
    return Math.pow(probabilityOfWorstCase, hitsToNegative);
  } else {
    // For removeHitSlots mode, calculate risk of next full break pushing earnings negative
    if (earnings <= 0) return 1; // Already negative, risk is 100%
    
    // Get items with stopWhenHit true to determine break end condition
    const stopWhenHitConfigs = prizeConfigs.filter(config => config.stopWhenHit);
    if (stopWhenHitConfigs.length === 0) return 0; // No stop conditions, no break risk
    
    // Calculate the expected cost of a break
    let expectedBreakCost = 0;
    for (const config of stopWhenHitConfigs) {
      // Expected spins to hit this prize is totalSlots / prize slots
      expectedBreakCost += (totalSlots / config.slots) * (costPerSpin - defaultPrize);
    }
    
    // Apply commission fee to the expected break cost
    expectedBreakCost = expectedBreakCost * (1 - (commissionFee / 100));
    
    // If break is profitable on average, no risk
    if (expectedBreakCost <= 0) return 0;
    
    // If a break costs more than current earnings, high risk
    if (expectedBreakCost >= earnings) return 0.75; // High but not certain
    
    // Calculate probability that a break costs more than average
    // This is a simplified approximation
    return (expectedBreakCost / earnings) * 0.5;
  }
}

/**
 * Initialize or reset house statistics
 * @returns Empty house statistics object
 */
export function initializeHouseStats(): HouseStatsType {
  return {
    totalEarnings: 0,
    totalSpins: 0,
    prizeDistribution: {}
  };
}

/**
 * Update house statistics with a new spin result
 * @param stats - Current house statistics
 * @param result - New spin result
 * @returns Updated house statistics
 */
export function updateHouseStats(stats: HouseStatsType, result: SpinResult): HouseStatsType {
  // Create a copy to avoid mutating the original
  const updatedStats = { ...stats };
  
  // Update basic counters
  updatedStats.totalEarnings += result.profit;
  updatedStats.totalSpins++;
  
  // Update prize distribution
  if (!updatedStats.prizeDistribution[result.prizeType]) {
    updatedStats.prizeDistribution[result.prizeType] = 0;
  }
  updatedStats.prizeDistribution[result.prizeType]++;
  
  return updatedStats;
}

/**
 * Calculate break probabilities based on best and worst breaks
 * @param worstBreakSpins - Number of spins in the worst break
 * @param bestBreakSpins - Number of spins in the best break
 * @param totalBreaks - Total number of breaks run
 * @param totalSlots - Total number of slots
 * @returns Object containing break and spin probabilities
 */
export interface BreakProbabilities {
  worstBreakProbability: number;
  bestBreakProbability: number;
  worstBreakSpinProbability: number;
  bestBreakSpinProbability: number;
}

export function calculateBreakProbabilities(
  worstBreakSpins: number,
  bestBreakSpins: number,
  totalBreaks: number,
  totalSlots: number
): BreakProbabilities {
  // Calculate break occurrence probabilities (simple frequency method)
  const worstBreakProbability = totalBreaks > 0 ? 1 / totalBreaks : 0;
  const bestBreakProbability = totalBreaks > 0 ? 1 / totalBreaks : 0;
  
  // Calculate spin-based probabilities (probability of all sequences)
  const worstBreakSpinProbability = worstBreakSpins > 0 ? 
    Math.pow(worstBreakProbability, worstBreakSpins) : 0;
  const bestBreakSpinProbability = bestBreakSpins > 0 ? 
    Math.pow(bestBreakProbability, bestBreakSpins) : 0;
  
  return {
    worstBreakProbability,
    bestBreakProbability,
    worstBreakSpinProbability,
    bestBreakSpinProbability
  };
}

/**
 * Update house statistics with break performance data
 * @param stats - Current house statistics
 * @param spins - Number of spins in the break
 * @param profit - Total profit from the break
 * @param totalBreaks - Total number of breaks run so far
 * @returns Updated house statistics with break performance data
 */
export function updateBreakPerformance(
  stats: HouseStatsType,
  spins: number,
  profit: number,
  totalBreaks: number
): HouseStatsType {
  if (spins <= 0) {
    return stats; // Don't update with invalid data
  }
  
  // Create a copy to avoid mutating the original
  const updatedStats = { ...stats };
  
  // Update totalBreaks count
  updatedStats.totalBreaks = totalBreaks;
  
  // Calculate profit per spin for this break
  const profitPerSpin = profit / spins;
  
  // Update best break if this is better than current best
  if (
    !updatedStats.bestBreak ||
    (updatedStats.bestBreak && profitPerSpin > (updatedStats.bestBreak.profit / updatedStats.bestBreak.spins))
  ) {
    updatedStats.bestBreak = { spins, profit };
    
    // Calculate probability of seeing consecutive best breaks
    if (totalBreaks > 0) {
      updatedStats.bestBreakProbability = 1 / totalBreaks;
      updatedStats.bestBreakSpinProbability = Math.pow(updatedStats.bestBreakProbability, spins);
    }
  }
  
  // Update worst break if this is worse than current worst
  if (
    !updatedStats.worstBreak ||
    (updatedStats.worstBreak && profitPerSpin < (updatedStats.worstBreak.profit / updatedStats.worstBreak.spins))
  ) {
    updatedStats.worstBreak = { spins, profit };
    
    // Calculate probability of seeing consecutive worst breaks
    if (totalBreaks > 0) {
      updatedStats.worstBreakProbability = 1 / totalBreaks;
      updatedStats.worstBreakSpinProbability = Math.pow(updatedStats.worstBreakProbability, spins);
    }
  }
  
  return updatedStats;
}
