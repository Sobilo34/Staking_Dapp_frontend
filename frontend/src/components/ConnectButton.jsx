import React from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';

export default function ConnectButton() {
  const { open } = useAppKit();
  const { address, isConnecting, isConnected } = useAccount();

  if (isConnecting) {
    return (
      <button disabled className="px-4 py-2 bg-gray-400 text-white rounded-lg">
        Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </span>
        <button 
          onClick={() => open({ view: 'Account' })}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Account
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => open()}
      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
    >
      Connect Wallet
    </button>
  );
}
