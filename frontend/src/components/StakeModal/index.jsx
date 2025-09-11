import React, { useState, useEffect } from 'react';
import { useStaking } from '../../hooks/useStaking';
import { useTokenBalance } from '../../hooks/useTokenBalance';
import { formatTokenAmount } from '../../config/index.js';

export default function StakeModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);
  const { stake, isStaking, approveTokens, isApproving, checkAllowance } = useStaking();
  const { balance } = useTokenBalance();

  // Check approval status when modal opens or amount changes
  useEffect(() => {
    if (!isOpen || !amount || parseFloat(amount) <= 0) {
      setIsApproved(false);
      return;
    }
    let cancelled = false;
    const check = async () => {
      setCheckingApproval(true);
      try {
        const ok = await checkAllowance(amount);
        if (!cancelled) setIsApproved(ok);
      } catch {
        if (!cancelled) setIsApproved(false);
      } finally {
        if (!cancelled) setCheckingApproval(false);
      }
    };
    check();
    return () => { cancelled = true; };
  }, [isOpen, amount, checkAllowance]);

  const handleApprove = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await approveTokens(amount);
      // Re-check allowance after approval
      const approved = await checkAllowance(amount);
      setIsApproved(approved);
    } catch (err) {
      console.error('Approval error:', err);
      setIsApproved(false);
    }
  };

  const handleStake = async (e) => {
    e.preventDefault();
    setError('');

    // Double-check approval before staking
    if (!isApproved) {
      setError('Please approve tokens first');
      return;
    }

    try {
      const result = await stake(amount);
      if (result.success) {
        console.log('Stake transaction successful:', result);
        setAmount('');
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Stake error:', err);
    }
  };

  const handleMaxClick = () => {
    const maxAmount = formatTokenAmount(balance);
    setAmount(maxAmount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="bg-blue-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Stake Tokens</h2>
          <p className="text-blue-100 text-sm">Earn rewards by staking your tokens</p>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200"
          disabled={isStaking || isApproving}
        >
          ×
        </button>

        {/* Modal Content */}
        <div className="p-6">
          <form onSubmit={isApproved ? handleStake : handleApprove} className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Amount to Stake
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.0001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full p-4 border border-gray-300 rounded-xl text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isStaking || isApproving}
                />
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-500 hover:text-blue-700 font-medium"
                  disabled={isStaking || isApproving}
                >
                  MAX
                </button>
              </div>
              <div className="text-sm text-gray-600 mt-2 flex justify-between">
                <span>Available: {formatTokenAmount(balance)} STK</span>
                <span className="text-blue-600 font-medium">Ready to stake</span>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <h3 className="font-semibold text-red-800 mb-1 text-sm">
                  Error
                </h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Approval Flow Information */}
            {!isApproved && amount && parseFloat(amount) > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-1 text-sm">
                  Approval Required
                </h3>
                <p className="text-blue-700 text-sm">
                  You need to approve the staking contract to spend your tokens. This is a one-time transaction.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
                disabled={isStaking || isApproving || checkingApproval}
              >
                Cancel
              </button>
              {!isApproved ? (
                <button
                  type="submit"
                  disabled={isApproving || checkingApproval || !amount || parseFloat(amount) <= 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
                >
                  {isApproving || checkingApproval ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      {checkingApproval ? 'Checking...' : 'Approving...'}
                    </div>
                  ) : (
                    'Approve Tokens'
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isStaking || !amount || parseFloat(amount) <= 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
                >
                  {isStaking ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Staking...
                    </div>
                  ) : (
                    'Stake Tokens'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
