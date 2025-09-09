# Staking DApp Frontend - Simplified Version

A clean React frontend for the Staking smart contract built without PostCSS/Tailwind complexity.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📦 Dependencies (Minimal)

- **React 19.1.1** - UI framework
- **Vite 7.1.5** - Build tool and dev server
- **Lucide React** - Clean SVG icons

## 🎨 Styling Approach

- **Vanilla CSS** with utility classes in `index.css`
- **No PostCSS or Tailwind** - simple and reliable
- **Gradient backgrounds** using CSS classes
- **Responsive design** with CSS Grid and Flexbox

## 🧩 Components

### Main Components
- **StakingDashboard** - Complete staking interface with real-time data
- **EventsPanel** - Live contract events and activity feed
- **AdminPanel** - Owner controls and emergency functions
- **StatsPanel** - Analytics and performance metrics

### UI Components (Simplified)
- **Button** - Various styles (primary, secondary, success, danger, warning)
- **Card** - Content containers with header/content structure
- **Input** - Form inputs with proper styling
- **Badge** - Status indicators and labels
- **Progress** - Progress bars for time remaining, etc.

## 🎯 Features

### Real-time Dashboard
- Live pending rewards counter
- Countdown timers for unlock periods
- Mock real-time events (10-second intervals)
- Responsive grid layouts

### Complete Functionality
- **Staking**: Token staking with amount input and validation
- **Withdrawals**: Regular and emergency withdraw options
- **Rewards**: Real-time reward claiming interface
- **Admin**: Contract pause, settings updates, emergency controls
- **Analytics**: TVL, APR tracking, top stakers leaderboard

## 🌐 Web3 Integration (Next Steps)

To connect with your StakingContract:

1. **Install Web3 libraries**:
   ```bash
   npm install ethers@^6.0.0 @wagmi/core wagmi
   ```

2. **Add environment variables** (create `.env.local`):
   ```
   VITE_CONTRACT_ADDRESS=your_deployed_contract_address
   VITE_RPC_URL=your_ethereum_rpc_url
   ```

3. **Replace mock data** with real contract calls

Perfect for developers who want clean, maintainable code without build tool complications.
