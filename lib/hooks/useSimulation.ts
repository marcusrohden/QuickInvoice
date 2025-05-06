/**
 * Custom hook for managing simulation state
 * Centralizes simulation logic and state management
 */

import { useState, useEffect } from 'react';
import { 
  PrizeConfig, 
  SpinResult, 
  SimulationStats, 
  HouseStatsType
} from '../types/simulation';
import { 
  determinePrizeHit, 
  calculateShortTermRisk, 
  calculateBreakProbabilities, 
  getValidRandomSlot,
  calculateProfit
} from '../services/simulationService';

interface UseSimulationProps {
  totalSlots: number;
  costPerSpin: number;
  defaultPrize: number;
  commissionFee: number;
  prizeConfigs: PrizeConfig[];
}

/**
 * Custom hook for managing the simulation state and logic
 */
export function useSimulation({
  totalSlots,
  costPerSpin,
  defaultPrize,
  commissionFee,
  prizeConfigs
}: UseSimulationProps) {
  // State for simulation results
  const [simulationStats, setSimulationStats] = useState<SimulationStats | null>(null);
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([]);
  
  // State for house statistics
  const [houseStats, setHouseStats] = useState<HouseStatsType>({
    totalEarnings: 0,
    totalSpins: 0,
    totalBreaks: 0,
    shortTermRisk: 0,
    prizeDistribution: {},
    worstBreak: {
      spins: 0,
      profit: 0
    },
    bestBreak: {
      spins: 0,
      profit: 0
    },
    worstBreakProbability: 0,
    bestBreakProbability: 0,
    worstBreakSpinProbability: 0,
    bestBreakSpinProbability: 0
  });
  
  // State for remove hit slots mode
  const [simulationMode, setSimulationMode] = useState<'normal' | 'removeHitSlots'>('normal');
  const [hitSlots, setHitSlots] = useState<number[]>([]);
  const [availableSlots, setAvailableSlots] = useState<number>(totalSlots);
  
  // Calculate remaining slots after special prizes
  const [remainingSlots, setRemainingSlots] = useState(0);
  
  // Update available slots when totalSlots or hitSlots change
  useEffect(() => {
    const usedSlots = prizeConfigs.reduce((total, prize) => total + prize.slots, 0);
    const remaining = totalSlots - usedSlots;
    setRemainingSlots(remaining > 0 ? remaining : 0);
    
    // Update available slots for "Remove Hit Slots" mode
    setAvailableSlots(totalSlots - hitSlots.length);
  }, [prizeConfigs, totalSlots, hitSlots]);
  
  /**
   * Perform a single spin
   */
  const singleSpin = () => {
    // Random selection from all slots
    const currentSpinResult = Math.floor(Math.random() * totalSlots) + 1;
    
    // Determine prize based on slot hit
    const hitResult = determinePrizeHit(currentSpinResult, prizeConfigs, defaultPrize);
    
    // Calculate profit from house perspective
    const { profit, commissionAmount } = calculateProfit(costPerSpin, hitResult.prize, commissionFee);
    
    // Create history entry
    const attempt = spinHistory.length + 1;
    const historyEntry: SpinResult = {
      attempt,
      result: currentSpinResult,
      cost: costPerSpin,
      prize: hitResult.prize,
      profit,
      prizeType: hitResult.prizeType
    };
    
    // Update spin history
    setSpinHistory(prevHistory => [...prevHistory, historyEntry]);
    
    // Update house stats
    setHouseStats(prev => {
      // Update prize distribution count
      const updatedDistribution = { ...prev.prizeDistribution };
      updatedDistribution[hitResult.prizeType] = (updatedDistribution[hitResult.prizeType] || 0) + 1;
      
      // Calculate new total earnings
      const newTotalEarnings = prev.totalEarnings + profit;
      const newTotalSpins = prev.totalSpins + 1;
      
      // Recalculate short-term risk based on new data
      const avgProfitPerSpin = newTotalEarnings / newTotalSpins;
      const updatedShortTermRisk = calculateShortTermRisk(
        prev,
        avgProfitPerSpin,
        costPerSpin,
        prizeConfigs,
        defaultPrize,
        totalSlots,
        remainingSlots
      );
      
      return {
        totalEarnings: newTotalEarnings,
        totalSpins: newTotalSpins,
        prizeDistribution: updatedDistribution,
        // Preserve previous break-related statistics
        worstBreak: prev.worstBreak,
        bestBreak: prev.bestBreak,
        worstBreakProbability: prev.worstBreakProbability,
        bestBreakProbability: prev.bestBreakProbability,
        worstBreakSpinProbability: prev.worstBreakSpinProbability,
        bestBreakSpinProbability: prev.bestBreakSpinProbability,
        shortTermRisk: updatedShortTermRisk,
        totalBreaks: prev.totalBreaks
      };
    });
    
    // Set simulation results based on the latest spin
    setSimulationStats({
      targetHitAttempt: attempt,
      totalCost: costPerSpin,
      finalSpinResult: currentSpinResult,
      finalPrize: hitResult.prize,
      finalProfit: profit,
      finalPrizeType: hitResult.prizeType
    });
  };
  
  /**
   * Perform multiple spins
   * @param spins - Number of spins to perform
   */
  const spinMultipleTimes = (spins: number = 10) => {
    let totalCost = 0;
    let currentSpinResult: number;
    let history: SpinResult[] = [];
    let housePrizeDistribution: Record<string, number> = {};
    let houseEarnings = 0;
    let totalCommission = 0;
    
    // Start with a copy of the current house stats
    if (houseStats.prizeDistribution) {
      housePrizeDistribution = { ...houseStats.prizeDistribution };
    }
    houseEarnings = houseStats.totalEarnings;
    
    for (let attempt = 1; attempt <= spins; attempt++) {
      // Random selection from all slots
      currentSpinResult = Math.floor(Math.random() * totalSlots) + 1;
      totalCost += costPerSpin;
      
      // Determine prize based on slot hit
      const hitResult = determinePrizeHit(currentSpinResult, prizeConfigs, defaultPrize);
      
      // Calculate profit from house perspective
      const { profit, commissionAmount } = calculateProfit(costPerSpin, hitResult.prize, commissionFee);
      totalCommission += commissionAmount;
      
      // Add to history (but limit to last 100 spins for memory/performance)
      if (spins <= 100 || attempt > spins - 100) {
        history.push({
          attempt: spinHistory.length + attempt,
          result: currentSpinResult,
          cost: costPerSpin,
          prize: hitResult.prize,
          profit,
          prizeType: hitResult.prizeType
        });
      }
      
      // Update house stats (locally rather than via setState to improve performance)
      housePrizeDistribution[hitResult.prizeType] = 
        (housePrizeDistribution[hitResult.prizeType] || 0) + 1;
      houseEarnings += profit;
    }
    
    // Update results for the last spin
    const lastAttemptNum = spinHistory.length + spins;
    const lastResult = history.length > 0 
      ? history[history.length - 1] 
      : { 
          attempt: lastAttemptNum,
          result: currentSpinResult!,
          cost: costPerSpin,
          prize: 0,
          profit: costPerSpin - ((costPerSpin * commissionFee) / 100),
          prizeType: 'Unknown'
        };
    
    // Set simulation results from house perspective
    setSimulationStats({
      targetHitAttempt: lastAttemptNum,
      totalCost,
      finalSpinResult: lastResult.result,
      finalPrize: lastResult.prize,
      finalProfit: totalCost - (lastResult.prize * spins) - totalCommission,
      finalPrizeType: lastResult.prizeType
    });
    
    // Update spin history (limit to most recent entries if there are too many)
    setSpinHistory(prevHistory => {
      // Keep at most 500 total spins in history to prevent browser slowdowns
      const combinedHistory = [...prevHistory, ...history];
      if (combinedHistory.length > 500) {
        return combinedHistory.slice(combinedHistory.length - 500);
      }
      return combinedHistory;
    });
    
    // Calculate short-term risk based on updated data
    const totalSpinsCount = houseStats.totalSpins + spins;
    const avgProfitPerSpin = totalSpinsCount > 0 ? houseEarnings / totalSpinsCount : null;
    const updatedShortTermRisk = calculateShortTermRisk(
      houseStats,
      avgProfitPerSpin,
      costPerSpin,
      prizeConfigs,
      defaultPrize,
      totalSlots,
      remainingSlots
    );
    
    // Update house stats
    setHouseStats(prev => ({
      totalEarnings: houseEarnings,
      totalSpins: prev.totalSpins + spins,
      prizeDistribution: housePrizeDistribution,
      // Preserve break-related statistics
      worstBreak: prev.worstBreak,
      bestBreak: prev.bestBreak,
      worstBreakProbability: prev.worstBreakProbability,
      bestBreakProbability: prev.bestBreakProbability,
      worstBreakSpinProbability: prev.worstBreakSpinProbability,
      bestBreakSpinProbability: prev.bestBreakSpinProbability,
      shortTermRisk: updatedShortTermRisk,
      totalBreaks: prev.totalBreaks
    }));
  };
  
  /**
   * Run multiple break simulations (removeHitSlots mode)
   * @param breakCount - Number of breaks to run
   */
  const runBreaks = (breakCount: number = 1) => {
    let totalCost = 0;
    let history: SpinResult[] = [];
    let housePrizeDistribution: Record<string, number> = {};
    let houseEarnings = 0;
    let totalPrizesRemoved = 0;
    let totalCommission = 0;
    
    // Start with a copy of the current house stats
    if (houseStats.prizeDistribution) {
      housePrizeDistribution = { ...houseStats.prizeDistribution };
    }
    houseEarnings = houseStats.totalEarnings;
    
    // For tracking best and worst breaks
    let bestBreakProfit = houseStats.bestBreak?.profit || 0;
    let bestBreakSpins = houseStats.bestBreak?.spins || 0;
    let worstBreakProfit = houseStats.worstBreak?.profit || 0;
    let worstBreakSpins = houseStats.worstBreak?.spins || 0;
    let currentBreakProfit = 0;
    let currentBreakSpins = 0;
    
    // Run the requested number of break cycles
    for (let breakNum = 1; breakNum <= breakCount; breakNum++) {
      // Get total number of prize slots (excluding default slots)
      const totalPrizeSlots = prizeConfigs.reduce((total, prize) => total + prize.slots, 0);
      
      // If there are no prize slots, skip this break
      if (totalPrizeSlots === 0) {
        continue;
      }
      
      // Create a fresh set of hit slots tracking for this break
      let breakHitSlots: number[] = [];
      let remainingPrizeSlots = totalPrizeSlots;
      let breakSpinCount = 0;
      let remainingSlotsToHit = totalSlots; // All slots need to be hit in a break
      
      // Reset tracking for this break
      currentBreakProfit = 0;
      currentBreakSpins = 0;
      
      // Create a list of prize slots that need to be hit (only those with stopWhenHit=true)
      let requiredPrizeConfig: PrizeConfig[] = prizeConfigs.filter(prize => prize.stopWhenHit);
      let requiredPrizeSlots = requiredPrizeConfig.reduce((total, prize) => total + prize.slots, 0);
      let remainingRequiredSlots = requiredPrizeSlots;
      
      // Continue until all required prize slots (those with stopWhenHit=true) are hit in this break
      while (remainingRequiredSlots > 0) {
        breakSpinCount++;
        
        // Get a valid slot (not already hit in this break cycle)
        let validSlot = false;
        let currentSpinResult = 0;
        
        // Find a slot that hasn't been hit yet in this break
        while (!validSlot) {
          const randomSlot = Math.floor(Math.random() * totalSlots) + 1;
          if (!breakHitSlots.includes(randomSlot)) {
            currentSpinResult = randomSlot;
            validSlot = true;
          }
        }
        
        totalCost += costPerSpin;
        currentBreakSpins++;
        
        // Determine prize based on slot hit
        const hitResult = determinePrizeHit(currentSpinResult, prizeConfigs, defaultPrize);
        
        // Calculate profit from house perspective
        const { profit, commissionAmount } = calculateProfit(costPerSpin, hitResult.prize, commissionFee);
        totalCommission += commissionAmount;
        
        // Track per-break profit (from house perspective)
        currentBreakProfit += profit;
        
        // Add to history (with limits for performance)
        const isLastBreak = breakNum === breakCount;
        const isFewBreaks = breakCount <= 5;
        const isImportantSpin = breakHitSlots.length >= totalPrizeSlots - 5; // Last few prize hits
        
        if (isLastBreak || isFewBreaks || isImportantSpin) {
          history.push({
            attempt: spinHistory.length + history.length + 1,
            result: currentSpinResult,
            cost: costPerSpin,
            prize: hitResult.prize,
            profit,
            prizeType: hitResult.prizeType
          });
        }
        
        // Update house stats locally
        housePrizeDistribution[hitResult.prizeType] = 
          (housePrizeDistribution[hitResult.prizeType] || 0) + 1;
        houseEarnings += profit;
        
        // Track this slot as hit in this break
        breakHitSlots.push(currentSpinResult);
        
        // If we hit a special prize (not default), track it separately
        if (hitResult.isSpecialPrize) {
          remainingPrizeSlots--;
          totalPrizesRemoved++;
          
          // If this is a required prize (stopWhenHit=true), decrement the counter
          if (hitResult.prizeIndex !== undefined) {
            const hitPrize = prizeConfigs[hitResult.prizeIndex];
            if (hitPrize && hitPrize.stopWhenHit) {
              remainingRequiredSlots--;
            }
          }
        }
      }
      
      // After each break, update the best/worst break stats if applicable
      if (currentBreakSpins > 0) {
        // Check if this is the best break (most profitable per spin)
        const currentBreakProfitPerSpin = currentBreakProfit / currentBreakSpins;
        const bestBreakProfitPerSpin = bestBreakSpins > 0 ? 
          bestBreakProfit / bestBreakSpins : 0;
        
        if (currentBreakProfitPerSpin > bestBreakProfitPerSpin || bestBreakSpins === 0) {
          bestBreakProfit = currentBreakProfit;
          bestBreakSpins = currentBreakSpins;
        }
        
        // Check if this is the worst break (least profitable per spin)
        const worstBreakProfitPerSpin = worstBreakSpins > 0 ? 
          worstBreakProfit / worstBreakSpins : 0;
        
        if (currentBreakProfitPerSpin < worstBreakProfitPerSpin || worstBreakSpins === 0) {
          worstBreakProfit = currentBreakProfit;
          worstBreakSpins = currentBreakSpins;
        }
      }
    }
    
    // Update spin history
    setSpinHistory(prevHistory => {
      // Keep at most 500 total spins in history to prevent browser slowdowns
      const combinedHistory = [...prevHistory, ...history];
      if (combinedHistory.length > 500) {
        return combinedHistory.slice(combinedHistory.length - 500);
      }
      return combinedHistory;
    });
    
    // Calculate break probabilities
    const {
      worstBreakProbability,
      bestBreakProbability,
      worstBreakSpinProbability,
      bestBreakSpinProbability
    } = calculateBreakProbabilities(
      worstBreakSpins,
      bestBreakSpins,
      (houseStats.totalBreaks || 0) + breakCount,
      totalSlots
    );
    
    // Calculate short-term risk
    const shortTermRisk = calculateShortTermRisk(
      houseStats,
      houseStats.totalSpins > 0 ? houseEarnings / (houseStats.totalSpins + history.length) : null,
      costPerSpin,
      prizeConfigs,
      defaultPrize,
      totalSlots,
      remainingSlots
    );
    
    // Update house stats in a single update at the end
    setHouseStats(prev => ({
      totalEarnings: houseEarnings,
      totalSpins: prev.totalSpins + history.length,
      totalBreaks: (prev.totalBreaks || 0) + breakCount,
      prizeDistribution: housePrizeDistribution,
      shortTermRisk,
      worstBreak: {
        spins: worstBreakSpins,
        profit: worstBreakProfit
      },
      bestBreak: {
        spins: bestBreakSpins,
        profit: bestBreakProfit
      },
      worstBreakProbability,
      bestBreakProbability,
      worstBreakSpinProbability,
      bestBreakSpinProbability
    }));
  };
  
  /**
   * Clear all simulation history and stats
   */
  const clearHistory = () => {
    setSpinHistory([]);
    setSimulationStats(null);
    setHouseStats({
      totalEarnings: 0,
      totalSpins: 0,
      totalBreaks: 0,
      shortTermRisk: 0,
      prizeDistribution: {},
      worstBreak: {
        spins: 0,
        profit: 0
      },
      bestBreak: {
        spins: 0,
        profit: 0
      },
      worstBreakProbability: 0,
      bestBreakProbability: 0,
      worstBreakSpinProbability: 0,
      bestBreakSpinProbability: 0
    });
    
    // Reset hit slots for "Remove Hit Slots" mode
    setHitSlots([]);
  };
  
  return {
    // State
    simulationStats,
    spinHistory,
    houseStats,
    simulationMode,
    hitSlots,
    availableSlots,
    remainingSlots,
    
    // Actions
    setSimulationMode,
    singleSpin,
    spinMultipleTimes,
    runBreaks,
    clearHistory,
    
    // Helpers
    setHitSlots
  };
}
