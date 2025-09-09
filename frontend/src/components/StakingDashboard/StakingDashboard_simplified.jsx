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
                  <p className="text-sm opacity-80">Total Staked</p>
                  <p className="text-3xl font-bold">{globalStats.totalStaked}</p>
                  <p className="text-xs opacity-80">TICKET tokens</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-green text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-80">Current APR</p>
                  <p className="text-3xl font-bold">{globalStats.currentRewardRate}%</p>
                  <p className="text-xs opacity-80">Annual rewards</p>
                </div>
                <div className="text-4xl">📈</div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-purple text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-80">Total Rewards Pool</p>
                  <p className="text-3xl font-bold">{globalStats.totalRewards}</p>
                  <p className="text-xs opacity-80">Available rewards</p>
                </div>
                <div className="text-4xl">⚡</div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-orange text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-80">Security Status</p>
                  <p className="text-2xl font-bold">Protected</p>
                  <p className="text-xs opacity-80">Smart contract audited</p>
                </div>
                <div className="text-4xl">🛡️</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Stats */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👛 Your Staking Position
                </CardTitle>
                <CardDescription>
                  Current staking details and earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Staked Amount</span>
                    <Badge variant="secondary">{userStats.stakedAmount} TICKET</Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Pending Rewards</span>
                    <Badge variant="success">{userStats.pendingRewards} TICKET</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lock Status</span>
                    <Badge variant={userStats.canWithdraw ? "success" : "warning"}>
                      {userStats.canWithdraw ? "Unlocked" : "Locked"}
                    </Badge>
                  </div>
                </div>

                {!userStats.canWithdraw && (
                  <div className="bg-yellow-50 p-4 rounded-lg border mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-yellow-800">
                        ⏱️ Time Until Unlock
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-900 mb-2">
                      {formatTimeRemaining(userStats.timeUntilUnlock)}
                    </div>
                    <Progress value={((86400 - userStats.timeUntilUnlock) / 86400) * 100} />
                  </div>
                )}

                <Button 
                  className="w-full" 
                  disabled={!isConnected || parseFloat(userStats.pendingRewards) === 0}
                >
                  ⚡ Claim Rewards ({userStats.pendingRewards} TICKET)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stake Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📈 Stake Tokens
                  </CardTitle>
                  <CardDescription>
                    Stake your TICKET tokens to earn rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Amount to Stake
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount..."
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Balance: 5,000 TICKET</span>
                      <button 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => setStakeAmount('5000')}
                      >
                        Use Max
                      </button>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg mb-4">
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
                    💰 Stake {stakeAmount || '0'} TICKET
                  </Button>
                </CardContent>
              </Card>

              {/* Withdraw Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    👛 Withdraw Tokens
                  </CardTitle>
                  <CardDescription>
                    Withdraw your staked tokens after lock period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Amount to Withdraw
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount..."
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      disabled={!userStats.canWithdraw}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Staked: {userStats.stakedAmount} TICKET</span>
                      <button 
                        className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        disabled={!userStats.canWithdraw}
                        onClick={() => setWithdrawAmount(userStats.stakedAmount.replace(',', ''))}
                      >
                        Use Max
                      </button>
                    </div>
                  </div>

                  {!userStats.canWithdraw && (
                    <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                      <div className="text-sm text-yellow-700">
                        ⚠️ Tokens are locked for {formatTimeRemaining(userStats.timeUntilUnlock)}
                      </div>
                    </div>
                  )}

                  <div className="gap-2 flex flex-col">
                    <Button 
                      className="w-full" 
                      disabled={!isConnected || !userStats.canWithdraw || !withdrawAmount}
                      variant={userStats.canWithdraw ? "primary" : "secondary"}
                    >
                      👛 {userStats.canWithdraw 
                        ? `Withdraw ${withdrawAmount || '0'} TICKET` 
                        : 'Withdraw Locked'
                      }
                    </Button>

                    <Button 
                      variant="danger" 
                      className="w-full" 
                      disabled={!isConnected || parseFloat(userStats.stakedAmount.replace(',', '')) === 0}
                    >
                      ⚠️ Emergency Withdraw (5% penalty)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Card */}
            <Card className="shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Recent Activity
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
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.type === 'stake' ? 'bg-green-500' :
                          activity.type === 'rewards' ? 'bg-blue-500' : 'bg-orange-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">
                            {activity.type === 'rewards' ? 'Claimed Rewards' : `${activity.type}d`}
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {activity.type === 'withdraw' ? '-' : '+'}{activity.amount} TICKET
                        </p>
                        <Badge variant="success" className="text-xs">
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
