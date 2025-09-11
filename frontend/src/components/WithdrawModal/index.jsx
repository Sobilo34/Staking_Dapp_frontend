import React, { useState, useEffect } from 'react';
import useStaking from '../../hooks/useStaking';
import useUserStakingDetails from '../../hooks/useUserStakingDetails';
import { formatTokenAmount } from '../../config/index.js';

export default function WithdrawModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const { withdraw, isWithdrawing } = useStaking();
  const { userDetails, loading } = useUserStakingDetails();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError('');
    }
  }, [isOpen]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!amount || parseFloat(amount) <= 0) {
        return; // Toast will be shown by useStaking hook
      }

      if (!userDetails) {
        return; // Toast will be shown by useStaking hook
      }

      if (!userDetails.canWithdraw) {
        return; // Toast will be shown by useStaking hook
      }

      // Safe amount validation
      const stakedAmountStr = userDetails.stakedAmount ? formatTokenAmount(userDetails.stakedAmount) : '0';
      if (parseFloat(amount) > parseFloat(stakedAmountStr)) {
        return; // Toast will be shown by useStaking hook
      }

      const result = await withdraw(amount);
      if (result?.success) {
        setAmount('');
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      // Error is handled by useStaking hook with toast
      console.error('Withdraw error:', err);
    }
  };

  const handleMaxClick = () => {
    try {
      if (userDetails?.stakedAmount) {
        const maxAmount = formatTokenAmount(userDetails.stakedAmount);
        setAmount(maxAmount);
      }
    } catch (err) {
      console.error('Max click error:', err);
      setError('Unable to calculate maximum amount');
    }
  };

  // Safe time calculation
  const getTimeDisplay = () => {
    try {
      if (!userDetails?.timeUntilUnlock) return null;
      
      // Handle both BigInt and regular number types
      let timeUntilUnlock;
      if (typeof userDetails.timeUntilUnlock === 'bigint') {
        timeUntilUnlock = Number(userDetails.timeUntilUnlock);
      } else {
        timeUntilUnlock = Number(userDetails.timeUntilUnlock);
      }
      
      if (isNaN(timeUntilUnlock) || timeUntilUnlock <= 0) return null;
      
      const hours = Math.floor(timeUntilUnlock / 3600);
      const minutes = Math.floor((timeUntilUnlock % 3600) / 60);
      
      return `${hours} hours and ${minutes} minutes`;
    } catch (err) {
      console.error('Time display error:', err);
      return 'Lock time calculation error';
    }
  };

  // Safe staked amount display
  const getStakedAmount = () => {
    try {
      return userDetails?.stakedAmount ? formatTokenAmount(userDetails.stakedAmount) : '0';
    } catch (err) {
      console.error('Staked amount display error:', err);
      return '0';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="bg-green-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Withdraw Tokens</h2>
          <p className="text-green-100 text-sm">Withdraw your staked tokens safely</p>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200"
          disabled={isWithdrawing}
        >
          ×
        </button>

        {/* Modal Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading staking details...</p>
            </div>
          ) : (
            <form onSubmit={handleWithdraw}>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-800">
                  Amount to Withdraw
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full p-4 pr-16 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-lg font-medium"
                    disabled={isWithdrawing}
                  />
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors duration-200"
                    disabled={isWithdrawing || !userDetails?.stakedAmount}
                  >
                    MAX
                  </button>
                </div>
                <div className="text-sm text-gray-600 mt-2 flex justify-between">
                  <span>Staked: {getStakedAmount()} STK</span>
                  <span className="text-green-600 font-medium">Available to withdraw</span>
                </div>
              </div>

              {/* Lock Status Information */}
              {userDetails && !userDetails.canWithdraw && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h3 className="font-semibold text-amber-800 mb-1 text-sm">
                    Tokens Locked
                  </h3>
                  <p className="text-amber-700 text-sm">
                    {getTimeDisplay() ? (
                      <>Your tokens are locked for {getTimeDisplay()}. Please wait before withdrawing.</>
                    ) : (
                      'Your tokens are currently locked. Please wait before withdrawing.'
                    )}
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <h3 className="font-semibold text-red-800 mb-1 text-sm">
                    Error
                  </h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
                  disabled={isWithdrawing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWithdrawing || !amount || !userDetails?.canWithdraw || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
                >
                  {isWithdrawing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Withdrawing...
                    </div>
                  ) : (
                    'Withdraw Tokens'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
