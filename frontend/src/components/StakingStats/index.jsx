import React from 'react';
import { useAccount } from 'wagmi';
import useUserStakingDetails from '../../hooks/useUserStakingDetails';
import useStakingPool from '../../hooks/useStakingPool';
import useTokenBalance from '../../hooks/useTokenBalance';
import { formatTokenAmount, formatDuration } from '../../config/index.js';

export default function StakingStats() {
  const { address } = useAccount();
  const { userDetails, loading: userLoading } = useUserStakingDetails();
  const { poolData, loading: poolLoading } = useStakingPool();
  const { balance } = useTokenBalance();

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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Staking Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* User Staked Amount */}
        <div className="bg-gray-50 p-4 rounded border">
          <p className="text-sm text-gray-600 mb-1">Your Staked Amount</p>
          <p className="text-xl font-medium text-gray-900">
            {formatTokenAmount(userDetails?.stakedAmount || 0n)} STK
          </p>
        </div>

        {/* User Token Balance */}
        <div className="bg-white p-4 rounded border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Your Token Balance</p>
          <p className="text-xl font-medium text-gray-900">
            {formatTokenAmount(balance || 0n)} STK
          </p>
        </div>

        {/* User Pending Rewards */}
        <div className="bg-blue-50 p-4 rounded border border-blue-100">
          <p className="text-sm text-gray-600 mb-1">Pending Rewards</p>
          <p className="text-xl font-medium text-blue-700">
            {formatTokenAmount(userDetails?.pendingRewards || 0n)} STK
          </p>
        </div>

        {/* Total Staked */}
        <div className="bg-green-50 p-4 rounded border border-green-100">
          <p className="text-sm text-gray-600 mb-1">Total Staked</p>
          <p className="text-xl font-medium text-green-700">
            {formatTokenAmount(poolData?.totalStaked || 0n)} STK
          </p>
        </div>

        {/* Current Reward Rate */}
        <div className="bg-amber-50 p-4 rounded border border-amber-100">
          <p className="text-sm text-gray-600 mb-1">Reward Rate</p>
          <p className="text-xl font-medium text-amber-700">
            {formatTokenAmount(poolData?.currentRewardRate || 0n)}/block
          </p>
        </div>

        {/* Lock Period Info */}
        <div className="bg-gray-100 p-4 rounded border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Lock Period</p>
          <p className="text-xl font-medium text-gray-900">
            {formatDuration(poolData?.lockPeriod || 0n)}
          </p>
        </div>
      </div>

      {/* Additional Info Row */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Time Until Unlock */}
        <div className="bg-orange-50 p-4 rounded border border-orange-100">
          <p className="text-sm text-gray-600 mb-1">Time Until Unlock</p>
          <p className="text-lg font-medium text-orange-700">
            {(userDetails?.timeUntilUnlock || 0n) > 0 ? 
              formatDuration(userDetails.timeUntilUnlock) : 
              'Unlocked'
            }
          </p>
        </div>

        {/* Emergency Withdraw Penalty */}
        <div className="bg-red-50 p-4 rounded border border-red-100">
          <p className="text-sm text-gray-600 mb-1">Emergency Withdraw Penalty</p>
          <p className="text-lg font-medium text-red-700">
            {Number(poolData?.emergencyWithdrawPenalty || 0n) / 100}%
          </p>
        </div>
      </div>
    </div>
  );
}
