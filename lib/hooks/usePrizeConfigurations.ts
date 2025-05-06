/**
 * Custom hook for managing prize configurations
 * Provides state and functions for handling prize configuration CRUD operations
 */

import { useState, useEffect } from 'react';
import { PrizeConfig } from '../types/simulation';
import { validateNotEmpty, validatePositiveNumber, validateSlots } from '../utils/validation';
import { ValidationError } from '../utils/errorHandling';

interface UsePrizeConfigurationsProps {
  totalSlots: number;
  initialConfigs?: PrizeConfig[];
}

// Default prize configurations for new instances
const DEFAULT_PRIZE_CONFIGS: PrizeConfig[] = [
  { id: "prize1", name: "Prize X", unitCost: 50, slots: 1, stopWhenHit: true },
  { id: "prize2", name: "Prize Z", unitCost: 30, slots: 3, stopWhenHit: true }
];

/**
 * Custom hook for managing prize configurations
 * @param totalSlots - Total number of slots available
 * @param initialConfigs - Initial prize configurations (optional)
 * @returns Object with prize configuration state and functions
 */
export function usePrizeConfigurations({ 
  totalSlots, 
  initialConfigs = [] 
}: UsePrizeConfigurationsProps) {
  // Prize configurations with their quantity and unit cost
  const [prizeConfigs, setPrizeConfigs] = useState<PrizeConfig[]>(
    initialConfigs.length > 0 ? initialConfigs : DEFAULT_PRIZE_CONFIGS
  );
  
  // Input for new prize configuration
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeValue, setNewPrizeValue] = useState(20);
  const [newPrizeSlots, setNewPrizeSlots] = useState(1);
  
  // Calculate remaining slots after special prizes
  const [remainingSlots, setRemainingSlots] = useState(totalSlots - 4); // Default 4 slots used
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  
  // Calculate remaining slots whenever prize configurations change
  useEffect(() => {
    const usedSlots = prizeConfigs.reduce((total, prize) => total + prize.slots, 0);
    const remaining = totalSlots - usedSlots;
    setRemainingSlots(remaining > 0 ? remaining : 0);
  }, [prizeConfigs, totalSlots]);
  
  /**
   * Add a new prize configuration
   * @returns Whether the addition was successful
   */
  const addPrizeConfig = (): boolean => {
    // Clear any previous errors
    setError(null);
    
    try {
      // Validate input using our validation utilities
      validateNotEmpty(newPrizeName.trim(), 'Prize name');
      validatePositiveNumber(newPrizeSlots, 'Number of slots');
      validatePositiveNumber(newPrizeValue, 'Prize value');
      
      // Check if there are enough remaining slots
      const usedSlots = prizeConfigs.reduce((total, prize) => total + prize.slots, 0);
      validateSlots(usedSlots + newPrizeSlots, totalSlots);
      
      // Generate a unique ID for the new prize using timestamp
      const uniqueId = `prize_${Date.now()}`;
      
      // Add new prize configuration
      const newPrize: PrizeConfig = {
        id: uniqueId,
        name: newPrizeName,
        unitCost: newPrizeValue,
        slots: newPrizeSlots,
        stopWhenHit: true // Default to true, can be toggled later in UI
      };
      
      setPrizeConfigs([...prizeConfigs, newPrize]);
      
      // Reset inputs
      setNewPrizeName('');
      setNewPrizeValue(20);
      setNewPrizeSlots(1);
      
      return true;
    } catch (e) {
      // Handle validation errors
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  };
  
  /**
   * Remove a prize configuration
   * @param id - The ID of the prize to remove
   */
  const removePrizeConfig = (id: string): void => {
    setPrizeConfigs(prizeConfigs.filter(prize => prize.id !== id));
  };
  
  /**
   * Toggle the stopWhenHit property of a prize configuration
   * @param id - The ID of the prize to update
   */
  const toggleStopWhenHit = (id: string): void => {
    const updatedConfigs = [...prizeConfigs];
    const index = updatedConfigs.findIndex(p => p.id === id);
    
    if (index !== -1) {
      updatedConfigs[index] = {
        ...updatedConfigs[index],
        stopWhenHit: !updatedConfigs[index].stopWhenHit
      };
      setPrizeConfigs(updatedConfigs);
    }
  };
  
  /**
   * Reset all prize configurations to default values
   */
  const resetToDefault = (): void => {
    setPrizeConfigs(DEFAULT_PRIZE_CONFIGS);
    setError(null);
  };
  
  /**
   * Update an existing prize configuration
   * @param id - ID of the prize to update
   * @param updatedConfig - New configuration values
   * @returns Whether the update was successful
   */
  const updatePrizeConfig = (id: string, updatedConfig: Partial<PrizeConfig>): boolean => {
    try {
      const configIndex = prizeConfigs.findIndex(p => p.id === id);
      if (configIndex === -1) {
        throw new Error(`Prize configuration with ID ${id} not found`);
      }
      
      // Calculate new total slots if slots are being updated
      if (updatedConfig.slots !== undefined) {
        const currentSlots = prizeConfigs[configIndex].slots;
        const otherSlots = prizeConfigs.reduce(
          (total, prize, idx) => total + (idx !== configIndex ? prize.slots : 0), 0
        );
        
        // Check if new slot count would exceed total slots
        validateSlots(otherSlots + updatedConfig.slots, totalSlots);
      }
      
      // Create updated prize config
      const newConfig = {
        ...prizeConfigs[configIndex],
        ...updatedConfig
      };
      
      // Validate the updated config
      validateNotEmpty(newConfig.name, 'Prize name');
      validatePositiveNumber(newConfig.unitCost, 'Prize value');
      validatePositiveNumber(newConfig.slots, 'Number of slots');
      
      // Update the config
      const newConfigs = [...prizeConfigs];
      newConfigs[configIndex] = newConfig;
      setPrizeConfigs(newConfigs);
      
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  };
  
  return {
    // State
    prizeConfigs,
    remainingSlots,
    newPrizeName,
    newPrizeValue,
    newPrizeSlots,
    showPrizeModal,
    error,
    
    // Setters
    setPrizeConfigs,
    setNewPrizeName,
    setNewPrizeValue,
    setNewPrizeSlots,
    setShowPrizeModal,
    setError,
    
    // Actions
    addPrizeConfig,
    removePrizeConfig,
    toggleStopWhenHit,
    updatePrizeConfig,
    resetToDefault
  };
}
