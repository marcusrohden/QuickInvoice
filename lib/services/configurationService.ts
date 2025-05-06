/**
 * Configuration Service
 * Handles loading and saving simulation configurations
 */

import { PrizeConfig } from '../types/simulation';

/**
 * Load a configuration from the API
 * @param id - The ID of the configuration to load
 * @returns The loaded configuration, or null if an error occurred
 */
export async function loadConfiguration(id: number): Promise<{
  totalSlots: number;
  pricePerSpin: number;
  defaultPrize: number;
  prizeConfigs: PrizeConfig[];
} | null> {
  try {
    const response = await fetch(`/api/configurations/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load configuration: ${response.status}`);
    }
    
    const config = await response.json();
    
    // Convert prize configs to our format
    const formattedPrizeConfigs = Array.isArray(config.prizeConfigs) 
      ? config.prizeConfigs.map((prize: any, index: number) => ({
          id: prize.id || `prize_${Date.now()}_${index}`, // Use existing ID or generate a unique one
          name: prize.name || `Prize ${index + 1}`,
          unitCost: prize.unitCost || prize.value || 0, // support both new and old format
          slots: prize.slots || 0,
          stopWhenHit: prize.stopWhenHit !== undefined ? prize.stopWhenHit : true // Default to true if not specified
        }))
      : [];
    
    return {
      totalSlots: config.totalSlots,
      pricePerSpin: config.pricePerSpin,
      defaultPrize: config.defaultPrize,
      prizeConfigs: formattedPrizeConfigs
    };
  } catch (error) {
    console.error('Error loading configuration:', error);
    return null;
  }
}

/**
 * Save a configuration to the API
 * @param config - The configuration to save
 * @param name - Optional name for the configuration
 * @param description - Optional description for the configuration
 * @param isPublic - Whether the configuration should be public
 * @returns The ID of the saved configuration, or null if an error occurred
 */
export async function saveConfiguration(
  config: {
    totalSlots: number;
    pricePerSpin: number;
    defaultPrize: number;
    prizeConfigs: PrizeConfig[];
  },
  name: string,
  description: string = '',
  isPublic: boolean = false
): Promise<number | null> {
  try {
    const response = await fetch('/api/configurations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        isPublic,
        totalSlots: config.totalSlots,
        pricePerSpin: config.pricePerSpin,
        defaultPrize: config.defaultPrize,
        prizeConfigs: config.prizeConfigs
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save configuration: ${response.status}`);
    }
    
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error saving configuration:', error);
    return null;
  }
}

/**
 * Get all configurations
 * @returns Array of configurations, or empty array if an error occurred
 */
export async function getConfigurations(): Promise<any[]> {
  try {
    const response = await fetch('/api/configurations');
    
    if (!response.ok) {
      throw new Error(`Failed to get configurations: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting configurations:', error);
    return [];
  }
}

/**
 * Delete a configuration
 * @param id - The ID of the configuration to delete
 * @returns Whether the deletion was successful
 */
export async function deleteConfiguration(id: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/configurations/${id}`, {
      method: 'DELETE'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return false;
  }
}
