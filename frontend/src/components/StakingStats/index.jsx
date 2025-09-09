import React from 'react';
import useUserStakingDetails from '../../hooks/useUserStakingDetails';
import useStakingPool from '../../hooks/useStakingPool';
import useTokenBalance from '../../hooks/useTokenBalance';
import { formatTokenAmount, formatDuration } from '../../config/index.js';

export default function StakingStats() {
  const { userDetails, loading: userLoading } = useUserStakingDetails();
  const { poolData, loading: poolLoading } = useStakingPool();
  const { balance } = useTokenBalance();

  console.log("User Details:", userDetails);
  console.log("Pool Data:", poolData);
  console.log("User Balance:", balance);
  if (userLoading || poolLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* User Balance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Available Balance</h3>
        <p className="text-2xl font-bold text-gray-900">
          {formatTokenAmount(balance)} STK
        </p>
      </div>

      {/* Staked Amount */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Your Staked</h3>
        <p className="text-2xl font-bold text-blue-600">
          {userDetails ? formatTokenAmount(userDetails.stakedAmount) : '0'} STK
        </p>
      </div>

      {/* Pending Rewards */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Rewards</h3>
        <p className="text-2xl font-bold text-green-600">
          {userDetails ? formatTokenAmount(userDetails.pendingRewards) : '0'} STK
        </p>
      </div>

      {/* Current APR */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Current APR</h3>
        <p className="text-2xl font-bold text-purple-600">
          {poolData.currentRewardRate ? Number(poolData.currentRewardRate) : 0}%
        </p>
      </div>

      {/* Total Pool Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Staked</h3>
        <p className="text-2xl font-bold text-gray-900">
          {formatTokenAmount(poolData.totalStaked)} STK
        </p>
      </div>

      {/* Lock Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Lock Status</h3>
        {userDetails?.timeUntilUnlock > 0 ? (
          <p className="text-2xl font-bold text-orange-600">
            {formatDuration(Number(userDetails.timeUntilUnlock))}
          </p>
        ) : (
          <p className="text-2xl font-bold text-green-600">Unlocked</p>
        )}
      </div>

      {/* Total Rewards Pool */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Rewards</h3>
        <p className="text-2xl font-bold text-indigo-600">
          {formatTokenAmount(poolData.totalRewards)} STK
        </p>
      </div>

      {/* Emergency Penalty */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Emergency Penalty</h3>
        <p className="text-2xl font-bold text-red-600">
          {Number(poolData.emergencyWithdrawPenalty)}%
        </p>
      </div>
    </div>
  );
}
