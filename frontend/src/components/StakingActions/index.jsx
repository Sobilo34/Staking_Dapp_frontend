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

  const hasStake = userDetails?.stakedAmount && userDetails.stakedAmount > 0n;
  const hasRewards = userDetails?.pendingRewards && userDetails.pendingRewards > 0n;

  // Action cards configuration
  const actionCards = [
    {
      id: 'stake',
      title: 'Stake Tokens',
      description: 'Stake your tokens to start earning rewards',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      textColor: 'text-white',
      action: () => setShowStakeModal(true),
      disabled: false,
      loading: false
    },
    {
      id: 'withdraw',
      title: 'Withdraw',
      description: 'Withdraw your staked tokens after lock period',
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      textColor: 'text-white',
      action: () => setShowWithdrawModal(true),
      disabled: !hasStake,
      loading: false
    },
    {
      id: 'claim',
      title: 'Claim Rewards',
      description: 'Claim your earned staking rewards',
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      textColor: 'text-white',
      action: handleClaimRewards,
      disabled: !hasRewards,
      loading: isClaiming
    },
    {
      id: 'emergency',
      title: 'Emergency Withdraw',
      description: 'Immediate withdrawal with penalty',
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      textColor: 'text-white',
      action: () => setShowEmergencyConfirm(true),
      disabled: !hasStake,
      loading: isEmergencyWithdrawing
    }
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900">Staking Actions</h3>
        </div>
        
        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {actionCards.map((card) => (
            <div
              key={card.id}
              className={`
                border rounded-lg p-4 transition-all duration-200 
                ${card.disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:shadow-md bg-white border-gray-200'}
              `}
            >
              <div className="h-full min-h-[120px] flex flex-col">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-lg text-gray-900">
                    {card.title}
                  </h4>
                  {card.disabled && (
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      Disabled
                    </span>
                  )}
                </div>
                
                {/* Card Content */}
                <div className="flex-1 mb-4">
                  <p className="text-gray-600 text-sm">
                    {card.description}
                  </p>
                </div>
                
                {/* Action Button */}
                <button
                  onClick={card.disabled ? undefined : card.action}
                  disabled={card.disabled || card.loading}
                  className={`
                    w-full py-2 px-4 rounded font-medium text-sm transition-colors duration-200
                    ${card.disabled 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : `${card.color} ${card.hoverColor} ${card.textColor}`
                    }
                    ${card.loading ? 'opacity-75' : ''}
                  `}
                >
                  {card.loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Execute'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Status Messages */}
        {userDetails && (
          <div className="space-y-4">
            {userDetails.timeUntilUnlock > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div>
                  <h4 className="font-medium text-orange-800 mb-1">Tokens Locked</h4>
                  <p className="text-sm text-orange-700">
                    Your tokens are locked for {Math.floor(Number(userDetails.timeUntilUnlock) / 3600)} hours 
                    and {Math.floor((Number(userDetails.timeUntilUnlock) % 3600) / 60)} minutes
                  </p>
                </div>
              </div>
            )}
            
            {!hasRewards && hasStake && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Earning Rewards</h4>
                  <p className="text-sm text-blue-700">
                    Your tokens are actively earning rewards! Check back soon to see your accumulated rewards.
                  </p>
                </div>
              </div>
            )}

            {hasRewards && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div>
                  <h4 className="font-medium text-green-800 mb-1">Rewards Available</h4>
                  <p className="text-sm text-green-700">
                    You have pending rewards ready to claim! Click the "Claim Rewards" card above.
                  </p>
                </div>
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

      {/* Emergency Withdraw Confirmation Modal */}
      {showEmergencyConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 overflow-hidden border border-gray-200">
          {/* Modal Header */}
          <div className="bg-red-600 p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Emergency Withdraw</h2>
            <p className="text-red-100 text-sm">Immediate withdrawal with penalty</p>
          </div>
          
          {/* Modal Content */}
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">
                Important Warning
              </h3>
              <p className="text-red-700 text-sm leading-relaxed">
                This action will withdraw all your staked tokens immediately, but you will lose{' '}
                <span className="font-bold bg-red-200 px-1 rounded">
                  {Number(userDetails?.emergencyWithdrawPenalty || 0)}%
                </span>{' '}
                as a penalty fee. This action cannot be undone.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowEmergencyConfirm(false)}
                disabled={isEmergencyWithdrawing}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencyWithdraw}
                disabled={isEmergencyWithdrawing}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
              >
                {isEmergencyWithdrawing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Confirm Withdraw'
                )}
              </button>
            </div>
          </div>
        </div>
        </div>
      )}
    </>
  );
}
