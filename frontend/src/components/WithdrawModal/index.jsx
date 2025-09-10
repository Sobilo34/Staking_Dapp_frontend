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
        setError('Please enter a valid amount');
        return;
      }

      if (!userDetails) {
        setError('Unable to load staking details. Please try again.');
        return;
      }

      if (!userDetails.canWithdraw) {
        setError('Tokens are still locked. Please wait for the lock period to end.');
        return;
      }

      // Safe amount validation
      const stakedAmountStr = userDetails.stakedAmount ? formatTokenAmount(userDetails.stakedAmount) : '0';
      if (parseFloat(amount) > parseFloat(stakedAmountStr)) {
        setError('Amount exceeds staked balance');
        return;
      }

      const result = await withdraw(amount);
      if (result?.success) {
        setAmount('');
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Withdraw error:', err);
      setError(err?.message || 'Failed to withdraw tokens. Please try again.');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Withdraw Tokens</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isWithdrawing}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading staking details...</p>
          </div>
        ) : (
          <form onSubmit={handleWithdraw}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Amount to Withdraw
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.0001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isWithdrawing}
                />
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-500 hover:text-blue-700"
                  disabled={isWithdrawing || !userDetails?.stakedAmount}
                >
                  MAX
                </button>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Staked: {getStakedAmount()} STK
              </div>
            </div>

            {/* Lock status warning */}
            {userDetails && !userDetails.canWithdraw && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg">
                <div className="text-sm">
                  {getTimeDisplay() ? (
                    <>Tokens are locked for {getTimeDisplay()}</>
                  ) : (
                    'Tokens are currently locked'
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isWithdrawing}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isWithdrawing || !amount || !userDetails?.canWithdraw || loading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
