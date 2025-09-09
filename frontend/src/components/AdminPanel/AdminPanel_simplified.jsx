import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

const AdminPanel = () => {
  const [contractSettings, setContractSettings] = useState({
    initialApr: 12.5,
    minLockDuration: 604800, // 7 days in seconds
    aprReductionPerThousand: 1,
    emergencyWithdrawPenalty: 5,
    isPaused: false
  });

  const [tempSettings, setTempSettings] = useState({ ...contractSettings });
  const [isOwner, setIsOwner] = useState(false);
  const [showOwnerControls, setShowOwnerControls] = useState(false);

  const formatDuration = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  const handleSettingChange = (key, value) => {
    setTempSettings(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  const applySettings = () => {
    if (!isOwner) return;
    setContractSettings({ ...tempSettings });
    // Here you would interact with the smart contract
    console.log('Settings applied:', tempSettings);
  };

  const togglePause = () => {
    if (!isOwner) return;
    const newPauseState = !contractSettings.isPaused;
    setContractSettings(prev => ({ ...prev, isPaused: newPauseState }));
    setTempSettings(prev => ({ ...prev, isPaused: newPauseState }));
    // Here you would call the contract's pause/unpause function
    console.log(`Contract ${newPauseState ? 'paused' : 'unpaused'}`);
  };

  const enableEmergencyWithdraw = () => {
    if (!isOwner) return;
    // Here you would call the contract's emergency withdraw function
    console.log('Emergency withdraw enabled');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                ⚙️ Admin Control Panel
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Contract administration and emergency controls
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isOwner ? "success" : "secondary"}>
                {isOwner ? "🔑 Owner" : "👤 User"}
              </Badge>
              {!isOwner && (
                <Button
                  variant="secondary"
                  onClick={() => setIsOwner(true)}
                >
                  🔐 Connect as Owner
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contract Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={contractSettings.isPaused ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${contractSettings.isPaused ? "text-red-700" : "text-green-700"}`}>
                  Contract Status
                </p>
                <p className={`text-xl font-bold ${contractSettings.isPaused ? "text-red-900" : "text-green-900"}`}>
                  {contractSettings.isPaused ? "Paused" : "Active"}
                </p>
              </div>
              <div className="text-3xl">
                {contractSettings.isPaused ? "⏸️" : "▶️"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Current APR</p>
                <p className="text-xl font-bold text-blue-900">{contractSettings.initialApr}%</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Lock Duration</p>
                <p className="text-xl font-bold text-orange-900">
                  {formatDuration(contractSettings.minLockDuration)}
                </p>
              </div>
              <div className="text-3xl">⏰</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Panel */}
      {isOwner && (
        <>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 Contract Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Initial APR (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={tempSettings.initialApr}
                      onChange={(e) => handleSettingChange('initialApr', e.target.value)}
                      placeholder="Enter APR percentage"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Annual percentage rate for staking rewards
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Minimum Lock Duration (seconds)
                    </label>
                    <Input
                      type="number"
                      value={tempSettings.minLockDuration}
                      onChange={(e) => handleSettingChange('minLockDuration', e.target.value)}
                      placeholder="Enter lock duration"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {formatDuration(tempSettings.minLockDuration)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      APR Reduction per 1000 TICKET (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={tempSettings.aprReductionPerThousand}
                      onChange={(e) => handleSettingChange('aprReductionPerThousand', e.target.value)}
                      placeholder="Enter APR reduction"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      APR decreases as more tokens are staked
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Emergency Withdraw Penalty (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={tempSettings.emergencyWithdrawPenalty}
                      onChange={(e) => handleSettingChange('emergencyWithdrawPenalty', e.target.value)}
                      placeholder="Enter penalty percentage"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Penalty for early withdrawal
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={applySettings}
                    className="flex-1"
                    disabled={JSON.stringify(tempSettings) === JSON.stringify(contractSettings)}
                  >
                    💾 Apply Settings
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setTempSettings({ ...contractSettings })}
                  >
                    🔄 Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Controls */}
          <Card className="shadow-lg border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                🚨 Emergency Controls
              </CardTitle>
              <p className="text-red-600 text-sm">
                Critical functions for contract management
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-900">Contract Pause</h4>
                      <p className="text-sm text-red-700">
                        {contractSettings.isPaused 
                          ? "Contract is currently paused. No new stakes or withdrawals allowed." 
                          : "Contract is active. All functions are operational."
                        }
                      </p>
                    </div>
                    <Button
                      variant={contractSettings.isPaused ? "success" : "danger"}
                      onClick={togglePause}
                    >
                      {contractSettings.isPaused ? "▶️ Resume" : "⏸️ Pause"}
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-yellow-900">Emergency Withdraw</h4>
                      <p className="text-sm text-yellow-700">
                        Enable emergency withdrawals for all users (applies penalty)
                      </p>
                    </div>
                    <Button
                      variant="warning"
                      onClick={enableEmergencyWithdraw}
                    >
                      ⚡ Enable Emergency
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Admin Actions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📜 Recent Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    action: 'APR Updated',
                    details: 'Changed from 11.8% to 12.5%',
                    time: '2 hours ago',
                    status: 'success'
                  },
                  {
                    action: 'Contract Paused',
                    details: 'Emergency pause activated',
                    time: '1 day ago',
                    status: 'warning'
                  },
                  {
                    action: 'Settings Changed',
                    details: 'Updated minimum lock duration',
                    time: '3 days ago',
                    status: 'success'
                  }
                ].map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        action.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{action.action}</p>
                        <p className="text-xs text-gray-500">{action.details}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {action.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Non-Owner View */}
      {!isOwner && (
        <Card className="shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Admin Access Required
            </h3>
            <p className="text-gray-600 mb-6">
              Connect with the contract owner account to access admin controls
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Contract Status:</strong> {contractSettings.isPaused ? "⏸️ Paused" : "✅ Active"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPanel;
