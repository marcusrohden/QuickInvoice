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
  nonTargetPrizes?: number
  targetPrizes?: number
  prizeDistribution: Record<string, number> // Count of each prize type hit
  worstBreak?: {
    spins: number
    profit: number
  }
  bestBreak?: {
    spins: number
    profit: number
  }
  worstBreakProbability?: number // Probability of hitting 5 worst breaks consecutively
  bestBreakProbability?: number // Probability of hitting 5 best breaks consecutively
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}
