/**
 * Simulation History Component
 * Displays a table of simulation history
 */

import { SpinResult } from '@/lib/types/simulation';
import { formatCurrency } from '@/lib/utils/formatting';

interface SimulationHistoryProps {
  history: SpinResult[];
}

export function SimulationHistory({ history }: SimulationHistoryProps) {
  if (!history.length) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No simulation history yet. Run a simulation to see results.
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="p-2 text-left font-medium">Attempt</th>
            <th className="p-2 text-left font-medium">Slot #</th>
            <th className="p-2 text-left font-medium">Prize Type</th>
            <th className="p-2 text-left font-medium">Cost</th>
            <th className="p-2 text-left font-medium">Prize</th>
            <th className="p-2 text-left font-medium">Profit</th>
          </tr>
        </thead>
        <tbody>
          {history.map((spin) => (
            <tr key={spin.attempt} className="border-t border-border hover:bg-muted/30">
              <td className="p-2">{spin.attempt}</td>
              <td className="p-2">{spin.result}</td>
              <td className="p-2">{spin.prizeType}</td>
              <td className="p-2">{formatCurrency(spin.cost)}</td>
              <td className="p-2">{formatCurrency(spin.prize)}</td>
              <td className={`p-2 ${spin.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(spin.profit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
