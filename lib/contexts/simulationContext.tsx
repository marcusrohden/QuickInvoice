/**
 * Simulation Context
 * Provides global access to simulation state and actions
 */

import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSimulation } from '@/lib/hooks/useSimulation';
import { usePrizeConfigurations } from '@/lib/hooks/usePrizeConfigurations';
import { loadConfiguration } from '@/lib/services/configurationService';
import { 
  PrizeConfig, 
  SpinResult, 
  SimulationStats, 
  HouseStatsType 
} from '@/lib/types/simulation';

interface SimulationContextType {
  // Game parameters
  totalSlots: number;
  costPerSpin: number;
  defaultPrize: number;
  commissionFee: number;
  
  // Setters for game parameters
  setTotalSlots: (value: number) => void;
  setCostPerSpin: (value: number) => void;
  setDefaultPrize: (value: number) => void;
  setCommissionFee: (value: number) => void;
  
  // Prize configurations
  prizeConfigs: PrizeConfig[];
  remainingSlots: number;
  newPrizeName: string;
  newPrizeValue: number;
  newPrizeSlots: number;
  showPrizeModal: boolean;
  
  // Setters for prize configurations
  setPrizeConfigs: (configs: PrizeConfig[]) => void;
  setNewPrizeName: (name: string) => void;
  setNewPrizeValue: (value: number) => void;
  setNewPrizeSlots: (slots: number) => void;
  setShowPrizeModal: (show: boolean) => void;
  
  // Prize configuration actions
  addPrizeConfig: () => boolean;
  removePrizeConfig: (id: string) => void;
  toggleStopWhenHit: (id: string) => void;
  
  // Simulation state
  simulationStats: SimulationStats | null;
  spinHistory: SpinResult[];
  houseStats: HouseStatsType;
  simulationMode: 'normal' | 'removeHitSlots';
  hitSlots: number[];
  availableSlots: number;
  showSaveModal: boolean;
  isLoading: boolean;
  
  // Setters for simulation state
  setSimulationMode: (mode: 'normal' | 'removeHitSlots') => void;
  setShowSaveModal: (show: boolean) => void;
  
  // Simulation actions
  singleSpin: () => void;
  spinMultipleTimes: (spins: number) => void;
  runBreaks: (breakCount: number) => void;
  clearHistory: () => void;
  loadConfig: (id: number) => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  // Game parameters
  const [totalSlots, setTotalSlots] = useState(25);
  const [costPerSpin, setCostPerSpin] = useState(25);
  const [defaultPrize, setDefaultPrize] = useState(10);
  const [commissionFee, setCommissionFee] = useState(0);
  
  // Prize configurations hook
  const prizeConfig = usePrizeConfigurations({ totalSlots });
  
  // Simulation hook
  const simulation = useSimulation({
    totalSlots,
    costPerSpin,
    defaultPrize,
    commissionFee,
    prizeConfigs: prizeConfig.prizeConfigs
  });
  
  // Additional state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get search params to check if we're loading a configuration
  const searchParams = useSearchParams();
  
  // Load configuration if configId is in the URL
  useEffect(() => {
    const configId = searchParams.get('config');
    if (configId) {
      loadConfig(parseInt(configId));
    }
  }, [searchParams]);
  
  /**
   * Load a configuration from the API
   * @param id - The ID of the configuration to load
   */
  const loadConfig = async (id: number) => {
    try {
      setIsLoading(true);
      const config = await loadConfiguration(id);
      
      if (!config) {
        throw new Error('Failed to load configuration');
      }
      
      // Update state with loaded configuration
      setTotalSlots(config.totalSlots);
      setCostPerSpin(config.pricePerSpin);
      setDefaultPrize(config.defaultPrize);
      prizeConfig.setPrizeConfigs(config.prizeConfigs);
      
      // Reset simulation data
      simulation.clearHistory();
    } catch (error) {
      console.error('Error loading configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Combine all values and functions into a single context value
  const contextValue: SimulationContextType = {
    // Game parameters
    totalSlots,
    costPerSpin,
    defaultPrize,
    commissionFee,
    
    // Setters for game parameters
    setTotalSlots,
    setCostPerSpin,
    setDefaultPrize,
    setCommissionFee,
    
    // Prize configurations (from usePrizeConfigurations hook)
    prizeConfigs: prizeConfig.prizeConfigs,
    remainingSlots: prizeConfig.remainingSlots,
    newPrizeName: prizeConfig.newPrizeName,
    newPrizeValue: prizeConfig.newPrizeValue,
    newPrizeSlots: prizeConfig.newPrizeSlots,
    showPrizeModal: prizeConfig.showPrizeModal,
    
    // Setters for prize configurations
    setPrizeConfigs: prizeConfig.setPrizeConfigs,
    setNewPrizeName: prizeConfig.setNewPrizeName,
    setNewPrizeValue: prizeConfig.setNewPrizeValue,
    setNewPrizeSlots: prizeConfig.setNewPrizeSlots,
    setShowPrizeModal: prizeConfig.setShowPrizeModal,
    
    // Prize configuration actions
    addPrizeConfig: prizeConfig.addPrizeConfig,
    removePrizeConfig: prizeConfig.removePrizeConfig,
    toggleStopWhenHit: prizeConfig.toggleStopWhenHit,
    
    // Simulation state (from useSimulation hook)
    simulationStats: simulation.simulationStats,
    spinHistory: simulation.spinHistory,
    houseStats: simulation.houseStats,
    simulationMode: simulation.simulationMode,
    hitSlots: simulation.hitSlots,
    availableSlots: simulation.availableSlots,
    
    // Additional state
    showSaveModal,
    isLoading,
    
    // Setters for simulation state
    setSimulationMode: simulation.setSimulationMode,
    setShowSaveModal,
    
    // Simulation actions
    singleSpin: simulation.singleSpin,
    spinMultipleTimes: simulation.spinMultipleTimes,
    runBreaks: simulation.runBreaks,
    clearHistory: simulation.clearHistory,
    loadConfig
  };
  
  return (
    <SimulationContext.Provider value={contextValue}>
      {children}
    </SimulationContext.Provider>
  );
}

/**
 * Hook for accessing the simulation context
 * @returns The simulation context
 * @throws Error if used outside SimulationProvider
 */
export function useSimulationContext() {
  const context = useContext(SimulationContext);
  
  if (!context) {
    throw new Error('useSimulationContext must be used within a SimulationProvider');
  }
  
  return context;
}
