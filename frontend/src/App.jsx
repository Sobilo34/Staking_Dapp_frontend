import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Progress } from './components/ui/progress';

function App() {
  // Mock data - replace with real contract integration
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  // User staking data
  const [userStats, setUserStats] = useState({
    totalStaked: '1,250.00',
    pendingRewards: '45.67',
    timeUntilUnlock: 86400, // seconds
    canWithdraw: false,
    allStakePositions: [
      { id: 1, amount: '500.00', unlockTime: Date.now() + 86400000, rewards: '15.23' },
      { id: 2, amount: '750.00', unlockTime: Date.now() + 172800000, rewards: '30.44' }
    ]
  });

  // Protocol statistics
  const [protocolStats, setProtocolStats] = useState({
    totalStaked: '125,000.00',
    currentAPR: '12.5',
    rewardRate: '0.034',
    totalRewardsPaid: '5,230.45'
  });

  // Form states
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Real-time updates for pending rewards
  useEffect(() => {
    const interval = setInterval(() => {
      setUserStats(prev => ({
        ...prev,
        pendingRewards: (parseFloat(prev.pendingRewards) + 0.001).toFixed(3),
        timeUntilUnlock: Math.max(0, prev.timeUntilUnlock - 1)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Mock contract functions - replace with actual Web3 integration
  const connectWallet = () => {
    setIsConnected(true);
    setWalletAddress('0x1234...5678');
    console.log('Connect wallet function - implement Web3 integration');
  };

  const stakeTokens = () => {
    if (!stakeAmount || !isConnected) return;
    console.log('Stake function called with amount:', stakeAmount);
    // Implement actual staking logic here
  };

  const withdrawTokens = () => {
    if (!withdrawAmount || !isConnected) return;
    console.log('Withdraw function called with amount:', withdrawAmount);
    // Implement actual withdraw logic here
  };

  const claimRewards = () => {
    if (!isConnected) return;
    console.log('Claim rewards function called');
    // Implement actual claim rewards logic here
  };

  const emergencyWithdraw = () => {
    if (!isConnected) return;
    console.log('Emergency withdraw function called');
    // Implement actual emergency withdraw logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="container flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🔥 Staking dApp</h1>
            <p className="text-gray-600 text-sm">Stake your tokens and earn rewards</p>
          </div>
          <div className="flex items-center gap-4">
            {isConnected && (
              <Badge variant="success">
                👛 {walletAddress}
              </Badge>
            )}
            <Button 
              variant={isConnected ? "secondary" : "primary"}
              onClick={connectWallet}
            >
              {isConnected ? "Disconnect" : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container p-6">
        {/* Protocol Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Protocol Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-blue-700">Total Staked</p>
                    <p className="text-xl font-bold text-blue-900">{protocolStats.totalStaked}</p>
                    <p className="text-xs text-blue-600">TICKET tokens</p>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-green-700">Current APR</p>
                    <p className="text-xl font-bold text-green-900">{protocolStats.currentAPR}%</p>
                    <p className="text-xs text-green-600">Annual rewards</p>
                  </div>
                  <div className="text-2xl">📈</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-purple-700">Reward Rate</p>
                    <p className="text-xl font-bold text-purple-900">{protocolStats.rewardRate}%</p>
                    <p className="text-xs text-purple-600">Daily rate</p>
                  </div>
                  <div className="text-2xl">⚡</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-orange-700">Total Rewards</p>
                    <p className="text-xl font-bold text-orange-900">{protocolStats.totalRewardsPaid}</p>
                    <p className="text-xs text-orange-600">Distributed</p>
                  </div>
                  <div className="text-2xl">🎁</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Stake Position & Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* User Stake Position Display */}
            <Card>
              <CardHeader>
                <CardTitle>👛 Your Staking Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Staked</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.totalStaked}</p>
                    <p className="text-xs text-gray-500">TICKET tokens</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Pending Rewards</p>
                    <p className="text-2xl font-bold text-green-900">{userStats.pendingRewards}</p>
                    <p className="text-xs text-green-500">TICKET tokens</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600">Status</p>
                    <Badge variant={userStats.canWithdraw ? "success" : "warning"}>
                      {userStats.canWithdraw ? "Unlocked" : "Locked"}
                    </Badge>
                    {!userStats.canWithdraw && (
                      <p className="text-xs text-yellow-600 mt-1">
                        ⏱️ {formatTimeRemaining(userStats.timeUntilUnlock)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Time until unlock progress */}
                {!userStats.canWithdraw && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Time Until Unlock</span>
                      <span>{formatTimeRemaining(userStats.timeUntilUnlock)}</span>
                    </div>
                    <Progress value={((86400 - userStats.timeUntilUnlock) / 86400) * 100} />
                  </div>
                )}

                <Button 
                  onClick={claimRewards} 
                  className="w-full mb-4"
                  disabled={!isConnected || parseFloat(userStats.pendingRewards) === 0}
                >
                  ⚡ Claim Rewards ({userStats.pendingRewards} TICKET)
                </Button>
              </CardContent>
            </Card>

            {/* All Stake Positions Display */}
            <Card>
              <CardHeader>
                <CardTitle>📋 All Stake Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats.allStakePositions.map((position) => (
                    <div key={position.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Position #{position.id}</span>
                            <Badge variant="secondary">{position.amount} TICKET</Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            Rewards: {position.rewards} TICKET
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-xs text-gray-500">
                            Unlock: {new Date(position.unlockTime).toLocaleDateString()}
                          </div>
                          {position.unlockTime > Date.now() && (
                            <div className="text-xs text-yellow-600">
                              🔒 {formatTimeRemaining((position.unlockTime - Date.now()) / 1000)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            
            {/* Staking Form */}
            <Card>
              <CardHeader>
                <CardTitle>📈 Stake Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
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

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-700">
                      <div className="flex justify-between">
                        <span>Est. Daily Rewards:</span>
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
                    onClick={stakeTokens}
                    className="w-full"
                    disabled={!isConnected || !stakeAmount}
                  >
                    💰 Stake {stakeAmount || '0'} TICKET
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal Interface */}
            <Card>
              <CardHeader>
                <CardTitle>👛 Withdraw Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
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
                      <span>Staked: {userStats.totalStaked} TICKET</span>
                      <button 
                        className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        disabled={!userStats.canWithdraw}
                        onClick={() => setWithdrawAmount(userStats.totalStaked.replace(',', ''))}
                      >
                        Use Max
                      </button>
                    </div>
                  </div>

                  {!userStats.canWithdraw && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-sm text-yellow-700">
                        ⚠️ Tokens locked for {formatTimeRemaining(userStats.timeUntilUnlock)}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button 
                      onClick={withdrawTokens}
                      className="w-full"
                      disabled={!isConnected || !userStats.canWithdraw || !withdrawAmount}
                      variant={userStats.canWithdraw ? "primary" : "secondary"}
                    >
                      👛 {userStats.canWithdraw 
                        ? `Withdraw ${withdrawAmount || '0'} TICKET` 
                        : 'Withdraw Locked'
                      }
                    </Button>

                    {/* Emergency Withdrawal Option */}
                    <Button 
                      onClick={emergencyWithdraw}
                      variant="danger"
                      className="w-full"
                      disabled={!isConnected || parseFloat(userStats.totalStaked.replace(',', '')) === 0}
                    >
                      ⚠️ Emergency Withdraw (5% penalty)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
