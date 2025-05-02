'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Header } from '@/components/Header'
import { SaveConfigurationForm } from '@/components/SaveConfigurationForm'
import { useSearchParams } from 'next/navigation'

// Define types
interface SpinResult {
  attempt: number
  result: number
  cost: number
  prize: number
  profit: number
  prizeType: string
}

interface SimulationStats {
  targetHitAttempt: number
  totalCost: number
  finalSpinResult: number
  finalPrize: number
  finalProfit: number
  finalPrizeType: string
}

interface HouseStatsType {
  totalEarnings: number
  totalSpins: number
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

interface PrizeConfig {
  id: string
  name: string
  unitCost: number // renamed from value to be more descriptive
  slots: number
}

export default function Home() {
  // Get search params to check if we're loading a configuration
  const searchParams = useSearchParams();
  
  // Game parameters state
  const [totalSlots, setTotalSlots] = useState(25)
  const [costPerSpin, setCostPerSpin] = useState(25)
  const [defaultPrize, setDefaultPrize] = useState(10)
  
  // Prize configurations with their quantity and unit cost
  const [prizeConfigs, setPrizeConfigs] = useState<PrizeConfig[]>([
    { id: "prize1", name: "Prize X", unitCost: 50, slots: 1 },
    { id: "prize2", name: "Prize Z", unitCost: 30, slots: 3 }
  ])
  
  // Calculate remaining slots after special prizes
  const [remainingSlots, setRemainingSlots] = useState(21)
  
  // Input for new prize configuration
  const [newPrizeName, setNewPrizeName] = useState('')
  const [newPrizeValue, setNewPrizeValue] = useState(20)
  const [newPrizeSlots, setNewPrizeSlots] = useState(1)
  
  // Modal state
  const [showPrizeModal, setShowPrizeModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  
  // Simulation mode: 'normal' or 'removeHitSlots'
  const [simulationMode, setSimulationMode] = useState<'normal' | 'removeHitSlots'>('normal')
  
  // Track hit slots for removeHitSlots mode
  const [hitSlots, setHitSlots] = useState<number[]>([])
  const [availableSlots, setAvailableSlots] = useState<number>(totalSlots)

  // Simulation results
  const [simulationStats, setSimulationStats] = useState<SimulationStats | null>(null)
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([])
  
  // House stats
  const [houseStats, setHouseStats] = useState<HouseStatsType>({
    totalEarnings: 0,
    totalSpins: 0,
    prizeDistribution: {}, // Initialize empty object for prize distribution counts
    worstBreak: {
      spins: 0,
      profit: 0
    },
    bestBreak: {
      spins: 0,
      profit: 0
    },
    worstBreakProbability: 0,
    bestBreakProbability: 0
  })
  
  // State to track loading status
  const [isLoading, setIsLoading] = useState(false)

  // Load configuration if configId is in the URL
  useEffect(() => {
    const configId = searchParams.get('config');
    if (configId) {
      loadConfiguration(parseInt(configId));
    }
  }, [searchParams]);
  
  // Function to load configuration from API
  const loadConfiguration = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/configurations/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load configuration');
      }
      
      const config = await response.json();
      
      // Update state with loaded configuration
      setTotalSlots(config.totalSlots);
      setCostPerSpin(config.pricePerSpin);
      setDefaultPrize(config.defaultPrize);
      
      // Convert prize configs to our format
      if (config.prizeConfigs && Array.isArray(config.prizeConfigs)) {
        setPrizeConfigs(config.prizeConfigs.map((prize: any, index: number) => ({
          id: `prize${index + 1}`,
          name: prize.name || `Prize ${index + 1}`,
          unitCost: prize.unitCost || prize.value || 0, // support both new and old format
          slots: prize.slots || 0
        })));
      }
      
      // Reset simulation data
      setHitSlots([]);
      setSpinHistory([]);
      setSimulationStats(null);
      setHouseStats({
        totalEarnings: 0,
        totalSpins: 0,
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
        bestBreakProbability: 0
      });
      
    } catch (error) {
      console.error('Error loading configuration:', error);
      alert('Failed to load configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate remaining slots whenever prize configurations change
  useEffect(() => {
    const usedSlots = prizeConfigs.reduce((total, prize) => total + prize.slots, 0)
    const remaining = totalSlots - usedSlots
    setRemainingSlots(remaining > 0 ? remaining : 0)
    
    // Update available slots for "Remove Hit Slots" mode
    setAvailableSlots(totalSlots - hitSlots.length)
  }, [prizeConfigs, totalSlots, hitSlots])

  // Handler for total slots change
  const handleTotalSlotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setTotalSlots(value)
    }
  }

