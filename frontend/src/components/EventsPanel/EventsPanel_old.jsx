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
      totalStaked: '124,000.00',
      txHash: '0x1234...abcd'
    },
    {
      id: 3,
      type: 'Withdrawn',
      user: '0x5555...1111',
      amount: '500.00',
      timestamp: Date.now() - 300000,
      newTotalStaked: '123,500.00',
      currentRewardRate: '12.6',
      rewardsAccrued: '23.45',
      txHash: '0x9999...2222'
    },
    {
      id: 4,
      type: 'RewardRateUpdated',
      oldRate: '12.8',
      newRate: '12.6',
      timestamp: Date.now() - 350000,
      totalStaked: '123,500.00',
      txHash: '0x7777...8888'
    },
    {
      id: 5,
      type: 'EmergencyWithdrawn',
      user: '0x3333...4444',
      amount: '750.00',
      penalty: '37.50',
      timestamp: Date.now() - 600000,
      newTotalStaked: '123,000.00',
      txHash: '0x5555...6666'
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
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'Withdrawn':
        return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case 'RewardsClaimed':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'EmergencyWithdrawn':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'RewardRateUpdated':
        return <Activity className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventBadgeVariant = (type) => {
    switch (type) {
      case 'Staked':
        return 'success';
      case 'Withdrawn':
        return 'warning';
      case 'RewardsClaimed':
        return 'default';
      case 'EmergencyWithdrawn':
        return 'destructive';
      case 'RewardRateUpdated':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatEventDescription = (event) => {
    switch (event.type) {
      case 'Staked':
        return `${event.user} staked ${event.amount} TICKET`;
      case 'Withdrawn':
        return `${event.user} withdrew ${event.amount} TICKET`;
      case 'RewardsClaimed':
        return `${event.user} claimed ${event.amount} TICKET rewards`;
      case 'EmergencyWithdrawn':
        return `${event.user} emergency withdrew ${event.amount} TICKET (${event.penalty} penalty)`;
      case 'RewardRateUpdated':
        return `Reward rate updated from ${event.oldRate}% to ${event.newRate}%`;
      default:
        return 'Unknown event';
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            <CardTitle className="text-lg">Live Events</CardTitle>
            <Badge variant={isListening ? "success" : "secondary"} className="ml-2">
              {isListening ? "Live" : "Paused"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsListening(!isListening)}
            >
              {isListening ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Listening
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Start Listening
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No events yet. Waiting for contract activity...</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="flex-shrink-0">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={getEventBadgeVariant(event.type)} 
                      className="text-xs"
                    >
                      {event.type}
                    </Badge>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 truncate">
                    {formatEventDescription(event)}
                  </p>
                  {event.txHash && (
                    <p className="text-xs text-slate-400 font-mono truncate">
                      {event.txHash}
                    </p>
                  )}
                </div>
                {event.amount && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-medium">
                      {event.type === 'Withdrawn' || event.type === 'EmergencyWithdrawn' ? '-' : '+'}
                      {event.amount}
                    </p>
                    <p className="text-xs text-slate-500">TICKET</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {events.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Showing {events.length} recent events</span>
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {isListening ? 'Live updates' : 'Updates paused'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventsPanel;
