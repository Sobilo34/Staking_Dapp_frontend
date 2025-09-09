import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const EventsPanel = () => {
  const [events, setEvents] = useState([]);
  const [isListening, setIsListening] = useState(true);

  // Mock real-time events - will be replaced with actual contract events
  const mockEvents = [
    {
      id: 1,
      type: 'Staked',
      user: '0x1234...5678',
      amount: '1,000.00',
      timestamp: Date.now() - 30000,
      newTotalStaked: '125,000.00',
      currentRewardRate: '12.5',
      txHash: '0xabcd...efgh'
    },
    {
      id: 2,
      type: 'RewardsClaimed',
      user: '0x9876...5432',
      amount: '45.67',
      timestamp: Date.now() - 120000,
      newTotalStaked: '124,000.00',
      currentRewardRate: '12.5',
      txHash: '0x1234...5678'
    },
    {
      id: 3,
      type: 'Withdrawn',
      user: '0x5555...1111',
      amount: '500.00',
      timestamp: Date.now() - 300000,
      newTotalStaked: '123,500.00',
      currentRewardRate: '12.3',
      txHash: '0x9999...aaaa'
    },
    {
      id: 4,
      type: 'RewardRateUpdated',
      user: '0x0000...0000',
      amount: '0.00',
      timestamp: Date.now() - 600000,
      newTotalStaked: '123,000.00',
      currentRewardRate: '12.5',
      previousRate: '11.8',
      txHash: '0xbbbb...cccc'
    }
  ];

  useEffect(() => {
    setEvents(mockEvents);
    
    // Simulate new events coming in
    if (isListening) {
      const interval = setInterval(() => {
        const eventTypes = ['Staked', 'RewardsClaimed', 'Withdrawn', 'RewardRateUpdated'];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        const newEvent = {
          id: Date.now(),
          type: randomType,
          user: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
          amount: (Math.random() * 1000).toFixed(2),
          timestamp: Date.now(),
          newTotalStaked: (125000 + Math.random() * 5000).toFixed(2),
          currentRewardRate: (12 + Math.random() * 2).toFixed(1),
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
        };

        setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events
      }, 10000); // New event every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isListening]);

  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'Staked':
        return '📈';
      case 'Withdrawn':
        return '📉';
      case 'RewardsClaimed':
        return '⚡';
      case 'RewardRateUpdated':
        return '⚠️';
      case 'EmergencyWithdrawEnabled':
        return '🚨';
      default:
        return '📊';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'Staked':
        return 'text-green-600 bg-green-50';
      case 'Withdrawn':
        return 'text-orange-600 bg-orange-50';
      case 'RewardsClaimed':
        return 'text-blue-600 bg-blue-50';
      case 'RewardRateUpdated':
        return 'text-red-600 bg-red-50';
      case 'EmergencyWithdrawEnabled':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                📊 Live Events
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Real-time contract activity and transactions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isListening ? "success" : "secondary"}>
                {isListening ? "🔴 Live" : "⏸️ Paused"}
              </Badge>
              <Button
                variant="secondary"
                onClick={() => setIsListening(!isListening)}
              >
                🔄 {isListening ? "Pause" : "Resume"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setEvents([])}
              >
                🗑️ Clear
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Events Feed */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <p>No events yet. Waiting for contract activity...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 20).map((event, index) => (
                <div 
                  key={event.id}
                  className={`border rounded-lg p-4 transition-all duration-300 ${
                    index === 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getEventColor(event.type)}`}>
                        <span className="text-lg">{getEventIcon(event.type)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{event.type}</h4>
                          {index === 0 && (
                            <Badge variant="success" className="text-xs px-2 py-1">
                              ⏰ NEW
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>by {event.user}</span>
                          <span>•</span>
                          <span>{formatTime(event.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {parseFloat(event.amount) > 0 && (
                        <div className="font-medium text-gray-900">
                          {event.type === 'Withdrawn' ? '-' : '+'}{event.amount} TICKET
                        </div>
                      )}
                      <button 
                        className="text-xs text-blue-600 hover:text-blue-700"
                        onClick={() => window.open(`https://etherscan.io/tx/${event.txHash}`, '_blank')}
                      >
                        {event.txHash} ↗️
                      </button>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Total Staked:</span>
                        <span className="ml-1">{event.newTotalStaked} TICKET</span>
                      </div>
                      <div>
                        <span className="font-medium">Current APR:</span>
                        <span className="ml-1">{event.currentRewardRate}%</span>
                      </div>
                    </div>
                    {event.previousRate && (
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="font-medium">Previous APR:</span>
                        <span className="ml-1">{event.previousRate}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Total Stakes</p>
                <p className="text-2xl font-bold text-green-900">
                  {events.filter(e => e.type === 'Staked').length}
                </p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Rewards Claimed</p>
                <p className="text-2xl font-bold text-blue-900">
                  {events.filter(e => e.type === 'RewardsClaimed').length}
                </p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Withdrawals</p>
                <p className="text-2xl font-bold text-orange-900">
                  {events.filter(e => e.type === 'Withdrawn').length}
                </p>
              </div>
              <div className="text-3xl">📉</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventsPanel;