  // Handler for cost per spin change
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setCostPerSpin(value)
    }
  }

  // Handler for default prize value change
  const handleDefaultPrizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setDefaultPrize(value)
    }
  }

  // Handler for adding a new prize configuration
  const addPrizeConfig = () => {
    if (newPrizeName.trim() === '') {
      alert('Please enter a prize name')
      return
    }
    
    if (newPrizeSlots <= 0) {
      alert('Prize slots must be greater than 0')
      return
    }
    
    if (newPrizeValue <= 0) {
      alert('Prize value must be greater than 0')
      return
    }
    
    // Check if there are enough remaining slots
    const usedSlots = prizeConfigs.reduce((total, prize) => total + prize.slots, 0)
    if (usedSlots + newPrizeSlots > totalSlots) {
      alert(`Cannot add ${newPrizeSlots} slots. Only ${totalSlots - usedSlots} slots available.`)
      return
    }
    
    // Add new prize configuration
    const newPrize: PrizeConfig = {
      id: `prize${prizeConfigs.length + 1}`,
      name: newPrizeName,
      unitCost: newPrizeValue,
      slots: newPrizeSlots
    }
    
    setPrizeConfigs([...prizeConfigs, newPrize])
    
    // Reset inputs
    setNewPrizeName('')
    setNewPrizeValue(20)
    setNewPrizeSlots(1)
  }

  // Handler for removing a prize configuration
  const removePrizeConfig = (id: string) => {
    setPrizeConfigs(prizeConfigs.filter(prize => prize.id !== id))
  }
  
  // Determine which prize was hit based on slot number and return more detailed info
  const determinePrizeHit = (
    slotNumber: number, 
    configs: PrizeConfig[] = prizeConfigs
  ): { 
    prize: number, 
    prizeType: string, 
    prizeIndex?: number, 
    isSpecialPrize: boolean, 
    relativeSlotIndex?: number 
  } => {
    let slotCounter = 0
    
    // Check if the slot hit any of the special prize configurations
    for (let i = 0; i < configs.length; i++) {
      const prizeConfig = configs[i]
      const startSlot = slotCounter + 1
      const endSlot = slotCounter + prizeConfig.slots
      
      if (slotNumber >= startSlot && slotNumber <= endSlot) {
        return { 
          prize: prizeConfig.unitCost,
          prizeType: prizeConfig.name,
          prizeIndex: i,
          isSpecialPrize: true,
          relativeSlotIndex: slotNumber - startSlot // Position within this prize's slots
        }
      }
      
      slotCounter += prizeConfig.slots
    }
    
    // If no special prize was hit, return the default prize
    return { 
      prize: defaultPrize,
      prizeType: 'Default Prize',
      isSpecialPrize: false,
      relativeSlotIndex: slotNumber - slotCounter // Position within default slots
    }
  }
  
  // Helper function to check if a slot is already hit
  const isSlotHit = (slotNumber: number): boolean => {
    return hitSlots.includes(slotNumber);
  }
  
  // Get a valid slot number (not already hit) in "Remove Hit Slots" mode
  const getValidRandomSlot = (): number => {
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
      
      // Safety valve - if we've tried too many times, just use the last slot
      if (attempts > 100) {
        // Find first non-hit slot
        for (let i = 1; i <= totalSlots; i++) {
          if (!hitSlots.includes(i)) {
            return i;
          }
        }
        return randomSlot; // Fallback
      }
    } while (isSlotHit(randomSlot));
    
    return randomSlot;
  }
  
  // Run breaks for the "Remove Hit Slots" mode
  const runBreaks = (breakCount: number = 1) => {
    let totalCost = 0;
    let history: SpinResult[] = [];
    let housePrizeDistribution: Record<string, number> = {};
    let houseEarnings = 0;
    let totalPrizesRemoved = 0;
    
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
      
      // Continue until all special prize slots are hit in this break
      while (remainingPrizeSlots > 0) {
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
        const hitResult = determinePrizeHit(currentSpinResult);
        // Calculate profit from house perspective (price received minus prize paid)
        const profit = costPerSpin - hitResult.prize;
        
        // Track per-break profit (from house perspective)
        currentBreakProfit += profit;
        
        // Add to history (but limit the entries we keep for performance)
        // For the final break or if we're only doing a few breaks, keep all spins
        // Otherwise, just keep the last few spins of each break
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
        housePrizeDistribution[hitResult.prizeType] = (housePrizeDistribution[hitResult.prizeType] || 0) + 1;
        houseEarnings += costPerSpin - hitResult.prize;
        
        // Track this slot as hit in this break
        breakHitSlots.push(currentSpinResult);
        
        // If we hit a special prize (not default), track it separately
        if (hitResult.isSpecialPrize) {
          remainingPrizeSlots--;
          totalPrizesRemoved++;
        }
      }
      
      // After the break is complete, check if it's the best or worst break
      // For best break: highest profit-per-spin ratio (or just highest profit if equal spins)
      const thisBreakProfitPerSpin = currentBreakProfit / currentBreakSpins;
      
      // First check if this is the best break
      if (currentBreakSpins > 0 && (
          // If no best break set yet OR this break has better profit ratio
          bestBreakSpins === 0 || 
          thisBreakProfitPerSpin > (bestBreakProfit / bestBreakSpins)
        )) {
        bestBreakProfit = currentBreakProfit;
        bestBreakSpins = currentBreakSpins;
      }
      
      // Now check if this is the worst break
      if (currentBreakSpins > 0 && (
          // If no worst break set yet OR this break has worse profit ratio 
          worstBreakSpins === 0 || 
          thisBreakProfitPerSpin < (worstBreakProfit / worstBreakSpins)
        )) {
        worstBreakProfit = currentBreakProfit;
        worstBreakSpins = currentBreakSpins;
      }
    }
    
    // Set hit slots to empty since we completed full breaks
    setHitSlots([]);
    setAvailableSlots(totalSlots);
    
    // Set simulation results based on the completed breaks
    const lastAttemptNum = spinHistory.length + history.length;
    const lastResult = history.length > 0 
      ? history[history.length - 1] 
      : { 
          attempt: lastAttemptNum,
          result: 0,
          cost: totalCost,
          prize: 0,
          profit: totalCost, // House perspective: price - prize (all price, no prizes)
          prizeType: 'Unknown'
        };
    
    // Calculate how many prize cycles were completed
    const prizeCount = prizeConfigs.reduce((total, prize) => total + prize.slots, 0);
    const completedCycles = prizeCount > 0 ? Math.floor(totalPrizesRemoved / prizeCount) : 0;
    
    setSimulationStats({
      targetHitAttempt: breakCount, // The number of break cycles completed
      totalCost,
      finalSpinResult: lastResult.result,
      finalPrize: lastResult.prize,
      finalProfit: totalCost - (lastResult.prize * totalPrizesRemoved), // House profit
      finalPrizeType: `Completed ${breakCount} breaks (${totalPrizesRemoved} prizes hit)`
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
    
    // Calculate probability of hitting 5 consecutive worst breaks or best breaks
    // This is calculated as (1/totalSlots)^(worstBreakSpins * 5) for worst break probability
    // and (1/totalSlots)^(bestBreakSpins * 5) for best break probability
    
    // The probability of hitting the exact same sequence of slots in 5 consecutive breaks
    let worstBreakProbability = 0;
    let bestBreakProbability = 0;
    
    if (worstBreakSpins > 0 && totalSlots > 0) {
      // Calculate probability based on the specific sequence needed
      // We need to hit exactly worstBreakSpins slots in sequence, 5 times in a row
      const singleWorstBreakProbability = Math.pow(1/totalSlots, worstBreakSpins);
      worstBreakProbability = Math.pow(singleWorstBreakProbability, 5);
    }
    
    if (bestBreakSpins > 0 && totalSlots > 0) {
      // Calculate probability based on the specific sequence needed
      // We need to hit exactly bestBreakSpins slots in sequence, 5 times in a row
      const singleBestBreakProbability = Math.pow(1/totalSlots, bestBreakSpins);
      bestBreakProbability = Math.pow(singleBestBreakProbability, 5);
    }
    
    // Update house stats in a single update at the end
    setHouseStats(prev => ({
      totalEarnings: houseEarnings,
      totalSpins: prev.totalSpins + history.length,
      prizeDistribution: housePrizeDistribution,
      worstBreak: {
        spins: worstBreakSpins,
        profit: worstBreakProfit
      },
      bestBreak: {
        spins: bestBreakSpins,
        profit: bestBreakProfit
      },
      worstBreakProbability,
      bestBreakProbability
    }));
  }
  
  // Single Spin Function
  const singleSpin = () => {
    // Random selection from all slots
    const currentSpinResult = Math.floor(Math.random() * totalSlots) + 1
    
    // Determine prize based on slot hit
    const { prize, prizeType } = determinePrizeHit(currentSpinResult)
    // Calculate profit from house perspective (price received minus prize paid)
    const profit = costPerSpin - prize
    
    // Create history entry
    const attempt = spinHistory.length + 1
    const historyEntry: SpinResult = {
      attempt,
      result: currentSpinResult,
      cost: costPerSpin,
      prize,
      profit,
      prizeType
    }
    
    // Update spin history
    setSpinHistory(prevHistory => [...prevHistory, historyEntry])
    
    // Update house stats
    setHouseStats(prev => {
      // Update prize distribution count
      const updatedDistribution = { ...prev.prizeDistribution }
      updatedDistribution[prizeType] = (updatedDistribution[prizeType] || 0) + 1
      
      return {
        totalEarnings: prev.totalEarnings + costPerSpin - prize,
        totalSpins: prev.totalSpins + 1,
        prizeDistribution: updatedDistribution
      }
    })
    
    // Set simulation results based on the latest spin
    setSimulationStats({
      targetHitAttempt: attempt,
      totalCost: costPerSpin,
      finalSpinResult: currentSpinResult,
      finalPrize: prize,
      finalProfit: profit,
      finalPrizeType: prizeType
    })
  }
  
  // Spin Multiple Times Function
  const spinMultipleTimes = (spins: number = 10) => {
    let totalCost = 0
    let currentSpinResult: number
    let history: SpinResult[] = []
    let housePrizeDistribution: Record<string, number> = {}
    let houseEarnings = 0
    
    // Start with a copy of the current house stats
    if (houseStats.prizeDistribution) {
      housePrizeDistribution = { ...houseStats.prizeDistribution }
    }
    houseEarnings = houseStats.totalEarnings
    
    for (let attempt = 1; attempt <= spins; attempt++) {
      // Random selection from all slots
      currentSpinResult = Math.floor(Math.random() * totalSlots) + 1
      totalCost += costPerSpin
      
      // Determine prize based on slot hit
      const { prize, prizeType } = determinePrizeHit(currentSpinResult)
      // Calculate profit from house perspective (price received minus prize paid)
      const profit = costPerSpin - prize
      
      // Add to history (but limit to last 100 spins for memory/performance)
      if (spins <= 100 || attempt > spins - 100) {
        history.push({
          attempt: spinHistory.length + attempt,
          result: currentSpinResult,
          cost: costPerSpin,
          prize,
          profit,
          prizeType
        })
      }
      
      // Update house stats (locally rather than via setState to improve performance)
      housePrizeDistribution[prizeType] = (housePrizeDistribution[prizeType] || 0) + 1
      houseEarnings += costPerSpin - prize
    }
    
    // Update results for the last spin
    const lastAttemptNum = spinHistory.length + spins
    const lastResult = history.length > 0 
      ? history[history.length - 1] 
      : { 
          attempt: lastAttemptNum,
          result: currentSpinResult!,
          cost: costPerSpin,
          prize: 0,
          profit: costPerSpin, // House perspective, profit is positive
          prizeType: 'Unknown'
        }
    
    // Set simulation results from house perspective
    setSimulationStats({
      targetHitAttempt: lastAttemptNum,
      totalCost,
      finalSpinResult: lastResult.result,
      finalPrize: lastResult.prize,
      finalProfit: totalCost - (lastResult.prize * spins), // House profit (total price - total prizes)
      finalPrizeType: lastResult.prizeType
    })
    
    // Update spin history (limit to most recent entries if there are too many)
    setSpinHistory(prevHistory => {
      // Keep at most 500 total spins in history to prevent browser slowdowns
      const combinedHistory = [...prevHistory, ...history]
      if (combinedHistory.length > 500) {
        return combinedHistory.slice(combinedHistory.length - 500)
      }
      return combinedHistory
    })
    
    // Update house stats in a single update at the end
    setHouseStats(prev => ({
      totalEarnings: houseEarnings,
      totalSpins: prev.totalSpins + spins,
      prizeDistribution: housePrizeDistribution,
      // Preserve best/worst break data in standard mode
      worstBreak: prev.worstBreak,
      bestBreak: prev.bestBreak
    }))
  }
  
  const clearHistory = () => {
    setSpinHistory([])
    setSimulationStats(null)
    setHouseStats({
      totalEarnings: 0,
      totalSpins: 0,
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
      bestBreakProbability: 0
    })
    
    // Reset hit slots for "Remove Hit Slots" mode
    setHitSlots([])
    setAvailableSlots(totalSlots)
  }

  return (
    <div>
      <Header />
      
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      
      <main>
        <h1 className="main-heading">Roulette Simulator</h1>
        
        <div className="tab-container">
          <div 
            className={`tab ${simulationMode === 'normal' ? 'active' : ''}`}
            onClick={() => setSimulationMode('normal')}
          >
            Normal Mode
          </div>
          <div 
            className={`tab ${simulationMode === 'removeHitSlots' ? 'active' : ''}`}
            onClick={() => setSimulationMode('removeHitSlots')}
          >
            Remove Hit Slots
          </div>
        </div>
      
        <div className="grid">
          <div className="card">
            <div className="card-header">
              <h2 className="section-heading">Game Parameters</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="totalSlots">Total Number of Slots</label>
                  <input
                    id="totalSlots"
                    type="number"
                    min="2"
                    value={totalSlots}
                    onChange={handleTotalSlotsChange}
                  />
                  <p className="text-hint">Total slots on the wheel</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="costPerSpin">Price per Spin</label>
                  <input
                    id="costPerSpin"
                    type="number"
                    min="0"
                    value={costPerSpin}
                    onChange={handleCostChange}
                  />
                  <p className="text-hint">Current: {formatCurrency(costPerSpin)}</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="defaultPrize">Default Prize</label>
                  <input
                    id="defaultPrize"
                    type="number"
                    min="0"
                    value={defaultPrize}
                    onChange={handleDefaultPrizeChange}
                  />
                  <p className="text-hint">Current: {formatCurrency(defaultPrize)}</p>
                  <p className="text-hint">For {remainingSlots} default slots</p>
                </div>
                
                <div className="divider"></div>
                
                <div className="prize-table-header">
                  <h3 className="subsection-heading">Prize Configurations</h3>
                  <button 
                    className="button-icon" 
                    onClick={() => setShowPrizeModal(true)}
                    title="Add New Prize"
                  >
                    +
                  </button>
                </div>
                
                <div className="prize-table-container">
                  <table className="prize-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit Cost</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {prizeConfigs.map((prize) => (
                        <tr key={prize.id}>
                          <td>{prize.name}</td>
                          <td>{prize.slots} slot{prize.slots !== 1 ? 's' : ''}</td>
                          <td>{formatCurrency(prize.unitCost)}</td>
                          <td>{formatCurrency(prize.unitCost * prize.slots)}</td>
                          <td>
                            <button 
                              className="button-small button-danger"
                              onClick={() => removePrizeConfig(prize.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="default-prize-row">
                        <td>Remaining Slots (Default)</td>
                        <td>{remainingSlots} slot{remainingSlots !== 1 ? 's' : ''}</td>
                        <td>{formatCurrency(defaultPrize)}</td>
                        <td>{formatCurrency(defaultPrize * remainingSlots)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Prize Modal */}
                {showPrizeModal && (
                  <div className="modal-overlay">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h3>Add New Prize</h3>
                        <button 
                          className="button-icon" 
                          onClick={() => setShowPrizeModal(false)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="modal-body">
                        <div className="form-group">
                          <label htmlFor="newPrizeName">Prize Name</label>
                          <input
                            id="newPrizeName"
                            type="text"
                            value={newPrizeName}
                            onChange={(e) => setNewPrizeName(e.target.value)}
                            placeholder="e.g., Jackpot"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="newPrizeValue">Prize Unit Cost</label>
                          <input
                            id="newPrizeValue"
                            type="number"
                            min="1"
                            value={newPrizeValue}
                            onChange={(e) => setNewPrizeValue(parseInt(e.target.value) || 0)}
                          />
                          <p className="text-hint">{formatCurrency(newPrizeValue)}</p>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="newPrizeSlots">Number of Slots</label>
                          <input
                            id="newPrizeSlots"
                            type="number"
                            min="1"
                            max={totalSlots - prizeConfigs.reduce((total, prize) => total + prize.slots, 0)}
                            value={newPrizeSlots}
                            onChange={(e) => setNewPrizeSlots(parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          onClick={() => setShowPrizeModal(false)}
                          className="button-outline"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            addPrizeConfig();
                            setShowPrizeModal(false);
                          }}
                          disabled={totalSlots - prizeConfigs.reduce((total, prize) => total + prize.slots, 0) < newPrizeSlots || !newPrizeName.trim()}
                        >
                          Add Prize
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Save Configuration Modal */}
                {showSaveModal && (
                  <div className="modal-overlay">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h3>Save Configuration</h3>
                        <button 
                          className="button-icon" 
                          onClick={() => setShowSaveModal(false)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="modal-body">
                        <SaveConfigurationForm 
                          configuration={{
                            totalSlots,
                            pricePerSpin: costPerSpin,
                            defaultPrize,
                            prizeConfigs
                          }}
                          onSaveComplete={() => setShowSaveModal(false)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="divider"></div>
              
              <div className="button-group">
                {simulationMode === 'normal' ? (
                  // Normal mode buttons
                  <>
                    <button onClick={() => spinMultipleTimes(1000)}>Spin 1000 Times</button>
                    <button onClick={() => spinMultipleTimes(100)}>Spin 100 Times</button>
                    <button onClick={() => spinMultipleTimes(10)}>Spin 10 Times</button>
                    <button onClick={singleSpin}>Single Spin</button>
                  </>
                ) : (
                  // Remove Hit Slots mode buttons
                  <>
                    <button onClick={() => runBreaks(1000)}>1000 Breaks</button>
                    <button onClick={() => runBreaks(100)}>100 Breaks</button>
                    <button onClick={() => runBreaks(10)}>10 Breaks</button>
                    <button onClick={() => runBreaks(1)}>Single Break</button>
                  </>
                )}
                <button className="button-outline" onClick={clearHistory}>Clear History</button>
                <button className="button-save" onClick={() => setShowSaveModal(true)}>Save Configuration</button>
              </div>
            </div>
          </div>
          
          {/* House Statistics */}
          <div className="card">
            <div className="card-header">
              <h2 className="section-heading">House Statistics</h2>
            </div>
            <div className="card-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-content">
                    <span className="stat-label">House Earnings</span>
                    <span className={`stat-value ${houseStats.totalEarnings >= 0 ? 'profit' : 'loss'}`}>
                      {formatCurrency(houseStats.totalEarnings)}
                    </span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-content">
                    <span className="stat-label">Total Spins</span>
                    <span className="stat-value">{houseStats.totalSpins}</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-content">
                    <span className="stat-label">Profit Rate</span>
                    <span className={`stat-value ${houseStats.totalEarnings >= 0 ? 'profit' : 'loss'}`}>
                      {houseStats.totalSpins > 0 
                        ? `${((houseStats.totalEarnings / (houseStats.totalSpins * costPerSpin)) * 100).toFixed(2)}%`
                        : '0.00%'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-content">
                    <span className="stat-label">Prize Distribution</span>
                    <span className="stat-value">
                      {Object.values(houseStats.prizeDistribution || {}).reduce((sum, count) => sum + count, 0)} prizes
                    </span>
                    <div className="stat-sublabel">
                      {Object.entries(houseStats.prizeDistribution || {})
                        .sort()
                        .map(([type, count]) => (
                          <div key={type} className="flex justify-between">
                            <span>{type}:</span>
                            <span>{count}</span>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Only show best/worst break stats in removeHitSlots mode */}
                {simulationMode === 'removeHitSlots' && (
                  <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                    <div className="stat-content">
                      <span className="stat-label">Break Performance</span>
                      <div className="flex flex-col space-y-4 mt-2">
                        <div>
                          <div className="flex justify-between">
                            <span className="font-medium">Best Break:</span>
                            <span className="profit">
                              {houseStats.bestBreak?.spins ? 
                                `${formatCurrency(houseStats.bestBreak.profit)}` : 
                                'N/A'}
                            </span>
                          </div>
                          <div className="stat-sublabel flex justify-between">
                            <span>Spins:</span>
                            <span>{houseStats.bestBreak?.spins || 'N/A'}</span>
                          </div>
                          <div className="stat-sublabel flex justify-between">
                            <span>Per Spin:</span>
                            <span className="profit">
                              {houseStats.bestBreak?.spins ? 
                                `${formatCurrency(houseStats.bestBreak.profit / houseStats.bestBreak.spins)}` : 
                                'N/A'}
                            </span>
                          </div>
                          <div className="stat-sublabel flex justify-between">
                            <span>5x Consecutive Probability:</span>
                            <span>
                              {houseStats.bestBreakProbability && houseStats.bestBreakProbability > 0 ? 
                                (houseStats.bestBreakProbability < 0.0000001 ? 
                                  houseStats.bestBreakProbability.toExponential(6) : 
                                  (houseStats.bestBreakProbability * 100).toFixed(6) + '%') : 
                                'N/A'}
                            </span>
                          </div>
                          <div className="stat-sublabel flex justify-between">
                            <span>Odds:</span>
                            <span>
                              {houseStats.bestBreakProbability && houseStats.bestBreakProbability > 0 ? 
                                `1 in ${Math.round(1 / houseStats.bestBreakProbability).toLocaleString()}` : 
                                'N/A'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between">
                            <span className="font-medium">Worst Break:</span>
                            <span className="loss">
                              {houseStats.worstBreak?.spins ? 
                                `${formatCurrency(houseStats.worstBreak.profit)}` : 
                                'N/A'}
                            </span>
                          </div>
                          <div className="stat-sublabel flex justify-between">
                            <span>Spins:</span>
                            <span>{houseStats.worstBreak?.spins || 'N/A'}</span>
                          </div>
                          <div className="stat-sublabel flex justify-between">
                            <span>Per Spin:</span>
                            <span className="loss">
                              {houseStats.worstBreak?.spins ? 
                                `${formatCurrency(houseStats.worstBreak.profit / houseStats.worstBreak.spins)}` : 
                                'N/A'}
                            </span>
                          </div>
                          <div className="stat-sublabel flex justify-between">
                            <span>5x Consecutive Probability:</span>
                            <span>
                              {houseStats.worstBreakProbability && houseStats.worstBreakProbability > 0 ? 
                                (houseStats.worstBreakProbability < 0.0000001 ? 
                                  houseStats.worstBreakProbability.toExponential(6) : 
                                  (houseStats.worstBreakProbability * 100).toFixed(6) + '%') : 
                                'N/A'}
                            </span>
                          </div>
                          <div className="stat-sublabel flex justify-between">
                            <span>Odds:</span>
                            <span>
                              {houseStats.worstBreakProbability && houseStats.worstBreakProbability > 0 ? 
                                `1 in ${Math.round(1 / houseStats.worstBreakProbability).toLocaleString()}` : 
                                'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}