/**
 * Simulation Results Component
 * Displays results from a simulation run
 */

import { SimulationStats } from '@/lib/types/simulation';
import { formatCurrency } from '@/lib/utils/formatting';

interface SimulationResultsProps {
  stats: SimulationStats | null;
}

export function SimulationResults({ stats }: SimulationResultsProps) {
  if (!stats) {
    return null;
  }
  
  const { 
    targetHitAttempt, 
    totalCost, 
    finalSpinResult, 
    finalPrize, 
    finalProfit, 
    finalPrizeType 
  } = stats;
  
  return (
    <div className="card bg-card p-4 rounded-lg shadow-sm">
      <div className="card-header pb-2 border-b border-border">
        <h3 className="text-lg font-medium">Simulation Results</h3>
      </div>
      
      <div className="card-content pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="stat-item">
            <span className="text-sm text-muted-foreground">Spin Count</span>
            <span className="text-2xl font-bold">
              {targetHitAttempt.toLocaleString()}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="text-sm text-muted-foreground">Last Slot Hit</span>
            <span className="text-2xl font-bold">
              Slot #{finalSpinResult}
            </span>
            <span className="text-sm text-muted-foreground block">
              {finalPrizeType}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="text-sm text-muted-foreground">Total Cost</span>
            <span className="text-2xl font-bold">
              {formatCurrency(totalCost)}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="text-sm text-muted-foreground">Last Prize</span>
            <span className="text-2xl font-bold">
              {formatCurrency(finalPrize)}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="text-sm text-muted-foreground">Profit</span>
            <span className={`text-2xl font-bold ${finalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(finalProfit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
