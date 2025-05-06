/**
 * Save Configuration Modal Component
 * Provides UI for saving the current configuration
 */

import { useState } from 'react';
import { useSimulationContext } from '@/lib/contexts/simulationContext';
import { saveConfiguration } from '@/lib/services/configurationService';

export function SaveConfigurationModal() {
  const {
    totalSlots,
    costPerSpin,
    defaultPrize,
    prizeConfigs,
    showSaveModal,
    setShowSaveModal
  } = useSimulationContext();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name.trim()) {
      setError('Configuration name is required');
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      const config = {
        totalSlots,
        pricePerSpin: costPerSpin,
        defaultPrize,
        prizeConfigs
      };
      
      const configId = await saveConfiguration(config, name, description, isPublic);
      
      if (configId) {
        setSuccess(true);
        
        // Reset form after a delay
        setTimeout(() => {
          setName('');
          setDescription('');
          setIsPublic(false);
          setSuccess(false);
          setShowSaveModal(false);
        }, 2000);
      } else {
        setError('Failed to save configuration. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!showSaveModal) {
    return null;
  }
  
  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="modal-content bg-card w-full max-w-md rounded-lg shadow-lg">
        <div className="modal-header flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-lg font-medium">Save Configuration</h3>
          <button
            className="text-2xl leading-none"
            onClick={() => setShowSaveModal(false)}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Configuration saved successfully!
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="configName" className="block text-sm font-medium mb-1">
              Configuration Name*
            </label>
            <input
              id="configName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-border rounded-md"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="configDescription" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="configDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-border rounded-md h-24"
            />
          </div>
          
          <div className="form-group flex items-center">
            <input
              id="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isPublic" className="text-sm">
              Make this configuration public
            </label>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowSaveModal(false)}
              className="px-4 py-2 border border-border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
