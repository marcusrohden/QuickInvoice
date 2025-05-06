'use client'

/**
 * Main Page Component
 * Provides the entry point for the application
 */

import { Header } from '@/components/Header';
import { SimulationProvider } from '@/lib/contexts/simulationContext';
import {
  GameParameters,
  HouseStats,
  PrizeForm,
  SaveConfigurationModal,
  SimulationControls,
  SimulationHistory,
  SimulationModeTabs,
  SimulationResults
} from '@/components/simulation';
import { useSimulationContext } from '@/lib/contexts/simulationContext';

/**
 * Main Simulation Page
 * Wraps all components in the SimulationProvider
 */
export default function SimulationPage() {
  return (
    <SimulationProvider>
      <SimulationApp />
    </SimulationProvider>
  );
}

/**
 * Inner component that uses the simulation context
 */
function SimulationApp() {
  const {
    simulationStats,
    spinHistory,
    houseStats,
    simulationMode,
    prizeConfigs,
    defaultPrize,
    remainingSlots,
    isLoading,
    setNewPrizeName,
    setNewPrizeValue,
    setNewPrizeSlots,
    addPrizeConfig,
    removePrizeConfig,
    toggleStopWhenHit
  } = useSimulationContext();
  
  const handleAddPrize = (name: string, value: number, slots: number) => {
    setNewPrizeName(name);
    setNewPrizeValue(value);
    setNewPrizeSlots(slots);
    addPrizeConfig();
  };
  
  return (
    <div>
      <Header />
      
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Roulette Simulator</h1>
        
        <SimulationModeTabs />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-1">
            <div className="card bg-card p-4 rounded-lg shadow-sm">
              <div className="card-header pb-2 border-b border-border">
                <h2 className="text-xl font-semibold">Game Parameters</h2>
              </div>
              <div className="card-content pt-4">
                <GameParameters />
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="space-y-6">
              <div className="card bg-card p-4 rounded-lg shadow-sm">
                <div className="card-header pb-2 border-b border-border">
                  <h2 className="text-xl font-semibold">Prize Configuration</h2>
                </div>
                <div className="card-content pt-4">
                  <PrizeForm
                    prizeConfigs={prizeConfigs}
                    defaultPrize={defaultPrize}
                    remainingSlots={remainingSlots}
                    simulationMode={simulationMode}
                    onAddPrize={handleAddPrize}
                    onRemovePrize={removePrizeConfig}
                    onToggleStopWhenHit={toggleStopWhenHit}
                  />
                </div>
              </div>
              
              <div className="card bg-card p-4 rounded-lg shadow-sm">
                <div className="card-header pb-2 border-b border-border">
                  <h2 className="text-xl font-semibold">Simulation</h2>
                </div>
                <div className="card-content pt-4">
                  <SimulationControls />
                </div>
              </div>
              
              {simulationStats && (
                <SimulationResults stats={simulationStats} />
              )}
              
              <HouseStats stats={houseStats} simulationMode={simulationMode} />
              
              {spinHistory.length > 0 && (
                <div className="card bg-card p-4 rounded-lg shadow-sm">
                  <div className="card-header pb-2 border-b border-border">
                    <h2 className="text-xl font-semibold">Simulation History</h2>
                  </div>
                  <div className="card-content pt-4">
                    <SimulationHistory history={spinHistory} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <SaveConfigurationModal />
    </div>
  );
}
