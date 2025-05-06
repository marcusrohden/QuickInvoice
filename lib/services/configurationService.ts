/**
 * Configuration Service
 * Handles saving and loading configurations
 */

import { PrizeConfig } from '../types/simulation';
import { tryCatch, isErrorResponse } from '../utils/errorHandling';

/**
 * Configuration data structure
 */
export interface Configuration {
  id?: number;
  name: string;
  description: string;
  totalSlots: number;
  pricePerSpin: number;
  defaultPrize: number;
  prizeConfigs: PrizeConfig[];
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Save a configuration to the database
 * @param config - Configuration data to save
 * @returns Saved configuration with ID
 */
export async function saveConfiguration(config: Configuration): Promise<Configuration> {
  return await tryCatch(async () => {
    const response = await fetch('/api/configurations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save configuration');
    }
    
    return await response.json();
  }) as Configuration;
}

/**
 * Load a configuration by ID
 * @param id - Configuration ID to load
 * @returns Configuration data or null if not found
 */
export async function loadConfiguration(id: number): Promise<Configuration | null> {
  const result = await tryCatch(async () => {
    const response = await fetch(`/api/configurations/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      
      const error = await response.json();
      throw new Error(error.message || 'Failed to load configuration');
    }
    
    return await response.json();
  });
  
  if (isErrorResponse(result)) {
    throw new Error(result.message);
  }
  
  return result;
}

/**
 * Get all public configurations
 * @returns Array of public configurations
 */
export async function getPublicConfigurations(): Promise<Configuration[]> {
  const result = await tryCatch(async () => {
    const response = await fetch('/api/configurations/public');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to load public configurations');
    }
    
    return await response.json();
  });
  
  if (isErrorResponse(result)) {
    throw new Error(result.message);
  }
  
  return result as Configuration[];
}

/**
 * Get all configurations for the current user
 * @returns Array of configurations
 */
export async function getUserConfigurations(): Promise<Configuration[]> {
  const result = await tryCatch(async () => {
    const response = await fetch('/api/configurations/user');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to load user configurations');
    }
    
    return await response.json();
  });
  
  if (isErrorResponse(result)) {
    throw new Error(result.message);
  }
  
  return result as Configuration[];
}

/**
 * Delete a configuration
 * @param id - Configuration ID to delete
 * @returns Success status
 */
export async function deleteConfiguration(id: number): Promise<boolean> {
  const result = await tryCatch(async () => {
    const response = await fetch(`/api/configurations/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete configuration');
    }
    
    return true;
  });
  
  if (isErrorResponse(result)) {
    throw new Error(result.message);
  }
  
  return result as boolean;
}
