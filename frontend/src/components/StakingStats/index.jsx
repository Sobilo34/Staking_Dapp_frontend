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

  // Local state for function-triggered updates
  const [realTimeData, setRealTimeData] = useState({
    userStaked: null,
    userBalance: null,
    userPendingRewards: null,
    totalStaked: null,
    currentRewardRate: null,
    totalRewards: null,
    timeUntilUnlock: null,
  });

  // Initialize with hook data on first load
  useEffect(() => {
    const hasRealTimeData = Object.values(realTimeData).some(value => value !== null);
    
    if (!hasRealTimeData && userDetails && poolData && balance !== undefined) {
      console.log('📊 Initializing StakingStats with hook data');
      setRealTimeData({
        userStaked: userDetails.stakedAmount,
        userBalance: balance,
        userPendingRewards: userDetails.pendingRewards,
        totalStaked: poolData.totalStaked,
        currentRewardRate: poolData.currentRewardRate,
        totalRewards: poolData.totalRewards,
        timeUntilUnlock: userDetails.timeUntilUnlock,
      });
    }
  }, [userDetails, poolData, balance, realTimeData]);

  // Handle function-triggered updates
  const handleFunctionUpdate = React.useCallback(({ eventData, functionType, isCurrentUser }) => {
    console.log(`🔄 StakingStats processing ${functionType} update:`, { 
      eventData, 
      isCurrentUser,
      eventCount: Object.keys(eventData).length 
    });

    // Log all event logs in detail
    Object.entries(eventData).forEach(([eventName, logs]) => {
      console.log(`📡 ${eventName} Event Details:`, {
        eventName,
        logCount: logs.length,
        logs: logs.map(log => ({
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
          address: log.address,
          args: log.args,
          parsedArgs: Object.entries(log.args).reduce((acc, [key, value]) => {
            if (typeof value === 'bigint') {
              acc[key] = {
                raw: value.toString(),
                formatted: formatTokenAmount(value)
              };
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        }))
      });
    });

    if (!isCurrentUser) {
      // For other users' actions, only update pool-level data
      if (eventData.Staked || eventData.Withdrawn || eventData.EmergencyWithdrawn) {
        const logs = eventData.Staked || eventData.Withdrawn || eventData.EmergencyWithdrawn;
        logs.forEach(log => {
          const { newTotalStaked } = log.args;
          console.log(`📈 [OTHER USER] Updating total staked:`, {
            oldValue: realTimeData.totalStaked?.toString() || 'null',
            newValue: newTotalStaked.toString(),
            formatted: formatTokenAmount(newTotalStaked)
          });
          setRealTimeData(prev => ({
            ...prev,
            totalStaked: newTotalStaked,
          }));
        });
      }
      
      if (eventData.RewardRateUpdated) {
        eventData.RewardRateUpdated.forEach(log => {
          const { newRate, totalStaked } = log.args;
          console.log(`📊 [OTHER USER] Updating reward rate:`, {
            oldRate: realTimeData.currentRewardRate?.toString() || 'null',
            newRate: newRate.toString(),
            formattedRate: formatTokenAmount(newRate),
            totalStaked: totalStaked.toString(),
            formattedTotal: formatTokenAmount(totalStaked)
          });
          setRealTimeData(prev => ({
            ...prev,
            currentRewardRate: newRate,
            totalStaked: totalStaked,
          }));
        });
      }
      return;
    }

    // Handle current user's function updates
    console.log(`🎯 Processing CURRENT USER action: ${functionType}`);
    
    switch (functionType) {
      case 'stake':
        if (eventData.Staked) {
          console.log(`🔥 Processing STAKE event - ${eventData.Staked.length} log(s)`);
          eventData.Staked.forEach((log, index) => {
            const { user, amount, newTotalStaked, currentRewardRate } = log.args;
            console.log(`🔥 [STAKE LOG ${index + 1}] Event details:`, {
              user,
              amount: amount.toString(),
              formattedAmount: formatTokenAmount(amount),
              newTotalStaked: newTotalStaked.toString(),
              formattedTotalStaked: formatTokenAmount(newTotalStaked),
              currentRewardRate: currentRewardRate.toString(),
              formattedRewardRate: formatTokenAmount(currentRewardRate),
              isCurrentUser: user.toLowerCase() === address?.toLowerCase()
            });
            
            if (user.toLowerCase() === address?.toLowerCase()) {
              console.log(`🔥 [UPDATING STATE] User staked ${formatTokenAmount(amount)} STK`, {
                beforeState: {
                  userStaked: realTimeData.userStaked?.toString() || 'null',
                  userBalance: realTimeData.userBalance?.toString() || 'null',
                  totalStaked: realTimeData.totalStaked?.toString() || 'null'
                }
              });
              
              setRealTimeData(prev => {
                const newState = {
                  ...prev,
                  userStaked: (prev.userStaked || 0n) + amount,
                  userBalance: (prev.userBalance || 0n) - amount,
                  totalStaked: newTotalStaked,
                  currentRewardRate: currentRewardRate,
                };
                
                console.log(`🔥 [STATE UPDATED] New state:`, {
                  userStaked: newState.userStaked.toString(),
                  formattedUserStaked: formatTokenAmount(newState.userStaked),
                  userBalance: newState.userBalance.toString(),
                  formattedUserBalance: formatTokenAmount(newState.userBalance),
                  totalStaked: newState.totalStaked.toString(),
                  formattedTotalStaked: formatTokenAmount(newState.totalStaked)
                });
                
                return newState;
              });
            }
          });
        }
        break;

      case 'withdraw':
        if (eventData.Withdrawn) {
          console.log(`💰 Processing WITHDRAW event - ${eventData.Withdrawn.length} log(s)`);
          eventData.Withdrawn.forEach((log, index) => {
            const { user, amount, newTotalStaked } = log.args;
            console.log(`💰 [WITHDRAW LOG ${index + 1}] Event details:`, {
              user,
              amount: amount.toString(),
              formattedAmount: formatTokenAmount(amount),
              newTotalStaked: newTotalStaked.toString(),
              formattedTotalStaked: formatTokenAmount(newTotalStaked),
              isCurrentUser: user.toLowerCase() === address?.toLowerCase()
            });
            
            if (user.toLowerCase() === address?.toLowerCase()) {
              console.log(`💰 [UPDATING STATE] User withdrew ${formatTokenAmount(amount)} STK`, {
                beforeState: {
                  userStaked: realTimeData.userStaked?.toString() || 'null',
                  userBalance: realTimeData.userBalance?.toString() || 'null'
                }
              });
              
              setRealTimeData(prev => {
                const newState = {
                  ...prev,
                  userStaked: (prev.userStaked || 0n) - amount,
                  userBalance: (prev.userBalance || 0n) + amount,
                  totalStaked: newTotalStaked,
                  timeUntilUnlock: 0n, // Reset lock time after withdraw
                };
                
                console.log(`💰 [STATE UPDATED] New state after withdraw:`, {
                  userStaked: newState.userStaked.toString(),
                  formattedUserStaked: formatTokenAmount(newState.userStaked),
                  userBalance: newState.userBalance.toString(),
                  formattedUserBalance: formatTokenAmount(newState.userBalance),
                  timeUntilUnlock: newState.timeUntilUnlock.toString()
                });
                
                return newState;
              });
            }
          });
        }
        break;

      case 'claim':
        if (eventData.RewardsClaimed) {
          console.log(`🎁 Processing CLAIM event - ${eventData.RewardsClaimed.length} log(s)`);
          eventData.RewardsClaimed.forEach((log, index) => {
            const { user, amount } = log.args;
            console.log(`🎁 [CLAIM LOG ${index + 1}] Event details:`, {
              user,
              amount: amount.toString(),
              formattedAmount: formatTokenAmount(amount),
              isCurrentUser: user.toLowerCase() === address?.toLowerCase()
            });
            
            if (user.toLowerCase() === address?.toLowerCase()) {
              console.log(`🎁 [UPDATING STATE] User claimed ${formatTokenAmount(amount)} STK rewards`, {
                beforeState: {
                  userPendingRewards: realTimeData.userPendingRewards?.toString() || 'null',
                  userBalance: realTimeData.userBalance?.toString() || 'null'
                }
              });
              
              setRealTimeData(prev => {
                const newState = {
                  ...prev,
                  userPendingRewards: 0n, // Reset pending rewards
                  userBalance: (prev.userBalance || 0n) + amount,
                };
                
                console.log(`🎁 [STATE UPDATED] New state after claim:`, {
                  userPendingRewards: newState.userPendingRewards.toString(),
                  userBalance: newState.userBalance.toString(),
                  formattedUserBalance: formatTokenAmount(newState.userBalance)
                });
                
                return newState;
              });
            }
          });
        }
        break;

      case 'emergency':
        if (eventData.EmergencyWithdrawn) {
          console.log(`🚨 Processing EMERGENCY WITHDRAW event - ${eventData.EmergencyWithdrawn.length} log(s)`);
          eventData.EmergencyWithdrawn.forEach((log, index) => {
            const { user, amount, penalty, newTotalStaked } = log.args;
            const netAmount = amount - penalty;
            console.log(`🚨 [EMERGENCY LOG ${index + 1}] Event details:`, {
              user,
              amount: amount.toString(),
              formattedAmount: formatTokenAmount(amount),
              penalty: penalty.toString(),
              formattedPenalty: formatTokenAmount(penalty),
              netAmount: netAmount.toString(),
              formattedNetAmount: formatTokenAmount(netAmount),
              newTotalStaked: newTotalStaked.toString(),
              formattedTotalStaked: formatTokenAmount(newTotalStaked),
              isCurrentUser: user.toLowerCase() === address?.toLowerCase()
            });
            
            if (user.toLowerCase() === address?.toLowerCase()) {
              console.log(`🚨 [UPDATING STATE] User emergency withdrew ${formatTokenAmount(amount)} STK (${formatTokenAmount(penalty)} penalty)`, {
                beforeState: {
                  userStaked: realTimeData.userStaked?.toString() || 'null',
                  userBalance: realTimeData.userBalance?.toString() || 'null',
                  userPendingRewards: realTimeData.userPendingRewards?.toString() || 'null'
                }
              });
              
              setRealTimeData(prev => {
                const newState = {
                  ...prev,
                  userStaked: 0n,
                  userBalance: (prev.userBalance || 0n) + netAmount,
                  userPendingRewards: 0n,
                  totalStaked: newTotalStaked,
                  timeUntilUnlock: 0n,
                };
                
                console.log(`🚨 [STATE UPDATED] New state after emergency withdraw:`, {
                  userStaked: newState.userStaked.toString(),
                  userBalance: newState.userBalance.toString(),
                  formattedUserBalance: formatTokenAmount(newState.userBalance),
                  userPendingRewards: newState.userPendingRewards.toString(),
                  totalStaked: newState.totalStaked.toString(),
                  formattedTotalStaked: formatTokenAmount(newState.totalStaked)
                });
                
                return newState;
              });
            }
          });
        }
        break;
    }

    // Handle RewardRateUpdated for all function types
    if (eventData.RewardRateUpdated) {
      console.log(`📊 Processing REWARD RATE UPDATED event - ${eventData.RewardRateUpdated.length} log(s)`);
      eventData.RewardRateUpdated.forEach((log, index) => {
        const { newRate, totalStaked } = log.args;
        console.log(`📊 [RATE UPDATE LOG ${index + 1}] Event details:`, {
          newRate: newRate.toString(),
          formattedNewRate: formatTokenAmount(newRate),
          totalStaked: totalStaked.toString(),
          formattedTotalStaked: formatTokenAmount(totalStaked)
        });
        
        console.log(`📊 [UPDATING STATE] Reward rate updated to: ${formatTokenAmount(newRate)} per block`, {
          beforeState: {
            currentRewardRate: realTimeData.currentRewardRate?.toString() || 'null',
            totalStaked: realTimeData.totalStaked?.toString() || 'null'
          }
        });
        
        setRealTimeData(prev => {
          const newState = {
            ...prev,
            currentRewardRate: newRate,
            totalStaked: totalStaked,
          };
          
          console.log(`📊 [STATE UPDATED] New reward rate state:`, {
            currentRewardRate: newState.currentRewardRate.toString(),
            formattedRewardRate: formatTokenAmount(newState.currentRewardRate),
            totalStaked: newState.totalStaked.toString(),
            formattedTotalStaked: formatTokenAmount(newState.totalStaked)
          });
          
          return newState;
        });
      });
    }
  }, [address, realTimeData]);

  // Register for function-triggered updates
  useStakingDataUpdates('stakingStats', handleFunctionUpdate);

  // Memoize static data that rarely changes
  const staticPoolData = useMemo(() => ({
    emergencyWithdrawPenalty: poolData?.emergencyWithdrawPenalty || 0n,
    lockPeriod: poolData?.lockPeriod || 0n,
    maxRewardRate: poolData?.maxRewardRate || 0n,
  }), [poolData]);

  // Combine real-time and static data for display - PREFER FUNCTION-TRIGGERED DATA
  const displayData = useMemo(() => {
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

  const loading = userLoading || poolLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Staking Dashboard</h2>
        <div className="flex items-center text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Function-Triggered Updates
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Staked Amount */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Your Staked Amount</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatTokenAmount(displayData.userStaked)} STK
          </p>
        </div>

        {/* User Token Balance */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Your Token Balance</p>
          <p className="text-2xl font-bold text-green-600">
            {formatTokenAmount(displayData.userBalance)} STK
          </p>
        </div>

        {/* User Pending Rewards */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600">Pending Rewards</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatTokenAmount(displayData.userPendingRewards)} STK
          </p>
        </div>

        {/* Total Staked */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm text-gray-600">Total Staked</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatTokenAmount(displayData.totalStaked)} STK
          </p>
        </div>

        {/* Current Reward Rate */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
          <p className="text-sm text-gray-600">Reward Rate</p>
          <p className="text-2xl font-bold text-teal-600">
            {formatTokenAmount(displayData.currentRewardRate)}/block
          </p>
        </div>

        {/* Lock Period Info */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Lock Period</p>
          <p className="text-2xl font-bold text-gray-600">
            {formatDuration(staticPoolData.lockPeriod)}
          </p>
        </div>
      </div>

      {/* Additional Info Row */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Until Unlock */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-600">Time Until Unlock</p>
          <p className="text-xl font-bold text-yellow-600">
            {displayData.timeUntilUnlock > 0 ? 
              formatDuration(displayData.timeUntilUnlock) : 
              'Unlocked'
            }
          </p>
        </div>

        {/* Emergency Withdraw Penalty */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600">Emergency Withdraw Penalty</p>
          <p className="text-xl font-bold text-red-600">
            {Number(staticPoolData.emergencyWithdrawPenalty) / 100}%
          </p>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <details>
            <summary className="text-sm font-medium text-gray-700 cursor-pointer">Debug Info</summary>
            <div className="mt-2 text-xs text-gray-600">
              <p><strong>Real-time data:</strong> {JSON.stringify(realTimeData, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2)}</p>
              <p><strong>Address:</strong> {address}</p>
              <p><strong>Data source:</strong> Function-triggered updates only</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
