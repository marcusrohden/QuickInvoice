import { Card, CardContent } from '@/components/ui/card'
import { HouseStatsType, formatCurrency } from '@/lib/utils'

interface HouseStatsProps {
  stats: HouseStatsType
}

const HouseStats = ({ stats }: HouseStatsProps) => {
  const { totalEarnings, totalSpins, nonTargetPrizes, targetPrizes } = stats
  
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
            <span className="text-sm text-muted-foreground">Non-Target Prizes</span>
            <span className="text-2xl font-bold">{nonTargetPrizes}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Target Prizes</span>
            <span className="text-2xl font-bold">{targetPrizes}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HouseStats
