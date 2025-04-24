"use client"

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

// Define types
interface SpinResult {
  attempt: number
  result: number
  cost: number
  prize: number
  profit: number
  slotsRemaining?: number // Optional field to track remaining slots in removal mode
}

interface SimulationStats {
  targetHitAttempt: number
  totalCost: number
  finalSpinResult: number
  finalPrize: number
  finalProfit: number
}

interface HouseStatsType {
  totalEarnings: number
  totalSpins: number
  nonTargetPrizes: number
  targetPrizes: number
}

export default function Home() {
  // Game parameters state
  const [slots, setSlots] = useState(25)
  const [targetSlot, setTargetSlot] = useState(1)
  const [costPerSpin, setCostPerSpin] = useState(25)
  const [nonTargetPrize, setNonTargetPrize] = useState(10)
  const [targetPrize, setTargetPrize] = useState(800)
  const [removeHitSlots, setRemoveHitSlots] = useState(false)

  // Simulation results
  const [simulationStats, setSimulationStats] = useState<SimulationStats | null>(null)
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([])
  
  // House stats
  const [houseStats, setHouseStats] = useState<HouseStatsType>({
    totalEarnings: 0,
    totalSpins: 0,
    nonTargetPrizes: 0,
    targetPrizes: 0
  })

  // Validation error state
  const [targetSlotError, setTargetSlotError] = useState('')

  // Validate target slot is within range when slots or targetSlot changes
  const validateTargetSlot = (target: number, totalSlots: number) => {
    if (target > totalSlots) {
      setTargetSlotError(`Target slot must be between 1 and ${totalSlots}`)
      return false
    } else {
      setTargetSlotError('')
      return true
    }
  }

  const handleSlotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setSlots(value)
      validateTargetSlot(targetSlot, value)
    }
  }

  const handleTargetSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setTargetSlot(value)
      validateTargetSlot(value, slots)
    }
  }

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setCostPerSpin(value)
    }
  }

  const handleNonTargetPrizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setNonTargetPrize(value)
    }
  }

  const handleTargetPrizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setTargetPrize(value)
    }
  }

  const toggleRemoveHitSlots = () => {
    setRemoveHitSlots(prev => !prev)
  }

  const runSimulation = () => {
    // Validate that target slot is valid
    if (!validateTargetSlot(targetSlot, slots)) {
      return;
    }
    
    let attempt = 1
    let currentSpinResult: number
    let totalCost = 0
    let history: SpinResult[] = []
    
    // For removal mode, keep track of available slots
    let availableSlots = Array.from({ length: slots }, (_, i) => i + 1)
    let targetFound = false

    // Continue spinning until we hit the target slot
    do {
      if (removeHitSlots) {
        // In removal mode, spin from the available slots
        const randomIndex = Math.floor(Math.random() * availableSlots.length)
        currentSpinResult = availableSlots[randomIndex]
        
        // Remove the slot that was hit
        availableSlots.splice(randomIndex, 1)
        
        // Check if we hit the target
        targetFound = currentSpinResult === targetSlot
      } else {
        // Standard mode - random selection from all slots
        currentSpinResult = Math.floor(Math.random() * slots) + 1
        targetFound = currentSpinResult === targetSlot
      }
      
      totalCost += costPerSpin
      
      const isTargetHit = currentSpinResult === targetSlot
      const prize = isTargetHit ? targetPrize : nonTargetPrize
      const profit = prize - costPerSpin
      
      // Add to history with remaining slots info for removal mode
      const historyEntry: SpinResult = {
        attempt,
        result: currentSpinResult,
        cost: costPerSpin,
        prize,
        profit
      }
      
      if (removeHitSlots) {
        historyEntry.slotsRemaining = availableSlots.length
      }
      
      history.push(historyEntry)
      
      // Update house stats
      if (isTargetHit) {
        setHouseStats(prev => ({
          ...prev,
          totalEarnings: prev.totalEarnings + costPerSpin - prize,
          totalSpins: prev.totalSpins + 1,
          targetPrizes: prev.targetPrizes + 1
        }))
      } else {
        setHouseStats(prev => ({
          ...prev,
          totalEarnings: prev.totalEarnings + costPerSpin - prize,
          totalSpins: prev.totalSpins + 1,
          nonTargetPrizes: prev.nonTargetPrizes + 1
        }))
      }
      
      attempt++
      
      // In removal mode, we continue until target is found or no slots remain
      if (removeHitSlots && availableSlots.length === 0 && !targetFound) {
        break; // All slots removed and target not found
      }
      
    } while (!targetFound)
    
    // Set simulation results
    setSimulationStats({
      targetHitAttempt: attempt - 1,
      totalCost,
      finalSpinResult: currentSpinResult!,
      finalPrize: targetFound ? targetPrize : 0,
      finalProfit: targetFound ? targetPrize - totalCost : -totalCost
    })
    
    // Update spin history
    setSpinHistory(prevHistory => [...prevHistory, ...history])
  }
  
  const clearHistory = () => {
    setSpinHistory([])
    setSimulationStats(null)
    setHouseStats({
      totalEarnings: 0,
      totalSpins: 0,
      nonTargetPrizes: 0,
      targetPrizes: 0
    })
  }
  
  // Single Spin Function
  const singleSpin = () => {
    // Validate that target slot is valid
    if (!validateTargetSlot(targetSlot, slots)) {
      return;
    }
    
    let currentSpinResult: number
    
    // For removal mode, keep track of available slots if this is a new simulation
    let availableSlots = Array.from({ length: slots }, (_, i) => i + 1)
    
    // If we have history and are in removal mode, reconstruct the available slots
    if (removeHitSlots && spinHistory.length > 0) {
      const hitSlots = new Set(spinHistory.map(spin => spin.result))
      availableSlots = availableSlots.filter(slot => !hitSlots.has(slot))
      
      // If no slots remain, reset
      if (availableSlots.length === 0) {
        availableSlots = Array.from({ length: slots }, (_, i) => i + 1)
      }
    }
    
    if (removeHitSlots) {
      // In removal mode, spin from the available slots
      const randomIndex = Math.floor(Math.random() * availableSlots.length)
      currentSpinResult = availableSlots[randomIndex]
    } else {
      // Standard mode - random selection from all slots
      currentSpinResult = Math.floor(Math.random() * slots) + 1
    }
    
    const isTargetHit = currentSpinResult === targetSlot
    const prize = isTargetHit ? targetPrize : nonTargetPrize
    const profit = prize - costPerSpin
    
    // Create history entry
    const attempt = spinHistory.length + 1
    const historyEntry: SpinResult = {
      attempt,
      result: currentSpinResult,
      cost: costPerSpin,
      prize,
      profit
    }
    
    if (removeHitSlots) {
      historyEntry.slotsRemaining = availableSlots.length - 1 // Subtract 1 for the slot we just hit
    }
    
    // Update spin history
    setSpinHistory(prevHistory => [...prevHistory, historyEntry])
    
    // Update house stats
    if (isTargetHit) {
      setHouseStats(prev => ({
        ...prev,
        totalEarnings: prev.totalEarnings + costPerSpin - prize,
        totalSpins: prev.totalSpins + 1,
        targetPrizes: prev.targetPrizes + 1
      }))
    } else {
      setHouseStats(prev => ({
        ...prev,
        totalEarnings: prev.totalEarnings + costPerSpin - prize,
        totalSpins: prev.totalSpins + 1,
        nonTargetPrizes: prev.nonTargetPrizes + 1
      }))
    }
    
    // Set simulation results based on the latest spin
    setSimulationStats({
      targetHitAttempt: attempt,
      totalCost: costPerSpin,
      finalSpinResult: currentSpinResult,
      finalPrize: prize,
      finalProfit: profit
    })
  }

  return (
    <main>
      <h1 className="main-heading">Roulette Simulator</h1>
      
      <div className="grid">
        <div className="card">
          <div className="card-header">
            <h2 className="section-heading">Game Parameters</h2>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="form-group">
                <label htmlFor="slots">Number of Slots</label>
                <input
                  id="slots"
                  type="number"
                  min="2"
                  value={slots}
                  onChange={handleSlotsChange}
                />
                <p className="text-hint">Total slots on the wheel</p>
              </div>

              <div className="form-group">
                <label htmlFor="targetSlot">Target Slot</label>
                <input
                  id="targetSlot"
                  type="number"
                  min="1"
                  max={slots}
                  value={targetSlot}
                  onChange={handleTargetSlotChange}
                  className={targetSlotError ? "input-error" : ""}
                />
                {targetSlotError && (
                  <p className="text-error">{targetSlotError}</p>
                )}
                <p className="text-hint">The slot you're betting on</p>
              </div>

              <div className="form-group">
                <label htmlFor="costPerSpin">Cost per Spin</label>
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
                <label htmlFor="nonTargetPrize">Non-Target Prize</label>
                <input
                  id="nonTargetPrize"
                  type="number"
                  min="0"
                  value={nonTargetPrize}
                  onChange={handleNonTargetPrizeChange}
                />
                <p className="text-hint">Current: {formatCurrency(nonTargetPrize)}</p>
              </div>

              <div className="form-group">
                <label htmlFor="targetPrize">Target Prize</label>
                <input
                  id="targetPrize"
                  type="number"
                  min="0"
                  value={targetPrize}
                  onChange={handleTargetPrizeChange}
                />
                <p className="text-hint">Current: {formatCurrency(targetPrize)}</p>
              </div>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={removeHitSlots}
                  onChange={toggleRemoveHitSlots}
                />
                <span>Remove Hit Slots Mode</span>
              </label>
              <p className="text-hint">
                When enabled, each slot is removed after being hit (like drawing cards from a deck)
              </p>
            </div>
            
            <div className="button-group">
              <button onClick={runSimulation}>Spin Until Target Hit</button>
              <button onClick={singleSpin}>Single Spin</button>
              <button className="button-outline" onClick={clearHistory}>Clear History</button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="section-heading">Simulation Results</h2>
          </div>
          <div className="card-content">
            {simulationStats ? (
              <div className="results-grid">
                <div className="result-card">
                  <div className="result-content">
                    <span className="result-label">Last Spin Attempt</span>
                    <span className="result-value">{simulationStats.targetHitAttempt}</span>
                  </div>
                </div>
                
                <div className="result-card">
                  <div className="result-content">
                    <span className="result-label">Total Cost</span>
                    <span className="result-value">{formatCurrency(simulationStats.totalCost)}</span>
                  </div>
                </div>
                
                <div className="result-card">
                  <div className="result-content">
                    <span className="result-label">Last Spin Result</span>
                    <span className="result-value">Slot {simulationStats.finalSpinResult}</span>
                  </div>
                </div>
                
                <div className="result-card">
                  <div className="result-content">
                    <span className="result-label">Final Prize</span>
                    <span className="result-value">{formatCurrency(simulationStats.finalPrize)}</span>
                  </div>
                </div>
                
                <div className="result-card wide">
                  <div className="result-content">
                    <span className="result-label">Net Profit/Loss</span>
                    <span className={`result-value ${simulationStats.finalProfit >= 0 ? 'profit' : 'loss'}`}>
                      {formatCurrency(simulationStats.finalProfit)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center">Run a simulation to see results</p>
            )}
          </div>
        </div>
      </div>
      
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
                <span className="stat-label">Non-Target Prizes</span>
                <span className="stat-value">{houseStats.nonTargetPrizes}</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Target Prizes</span>
                <span className="stat-value">{houseStats.targetPrizes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="section-heading">Simulation History</h2>
        </div>
        <div className="divider"></div>
        <div className="card-content p-0">
          <div className="history-table-container">
            {spinHistory.length === 0 ? (
              <div className="text-center p-8">
                <p>No spin history yet. Run a simulation to see results.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Attempt</th>
                    <th>Spin Result</th>
                    <th>Cost</th>
                    <th>Prize</th>
                    <th>Profit/Loss</th>
                    {removeHitSlots && <th>Slots Remaining</th>}
                  </tr>
                </thead>
                <tbody>
                  {spinHistory.map((spin, index) => (
                    <tr key={index}>
                      <td>{spin.attempt}</td>
                      <td>Slot {spin.result}</td>
                      <td>{formatCurrency(spin.cost)}</td>
                      <td>{formatCurrency(spin.prize)}</td>
                      <td className={spin.profit >= 0 ? 'profit' : 'loss'}>
                        {formatCurrency(spin.profit)}
                      </td>
                      {removeHitSlots && <td>{spin.slotsRemaining ?? 'N/A'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
