import { useEffect, useCallback, useRef } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { stakingContractConfig } from '../config/index.js';

/**
 * Custom hook for listening to staking contract events
 * This hook provides a clean interface for subscribing to specific events
 * and handles cleanup automatically
 */
export const useStakingEvents = (eventCallbacks = {}) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const unsubscribersRef = useRef([]);

  // Event definitions
  const eventDefinitions = {
    Staked: {
      type: 'event',
      name: 'Staked',
      inputs: [
        { name: 'user', type: 'address', indexed: true },
        { name: 'amount', type: 'uint256', indexed: false },
        { name: 'timestamp', type: 'uint256', indexed: false },
        { name: 'newTotalStaked', type: 'uint256', indexed: false },
        { name: 'currentRewardRate', type: 'uint256', indexed: false }
      ]
    },
    Withdrawn: {
      type: 'event',
      name: 'Withdrawn',
      inputs: [
        { name: 'user', type: 'address', indexed: true },
        { name: 'amount', type: 'uint256', indexed: false },
        { name: 'timestamp', type: 'uint256', indexed: false },
        { name: 'newTotalStaked', type: 'uint256', indexed: false },
        { name: 'currentRewardRate', type: 'uint256', indexed: false },
        { name: 'rewardsAccrued', type: 'uint256', indexed: false }
      ]
    },
    RewardsClaimed: {
      type: 'event',
      name: 'RewardsClaimed',
      inputs: [
        { name: 'user', type: 'address', indexed: true },
        { name: 'amount', type: 'uint256', indexed: false },
        { name: 'timestamp', type: 'uint256', indexed: false },
        { name: 'newPendingRewards', type: 'uint256', indexed: false },
        { name: 'totalStaked', type: 'uint256', indexed: false }
      ]
    },
    RewardRateUpdated: {
      type: 'event',
      name: 'RewardRateUpdated',
      inputs: [
        { name: 'oldRate', type: 'uint256', indexed: false },
        { name: 'newRate', type: 'uint256', indexed: false },
        { name: 'timestamp', type: 'uint256', indexed: false },
        { name: 'totalStaked', type: 'uint256', indexed: false }
      ]
    },
    EmergencyWithdrawn: {
      type: 'event',
      name: 'EmergencyWithdrawn',
      inputs: [
        { name: 'user', type: 'address', indexed: true },
        { name: 'amount', type: 'uint256', indexed: false },
        { name: 'penalty', type: 'uint256', indexed: false },
        { name: 'timestamp', type: 'uint256', indexed: false },
        { name: 'newTotalStaked', type: 'uint256', indexed: false }
      ]
    },
    StakingInitialized: {
      type: 'event',
      name: 'StakingInitialized',
      inputs: [
        { name: 'stakingToken', type: 'address', indexed: true },
        { name: 'initialRewardRate', type: 'uint256', indexed: false },
        { name: 'timestamp', type: 'uint256', indexed: false }
      ]
    }
  };

  // Cleanup function
  const cleanup = useCallback(() => {
    unsubscribersRef.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing from event:', error);
      }
    });
    unsubscribersRef.current = [];
  }, []);

  useEffect(() => {
    if (!publicClient || !address || Object.keys(eventCallbacks).length === 0) {
      return;
    }

    // Clean up any existing subscriptions
    cleanup();

    // Set up new event watchers
    Object.entries(eventCallbacks).forEach(([eventName, callback]) => {
      if (!eventDefinitions[eventName]) {
        console.warn(`Unknown event: ${eventName}`);
        return;
      }

      try {
        const unsubscribe = publicClient.watchEvent({
          address: stakingContractConfig.address,
          event: eventDefinitions[eventName],
          onLogs: callback,
          pollingInterval: 500, // Poll every 500ms for faster updates
          fromBlock: 'latest', // Start listening from latest block
        });

        unsubscribersRef.current.push(unsubscribe);
      } catch (error) {
        console.error(`Error setting up ${eventName} event watcher:`, error);
      }
    });

    // Cleanup on unmount or dependency change
    return cleanup;
  }, [publicClient, address, eventCallbacks, cleanup]);

  // Manual cleanup function for external use
  const stopListening = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return {
    stopListening,
    isListening: unsubscribersRef.current.length > 0,
  };
};

export default useStakingEvents;
