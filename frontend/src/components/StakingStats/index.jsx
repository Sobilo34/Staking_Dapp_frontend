import React from 'react';
import { useAccount } from 'wagmi';
import useUserStakingDetails from '../../hooks/useUserStakingDetails';
import useStakingPool from '../../hooks/useStakingPool';
import useTokenBalance from '../../hooks/useTokenBalance';
import useStaking from '../../hooks/useStaking';
import useStakingEventData from '../../hooks/useStakingEventData';
import { formatTokenAmount, formatDuration } from '../../config/index.js';

export default function StakingStats() {
  const { address } = useAccount();
  const { userDetails, loading: userLoading } = useUserStakingDetails();
  const { poolData, loading: poolLoading } = useStakingPool();
  const { balance } = useTokenBalance();
  const { eventData, eventUpdateCount } = useStaking();
  const stakingEventData = useStakingEventData();

  const loading = userLoading || poolLoading;

  // Debug log to see if component re-renders
  console.log('🔄 StakingStats component render:', {
    eventUpdateCount,
    eventData,
    stakingEventData,
    hasUserStakedAmount: !!eventData.userStakedAmount,
    isFromEvents: stakingEventData.isFromEvents
  });

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
        
        {/* Debug Information */}
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>Event Updates: {eventUpdateCount}</p>
          <p>Event User Staked: {eventData.userStakedAmount || 'null'}</p>
          <p>Combined User Staked: {stakingEventData.userStakedAmount || 'null'}</p>
          <p>Is From Events: {stakingEventData.isFromEvents ? 'Yes' : 'No'}</p>
          <p>Last Update: {stakingEventData.lastUpdate?.toLocaleTimeString() || 'null'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* User Staked Amount */}
        <div className="bg-gray-50 p-4 rounded border">
          <p className="text-sm text-gray-600 mb-1">Your Staked Amount</p>
          <p className="text-xl font-medium text-gray-900">
            {stakingEventData.userStakedAmount ? 
              `${stakingEventData.userStakedAmount} STK` : 
              `${formatTokenAmount(userDetails?.stakedAmount || 0n)} STK`}
          </p>
          {stakingEventData.isFromEvents && (
            <p className="text-xs text-green-500">Real-time from events</p>
          )}
          {stakingEventData.lastUpdate && (
            <p className="text-xs text-gray-400">
              Updated: {stakingEventData.lastUpdate.toLocaleTimeString()}
            </p>
          )}
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
            {stakingEventData.pendingRewards ? 
              `${stakingEventData.pendingRewards} STK` :
              `${formatTokenAmount(userDetails?.pendingRewards || 0n)} STK`}
          </p>
          {stakingEventData.isFromEvents && (
            <p className="text-xs text-blue-500">Real-time from events</p>
          )}
        </div>

        {/* Total Staked */}
        <div className="bg-green-50 p-4 rounded border border-green-100">
          <p className="text-sm text-gray-600 mb-1">Total Staked</p>
          <p className="text-xl font-medium text-green-700">
            {stakingEventData.totalStaked ? 
              `${stakingEventData.totalStaked} STK` :
              `${formatTokenAmount(poolData?.totalStaked || 0n)} STK`}
          </p>
          {stakingEventData.isFromEvents && (
            <p className="text-xs text-green-500">Real-time from events</p>
          )}
        </div>

        {/* Current Reward Rate */}
        <div className="bg-amber-50 p-4 rounded border border-amber-100">
          <p className="text-sm text-gray-600 mb-1">Reward Rate</p>
          <p className="text-xl font-medium text-amber-700">
            {stakingEventData.currentRewardRate ? 
              `${formatTokenAmount(stakingEventData.currentRewardRate)}/block` :
              `${formatTokenAmount(poolData?.currentRewardRate || 0n)}/block`}
          </p>
          {stakingEventData.isFromEvents && (
            <p className="text-xs text-amber-500">Real-time from events</p>
          )}
        </div>

        {/* Lock Period Info */}
        <div className="bg-gray-100 p-4 rounded border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Lock Period</p>
          <p className="text-xl font-medium text-gray-900">
            {formatDuration(poolData?.lockPeriod || 0n)}
          </p>
        </div>
      </div>

      {/* Last Stake Info - From Events */}
      {stakingEventData.lastStakeTimestamp && (
        <div className="mt-4">
          <div className="bg-blue-50 p-4 rounded border border-blue-100">
            <p className="text-sm text-gray-600 mb-1">Last Stake Time</p>
            <p className="text-lg font-medium text-blue-700">
              {new Date(Number(stakingEventData.lastStakeTimestamp) * 1000).toLocaleString()}
            </p>
            {stakingEventData.isFromEvents && (
              <p className="text-xs text-blue-500">Real-time from events</p>
            )}
          </div>
        </div>
      )}

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

      {/* Recent Events Section */}
      {address && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {/* Last Stake Event */}
            {eventData.lastStakeEvent && (
              <div className="bg-green-50 p-4 rounded border border-green-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-green-800">Stake Transaction</p>
                    <p className="text-sm text-green-600">
                      Amount: {eventData.lastStakeEvent.amount} STK
                    </p>
                    <p className="text-xs text-gray-500">
                      {eventData.lastStakeEvent.timestamp?.toLocaleString()}
                    </p>
                  </div>
                  {eventData.lastStakeEvent.transactionHash && (
                    <a
                      href={`https://etherscan.io/tx/${eventData.lastStakeEvent.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View on Etherscan
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Last Withdraw Event */}
            {eventData.lastWithdrawEvent && (
              <div className="bg-blue-50 p-4 rounded border border-blue-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-blue-800">Withdraw Transaction</p>
                    <p className="text-sm text-blue-600">
                      Amount: {eventData.lastWithdrawEvent.amount} STK
                    </p>
                    {eventData.lastWithdrawEvent.rewardsAccrued && (
                      <p className="text-sm text-blue-600">
                        Rewards: {eventData.lastWithdrawEvent.rewardsAccrued} STK
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {eventData.lastWithdrawEvent.timestamp?.toLocaleString()}
                    </p>
                  </div>
                  {eventData.lastWithdrawEvent.transactionHash && (
                    <a
                      href={`https://etherscan.io/tx/${eventData.lastWithdrawEvent.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View on Etherscan
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Last Claim Event */}
            {eventData.lastClaimEvent && (
              <div className="bg-yellow-50 p-4 rounded border border-yellow-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-yellow-800">Rewards Claimed</p>
                    <p className="text-sm text-yellow-600">
                      Amount: {eventData.lastClaimEvent.amount} STK
                    </p>
                    <p className="text-xs text-gray-500">
                      {eventData.lastClaimEvent.timestamp?.toLocaleString()}
                    </p>
                  </div>
                  {eventData.lastClaimEvent.transactionHash && (
                    <a
                      href={`https://etherscan.io/tx/${eventData.lastClaimEvent.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View on Etherscan
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Last Emergency Withdraw Event */}
            {eventData.lastEmergencyWithdrawEvent && (
              <div className="bg-red-50 p-4 rounded border border-red-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-red-800">Emergency Withdrawal</p>
                    <p className="text-sm text-red-600">
                      Amount: {eventData.lastEmergencyWithdrawEvent.amount} STK
                    </p>
                    <p className="text-sm text-red-600">
                      Penalty: {eventData.lastEmergencyWithdrawEvent.penalty} STK
                    </p>
                    <p className="text-xs text-gray-500">
                      {eventData.lastEmergencyWithdrawEvent.timestamp?.toLocaleString()}
                    </p>
                  </div>
                  {eventData.lastEmergencyWithdrawEvent.transactionHash && (
                    <a
                      href={`https://etherscan.io/tx/${eventData.lastEmergencyWithdrawEvent.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View on Etherscan
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Last Approval Event */}
            {eventData.lastApprovalEvent && (
              <div className="bg-purple-50 p-4 rounded border border-purple-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-purple-800">Token Approval</p>
                    <p className="text-sm text-purple-600">
                      Amount: {eventData.lastApprovalEvent.value} STK
                    </p>
                    <p className="text-xs text-gray-500">
                      {eventData.lastApprovalEvent.timestamp?.toLocaleString()}
                    </p>
                  </div>
                  {eventData.lastApprovalEvent.transactionHash && (
                    <a
                      href={`https://etherscan.io/tx/${eventData.lastApprovalEvent.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View on Etherscan
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* No events message */}
            {!eventData.lastStakeEvent && 
             !eventData.lastWithdrawEvent && 
             !eventData.lastClaimEvent && 
             !eventData.lastEmergencyWithdrawEvent && 
             !eventData.lastApprovalEvent && (
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-gray-500 text-center">No recent activity detected</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
