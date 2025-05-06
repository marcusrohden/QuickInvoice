/**
 * House Stats Component
 * Displays statistics from the house's perspective
 */

import { HouseStatsType } from '@/lib/types/simulation';
import { formatCurrency, formatProbability, formatProbabilityAsOdds } from '@/lib/utils/formatting';

interface HouseStatsProps {
  stats: HouseStatsType;
  simulationMode?: 'normal' | 'removeHitSlots';
}

export function HouseStats({ stats, simulationMode = 'normal' }: HouseStatsProps) {
  const { 
    totalEarnings, 
    totalSpins, 
    prizeDistribution, 
    worstBreak, 
    bestBreak,
    worstBreakProbability,
    bestBreakProbability,
    worstBreakSpinProbability,
    bestBreakSpinProbability,
    shortTermRisk
  } = stats;
  
  // Calculate average earnings per spin
  const avgEarningsPerSpin = totalSpins > 0 ? totalEarnings / totalSpins : 0;
  
  // Calculate profit rate as a percentage
  const profitRate = totalSpins > 0 ? (totalEarnings / totalSpins) * 100 : 0;
  
  return (
    <div className="space-y-4">
      <div className="card bg-card p-4 rounded-lg shadow-sm">
        <div className="card-header pb-2 border-b border-border">
          <h3 className="text-lg font-medium">House Statistics</h3>
        </div>
        
        <div className="card-content pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="stat-item">
              <span className="text-sm text-muted-foreground">Total Earnings</span>
              <span className={`text-2xl font-bold ${totalEarnings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(totalEarnings)}
              </span>
            </div>
            
            <div className="stat-item">
              <span className="text-sm text-muted-foreground">Total Spins</span>
              <span className="text-2xl font-bold">
                {totalSpins.toLocaleString()}
              </span>
            </div>
            
            <div className="stat-item">
              <span className="text-sm text-muted-foreground">Average Per Spin</span>
              <span className={`text-2xl font-bold ${avgEarningsPerSpin >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(avgEarningsPerSpin)}
              </span>
            </div>
            
            <div className="stat-item">
              <span className="text-sm text-muted-foreground">Profit Rate</span>
              <span className={`text-2xl font-bold ${profitRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {profitRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card bg-card p-4 rounded-lg shadow-sm">
        <div className="card-content">
          <div className="stat-item text-center">
            <span className="text-sm text-muted-foreground">Short-Term Risk</span>
            <span className={`text-2xl font-bold ${(shortTermRisk ?? 0) < 0.1 ? 'text-green-500' : (shortTermRisk ?? 0) < 0.5 ? 'text-yellow-500' : 'text-red-500'}`}>
              {shortTermRisk !== undefined ? `${(shortTermRisk * 100).toFixed(1)}%` : 'N/A'}
            </span>
            <span className="text-sm text-muted-foreground mt-1">
              Probability of negative profit in next break
            </span>
          </div>
        </div>
      </div>
      
      {/* Display break performance stats only in removeHitSlots mode */}
      {simulationMode === 'removeHitSlots' && (
        <div className="card bg-card p-4 rounded-lg shadow-sm">
          <div className="card-content">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Break Performance</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Best Break Statistics */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Best Break:</span>
                    <span className="text-green-500">
                      {bestBreak?.spins ? 
                        `${formatCurrency(bestBreak.profit)} / ${bestBreak.spins} spins` : 
                        'N/A'}
                    </span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>Per Spin:</span>
                    <span className="text-green-500">
                      {bestBreak?.spins ? 
                        `${formatCurrency(bestBreak.profit / bestBreak.spins)}` : 
                        'N/A'}
                    </span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>Break Sequence Probability:</span>
                    <span>{formatProbability(bestBreakProbability)}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>Odds (Break):</span>
                    <span>{formatProbabilityAsOdds(bestBreakProbability)}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>Spin Sequence Probability:</span>
                    <span className={`${(bestBreakSpinProbability ?? 0) >= 0.1 ? 'text-green-500' : 'text-gray-500'}`}>
                      {formatProbability(bestBreakSpinProbability)}
                    </span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>Odds (Spin):</span>
                    <span>{formatProbabilityAsOdds(bestBreakSpinProbability)}</span>
                  </div>
                </div>
                
                {/* Worst Break Statistics */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Worst Break:</span>
                    <span className="text-red-500">
                      {worstBreak?.spins ? 
                        `${formatCurrency(worstBreak.profit)} / ${worstBreak.spins} spins` : 
                        'N/A'}
                    </span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>Per Spin:</span>
                    <span className="text-red-500">
                      {worstBreak?.spins ? 
                        `${formatCurrency(worstBreak.profit / worstBreak.spins)}` : 
                        'N/A'}
                    </span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>Break Sequence Probability:</span>
                    <span>{formatProbability(worstBreakProbability)}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>Odds (Break):</span>
                    <span>{formatProbabilityAsOdds(worstBreakProbability)}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>Spin Sequence Probability:</span>
                    <span className={`${(worstBreakSpinProbability ?? 0) < 0.1 ? 'text-green-500' : (worstBreakSpinProbability ?? 0) < 0.5 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {formatProbability(worstBreakSpinProbability)}
                    </span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>Odds (Spin):</span>
                    <span>{formatProbabilityAsOdds(worstBreakSpinProbability)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
