import React, { createContext, useContext, useCallback, useState } from 'react';
import { useAccount } from 'wagmi';

/**
 * Context for coordinating staking data updates across components
 * This replaces continuous event polling with function-triggered updates
 */
const StakingUpdateContext = createContext();

export const StakingUpdateProvider = ({ children }) => {
  const { address } = useAccount();
  const [updateCallbacks, setUpdateCallbacks] = useState({});

  /**
   * Register a component to receive updates
   * @param {string} componentId - Unique identifier for the component
   * @param {Function} callback - Function to call when updates occur
   */
  const registerForUpdates = useCallback((componentId, callback) => {
    setUpdateCallbacks(prev => ({
      ...prev,
      [componentId]: callback
    }));

    // Return cleanup function
    return () => {
      setUpdateCallbacks(prev => {
        const newCallbacks = { ...prev };
        delete newCallbacks[componentId];
        return newCallbacks;
      });
    };
  }, []);

  /**
   * Trigger updates across all registered components
   * @param {Object} eventData - Event data from blockchain
   * @param {string} functionType - Type of function that was executed
   * @param {string} userAddress - Address of user who performed the action
   */
  const triggerUpdates = useCallback((eventData, functionType, userAddress) => {
    console.log(`🔄 [UPDATE CONTEXT] Triggering updates for ${functionType}:`, {
      eventData,
      userAddress,
      registeredComponents: Object.keys(updateCallbacks),
      componentCount: Object.keys(updateCallbacks).length
    });
    
    // Call all registered update callbacks
    Object.entries(updateCallbacks).forEach(([componentId, callback]) => {
      try {
        const updatePayload = {
          eventData,
          functionType,
          userAddress,
          isCurrentUser: userAddress?.toLowerCase() === address?.toLowerCase()
        };
        
        console.log(`🔄 [UPDATE CONTEXT] Calling ${componentId} callback:`, updatePayload);
        callback(updatePayload);
        console.log(`✅ [UPDATE CONTEXT] Successfully called ${componentId} callback`);
      } catch (error) {
        console.error(`❌ [UPDATE CONTEXT] Error in update callback for ${componentId}:`, error);
      }
    });
  }, [updateCallbacks, address]);

  const contextValue = {
    registerForUpdates,
    triggerUpdates
  };

  return (
    <StakingUpdateContext.Provider value={contextValue}>
      {children}
    </StakingUpdateContext.Provider>
  );
};

/**
 * Hook to access staking update functionality
 */
export const useStakingUpdateContext = () => {
  const context = useContext(StakingUpdateContext);
  if (!context) {
    throw new Error('useStakingUpdateContext must be used within StakingUpdateProvider');
  }
  return context;
};

/**
 * Hook for components to register for and handle staking updates
 * @param {string} componentId - Unique identifier for the component
 * @param {Function} onUpdate - Function to handle updates
 */
export const useStakingDataUpdates = (componentId, onUpdate) => {
  const { registerForUpdates } = useStakingUpdateContext();
  
  React.useEffect(() => {
    const cleanup = registerForUpdates(componentId, onUpdate);
    return cleanup;
  }, [componentId, onUpdate, registerForUpdates]);
};
