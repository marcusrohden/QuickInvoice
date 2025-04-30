import { Card, CardContent } from '@/components/ui/card'
import { HouseStatsType, formatCurrency } from '@/lib/utils'

interface HouseStatsProps {
  stats: HouseStatsType
  simulationMode?: 'normal' | 'removeHitSlots'
}

const HouseStats = ({ stats, simulationMode = 'normal' }: HouseStatsProps) => {
  const { totalEarnings, totalSpins, prizeDistribution, bestBreak, worstBreak } = stats
  
  // Count total prizes from prize distribution
  const totalPrizes = Object.values(prizeDistribution || {}).reduce((sum, count) => sum + count, 0);
  
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
      
      {/* Display best/worst break stats only in removeHitSlots mode */}
      {simulationMode === 'removeHitSlots' && (
        <>
          <Card className="md:col-span-2">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Best Break</span>
                <span className="text-2xl font-bold profit">
                  {bestBreak?.spins ? 
                    `${formatCurrency(bestBreak.profit)} / ${bestBreak.spins} spins` : 
                    'N/A'}
                </span>
                <span className="stat-sublabel">
                  {bestBreak?.spins ? 
                    `${formatCurrency(bestBreak.profit / bestBreak.spins)}/spin` : 
                    ''}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Worst Break</span>
                <span className="text-2xl font-bold loss">
                  {worstBreak?.spins ? 
                    `${formatCurrency(worstBreak.profit)} / ${worstBreak.spins} spins` : 
                    'N/A'}
                </span>
                <span className="stat-sublabel">
                  {worstBreak?.spins ? 
                    `${formatCurrency(worstBreak.profit / worstBreak.spins)}/spin` : 
                    ''}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default HouseStats
