import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

const StatsPanel = () => {
  const [stats, setStats] = useState({
    totalValueLocked: 0,
    totalStakers: 0,
    averageStakeAmount: 0,
    totalRewardsPaid: 0,
    contractBalance: 0,
    avgStakingDuration: 0,
    currentApr: 12.5,
    nextAprUpdate: Date.now() + 86400000, // Next day
    topStakers: []
  });

  const [timeRemaining, setTimeRemaining] = useState('');

  // Mock data - will be replaced with real contract data
  useEffect(() => {
    const mockData = {
      totalValueLocked: 125000.50,
      totalStakers: 847,
      averageStakeAmount: 1476.32,
      totalRewardsPaid: 15234.67,
      contractBalance: 200000.00,
      avgStakingDuration: 12.5, // days
      currentApr: 12.5,
      nextAprUpdate: Date.now() + 86400000,
      topStakers: [
        { address: '0x1234...5678', amount: 25000.00, rewards: 1250.34 },
        { address: '0x9876...5432', amount: 18500.50, rewards: 892.15 },
        { address: '0x5555...1111', amount: 15750.75, rewards: 745.23 },
        { address: '0x3333...4444', amount: 12300.25, rewards: 623.11 },
        { address: '0x7777...8888', amount: 10500.00, rewards: 534.67 }
      ]
    };

    setStats(mockData);

    // Update time remaining every second
    const updateTimer = setInterval(() => {
      const now = Date.now();
      const diff = mockData.nextAprUpdate - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (diff > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining('APR Update Due');
      }
    }, 1000);

    return () => clearInterval(updateTimer);
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Staking Statistics
          </CardTitle>
          <CardDescription>
            Comprehensive analytics and performance metrics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gradient-blue text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Value Locked</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalValueLocked)}</p>
                <p className="text-xs opacity-80">TICKET tokens</p>
              </div>
              <div className="text-3xl">🏦</div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-green text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Active Stakers</p>
                <p className="text-2xl font-bold">{stats.totalStakers.toLocaleString()}</p>
                <p className="text-xs opacity-80">unique addresses</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-purple text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Avg Stake Amount</p>
                <p className="text-2xl font-bold">{formatNumber(stats.averageStakeAmount)}</p>
                <p className="text-xs opacity-80">TICKET per user</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-orange text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Rewards</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalRewardsPaid)}</p>
                <p className="text-xs opacity-80">TICKET distributed</p>
              </div>
              <div className="text-3xl">🎁</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* APR Information */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 APR Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Current APR</span>
                <Badge variant="success">{stats.currentApr}%</Badge>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-2">
                {stats.currentApr}% Annual
              </div>
              <div className="text-sm text-blue-700">
                Daily: {(stats.currentApr / 365).toFixed(4)}% • 
                Monthly: {(stats.currentApr / 12).toFixed(2)}%
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-700">Next APR Update</span>
                <Badge variant="warning">⏰ {timeRemaining}</Badge>
              </div>
              <div className="text-lg font-bold text-yellow-900 mb-2">
                Auto-adjusts based on TVL
              </div>
              <div className="text-sm text-yellow-700">
                APR decreases as more tokens are staked
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚡ Contract Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Reserve Ratio</span>
                  <span className="font-medium">
                    {((stats.contractBalance / stats.totalValueLocked) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(stats.contractBalance / stats.totalValueLocked) * 100} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Contract Balance: {formatNumber(stats.contractBalance)} TICKET
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Utilization Rate</span>
                  <span className="font-medium">
                    {((stats.totalValueLocked / stats.contractBalance) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(stats.totalValueLocked / stats.contractBalance) * 100} 
                  className="h-2"
                />
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">
                    Contract is healthy and fully operational
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏆 Top Stakers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topStakers.map((staker, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{staker.address}</p>
                      <p className="text-xs text-gray-500">
                        Rewards: {formatNumber(staker.rewards)} TICKET
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatNumber(staker.amount)}</p>
                    <p className="text-xs text-gray-500">TICKET</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Staking Duration</p>
                <p className="text-xl font-bold text-gray-900">{stats.avgStakingDuration} days</p>
              </div>
              <div className="text-2xl">⏱️</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Stakers (24h)</p>
                <p className="text-xl font-bold text-gray-900">+{Math.floor(Math.random() * 50) + 10}</p>
              </div>
              <div className="text-2xl">📈</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volume (24h)</p>
                <p className="text-xl font-bold text-gray-900">{formatNumber(Math.random() * 50000)}</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsPanel;
