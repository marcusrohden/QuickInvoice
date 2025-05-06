/**
 * Simulation Service
 * Handles the core logic for the roulette simulation
 */

import { 
  PrizeConfig, 
  PrizeHitResult, 
  SpinResult,
  HouseStatsType,
  SimulationStats
} from '../types/simulation';

/**
 * Determines which prize was hit based on slot number
 * @param slotNumber - The slot that was hit
 * @param prizeConfigs - Array of prize configurations
 * @param defaultPrize - The default prize amount
 * @returns Object containing prize details
 */
export function determinePrizeHit(
  slotNumber: number, 
  prizeConfigs: PrizeConfig[] = [],
  defaultPrize: number
): PrizeHitResult {
  let slotCounter = 0;
  
  // Check if the slot hit any of the special prize configurations
  for (let i = 0; i < prizeConfigs.length; i++) {
    const prizeConfig = prizeConfigs[i];
    const startSlot = slotCounter + 1;
    const endSlot = slotCounter + prizeConfig.slots;
    
    if (slotNumber >= startSlot && slotNumber <= endSlot) {
      return { 
        prize: prizeConfig.unitCost,
        prizeType: prizeConfig.name,
        prizeIndex: i,
        isSpecialPrize: true,
        relativeSlotIndex: slotNumber - startSlot // Position within this prize's slots
      };
    }
    
    slotCounter += prizeConfig.slots;
  }
  
  // If no special prize was hit, return the default prize
  return { 
    prize: defaultPrize,
    prizeType: 'Default Prize',
    isSpecialPrize: false,
    relativeSlotIndex: slotNumber - slotCounter // Position within default slots
  };
}

/**
 * Calculate short-term risk based on current data
 * @param houseStats - Current house statistics
 * @param avgProfitPerSpin - Average profit per spin
 * @param costPerSpin - Cost per spin
 * @param prizeConfigs - Array of prize configurations
 * @param defaultPrize - Default prize amount
 * @param totalSlots - Total number of slots
 * @param remainingSlots - Number of default slots remaining
 * @returns Probability of negative profit in next break
 */
export function calculateShortTermRisk(
  houseStats: HouseStatsType,
  avgProfitPerSpin: number | null,
  costPerSpin: number,
  prizeConfigs: PrizeConfig[],
  defaultPrize: number,
  totalSlots: number,
  remainingSlots: number
): number {
  let shortTermRisk = 0;
  
  if (houseStats.totalSpins > 0 && avgProfitPerSpin !== null) {
    // Using actual data to calculate risk
    if (avgProfitPerSpin < 0) {
      // We're already losing money on average, so risk is higher
      shortTermRisk = Math.min(0.9, Math.abs(avgProfitPerSpin / costPerSpin) + 0.4);
    } else if (houseStats.worstBreak && houseStats.worstBreak.profit < 0) {
      // We've seen losing breaks before, so use that data
      const worstBreakLossPerSpin = houseStats.worstBreak.profit / houseStats.worstBreak.spins;
      shortTermRisk = Math.min(0.75, Math.abs(worstBreakLossPerSpin / costPerSpin) + 0.25);
    } else {
      // We haven't seen negative breaks yet, but there's still some risk
      // Lower risk for higher positive profit per spin
      shortTermRisk = Math.max(0.05, 0.15 - (avgProfitPerSpin / costPerSpin * 0.1));
    }
  } else {
    // No spins yet, estimate based on prize configuration
    const totalPrizeValue = prizeConfigs.reduce((sum, prize) => 
      sum + prize.unitCost * prize.slots, 0) + defaultPrize * remainingSlots;
    const avgPrizeValue = totalPrizeValue / totalSlots;
    
    if (avgPrizeValue > costPerSpin) {
      // If average prize is higher than cost, probability of loss is higher
      shortTermRisk = Math.min(0.9, (avgPrizeValue / costPerSpin) * 0.7);
    } else {
      // Still some risk even with favorable expected value
      shortTermRisk = Math.max(0.05, avgPrizeValue / costPerSpin * 0.4);
    }
  }
  
  return shortTermRisk;
}

