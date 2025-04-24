import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SpinResult, formatCurrency } from '@/lib/utils'

interface SimulationHistoryProps {
  history: SpinResult[]
}

const SimulationHistory = ({ history }: SimulationHistoryProps) => {
  if (history.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No spin history yet. Run a simulation to see results.</p>
      </div>
    )
  }

  return (
    <div className="history-table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Attempt</TableHead>
            <TableHead>Spin Result</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Prize</TableHead>
            <TableHead>Profit/Loss</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((spin, index) => (
            <TableRow key={index}>
              <TableCell>{spin.attempt}</TableCell>
              <TableCell>Slot {spin.result}</TableCell>
              <TableCell>{formatCurrency(spin.cost)}</TableCell>
              <TableCell>{formatCurrency(spin.prize)}</TableCell>
              <TableCell className={spin.profit >= 0 ? 'profit' : 'loss'}>
                {formatCurrency(spin.profit)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default SimulationHistory
