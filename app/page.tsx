'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

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
}

interface PrizeConfig {
  id: string
  name: string
  value: number
  slots: number
}

export default function Home() {
  // Game parameters state
  const [totalSlots, setTotalSlots] = useState(25)
  const [costPerSpin, setCostPerSpin] = useState(25)
  const [defaultPrize, setDefaultPrize] = useState(10)
  
  // Prize configurations with their quantity and value
  const [prizeConfigs, setPrizeConfigs] = useState<PrizeConfig[]>([
    { id: "prize1", name: "Prize X", value: 50, slots: 1 },
    { id: "prize2", name: "Prize Z", value: 30, slots: 3 }
  ])
  
  // Calculate remaining slots after special prizes
  const [remainingSlots, setRemainingSlots] = useState(21)
  
  // Input for new prize configuration
  const [newPrizeName, setNewPrizeName] = useState('')
  const [newPrizeValue, setNewPrizeValue] = useState(20)
  const [newPrizeSlots, setNewPrizeSlots] = useState(1)

  // Simulation results
  const [simulationStats, setSimulationStats] = useState<SimulationStats | null>(null)
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([])
  
  // House stats
  const [houseStats, setHouseStats] = useState<HouseStatsType>({
    totalEarnings: 0,
    totalSpins: 0,
    prizeDistribution: {} // Initialize empty object for prize distribution counts
  })

  // Calculate remaining slots whenever prize configurations change
  useEffect(() => {
    const usedSlots = prizeConfigs.reduce((total, prize) => total + prize.slots, 0)
    const remaining = totalSlots - usedSlots
    setRemainingSlots(remaining > 0 ? remaining : 0)
  }, [prizeConfigs, totalSlots])

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
      value: newPrizeValue,
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
  
  // Determine which prize was hit based on slot number
  const determinePrizeHit = (slotNumber: number): { prize: number, prizeType: string } => {
    let slotCounter = 0
    
    // Check if the slot hit any of the special prize configurations
    for (const prizeConfig of prizeConfigs) {
      const startSlot = slotCounter + 1
      const endSlot = slotCounter + prizeConfig.slots
      
      if (slotNumber >= startSlot && slotNumber <= endSlot) {
        return { 
          prize: prizeConfig.value,
          prizeType: prizeConfig.name
        }
      }
      
      slotCounter += prizeConfig.slots
    }
    
    // If no special prize was hit, return the default prize
    return { 
      prize: defaultPrize,
      prizeType: 'Default Prize'
    }
  }
  
  // Single Spin Function
  const singleSpin = () => {
    // Random selection from all slots
    const currentSpinResult = Math.floor(Math.random() * totalSlots) + 1
    
    // Determine prize based on slot hit
    const { prize, prizeType } = determinePrizeHit(currentSpinResult)
    const profit = prize - costPerSpin
    
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
    
    for (let attempt = 1; attempt <= spins; attempt++) {
      // Random selection from all slots
      currentSpinResult = Math.floor(Math.random() * totalSlots) + 1
      totalCost += costPerSpin
      
      // Determine prize based on slot hit
      const { prize, prizeType } = determinePrizeHit(currentSpinResult)
      const profit = prize - costPerSpin
      
      // Add to history
      history.push({
        attempt: spinHistory.length + attempt,
        result: currentSpinResult,
        cost: costPerSpin,
        prize,
        profit,
        prizeType
      })
      
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
    }
    
    // Update results for the last spin
    const lastSpin = history[history.length - 1]
    
    // Set simulation results
    setSimulationStats({
      targetHitAttempt: lastSpin.attempt,
      totalCost,
      finalSpinResult: lastSpin.result,
      finalPrize: lastSpin.prize,
      finalProfit: lastSpin.prize - totalCost,
      finalPrizeType: lastSpin.prizeType
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
      prizeDistribution: {}
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
              
              <h3 className="subsection-heading">Special Prizes</h3>
              
              {prizeConfigs.map((prize, index) => (
                <div key={prize.id} className="prize-config-item">
                  <div className="prize-config-details">
                    <span className="prize-name">{prize.name}</span>
                    <span className="prize-value">{formatCurrency(prize.value)}</span>
                    <span className="prize-slots">{prize.slots} slot{prize.slots !== 1 ? 's' : ''}</span>
                  </div>
                  <button 
                    className="button-small button-danger"
                    onClick={() => removePrizeConfig(prize.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <div className="divider"></div>
              
              <h3 className="subsection-heading">Add New Prize</h3>
              
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
                <label htmlFor="newPrizeValue">Prize Value</label>
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
              
              <button 
                onClick={addPrizeConfig}
                disabled={totalSlots - prizeConfigs.reduce((total, prize) => total + prize.slots, 0) < newPrizeSlots}
                className="button-full"
              >
                Add Prize Configuration
              </button>
            </div>
            
            <div className="divider"></div>
            
            <div className="button-group">
              <button onClick={() => spinMultipleTimes(10)}>Spin 10 Times</button>
              <button onClick={singleSpin}>Single Spin</button>
              <button className="button-outline" onClick={clearHistory}>Clear History</button>
            </div>
          </div>
        </div>
        
        {/* House Statistics moved above Simulation Results */}
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
            </div>
            
            <div className="divider"></div>
            
            <h3 className="subsection-heading">Prize Distribution</h3>
            
            <div className="prize-distribution">
              {Object.entries(houseStats.prizeDistribution).map(([prizeType, count]) => (
                <div key={prizeType} className="prize-distribution-item">
                  <span className="prize-type">{prizeType}</span>
                  <span className="prize-count">{count} hit{count !== 1 ? 's' : ''}</span>
                </div>
              ))}
              
              {Object.keys(houseStats.prizeDistribution).length === 0 && (
                <p className="text-center">No spins recorded yet</p>
              )}
            </div>
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
                  <span className="result-label">Prize Type</span>
                  <span className="result-value">{simulationStats.finalPrizeType}</span>
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
                    <th>Prize Type</th>
                    <th>Cost</th>
                    <th>Prize</th>
                    <th>Profit/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {spinHistory.map((spin, index) => (
                    <tr key={index}>
                      <td>{spin.attempt}</td>
                      <td>Slot {spin.result}</td>
                      <td>{spin.prizeType}</td>
                      <td>{formatCurrency(spin.cost)}</td>
                      <td>{formatCurrency(spin.prize)}</td>
                      <td className={spin.profit >= 0 ? 'profit' : 'loss'}>
                        {formatCurrency(spin.profit)}
                      </td>
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