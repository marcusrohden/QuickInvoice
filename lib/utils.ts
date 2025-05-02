// Utility functions for the Roulette Simulator application
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SpinResult {
  attempt: number
  result: number
  cost: number
  prize: number
  profit: number
  prizeType: string
}

export interface SimulationStats {
  targetHitAttempt: number
  totalCost: number
  finalSpinResult: number
  finalPrize: number
  finalProfit: number
  finalPrizeType: string
}

export interface HouseStatsType {
  totalEarnings: number
  totalSpins: number
  totalBreaks?: number // Count of complete breaks for Remove Hit Slots mode
  nonTargetPrizes?: number
  targetPrizes?: number
  shortTermRisk?: number // Odds of negative profit after 3 breaks
  prizeDistribution: Record<string, number> // Count of each prize type hit
  worstBreak?: {
    spins: number
    profit: number
  }
  bestBreak?: {
    spins: number
    profit: number
  }
  worstBreakProbability?: number // Probability of hitting consecutive worst breaks
  bestBreakProbability?: number // Probability of hitting consecutive best breaks
  // Probabilities based on spins rather than breaks
  worstBreakSpinProbability?: number
  bestBreakSpinProbability?: number
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}
