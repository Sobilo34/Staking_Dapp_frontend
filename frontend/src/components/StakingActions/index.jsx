import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import useStaking from '../../hooks/useStaking';
import useUserStakingDetails from '../../hooks/useUserStakingDetails';
import StakeModal from '../StakeModal';
import WithdrawModal from '../WithdrawModal';

export default function StakingActions() {
  const { address } = useAccount();
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  
  const { claimRewards, emergencyWithdraw, isClaiming, isEmergencyWithdrawing } = useStaking();
  const { userDetails, refetch } = useUserStakingDetails();

  const handleClaimRewards = async () => {
    try {
      const result = await claimRewards();
      if (result.success) {
        await refetch();
      }
    } catch (error) {
      console.error('Failed to claim rewards:', error);
    }
  };

  const handleEmergencyWithdraw = async () => {
    try {
      const result = await emergencyWithdraw();
      if (result.success) {
        setShowEmergencyConfirm(false);
        await refetch();
      }
    } catch (error) {
      console.error('Failed to emergency withdraw:', error);
    }
  };

  const handleModalSuccess = async () => {
    await refetch();
  };

  if (!address) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-xl font-bold mb-4">Connect Your Wallet</h3>
        <p className="text-gray-600 mb-6">
          Connect your wallet to start staking and earning rewards
        </p>
      </div>
    );
  }

  const hasStake = userDetails?.stakedAmount && userDetails.stakedAmount > 0n;
  const hasRewards = userDetails?.pendingRewards && userDetails.pendingRewards > 0n;

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-6">Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stake Button */}
          <button
            onClick={() => setShowStakeModal(true)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Stake Tokens
          </button>

          {/* Withdraw Button */}
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={!hasStake}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Withdraw
          </button>

          {/* Claim Rewards Button */}
          <button
            onClick={handleClaimRewards}
            disabled={!hasRewards || isClaiming}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isClaiming ? 'Claiming...' : 'Claim Rewards'}
          </button>

          {/* Emergency Withdraw Button */}
          <button
            onClick={() => setShowEmergencyConfirm(true)}
            disabled={!hasStake}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Emergency Withdraw
          </button>
        </div>

        {/* Status Messages */}
        {userDetails && (
          <div className="mt-6 space-y-3">
            {userDetails.timeUntilUnlock > 0 && (
              <div className="p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg">
                <p className="text-sm">
                  ⏰ Your tokens are locked for {Math.floor(Number(userDetails.timeUntilUnlock) / 3600)} hours 
                  and {Math.floor((Number(userDetails.timeUntilUnlock) % 3600) / 60)} minutes
                </p>
              </div>
            )}
            
            {!hasRewards && hasStake && (
              <div className="p-3 bg-blue-100 border border-blue-300 text-blue-700 rounded-lg">
                <p className="text-sm">
                  💡 Rewards are calculated every minute. Start earning now!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <StakeModal
        isOpen={showStakeModal}
        onClose={() => setShowStakeModal(false)}
        onSuccess={handleModalSuccess}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Emergency Withdraw Confirmation */}
      {showEmergencyConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold mb-4 text-red-600">Emergency Withdraw</h2>
              <p className="text-gray-700 mb-6">
                This action will withdraw all your staked tokens immediately, but you will lose{' '}
                <strong className="text-red-600">{Number(userDetails?.emergencyWithdrawPenalty || 0)}%</strong>{' '}
                as a penalty. Are you sure you want to continue?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEmergencyConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={isEmergencyWithdrawing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmergencyWithdraw}
                  disabled={isEmergencyWithdrawing}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400"
                >
                  {isEmergencyWithdrawing ? 'Processing...' : 'Confirm Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
