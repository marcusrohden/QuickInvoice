/**
 * Simulation Types
 * Type definitions for the simulation system
 */

/**
 * Result of a single spin
 */
export interface SpinResult {
  attempt: number;
  result: number;
  cost: number;
  prize: number;
  profit: number;
  prizeType: string;
}

/**
 * Statistics for a simulation run
 */
export interface SimulationStats {
  targetHitAttempt: number;
  totalCost: number;
  finalSpinResult: number;
  finalPrize: number;
  finalProfit: number;
  finalPrizeType: string;
}

/**
 * Statistics from the house's perspective
 */
export interface HouseStatsType {
  totalEarnings: number;
  totalSpins: number;
  totalBreaks?: number; // Count of complete breaks for Remove Hit Slots mode
  nonTargetPrizes?: number;
  targetPrizes?: number;
  shortTermRisk?: number; // Odds of negative profit in next break based on current earnings
  prizeDistribution: Record<string, number>; // Count of each prize type hit
  worstBreak?: {
    spins: number;
    profit: number;
  };
  bestBreak?: {
    spins: number;
    profit: number;
  };
  worstBreakProbability?: number; // Probability of hitting consecutive worst breaks
  bestBreakProbability?: number; // Probability of hitting consecutive best breaks
  // Probabilities based on spins rather than breaks
  worstBreakSpinProbability?: number;
  bestBreakSpinProbability?: number;
}

/**
 * Configuration for a prize
 */
export interface PrizeConfig {
  id: string;
  name: string;
  unitCost: number; // renamed from value to be more descriptive
  slots: number;
  stopWhenHit: boolean; // Whether to stop the break when all instances of this prize are hit
}

/**
 * Type for simulation modes
 */
export type SimulationMode = 'normal' | 'removeHitSlots';
