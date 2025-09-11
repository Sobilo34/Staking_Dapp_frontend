import { useAccount, usePublicClient } from 'wagmi';
import { stakingContractConfig } from '../config/index.js';

/**
 * Development utility hook for testing event listening
 * This hook provides functions to simulate and test event handling
 */
export const useEventTester = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  /**
   * Get historical events for testing
   * Useful for testing event handlers with real historical data
   */
  const getHistoricalEvents = async (eventName, fromBlock = 'earliest', toBlock = 'latest') => {
    if (!publicClient) {
      console.error('Public client not available');
      return [];
    }

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
    };

    if (!eventDefinitions[eventName]) {
      console.error(`Unknown event: ${eventName}`);
      return [];
    }

    try {
      const logs = await publicClient.getLogs({
        address: stakingContractConfig.address,
        event: eventDefinitions[eventName],
        fromBlock,
        toBlock,
      });

      console.log(`Found ${logs.length} ${eventName} events:`, logs);
      return logs;
    } catch (error) {
      console.error(`Error fetching ${eventName} events:`, error);
      return [];
    }
  };

  /**
   * Test event handler with mock data
   */
  const testEventHandler = (eventName, mockData) => {
    console.log(`Testing ${eventName} event handler with data:`, mockData);
    
    // Simulate log structure
    const mockLog = {
      args: mockData,
      address: stakingContractConfig.address,
      blockNumber: BigInt(Date.now()),
      transactionHash: `0x${'0'.repeat(64)}`,
    };

    return [mockLog];
  };

  /**
   * Generate mock event data for testing
   */
  const generateMockEventData = (eventName, userAddress = address) => {
    const mockData = {
      Staked: {
        user: userAddress,
        amount: BigInt('1000000000000000000'), // 1 STK
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        newTotalStaked: BigInt('10000000000000000000'), // 10 STK
        currentRewardRate: BigInt('5'), // 5%
      },
      Withdrawn: {
        user: userAddress,
        amount: BigInt('500000000000000000'), // 0.5 STK
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        newTotalStaked: BigInt('9500000000000000000'), // 9.5 STK
        currentRewardRate: BigInt('5'), // 5%
        rewardsAccrued: BigInt('50000000000000000'), // 0.05 STK rewards
      },
      RewardsClaimed: {
        user: userAddress,
        amount: BigInt('100000000000000000'), // 0.1 STK rewards
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        newPendingRewards: BigInt('0'),
        totalStaked: BigInt('10000000000000000000'), // 10 STK
      },
      RewardRateUpdated: {
        oldRate: BigInt('5'),
        newRate: BigInt('7'),
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        totalStaked: BigInt('10000000000000000000'), // 10 STK
      },
      EmergencyWithdrawn: {
        user: userAddress,
        amount: BigInt('1000000000000000000'), // 1 STK
        penalty: BigInt('100000000000000000'), // 0.1 STK penalty (10%)
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        newTotalStaked: BigInt('9000000000000000000'), // 9 STK
      },
    };

    return mockData[eventName] || {};
  };

  /**
   * Log current event listening status
   */
  const checkEventListening = () => {
    console.log('Event Listening Status:', {
      address,
      publicClientAvailable: !!publicClient,
      stakingContractAddress: stakingContractConfig.address,
    });
  };

  return {
    getHistoricalEvents,
    testEventHandler,
    generateMockEventData,
    checkEventListening,
  };
};

export default useEventTester;
