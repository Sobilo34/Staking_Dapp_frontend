import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

const StakingDashboard = () => {
  // Mock data - will be replaced with real contract data
  const [userStats, setUserStats] = useState({
    stakedAmount: '1,250.00',
    pendingRewards: '45.67',
    timeUntilUnlock: 86400, // seconds
    canWithdraw: false,
    lastStakeTimestamp: Date.now() - 86400000
  });

  const [globalStats, setGlobalStats] = useState({
    totalStaked: '125,000.00',
    currentRewardRate: '12.5',
    totalRewards: '5,230.45',
    isContractPaused: false
  });

  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate pending rewards increasing
      setUserStats(prev => ({
        ...prev,
        pendingRewards: (parseFloat(prev.pendingRewards) + 0.001).toFixed(3),
        timeUntilUnlock: Math.max(0, prev.timeUntilUnlock - 1)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Staking Dashboard
              </h1>
              <p className="text-gray-600">
                Stake your tokens and earn rewards in real-time
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={globalStats.isContractPaused ? "danger" : "success"}>
                {globalStats.isContractPaused ? "⚠️ Paused" : "✅ Active"}
              </Badge>
              <Button 
                variant={isConnected ? "secondary" : "primary"}
                onClick={() => setIsConnected(!isConnected)}
              >
                👛 {isConnected ? "Disconnect" : "Connect Wallet"}
              </Button>
            </div>
          </div>
        </div>

        {/* Global Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 mb-8">
          <Card className="gradient-blue text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-100 text-sm">Total Staked</p>
                  <p className="text-3xl font-bold">{globalStats.totalStaked}</p>
                  <p className="text-blue-100 text-xs">TICKET tokens</p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Current APR</p>
                  <p className="text-3xl font-bold">{globalStats.currentRewardRate}%</p>
                  <p className="text-green-100 text-xs">Annual rewards</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Rewards Pool</p>
                  <p className="text-3xl font-bold">{globalStats.totalRewards}</p>
                  <p className="text-purple-100 text-xs">Available rewards</p>
                </div>
                <Zap className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Security Status</p>
                  <p className="text-2xl font-bold">Protected</p>
                  <p className="text-orange-100 text-xs">Smart contract audited</p>
                </div>
                <Shield className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Stats */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Your Staking Position
                </CardTitle>
                <CardDescription>
                  Current staking details and earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Staked Amount</span>
                      <Badge variant="secondary">{userStats.stakedAmount} TICKET</Badge>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Pending Rewards</span>
                      <Badge variant="success">{userStats.pendingRewards} TICKET</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Lock Status</span>
                      <Badge variant={userStats.canWithdraw ? "success" : "warning"}>
                        {userStats.canWithdraw ? "Unlocked" : "Locked"}
                      </Badge>
                    </div>
                  </div>

                  {!userStats.canWithdraw && (
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">
                          Time Until Unlock
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-amber-900 mb-2">
                        {formatTimeRemaining(userStats.timeUntilUnlock)}
                      </div>
                      <Progress 
                        value={((86400 - userStats.timeUntilUnlock) / 86400) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    disabled={!isConnected || parseFloat(userStats.pendingRewards) === 0}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Claim Rewards ({userStats.pendingRewards} TICKET)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stake Card */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Stake Tokens
                  </CardTitle>
                  <CardDescription>
                    Stake your TICKET tokens to earn rewards
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Amount to Stake
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount..."
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="text-lg"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Balance: 5,000 TICKET</span>
                      <button 
                        className="text-blue-500 hover:underline"
                        onClick={() => setStakeAmount('5000')}
                      >
                        Use Max
                      </button>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="text-sm text-green-700">
                      <div className="flex justify-between">
                        <span>Estimated Daily Rewards:</span>
                        <span className="font-medium">
                          {stakeAmount ? (parseFloat(stakeAmount) * 0.00034).toFixed(4) : '0.0000'} TICKET
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lock Duration:</span>
                        <span className="font-medium">7 days</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    disabled={!isConnected || !stakeAmount || globalStats.isContractPaused}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Stake {stakeAmount || '0'} TICKET
                  </Button>
                </CardContent>
              </Card>

              {/* Withdraw Card */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-500" />
                    Withdraw Tokens
                  </CardTitle>
                  <CardDescription>
                    Withdraw your staked tokens after lock period
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Amount to Withdraw
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount..."
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="text-lg"
                      disabled={!userStats.canWithdraw}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Staked: {userStats.stakedAmount} TICKET</span>
                      <button 
                        className="text-blue-500 hover:underline disabled:opacity-50"
                        disabled={!userStats.canWithdraw}
                        onClick={() => setWithdrawAmount(userStats.stakedAmount.replace(',', ''))}
                      >
                        Use Max
                      </button>
                    </div>
                  </div>

                  {!userStats.canWithdraw && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <div className="text-sm text-amber-700">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        Tokens are locked for {formatTimeRemaining(userStats.timeUntilUnlock)}
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    disabled={!isConnected || !userStats.canWithdraw || !withdrawAmount}
                    variant={userStats.canWithdraw ? "default" : "secondary"}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {userStats.canWithdraw 
                      ? `Withdraw ${withdrawAmount || '0'} TICKET` 
                      : 'Withdraw Locked'
                    }
                  </Button>

                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    disabled={!isConnected || parseFloat(userStats.stakedAmount.replace(',', '')) === 0}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Withdraw (5% penalty)
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Card */}
            <Card className="shadow-lg border-0 mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest staking transactions and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'stake', amount: '500.00', time: '2 hours ago', status: 'completed' },
                    { type: 'rewards', amount: '12.34', time: '1 day ago', status: 'completed' },
                    { type: 'withdraw', amount: '250.00', time: '3 days ago', status: 'completed' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'stake' ? 'bg-green-500' :
                          activity.type === 'rewards' ? 'bg-blue-500' : 'bg-orange-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {activity.type === 'rewards' ? 'Claimed Rewards' : `${activity.type}d`}
                          </p>
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {activity.type === 'withdraw' ? '-' : '+'}{activity.amount} TICKET
                        </p>
                        <Badge 
                          variant="success" 
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingDashboard;
