/**
 * Game Parameters Component
 * Handles user input for game configuration settings
 */

import { useSimulationContext } from '@/lib/contexts/simulationContext';
import { formatCurrency } from '@/lib/utils/formatting';

export function GameParameters() {
  const {
    totalSlots,
    setTotalSlots,
    costPerSpin,
    setCostPerSpin,
    defaultPrize,
    setDefaultPrize,
    commissionFee,
    setCommissionFee,
    remainingSlots
  } = useSimulationContext();
  
  /**
   * Handler for total slots change
   */
  const handleTotalSlotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setTotalSlots(value);
    }
  };
  
  /**
   * Handler for cost per spin change
   */
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setCostPerSpin(value);
    }
  };
  
  /**
   * Handler for default prize value change
   */
  const handleDefaultPrizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setDefaultPrize(value);
    }
  };
  
  /**
   * Handler for commission fee percentage change
   */
  const handleCommissionFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setCommissionFee(value);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="form-group">
        <label htmlFor="totalSlots" className="block text-sm font-medium mb-1">Total Number of Slots</label>
        <input
          id="totalSlots"
          type="number"
          min="2"
          value={totalSlots}
          onChange={handleTotalSlotsChange}
          className="w-full p-2 border border-border rounded-md"
        />
        <p className="text-hint text-sm text-muted-foreground mt-1">Total slots on the wheel</p>
      </div>
      
      <div className="form-group">
        <label htmlFor="costPerSpin" className="block text-sm font-medium mb-1">Price per Spin</label>
        <input
          id="costPerSpin"
          type="number"
          min="0"
          value={costPerSpin}
          onChange={handleCostChange}
          className="w-full p-2 border border-border rounded-md"
        />
        <p className="text-hint text-sm text-muted-foreground mt-1">Current: {formatCurrency(costPerSpin)}</p>
      </div>
      
      <div className="form-group">
        <label htmlFor="defaultPrize" className="block text-sm font-medium mb-1">Default Prize</label>
        <input
          id="defaultPrize"
          type="number"
          min="0"
          value={defaultPrize}
          onChange={handleDefaultPrizeChange}
          className="w-full p-2 border border-border rounded-md"
        />
        <p className="text-hint text-sm text-muted-foreground mt-1">Current: {formatCurrency(defaultPrize)}</p>
        <p className="text-hint text-sm text-muted-foreground">For {remainingSlots} default slots</p>
      </div>
      
      <div className="form-group">
        <label htmlFor="commissionFee" className="block text-sm font-medium mb-1">Platform Commission (%)</label>
        <input
          id="commissionFee"
          type="number"
          min="0"
          max="100"
          value={commissionFee}
          onChange={handleCommissionFeeChange}
          className="w-full p-2 border border-border rounded-md"
        />
        <p className="text-hint text-sm text-muted-foreground mt-1">Fee paid to external platform hosting the games</p>
      </div>
    </div>
  );
}
