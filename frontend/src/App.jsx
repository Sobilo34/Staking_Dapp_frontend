import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import ErrorBoundary from './components/ErrorBoundary';
import ConnectButton from './components/ConnectButton';
import StakingStats from './components/StakingStats';
import StakingActions from './components/StakingActions';
import { Toaster } from './components/ui/sonner';

function App() {
  const { isConnected } = useAccount();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">S</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Staking dApp
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Stake your STK tokens and earn rewards
                  </p>
                </div>
              </div>
              <ConnectButton />
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <StakingStats />
          <StakingActions />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 font-medium">
              <span className="text-blue-600 font-bold">Bilal Oyeleke Soliu</span> © {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
      
      {/* Toast Container */}
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
