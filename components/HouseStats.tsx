import { Card, CardContent } from '@/components/ui/card'
import { HouseStatsType, formatCurrency } from '@/lib/utils'

interface HouseStatsProps {
  stats: HouseStatsType
  simulationMode?: 'normal' | 'removeHitSlots'
}

const HouseStats = ({ stats, simulationMode = 'normal' }: HouseStatsProps) => {
  const { 
    totalEarnings, 
    totalSpins, 
    prizeDistribution, 
    bestBreak, 
    worstBreak,
    bestBreakProbability,
    worstBreakProbability,
    bestBreakSpinProbability,
    worstBreakSpinProbability,
    shortTermRisk,
    totalBreaks
  } = stats
  
  // Count total prizes from prize distribution
  const totalPrizes = Object.values(prizeDistribution || {}).reduce((sum, count) => sum + count, 0);
  
  // Format probability as percentage with scientific notation for very small numbers
  const formatProbability = (probability?: number): string => {
    if (probability === undefined || probability === 0) return 'N/A';
    
    // If probability is very small, use scientific notation
    if (probability < 0.0000001) {
      return probability.toExponential(6);
    }
    
    // Otherwise format as percentage with up to 6 decimal places
    return (probability * 100).toFixed(6) + '%';
  };
  
  // Convert exponential notation to "1 in X" format for readability
  const formatProbabilityAsOdds = (probability?: number): string => {
    if (probability === undefined || probability === 0) return 'N/A';
    
    const odds = Math.round(1 / probability);
    return `1 in ${odds.toLocaleString()}`;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">House Earnings</span>
            <span className={`text-2xl font-bold ${totalEarnings >= 0 ? 'profit' : 'loss'}`}>
              {formatCurrency(totalEarnings)}
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Spins</span>
            <span className="text-2xl font-bold">{totalSpins}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Prize Distribution</span>
            <span className="text-2xl font-bold">{totalPrizes} prizes</span>
            <div className="mt-2">
              {Object.entries(prizeDistribution || {}).map(([type, count]) => (
                <div key={type} className="text-sm flex justify-between">
                  <span>{type}:</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Profit Rate</span>
            <span className={`text-2xl font-bold ${totalEarnings >= 0 ? 'profit' : 'loss'}`}>
              {totalSpins > 0 
                ? `${((totalEarnings / totalSpins) * 100).toFixed(2)}%`
                : '0.00%'
              }
            </span>
            <span className="text-sm text-muted-foreground mt-1">
              Per spin average: {formatCurrency(totalSpins > 0 ? totalEarnings / totalSpins : 0)}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Short-Term Risk Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Short-Term Risk</span>
            <span className={`text-2xl font-bold ${(shortTermRisk ?? 0) < 0.1 ? 'text-green-500' : (shortTermRisk ?? 0) < 0.5 ? 'text-yellow-500' : 'text-red-500'}`}>
              {shortTermRisk !== undefined ? `${(shortTermRisk * 100).toFixed(1)}%` : 'N/A'}
            </span>
            <span className="text-sm text-muted-foreground mt-1">
              Odds of negative profit after 3 breaks
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Display break performance stats only in removeHitSlots mode */}
      {simulationMode === 'removeHitSlots' && (
        <Card className="md:col-span-4">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Break Performance</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Best Break Statistics */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Best Break:</span>
                    <span className="profit">
                      {bestBreak?.spins ? 
                        `${formatCurrency(bestBreak.profit)} / ${bestBreak.spins} spins` : 
                        'N/A'}
                    </span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>Per Spin:</span>
                    <span className="profit">
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
                    <span className="loss">
                      {worstBreak?.spins ? 
                        `${formatCurrency(worstBreak.profit)} / ${worstBreak.spins} spins` : 
                        'N/A'}
                    </span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>Per Spin:</span>
                    <span className="loss">
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default HouseStats
