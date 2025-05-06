/**
 * Custom hook for managing prize configurations
 * Provides state and functions for handling prize configuration CRUD operations
 */

import { useState, useEffect } from 'react';
import { PrizeConfig } from '../types/simulation';

interface UsePrizeConfigurationsProps {
  totalSlots: number;
  initialConfigs?: PrizeConfig[];
}

/**
 * Custom hook for managing prize configurations
 */
export function usePrizeConfigurations({ 
  totalSlots, 
  initialConfigs = [] 
}: UsePrizeConfigurationsProps) {
  // Prize configurations with their quantity and unit cost
  const [prizeConfigs, setPrizeConfigs] = useState<PrizeConfig[]>(initialConfigs.length > 0 
    ? initialConfigs 
    : [
        { id: "prize1", name: "Prize X", unitCost: 50, slots: 1, stopWhenHit: true },
        { id: "prize2", name: "Prize Z", unitCost: 30, slots: 3, stopWhenHit: true }
      ]
  );
  
  // Input for new prize configuration
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeValue, setNewPrizeValue] = useState(20);
  const [newPrizeSlots, setNewPrizeSlots] = useState(1);
  
  // Calculate remaining slots after special prizes
  const [remainingSlots, setRemainingSlots] = useState(totalSlots - 4); // Default 4 slots used
  
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
    // Validate input
    if (newPrizeName.trim() === '') {
      console.error('Please enter a prize name');
      return false;
    }
    
    if (newPrizeSlots <= 0) {
      console.error('Prize slots must be greater than 0');
      return false;
    }
    
    if (newPrizeValue <= 0) {
      console.error('Prize value must be greater than 0');
      return false;
    }
    
    // Check if there are enough remaining slots
    const usedSlots = prizeConfigs.reduce((total, prize) => total + prize.slots, 0);
    if (usedSlots + newPrizeSlots > totalSlots) {
      console.error(`Cannot add ${newPrizeSlots} slots. Only ${totalSlots - usedSlots} slots available.`);
      return false;
    }
    
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
  };
  
  /**
   * Remove a prize configuration
   * @param id - The ID of the prize to remove
   */
  const removePrizeConfig = (id: string) => {
    setPrizeConfigs(prizeConfigs.filter(prize => prize.id !== id));
  };
  
  /**
   * Toggle the stopWhenHit property of a prize configuration
   * @param id - The ID of the prize to update
   */
  const toggleStopWhenHit = (id: string) => {
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
  const resetToDefault = () => {
    setPrizeConfigs([
      { id: "prize1", name: "Prize X", unitCost: 50, slots: 1, stopWhenHit: true },
      { id: "prize2", name: "Prize Z", unitCost: 30, slots: 3, stopWhenHit: true }
    ]);
  };
  
  return {
    // State
    prizeConfigs,
    remainingSlots,
    newPrizeName,
    newPrizeValue,
    newPrizeSlots,
    showPrizeModal,
    
    // Setters
    setPrizeConfigs,
    setNewPrizeName,
    setNewPrizeValue,
    setNewPrizeSlots,
    setShowPrizeModal,
    
    // Actions
    addPrizeConfig,
    removePrizeConfig,
    toggleStopWhenHit,
    resetToDefault
  };
}
