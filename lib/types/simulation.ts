/**
 * Types for the Roulette Simulator application
 * Centralizes all type definitions for better maintainability and consistency
 */

/**
 * Represents the result of a single spin
 */
export interface SpinResult {
  attempt: number;   // Spin attempt number
  result: number;    // The slot that was hit
  cost: number;      // Cost/price per spin
  prize: number;     // Prize amount won
  profit: number;    // Profit from house perspective (cost - prize - commission)
  prizeType: string; // Type of prize that was hit
}

/**
 * Statistics from a simulation run
 */
export interface SimulationStats {
  targetHitAttempt: number;   // The attempt number when the target was hit
  totalCost: number;          // Total cost of all spins
  finalSpinResult: number;    // Last spin result
  finalPrize: number;         // Last prize won
  finalProfit: number;        // Final profit from house perspective
  finalPrizeType: string;     // Type of last prize hit
}

/**
 * Statistics from the house's perspective
 */
export interface HouseStatsType {
  totalEarnings: number;                 // Total profit earned by the house
  totalSpins: number;                   // Total number of spins
  prizeDistribution: Record<string, number>; // Count of each prize type hit
  worstBreak?: {
    spins: number;                       // Number of spins in worst-performing break
    profit: number;                      // Profit in worst-performing break
  };
  bestBreak?: {
    spins: number;                       // Number of spins in best-performing break
    profit: number;                      // Profit in best-performing break
  };
  worstBreakProbability?: number;       // Probability of hitting worst breaks in sequence
  bestBreakProbability?: number;        // Probability of hitting best breaks in sequence
  worstBreakSpinProbability?: number;   // Probability of hitting worst break in consecutive spins
  bestBreakSpinProbability?: number;    // Probability of hitting best break in consecutive spins
  shortTermRisk?: number;               // Probability of going negative in next break
  totalBreaks?: number;                 // Count of complete breaks for Remove Hit Slots mode
}

/**
 * Prize configuration for a specific prize type
 */
export interface PrizeConfig {
  id: string;         // Unique ID for the prize
  name: string;       // Descriptive name of the prize
  unitCost: number;   // Cost per unit of the prize
  slots: number;      // Number of slots allocated to this prize
  stopWhenHit: boolean; // Whether to stop the break when all instances of this prize are hit
}

/**
 * Result of a prize hit determination
 */
export interface PrizeHitResult {
  prize: number;           // Prize amount won
  prizeType: string;       // Type of prize hit
  prizeIndex?: number;     // Index of the prize in the configurations array
  isSpecialPrize: boolean; // Whether this is a special prize or default
  relativeSlotIndex?: number; // Position within this prize's slots
}

/**
 * Configuration for the simulation
 */
export interface SimulationConfig {
  totalSlots: number;      // Total number of slots on the wheel
  costPerSpin: number;     // Cost/price per spin
  defaultPrize: number;    // Prize amount for default slots
  commissionFee: number;   // Platform commission fee percentage
  prizeConfigs: PrizeConfig[]; // Special prize configurations
}
