/**
 * Prize Form Component
 * Handles the creation and display of prize configurations
 */

import { useState } from 'react';
import { PrizeConfig } from '@/lib/types/simulation';
import { formatCurrency } from '@/lib/utils/formatting';
import { validatePrizeConfig } from '@/lib/utils/validation';

interface PrizeFormProps {
  prizeConfigs: PrizeConfig[];
  defaultPrize: number;
  remainingSlots: number;
  simulationMode: 'normal' | 'removeHitSlots';
  onAddPrize: (name: string, value: number, slots: number) => void;
  onRemovePrize: (id: string) => void;
  onToggleStopWhenHit: (id: string) => void;
}

export function PrizeForm({
  prizeConfigs,
  defaultPrize,
  remainingSlots,
  simulationMode,
  onAddPrize,
  onRemovePrize,
  onToggleStopWhenHit
}: PrizeFormProps) {
  // Input for new prize configuration
  const [name, setName] = useState('');
  const [value, setValue] = useState(20);
  const [slots, setSlots] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the prize configuration
    const validation = validatePrizeConfig(name, value, slots, remainingSlots);
    
    if (!validation.isValid) {
      setError(validation.errorMessage || 'Invalid prize configuration');
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    // Add the prize and reset form
    onAddPrize(name, value, slots);
    setName('');
    setValue(20);
    setSlots(1);
  };
  
  return (
    <div className="space-y-4">
      <div className="prize-table-header">
        <h3 className="subsection-heading">Prize Configurations</h3>
      </div>
      
      {/* Prize Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-4 p-4 border border-border rounded-md">
        <h4 className="text-sm font-medium">Add New Prize</h4>
        
        {error && <div className="text-red-500 text-sm">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="newPrizeName" className="text-sm font-medium mb-1 block">Prize Name</label>
            <input
              id="newPrizeName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Jackpot"
              className="w-full p-2 border border-border rounded-md"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPrizeValue" className="text-sm font-medium mb-1 block">Prize Unit Cost</label>
            <input
              id="newPrizeValue"
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-border rounded-md"
            />
            <p className="text-hint text-sm text-muted-foreground mt-1">Current: {formatCurrency(value)}</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="newPrizeSlots" className="text-sm font-medium mb-1 block">Number of Slots</label>
            <input
              id="newPrizeSlots"
              type="number"
              min="1"
              max={remainingSlots}
              value={slots}
              onChange={(e) => setSlots(parseInt(e.target.value) || 1)}
              className="w-full p-2 border border-border rounded-md"
            />
            <p className="text-hint text-sm text-muted-foreground mt-1">{remainingSlots} slots available</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Add Prize
          </button>
        </div>
      </form>
      
      {/* Prize Table */}
      <div className="prize-table-container overflow-x-auto">
        <table className="prize-table w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Item</th>
              <th className="text-left p-2">Quantity</th>
              <th className="text-left p-2">Unit Cost</th>
              <th className="text-left p-2">Total</th>
              {simulationMode === 'removeHitSlots' && (
                <th className="text-left p-2">
                  Stop When Hit
                  <span className="tooltip ml-1" title="When checked, the break will only complete when all prizes with this option checked are hit. Unchecked prizes are treated like default slots.">ⓘ</span>
                </th>
              )}
              <th className="text-left p-2"></th>
            </tr>
          </thead>
          <tbody>
            {prizeConfigs.map((prize) => (
              <tr key={prize.id} className="border-t border-border">
                <td className="p-2">{prize.name}</td>
                <td className="p-2">{prize.slots} slot{prize.slots !== 1 ? 's' : ''}</td>
                <td className="p-2">{formatCurrency(prize.unitCost)}</td>
                <td className="p-2">{formatCurrency(prize.unitCost * prize.slots)}</td>
                {simulationMode === 'removeHitSlots' && (
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={prize.stopWhenHit}
                      onChange={() => onToggleStopWhenHit(prize.id)}
                      className="w-4 h-4"
                    />
                  </td>
                )}
                <td className="p-2">
                  <button 
                    className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                    onClick={() => onRemovePrize(prize.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            <tr className="default-prize-row border-t border-border bg-muted/50">
              <td className="p-2">Remaining Slots (Default)</td>
              <td className="p-2">{remainingSlots} slot{remainingSlots !== 1 ? 's' : ''}</td>
              <td className="p-2">{formatCurrency(defaultPrize)}</td>
              <td className="p-2">{formatCurrency(defaultPrize * remainingSlots)}</td>
              {simulationMode === 'removeHitSlots' && (
                <td className="p-2">N/A</td>
              )}
              <td className="p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
