import { Card, CardContent } from '@/components/ui/card'
import { SimulationStats, formatCurrency } from '@/lib/utils'

interface SimulationResultsProps {
  stats: SimulationStats
}

const SimulationResults = ({ stats }: SimulationResultsProps) => {
  const { targetHitAttempt, totalCost, finalSpinResult, finalPrize, finalProfit } = stats
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Target Hit on Attempt</span>
            <span className="text-2xl font-bold">{targetHitAttempt}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Cost</span>
            <span className="text-2xl font-bold">{formatCurrency(totalCost)}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Final Spin Result</span>
            <span className="text-2xl font-bold">Slot {finalSpinResult}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Final Prize</span>
            <span className="text-2xl font-bold">{formatCurrency(finalPrize)}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Net Profit/Loss</span>
            <span className={`text-2xl font-bold ${finalProfit - totalCost + finalPrize >= 0 ? 'profit' : 'loss'}`}>
              {formatCurrency(finalProfit - totalCost + finalPrize)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SimulationResults
