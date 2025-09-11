import React, { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import useUserStakingDetails from '../../hooks/useUserStakingDetails';
import useStakingPool from '../../hooks/useStakingPool';
import useTokenBalance from '../../hooks/useTokenBalance';
import { useStakingDataUpdates } from '../../contexts/StakingUpdateContext.jsx';
import { formatTokenAmount, formatDuration } from '../../config/index.js';

export default function StakingStats() {
  const { address } = useAccount();
  const { userDetails, loading: userLoading } = useUserStakingDetails();
  const { poolData, loading: poolLoading } = useStakingPool();
  const { balance } = useTokenBalance();

  // Local state for real-time updates
  const [realTimeData, setRealTimeData] = useState({
    userStaked: null,
    userBalance: null,
    userPendingRewards: null,
    totalStaked: null,
    currentRewardRate: null,
    totalRewards: null,
    timeUntilUnlock: null,
  });

  // Update real-time data when hook data changes (initial load - optional)
  useEffect(() => {
    // Only set initial data if we don't have real-time data yet
    const hasRealTimeData = Object.values(realTimeData).some(value => value !== null);
    
    if (!hasRealTimeData && userDetails && poolData && balance !== undefined) {
      setRealTimeData(prev => ({
        ...prev,
        userStaked: userDetails.stakedAmount,
        userBalance: balance,
        userPendingRewards: userDetails.pendingRewards,
        totalStaked: poolData.totalStaked,
        currentRewardRate: poolData.currentRewardRate,
        totalRewards: poolData.totalRewards,
        timeUntilUnlock: userDetails.timeUntilUnlock,
      }));
    }
  }, [userDetails, poolData, balance, realTimeData]);

  // Event handlers for real-time updates - ALL AT TOP LEVEL
  const handleStakedEvent = useCallback((logs) => {
    console.log('🔥 Staked event received:', logs);
    logs.forEach(log => {
      const { user, amount, newTotalStaked, currentRewardRate } = log.args;
      
      if (user.toLowerCase() === address?.toLowerCase()) {
        setRealTimeData(prev => ({
          ...prev,
          userStaked: (prev.userStaked || 0n) + amount,
          userBalance: (prev.userBalance || 0n) - amount,
          totalStaked: newTotalStaked,
          currentRewardRate: currentRewardRate,
        }));
        console.log(`User ${user} staked ${formatTokenAmount(amount)} STK`);
      } else {
        setRealTimeData(prev => ({
          ...prev,
          totalStaked: newTotalStaked,
          currentRewardRate: currentRewardRate,
        }));
      }
    });
  }, [address]);

  const handleWithdrawnEvent = useCallback((logs) => {
    console.log('💰 Withdrawn event received:', logs);
    logs.forEach(log => {
      const { user, amount, newTotalStaked, currentRewardRate, rewardsAccrued } = log.args;
      
      if (user.toLowerCase() === address?.toLowerCase()) {
        setRealTimeData(prev => ({
          ...prev,
          userStaked: (prev.userStaked || 0n) - amount,
          userBalance: (prev.userBalance || 0n) + amount + rewardsAccrued,
          userPendingRewards: 0n,
          totalStaked: newTotalStaked,
          currentRewardRate: currentRewardRate,
          timeUntilUnlock: 0n,
        }));
      } else {
        setRealTimeData(prev => ({
          ...prev,
          totalStaked: newTotalStaked,
          currentRewardRate: currentRewardRate,
        }));
      }
    });
  }, [address]);

  const handleRewardsClaimedEvent = useCallback((logs) => {
    console.log('🎁 Rewards claimed event received:', logs);
    logs.forEach(log => {
      const { user, amount, newPendingRewards } = log.args;
      
      if (user.toLowerCase() === address?.toLowerCase()) {
        setRealTimeData(prev => ({
          ...prev,
          userBalance: (prev.userBalance || 0n) + amount,
          userPendingRewards: newPendingRewards,
        }));
      }
    });
  }, [address]);

  const handleRewardRateUpdatedEvent = useCallback((logs) => {
    console.log('📈 Reward rate updated event received:', logs);
    logs.forEach(log => {
      const { newRate } = log.args;
      setRealTimeData(prev => ({
        ...prev,
        currentRewardRate: newRate,
      }));
    });
  }, []);

  const handleEmergencyWithdrawnEvent = useCallback((logs) => {
    console.log('🚨 Emergency withdrawn event received:', logs);
    logs.forEach(log => {
      const { user, amount, penalty, newTotalStaked } = log.args;
      
      if (user.toLowerCase() === address?.toLowerCase()) {
        const netAmount = amount - penalty;
        setRealTimeData(prev => ({
          ...prev,
          userStaked: 0n,
          userBalance: (prev.userBalance || 0n) + netAmount,
          userPendingRewards: 0n,
          totalStaked: newTotalStaked,
          timeUntilUnlock: 0n,
        }));
      } else {
        setRealTimeData(prev => ({
          ...prev,
          totalStaked: newTotalStaked,
        }));
      }
    });
  }, [address]);

  // Event callbacks object for the hook - USING REGULAR OBJECT, NOT useMemo WITH useCallback
  const eventCallbacks = {
    Staked: handleStakedEvent,
    Withdrawn: handleWithdrawnEvent,
    RewardsClaimed: handleRewardsClaimedEvent,
    RewardRateUpdated: handleRewardRateUpdatedEvent,
    EmergencyWithdrawn: handleEmergencyWithdrawnEvent,
  };

  // Use the event listening hook
  const { isListening } = useStakingEvents(eventCallbacks);

  // Memoize static data that rarely changes
  const staticPoolData = useMemo(() => ({
    emergencyWithdrawPenalty: poolData?.emergencyWithdrawPenalty || 0n,
    lockPeriod: poolData?.lockPeriod || 0n,
    maxRewardRate: poolData?.maxRewardRate || 0n,
  }), [poolData]);

  // Combine real-time and static data for display - PREFER EVENTS OVER HOOK DATA
  const displayData = useMemo(() => {
    // Always try to use real-time data first, fallback to hook data only if needed
    return {
      userStaked: realTimeData.userStaked ?? userDetails?.stakedAmount ?? 0n,
      userBalance: realTimeData.userBalance ?? balance ?? 0n,
      userPendingRewards: realTimeData.userPendingRewards ?? userDetails?.pendingRewards ?? 0n,
      totalStaked: realTimeData.totalStaked ?? poolData?.totalStaked ?? 0n,
      currentRewardRate: realTimeData.currentRewardRate ?? poolData?.currentRewardRate ?? 0n,
      totalRewards: realTimeData.totalRewards ?? poolData?.totalRewards ?? 0n,
      timeUntilUnlock: realTimeData.timeUntilUnlock ?? userDetails?.timeUntilUnlock ?? 0n,
    };
  }, [realTimeData, userDetails, poolData, balance]);

  if (!address) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Staking Statistics
        </h3>
        <p className="text-gray-600">Connect your wallet to view staking statistics</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Staking Statistics
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">Your Staking</h4>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Staked Amount</p>
            <p className="text-xl font-semibold text-blue-600">
              {formatTokenAmount(displayData.userStaked, 18)}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Wallet Balance</p>
            <p className="text-xl font-semibold text-green-600">
              {formatTokenAmount(displayData.userBalance, 18)}
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Pending Rewards</p>
            <p className="text-xl font-semibold text-yellow-600">
              {formatTokenAmount(displayData.userPendingRewards, 18)}
            </p>
          </div>

          {displayData.timeUntilUnlock > 0n && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Time Until Unlock</p>
              <p className="text-lg font-semibold text-orange-600">
                {formatDuration(displayData.timeUntilUnlock)}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">Pool Statistics</h4>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Staked</p>
            <p className="text-xl font-semibold text-purple-600">
              {formatTokenAmount(displayData.totalStaked, 18)}
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Current Reward Rate</p>
            <p className="text-lg font-semibold text-indigo-600">
              {formatTokenAmount(displayData.currentRewardRate, 18)}/sec
            </p>
          </div>

          <div className="bg-pink-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Rewards Distributed</p>
            <p className="text-lg font-semibold text-pink-600">
              {formatTokenAmount(displayData.totalRewards, 18)}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Lock Period</p>
            <p className="text-lg font-semibold text-gray-600">
              {formatDuration(staticPoolData.lockPeriod)}
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Emergency Withdraw Penalty</p>
            <p className="text-lg font-semibold text-red-600">
              {Number(staticPoolData.emergencyWithdrawPenalty) / 100}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