/**
 * Calculate break probabilities based on historical data
 * @param worstBreakSpins - Number of spins in worst break
 * @param bestBreakSpins - Number of spins in best break
 * @param totalBreaks - Total number of breaks
 * @param totalSlots - Total number of slots
 * @returns Object containing probability calculations
 */
export function calculateBreakProbabilities(
  worstBreakSpins: number,
  bestBreakSpins: number,
  totalBreaks: number,
  totalSlots: number
): { 
  worstBreakProbability: number; 
  bestBreakProbability: number; 
  worstBreakSpinProbability: number; 
  bestBreakSpinProbability: number; 
} {
  // Calculate probabilities based on actual occurrences if we have enough data
  let worstBreakProbability = 0;
  let bestBreakProbability = 0;
  let worstBreakSpinProbability = 0;
  let bestBreakSpinProbability = 0;
  
  if (totalBreaks > 0) {
    // Calculate based on empirical frequency
    // Higher numbers of observations give more accurate probabilities
    if (totalBreaks >= 10) {
      // More statistically significant with more data
      worstBreakProbability = Math.max(0.01, 1 / totalBreaks);
      bestBreakProbability = Math.max(0.01, 1 / totalBreaks);
    } else {
      // Conservative estimate with less data
      worstBreakProbability = Math.max(0.05, 1 / (totalBreaks * 2));
      bestBreakProbability = Math.max(0.05, 1 / (totalBreaks * 2));
    }
  } else {
    // Theoretical probabilities if no breaks have occurred yet
    worstBreakProbability = 0.1; // Default starting probabilities
    bestBreakProbability = 0.1;
  }
  
  // Probability based on consecutive spins (one spin after another)
  if (worstBreakSpins > 0) {
    worstBreakSpinProbability = Math.pow(1/totalSlots, worstBreakSpins);
  }
  
  if (bestBreakSpins > 0) {
    bestBreakSpinProbability = Math.pow(1/totalSlots, bestBreakSpins);
  }
  
  return {
    worstBreakProbability,
    bestBreakProbability,
    worstBreakSpinProbability,
    bestBreakSpinProbability
  };
}

/**
 * Get a valid slot that hasn't been hit yet
 * @param totalSlots - Total number of slots
 * @param hitSlots - Array of slots that have already been hit
 * @returns A valid slot number
 */
export function getValidRandomSlot(totalSlots: number, hitSlots: number[]): number {
  // If all slots are hit, reset
  if (hitSlots.length >= totalSlots) {
    return Math.floor(Math.random() * totalSlots) + 1;
  }
  
  // Try to find a slot that hasn't been hit yet
  let attempts = 0;
  let randomSlot;
  do {
    randomSlot = Math.floor(Math.random() * totalSlots) + 1;
    attempts++;
    
    // Safety valve - if we've tried too many times, find first non-hit slot
    if (attempts > 100) {
      for (let i = 1; i <= totalSlots; i++) {
        if (!hitSlots.includes(i)) {
          return i;
        }
      }
      return randomSlot; // Fallback
    }
  } while (hitSlots.includes(randomSlot));
  
  return randomSlot;
}

/**
 * Calculate house earnings after applying commission
 * @param costPerSpin - Cost per spin
 * @param prize - Prize amount
 * @param commissionFee - Commission fee percentage
 * @returns Net profit after commission
 */
export function calculateProfit(costPerSpin: number, prize: number, commissionFee: number): {
  profit: number;
  commissionAmount: number;
} {
  // Calculate commission amount (percentage of the cost per spin)
  const commissionAmount = (costPerSpin * commissionFee) / 100;
  
  // Calculate profit from house perspective (price received minus prize paid minus commission)
  const profit = costPerSpin - prize - commissionAmount;
  
  return { profit, commissionAmount };
}
