/**
 * Simulation Mode Tabs Component
 * Provides UI for switching between simulation modes
 */

import { useSimulationContext } from '@/lib/contexts/simulationContext';

export function SimulationModeTabs() {
  const { simulationMode, setSimulationMode } = useSimulationContext();
  
  return (
    <div className="space-y-4">
      <div className="tab-container flex border-b border-border">
        <div
          className={`tab px-4 py-2 cursor-pointer ${simulationMode === 'normal' ? 'active border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
          onClick={() => setSimulationMode('normal')}
        >
          Normal Mode
        </div>
        <div
          className={`tab px-4 py-2 cursor-pointer ${simulationMode === 'removeHitSlots' ? 'active border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
          onClick={() => setSimulationMode('removeHitSlots')}
        >
          Remove Hit Slots
        </div>
      </div>
      
      {simulationMode === 'removeHitSlots' && (
        <div className="mode-description bg-muted/30 p-4 rounded-md">
          <p>
            <strong>Remove Hit Slots Mode:</strong> A "break" continues until all prizes marked with "Stop When Hit" are hit.
            Prizes without this option checked are treated like default slots.
          </p>
        </div>
      )}
    </div>
  );
}
