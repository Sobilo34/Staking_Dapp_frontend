import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Settings, 
  Pause, 
  Play, 
  Shield, 
  AlertTriangle,
  Key,
  RefreshCw,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

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

  const handleSaveSettings = () => {
    setContractSettings({ ...tempSettings });
    // Here you would call the actual contract update functions
    console.log('Settings would be updated to:', tempSettings);
  };

  const handlePauseContract = () => {
    setContractSettings(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
    // Here you would call the actual contract pause/unpause function
  };

  const handleRecoverTokens = () => {
    // Here you would call the recoverERC20 function
    console.log('Token recovery would be initiated');
  };

  return (
    <div className="space-y-6">
      {/* Admin Access Control */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-500" />
            Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Contract Owner Status</p>
              <Badge variant={isOwner ? "success" : "secondary"}>
                {isOwner ? "Owner Connected" : "Not Owner"}
              </Badge>
              {isOwner && (
                <p className="text-xs text-slate-500 mt-1">
                  You have administrative privileges for this contract
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOwner(!isOwner)}
              >
                {isOwner ? "Disconnect" : "Connect as Owner"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOwnerControls(!showOwnerControls)}
              >
                {showOwnerControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isOwner && showOwnerControls && (
        <>
          {/* Contract Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Contract Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Current Status</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={contractSettings.isPaused ? "destructive" : "success"}>
                      {contractSettings.isPaused ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          Paused
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Active
                        </>
                      )}
                    </Badge>
                    {contractSettings.isPaused && (
                      <span className="text-xs text-red-600">
                        ⚠️ Staking and rewards are currently disabled
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant={contractSettings.isPaused ? "default" : "destructive"}
                  onClick={handlePauseContract}
                >
                  {contractSettings.isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Unpause Contract
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Contract
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contract Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                Contract Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Initial APR (%)
                  </label>
                  <Input
                    type="number"
                    value={tempSettings.initialApr}
                    onChange={(e) => handleSettingChange('initialApr', e.target.value)}
                    placeholder="Enter APR..."
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-slate-500">
                    Current: {contractSettings.initialApr}%
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Emergency Withdraw Penalty (%)
                  </label>
                  <Input
                    type="number"
                    value={tempSettings.emergencyWithdrawPenalty}
                    onChange={(e) => handleSettingChange('emergencyWithdrawPenalty', e.target.value)}
                    placeholder="Enter penalty..."
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-slate-500">
                    Current: {contractSettings.emergencyWithdrawPenalty}%
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Min Lock Duration (days)
                  </label>
                  <Input
                    type="number"
                    value={tempSettings.minLockDuration / 86400}
                    onChange={(e) => handleSettingChange('minLockDuration', e.target.value * 86400)}
                    placeholder="Enter days..."
                    step="1"
                    min="1"
                  />
                  <p className="text-xs text-slate-500">
                    Current: {formatDuration(contractSettings.minLockDuration)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    APR Reduction per 1000 tokens
                  </label>
                  <Input
                    type="number"
                    value={tempSettings.aprReductionPerThousand}
                    onChange={(e) => handleSettingChange('aprReductionPerThousand', e.target.value)}
                    placeholder="Enter reduction..."
                    step="0.1"
                    min="0"
                  />
                  <p className="text-xs text-slate-500">
                    Current: {contractSettings.aprReductionPerThousand}%
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-slate-600">
                  Changes will take effect immediately upon confirmation
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setTempSettings({ ...contractSettings })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={handleSaveSettings}>
                    <Save className="w-4 h-4 mr-2" />
                    Update Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Controls */}
          <Card className="border-0 shadow-lg border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Emergency Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">Token Recovery</h4>
                <p className="text-sm text-red-700 mb-3">
                  Recover mistakenly sent ERC20 tokens (excluding the staking token)
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Token contract address"
                    className="flex-1"
                  />
                  <Input
                    placeholder="Amount"
                    className="w-32"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRecoverTokens}
                  >
                    Recover
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">Contract Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-yellow-700">Owner Actions Today:</span>
                    <span className="font-medium ml-2">0</span>
                  </div>
                  <div>
                    <span className="text-yellow-700">Last Parameter Change:</span>
                    <span className="font-medium ml-2">Never</span>
                  </div>
                  <div>
                    <span className="text-yellow-700">Emergency Withdrawals:</span>
                    <span className="font-medium ml-2">8 total</span>
                  </div>
                  <div>
                    <span className="text-yellow-700">Contract Deployed:</span>
                    <span className="font-medium ml-2">2 months ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!isOwner && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              Owner Access Required
            </h3>
            <p className="text-slate-500">
              Connect with the contract owner account to access administrative controls
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPanel;
