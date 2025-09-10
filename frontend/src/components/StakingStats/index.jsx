import React from 'react';
import useUserStakingDetails from '../../hooks/useUserStakingDetails';
import useStakingPool from '../../hooks/useStakingPool';
import useTokenBalance from '../../hooks/useTokenBalance';
import { formatTokenAmount, formatDuration } from '../../config/index.js';

export default function StakingStats() {
  const { userDetails, loading: userLoading } = useUserStakingDetails();
  const { poolData, loading: poolLoading } = useStakingPool();
  const { balance } = useTokenBalance();

  if (userLoading || poolLoading) {
    return (
      <div className="stats-grid mb-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card loading-skeleton h-20">
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Available Balance",
      value: `${formatTokenAmount(balance)} STK`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Your Staked",
      value: `${userDetails ? formatTokenAmount(userDetails.stakedAmount) : '0'} STK`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    },
    {
      title: "Pending Rewards",
      value: `${userDetails ? formatTokenAmount(userDetails.pendingRewards) : '0'} STK`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Current APR",
      value: `${poolData.currentRewardRate ? Number(poolData.currentRewardRate) : 0}%`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Total Staked",
      value: `${formatTokenAmount(poolData.totalStaked)} STK`,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200"
    },
    {
      title: "Lock Status",
      value: userDetails?.timeUntilUnlock > 0 
        ? formatDuration(Number(userDetails.timeUntilUnlock))
        : "Unlocked",
      color: userDetails?.timeUntilUnlock > 0 ? "text-orange-600" : "text-green-600",
      bgColor: userDetails?.timeUntilUnlock > 0 ? "bg-orange-50" : "bg-green-50",
      borderColor: userDetails?.timeUntilUnlock > 0 ? "border-orange-200" : "border-green-200"
    },
    {
      title: "Total Rewards",
      value: `${formatTokenAmount(poolData.totalRewards)} STK`,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200"
    },
    {
      title: "Emergency Penalty",
      value: `${Number(poolData.emergencyWithdrawPenalty)}%`,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    }
  ];

  return (
    <div className="stats-grid mb-8">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className={`card ${stat.bgColor} ${stat.borderColor}`}
        >
          <h3 className="text-xs font-medium text-gray-600 mb-2">{stat.title}</h3>
          <p className={`text-sm font-bold ${stat.color}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
