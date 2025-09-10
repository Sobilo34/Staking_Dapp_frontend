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
      // Error handled by useStaking hook
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
      // Error handled by useStaking hook
    }
  };

  const handleModalSuccess = async () => {
    await refetch();
  };

  if (!address) {
    return (
      <div className="card p-12 text-center">
        <h3 className="text-2xl font-bold mb-4 text-gray-900">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600 mb-8 text-lg">
          Connect your wallet to start staking and earning rewards
        </p>
      </div>
    );
  }

  const hasStake = userDetails?.stakedAmount && userDetails.stakedAmount > 0n;
  const hasRewards = userDetails?.pendingRewards && userDetails.pendingRewards > 0n;

  return (
    <>
      <div className="card">
        <h3 className="text-xl font-bold mb-6">Actions</h3>
        
        <div className="actions-grid">
          {/* Stake Button */}
          <button
            onClick={() => setShowStakeModal(true)}
            className="btn btn-primary"
          >
            Stake Tokens
          </button>

          {/* Withdraw Button */}
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={!hasStake}
            className="btn btn-secondary disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Withdraw
          </button>

          {/* Claim Rewards Button */}
          <button
            onClick={handleClaimRewards}
            disabled={!hasRewards || isClaiming}
            className="btn btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#7c3aed' }}
          >
            {isClaiming ? 'Claiming...' : 'Claim Rewards'}
          </button>

          {/* Emergency Withdraw Button */}
          <button
            onClick={() => setShowEmergencyConfirm(true)}
            disabled={!hasStake}
            className="btn btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#dc2626' }}
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
          <div className="card w-full max-w-md mx-4">
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
                  className="btn btn-secondary flex-1"
                  disabled={isEmergencyWithdrawing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmergencyWithdraw}
                  disabled={isEmergencyWithdrawing}
                  className="btn btn-primary flex-1"
                  style={{ backgroundColor: '#dc2626' }}
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
