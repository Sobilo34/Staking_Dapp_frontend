import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Zap,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

const StatsPanel = () => {
  const [stats, setStats] = useState({
    totalStaked: 125000.00,
    totalStakers: 342,
    currentAPR: 12.5,
    totalRewardsPaid: 15430.67,
    contractBalance: 140430.67,
    averageStakeAmount: 365.12,
    totalTransactions: 1247,
    emergencyWithdrawals: 8
  });

  const [historicalData, setHistoricalData] = useState([
    { time: '6h ago', totalStaked: 122000, apr: 12.8, stakers: 338 },
    { time: '5h ago', totalStaked: 123500, apr: 12.7, stakers: 340 },
    { time: '4h ago', totalStaked: 124200, apr: 12.6, stakers: 341 },
    { time: '3h ago', totalStaked: 124800, apr: 12.6, stakers: 342 },
    { time: '2h ago', totalStaked: 125200, apr: 12.5, stakers: 342 },
    { time: '1h ago', totalStaked: 125000, apr: 12.5, stakers: 342 },
    { time: 'Now', totalStaked: 125000, apr: 12.5, stakers: 342 }
  ]);

  const [trends, setTrends] = useState({
    totalStaked: { direction: 'up', percentage: 2.4 },
    stakers: { direction: 'up', percentage: 1.2 },
    apr: { direction: 'down', percentage: 2.3 },
    rewards: { direction: 'up', percentage: 15.6 }
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalStaked: prev.totalStaked + (Math.random() - 0.5) * 100,
        currentAPR: Math.max(10, Math.min(15, prev.currentAPR + (Math.random() - 0.5) * 0.1)),
        totalRewardsPaid: prev.totalRewardsPaid + Math.random() * 2,
        totalStakers: prev.totalStakers + (Math.random() > 0.9 ? 1 : 0)
      }));

      // Update historical data
      setHistoricalData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: 'Now',
          totalStaked: stats.totalStaked,
          apr: stats.currentAPR,
          stakers: stats.totalStakers
        });
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [stats]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(2);
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up':
        return <ArrowUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Value Locked</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(stats.totalStaked)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(trends.totalStaked.direction)}
                  <span className={`text-xs ${getTrendColor(trends.totalStaked.direction)}`}>
                    {trends.totalStaked.percentage}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active Stakers</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.totalStakers.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(trends.stakers.direction)}
                  <span className={`text-xs ${getTrendColor(trends.stakers.direction)}`}>
                    {trends.stakers.percentage}%
                  </span>
                </div>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Current APR</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.currentAPR.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(trends.apr.direction)}
                  <span className={`text-xs ${getTrendColor(trends.apr.direction)}`}>
                    {trends.apr.percentage}%
                  </span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Rewards Paid</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(stats.totalRewardsPaid)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(trends.rewards.direction)}
                  <span className={`text-xs ${getTrendColor(trends.rewards.direction)}`}>
                    {trends.rewards.percentage}%
                  </span>
                </div>
              </div>
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Contract Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Contract Balance</p>
                <p className="text-lg font-semibold">{formatNumber(stats.contractBalance)} TICKET</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Average Stake</p>
                <p className="text-lg font-semibold">{stats.averageStakeAmount.toFixed(2)} TICKET</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Total Transactions</p>
                <p className="text-lg font-semibold">{stats.totalTransactions.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Emergency Withdrawals</p>
                <p className="text-lg font-semibold text-red-600">{stats.emergencyWithdrawals}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Staking Capacity</span>
                  <span className="font-medium">{((stats.totalStaked / 200000) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(stats.totalStaked / 200000) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Reward Pool Usage</span>
                  <span className="font-medium">{((stats.totalRewardsPaid / 50000) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(stats.totalRewardsPaid / 50000) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Historical Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Total Staked Over Time</p>
                <div className="space-y-1">
                  {historicalData.slice(-5).map((data, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">{data.time}</span>
                      <span className="font-medium">{formatNumber(data.totalStaked)} TICKET</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">APR History</p>
                <div className="space-y-1">
                  {historicalData.slice(-5).map((data, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">{data.time}</span>
                      <span className="font-medium">{data.apr.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Last Updated</span>
                  <Badge variant="secondary" className="text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsPanel;
