import React from 'react';
import { useAccount } from 'wagmi';
import ConnectButton from './components/ConnectButton';
import StakingStats from './components/StakingStats';
import StakingActions from './components/StakingActions';

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Staking dApp
              </h1>
              <p className="text-gray-600">
                Stake your STK tokens and earn rewards
              </p>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isConnected ? (
          <div className="space-y-8">
            {/* Stats Overview */}
            <StakingStats />
            
            {/* Actions */}
            <StakingActions />
            
            {/* Info Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🪙</div>
                  <h4 className="font-semibold mb-2">1. Stake Tokens</h4>
                  <p className="text-sm text-gray-600">
                    Stake your STK tokens to start earning rewards
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">📈</div>
                  <h4 className="font-semibold mb-2">2. Earn Rewards</h4>
                  <p className="text-sm text-gray-600">
                    Earn rewards every minute based on the current APR
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">💰</div>
                  <h4 className="font-semibold mb-2">3. Claim & Withdraw</h4>
                  <p className="text-sm text-gray-600">
                    Claim rewards anytime or withdraw after the lock period
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔗</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Staking dApp
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect your wallet to start staking STK tokens and earning rewards. 
              Experience a simple and secure way to grow your holdings.
            </p>
            <ConnectButton />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>Bilal</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
