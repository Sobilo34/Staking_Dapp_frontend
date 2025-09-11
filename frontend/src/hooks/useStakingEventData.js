import { useAccount, usePublicClient } from "wagmi";
import { useState, useEffect } from "react";
import { stakingContractConfig, formatTokenAmount } from "../config/index.js";
import useStaking from "./useStaking";

/**
 * Hook to get combined staking data from both events and contract calls
 * This provides the most up-to-date information for UI components
 */
export const useStakingEventData = () => {
    const { address, isConnected } = useAccount();
    const publicClient = usePublicClient();
    const { eventData } = useStaking();
    const [combinedData, setCombinedData] = useState({
        userStakedAmount: null,
        pendingRewards: null,
        totalStaked: null,
        currentRewardRate: null,
        lastStakeTimestamp: null,
        isFromEvents: false,
        loading: true,
        lastUpdate: null
    });

    useEffect(() => {
        const fetchAndCombineData = async () => {
            if (!address || !publicClient || !isConnected) {
                setCombinedData(prev => ({ ...prev, loading: false }));
                return;
            }

            console.log('🔍 Checking event data freshness:', {
                hasEventData: !!eventData.lastUpdateTimestamp,
                eventTimestamp: eventData.lastUpdateTimestamp,
                now: Date.now(),
                age: eventData.lastUpdateTimestamp ? (Date.now() - eventData.lastUpdateTimestamp) : 'N/A',
                userStakedFromEvent: eventData.userStakedAmount
            });

            try {
                // If we have fresh event data, use it
                if (eventData.lastUpdateTimestamp) { // Remove 30 second limit for testing
                    
                    console.log('✅ Using fresh event data for UI');
                    setCombinedData({
                        userStakedAmount: eventData.userStakedAmount,
                        pendingRewards: eventData.pendingRewards,
                        totalStaked: eventData.totalStaked,
                        currentRewardRate: eventData.currentRewardRate,
                        lastStakeTimestamp: eventData.lastStakeTimestamp,
                        isFromEvents: true,
                        loading: false,
                        lastUpdate: new Date(eventData.lastUpdateTimestamp)
                    });
                    
                    return;
                }

                // Fallback to contract data if no fresh events
                console.log('🔄 Fetching fresh contract data...');
                const userDetails = await publicClient.readContract({
                    ...stakingContractConfig,
                    functionName: "getUserDetails",
                    args: [address],
                });

                if (userDetails && userDetails.length >= 3) {
                    const [stakedAmount, lastStakeTimestamp, pendingRewards] = userDetails;
                    
                    setCombinedData({
                        userStakedAmount: formatTokenAmount(stakedAmount.toString()),
                        pendingRewards: formatTokenAmount(pendingRewards.toString()),
                        totalStaked: eventData.totalStaked || null,
                        currentRewardRate: eventData.currentRewardRate || null,
                        lastStakeTimestamp: lastStakeTimestamp.toString(),
                        isFromEvents: false,
                        loading: false,
                        lastUpdate: new Date()
                    });
                    
                    console.log('📄 Using contract data for UI');
                }
            } catch (error) {
                console.error('Error fetching combined staking data:', error);
                setCombinedData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchAndCombineData();
    }, [address, publicClient, isConnected, eventData.lastUpdateTimestamp, eventData.userStakedAmount]);

    return combinedData;
};

export default useStakingEventData;
