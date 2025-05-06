/**
 * Simulation Controls Component
 * Provides UI for controlling the simulation
 */

import { useSimulationContext } from '@/lib/contexts/simulationContext';

export function SimulationControls() {
  const { 
    simulationMode, 
    singleSpin, 
    spinMultipleTimes, 
    runBreaks, 
    clearHistory, 
    setShowSaveModal 
  } = useSimulationContext();
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <button 
          className="button-primary"
          onClick={() => simulationMode === 'normal' ? spinMultipleTimes(1000) : runBreaks(1000)}
        >
          1000x {simulationMode === 'removeHitSlots' ? 'Breaks' : 'Spins'}
        </button>
        
        <button 
          className="button-primary"
          onClick={() => simulationMode === 'normal' ? spinMultipleTimes(100) : runBreaks(100)}
        >
          100x {simulationMode === 'removeHitSlots' ? 'Breaks' : 'Spins'}
        </button>
        
        <button 
          className="button-primary"
          onClick={() => simulationMode === 'normal' ? spinMultipleTimes(10) : runBreaks(10)}
        >
          10x {simulationMode === 'removeHitSlots' ? 'Breaks' : 'Spins'}
        </button>
        
        <button 
          className="button-secondary"
          onClick={() => simulationMode === 'normal' ? singleSpin() : runBreaks(1)}
        >
          Single {simulationMode === 'removeHitSlots' ? 'Break' : 'Spin'}
        </button>
        
        <button 
          className="button-danger"
          onClick={clearHistory}
        >
          Clear History
        </button>
      </div>
      
      <div className="flex justify-end">
        <button 
          className="button-secondary"
          onClick={() => setShowSaveModal(true)}
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}
