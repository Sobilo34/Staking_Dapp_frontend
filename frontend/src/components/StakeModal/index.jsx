import React, { useState, useEffect } from 'react';
import useStaking from '../../hooks/useStaking';
import useTokenBalance from '../../hooks/useTokenBalance';
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
      setIsApproved(true);
    } catch (err) {
      // Error handled by useStaking hook with toast
      console.error('Approval error:', err);
    }
  };

  const handleStake = async (e) => {
    e.preventDefault();
    setError('');

    // Let the useStaking hook handle validation and show toasts
    try {
      const result = await stake(amount);
      if (result.success) {
        setAmount('');
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      // Error handled by useStaking hook with toast
      console.error('Stake error:', err);
    }
  };

  const handleMaxClick = () => {
    const maxAmount = formatTokenAmount(balance);
    setAmount(maxAmount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Stake Tokens</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isStaking}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleStake}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Amount to Stake
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isStaking}
              />
              <button
                type="button"
                onClick={handleMaxClick}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-500 hover:text-blue-700"
                disabled={isStaking}
              >
                MAX
              </button>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Available: {formatTokenAmount(balance)} STK
            </div>
          </div>

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
              disabled={isStaking || isApproving || checkingApproval}
            >
              Cancel
            </button>
            {!isApproved ? (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving || checkingApproval || !amount}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isApproving || checkingApproval ? 'Approving...' : 'Approve'}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isStaking || !amount}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isStaking ? 'Staking...' : 'Stake'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
