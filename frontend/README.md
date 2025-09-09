# StakeVault Frontend

A beautiful, real-time staking dashboard built with React, shadcn/ui, and Tailwind CSS.

## Features

### 🎯 Core Functionality
- **Staking Dashboard** - Complete staking interface with real-time data
- **Live Events Monitoring** - Real-time contract event listening and display
- **Statistics & Analytics** - Comprehensive metrics and historical data
- **Admin Panel** - Owner controls for contract management

### 🎨 UI Components
- Built with **shadcn/ui** components
- **Tailwind CSS** for styling
- **Lucide React** icons
- Responsive design for all devices
- Dark/light theme support (CSS variables)

### ⚡ Real-time Features
- Live pending rewards calculation
- Real-time event streaming simulation
- Dynamic statistics updates
- Auto-refreshing data displays

## Project Structure

```
src/
├── components/
│   ├── ui/                     # shadcn/ui base components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   ├── badge.jsx
│   │   └── progress.jsx
│   ├── StakingDashboard/       # Main dashboard
│   ├── EventsPanel/            # Live events
│   ├── StatsPanel/             # Analytics
│   └── AdminPanel/             # Owner controls
├── lib/
│   └── utils.js                # Utility functions
├── App.jsx                     # Main app with navigation
└── index.css                   # Tailwind + custom CSS
```

## Smart Contract Integration Points

The UI is designed to integrate with these contract functions:

### Read Functions
- `getUserDetails(address)` - User staking information
- `getPendingRewards(address)` - Real-time rewards
- `getTimeUntilUnlock(address)` - Lock period remaining
- `totalStaked()` - Global staking metrics
- `currentRewardRate()` - Current APR

### Write Functions
- `stake(uint256)` - Stake tokens
- `withdraw(uint256)` - Withdraw staked tokens
- `claimRewards()` - Claim pending rewards
- `emergencyWithdraw()` - Emergency withdrawal with penalty

### Events Monitored
- `Staked` - New staking events
- `Withdrawn` - Withdrawal events
- `RewardsClaimed` - Reward claims
- `RewardRateUpdated` - APR changes
- `EmergencyWithdrawn` - Emergency withdrawals
- `StakingPaused/Unpaused` - Contract status

### Admin Functions
- `pause()/unpause()` - Contract control
- `setInitialApr(uint256)` - Update APR
- `setMinLockDuration(uint256)` - Update lock time
- `recoverERC20()` - Token recovery

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Visit the App**
   Open [http://localhost:5173](http://localhost:5173)

## Next Steps for Web3 Integration

To connect this UI to the actual smart contract, you'll need to:

1. **Install Web3 Libraries**
   ```bash
   npm install ethers wagmi viem
   ```

2. **Add Wallet Connection**
   - Implement MetaMask/WalletConnect
   - Handle account changes
   - Network switching

3. **Contract Integration**
   - Replace mock data with contract calls
   - Set up event listeners
   - Handle transactions

4. **Error Handling**
   - Transaction failures
   - Network issues
   - User rejections

## Design Features

- **Gradient Backgrounds** - Beautiful visual hierarchy
- **Live Data Indicators** - Pulsing dots and badges for real-time updates
- **Responsive Grid Layout** - Works on mobile, tablet, and desktop
- **Interactive Elements** - Hover states and smooth transitions
- **Status Indicators** - Clear visual feedback for all states
- **Progress Bars** - Visual representation of time and capacity
- **Color-Coded Events** - Different colors for different event types

## Mock Data

Currently uses realistic mock data for:
- User staking positions
- Pending rewards (increments every second)
- Global statistics
- Historical trends
- Live events (new event every 10 seconds)
- Admin controls

All mock data is structured to match the smart contract's expected data formats.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
