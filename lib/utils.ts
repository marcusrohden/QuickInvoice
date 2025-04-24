// Utility functions for the Roulette Simulator application

export interface SpinResult {
  attempt: number
  result: number
  cost: number
  prize: number
  profit: number
}

export interface SimulationStats {
  targetHitAttempt: number
  totalCost: number
  finalSpinResult: number
  finalPrize: number
  finalProfit: number
}

export interface HouseStatsType {
  totalEarnings: number
  totalSpins: number
  nonTargetPrizes: number
  targetPrizes: number
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}
