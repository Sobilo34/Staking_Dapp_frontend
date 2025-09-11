import { useCallback, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { stakingContractConfig } from '../config/index.js';
import { formatTokenAmount } from '../config/index.js';

/**
 * Hook for function-triggered staking updates
 * This replaces continuous event polling with targeted event listening after function execution
 */
export const useStakingUpdates = () => {
  const publicClient = usePublicClient();
  const [isListeningForUpdate, setIsListeningForUpdate] = useState(false);

  /**
   * Listen for specific events after a function execution
   * @param {Object} options - Configuration for event listening
   * @param {string} options.functionType - Type of function executed ('stake', 'withdraw', 'claim', 'emergency')
   * @param {string} options.transactionHash - Hash of the completed transaction
   * @param {Function} options.onUpdate - Callback when events are found
   * @param {number} options.timeout - Max time to wait for events (default 10s)
   */
  const listenForFunctionEvents = useCallback(async ({ 
    functionType, 
    transactionHash, 
    onUpdate,
    timeout = 10000 
  }) => {
    if (!publicClient || !transactionHash) return;

    console.log(`🔍 [EVENT LISTENER] Starting to listen for ${functionType} events`, {
      transactionHash,
      timeout
    });

    setIsListeningForUpdate(true);
    
    try {
      // Get transaction receipt to find the block number
      console.log(`🔍 [EVENT LISTENER] Waiting for transaction receipt...`);
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: transactionHash,
        timeout 
      });
      
      console.log(`🔍 [EVENT LISTENER] Transaction receipt received:`, {
        status: receipt.status,
        blockNumber: receipt.blockNumber.toString(),
        transactionHash: receipt.transactionHash,
        logs: receipt.logs.length
      });
      
      if (receipt.status === 'reverted') {
        throw new Error('Transaction was reverted');
      }

      // Define which events to listen for based on function type
      const eventMap = {
        stake: ['Staked', 'RewardRateUpdated'],
        withdraw: ['Withdrawn', 'RewardRateUpdated'],
        claim: ['RewardsClaimed'],
        emergency: ['EmergencyWithdrawn', 'RewardRateUpdated']
      };

      const eventsToListen = eventMap[functionType] || [];
      console.log(`🔍 [EVENT LISTENER] Looking for events: ${eventsToListen.join(', ')}`);
      
      const eventData = {};

      // Listen for each relevant event
      for (const eventName of eventsToListen) {
        try {
          console.log(`🔍 [EVENT LISTENER] Searching for ${eventName} events in block ${receipt.blockNumber}`);
          
          const logs = await publicClient.getLogs({
            address: stakingContractConfig.address,
            event: getEventABI(eventName),
            fromBlock: receipt.blockNumber,
            toBlock: receipt.blockNumber
          });

          console.log(`🔍 [EVENT LISTENER] Found ${logs.length} ${eventName} events:`, logs);

          if (logs.length > 0) {
            eventData[eventName] = logs.map(log => {
              const parsedLog = {
                ...log,
                args: parseEventArgs(eventName, log)
              };
              
              console.log(`🔍 [EVENT LISTENER] Parsed ${eventName} log:`, {
                transactionHash: parsedLog.transactionHash,
                blockNumber: parsedLog.blockNumber.toString(),
                args: parsedLog.args,
                formattedArgs: Object.entries(parsedLog.args).reduce((acc, [key, value]) => {
                  if (typeof value === 'bigint') {
                    acc[key] = {
                      raw: value.toString(),
                      formatted: formatTokenAmount ? formatTokenAmount(value) : value.toString()
                    };
                  } else {
                    acc[key] = value;
                  }
                  return acc;
                }, {})
              });
              
              return parsedLog;
            });
          }
        } catch (eventError) {
          console.warn(`❌ [EVENT LISTENER] Failed to get ${eventName} events:`, eventError);
        }
      }

      // Call the update callback with the event data
      if (Object.keys(eventData).length > 0) {
        console.log(`✅ [EVENT LISTENER] Successfully found events for ${functionType}:`, {
          eventTypes: Object.keys(eventData),
          totalLogs: Object.values(eventData).flat().length,
          eventData
        });
        onUpdate(eventData, functionType);
      } else {
        console.warn(`⚠️ [EVENT LISTENER] No events found for ${functionType} transaction: ${transactionHash}`);
        // Still call onUpdate to trigger any necessary UI updates
        onUpdate({}, functionType);
      }

    } catch (error) {
      console.error(`❌ [EVENT LISTENER] Error listening for ${functionType} events:`, {
        error: error.message,
        transactionHash,
        functionType
      });
      // Call onUpdate with empty data to at least trigger UI refresh
      onUpdate({}, functionType);
    } finally {
      console.log(`🔍 [EVENT LISTENER] Finished listening for ${functionType} events`);
      setIsListeningForUpdate(false);
    }
  }, [publicClient]);

  return {
    listenForFunctionEvents,
    isListeningForUpdate
  };
};

/**
 * Get event ABI definition for a specific event
 */
function getEventABI(eventName) {
  const eventABIs = {
    Staked: {
      type: 'event',
      name: 'Staked',
      inputs: [
        { name: 'user', type: 'address', indexed: true },
        { name: 'amount', type: 'uint256', indexed: false },
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
        { name: 'newTotalStaked', type: 'uint256', indexed: false }
      ]
    },
    RewardsClaimed: {
      type: 'event',
      name: 'RewardsClaimed',
      inputs: [
        { name: 'user', type: 'address', indexed: true },
        { name: 'amount', type: 'uint256', indexed: false }
      ]
    },
    EmergencyWithdrawn: {
      type: 'event',
      name: 'EmergencyWithdrawn',
      inputs: [
        { name: 'user', type: 'address', indexed: true },
        { name: 'amount', type: 'uint256', indexed: false },
        { name: 'penalty', type: 'uint256', indexed: false },
        { name: 'newTotalStaked', type: 'uint256', indexed: false }
      ]
    },
    RewardRateUpdated: {
      type: 'event',
      name: 'RewardRateUpdated',
      inputs: [
        { name: 'oldRate', type: 'uint256', indexed: false },
        { name: 'newRate', type: 'uint256', indexed: false },
        { name: 'totalStaked', type: 'uint256', indexed: false }
      ]
    }
  };

  return eventABIs[eventName];
}

/**
 * Parse event arguments based on event type
 */
function parseEventArgs(eventName, log) {
  // The log already contains parsed args, just return them
  return log.args;
}
