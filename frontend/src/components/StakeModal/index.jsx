import React, { useState, useEffect } from 'react';
import { useStaking } from '../../hooks/useStaking';
import { useTokenBalance } from '../../hooks/useTokenBalance';
import { formatUnits, parseUnits } from 'viem';

export default function StakeModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);

  const { 
    stake, 
    approveTokens, 
    checkAllowance, 
    isStaking, 
    isApproving 
  } = useStaking();
  
  const { balance: tokenBalance, loading: balanceLoading } = useTokenBalance();

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError('');
      setLoading(true);
      checkApprovalStatus();
    }
  }, [isOpen]);

  const checkApprovalStatus = async () => {
    try {
      setCheckingApproval(true);
      const allowance = await checkAllowance();
      setIsApproved(allowance > 0);
    } catch (err) {
      console.error('Error checking allowance:', err);
      setIsApproved(false);
    } finally {
      setCheckingApproval(false);
      setLoading(false);
    }
  };

  const formatTokenAmount = (amount) => {
    if (!amount) return '0';
    return Number(formatUnits(amount, 18)).toFixed(4);
  };

  const getTokenBalance = () => {
    if (balanceLoading || !tokenBalance) return '0.0000';
    return formatTokenAmount(tokenBalance);
  };

  const hasAllowance = isApproved && amount && parseFloat(amount) > 0;

  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError('');
    try {
      const amountInWei = parseUnits(amount, 18);
      const success = await approveTokens(amountInWei);
      if (success) {
        setIsApproved(true);
      }
    } catch (err) {
      // Error handled by useStaking hook with toast
      console.error('Approve error:', err);
    }
  };

  const handleStake = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!isApproved) {
      setError('Please approve tokens first');
      return;
    }

    setError('');
    try {
      const amountInWei = parseUnits(amount, 18);
      const success = await stake(amountInWei);
      if (success) {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      // Error handled by useStaking hook with toast
      console.error('Stake error:', err);
    }
  };

  const handleMaxClick = () => {
    const maxAmount = formatTokenAmount(tokenBalance);
    setAmount(maxAmount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-center">
          <div className="text-5xl mb-2">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-2">Stake Tokens</h2>
          <p className="text-blue-100 text-sm">Earn rewards by staking your tokens</p>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200"
          disabled={isApproving || isStaking}
        >
          ✕
        </button>

        {/* Modal Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading token details...</p>
            </div>
          ) : (
            <form onSubmit={handleStake}>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-800">
                  Amount to Stake
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full p-4 pr-16 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-lg font-medium"
                    disabled={isApproving || isStaking}
                  />
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors duration-200"
                    disabled={isApproving || isStaking || !tokenBalance}
                  >
                    MAX
                  </button>
                </div>
                <div className="text-sm text-gray-600 mt-2 flex justify-between">
                  <span>Balance: {getTokenBalance()} STK</span>
                  <span className="text-blue-600 font-medium">Available to stake</span>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <h3 className="font-semibold text-red-800 mb-1 flex items-center text-sm">
                    ⚠️ Error
                  </h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Approval Flow Information */}
              {!hasAllowance && amount && parseFloat(amount) > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h3 className="font-semibold text-blue-800 mb-1 flex items-center text-sm">
                    ℹ️ Approval Required
                  </h3>
                  <p className="text-blue-700 text-sm">
                    You need to approve the staking contract to spend your tokens first.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
                  disabled={isApproving || isStaking}
                >
                  Cancel
                </button>
                {!hasAllowance ? (
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isApproving || !amount || parseFloat(amount) <= 0}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {isApproving ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Approving...
                      </div>
                    ) : (
                      'Approve Tokens'
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isStaking || !amount || parseFloat(amount) <= 0}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50"
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
          )}
        </div>
      </div>
    </div>
  );
}
