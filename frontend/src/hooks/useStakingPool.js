import { usePublicClient } from "wagmi";
import { useState, useEffect } from "react";
import { stakingContractConfig } from "../config/index.js";

/**
 * Hook to get staking pool information
 */
export const useStakingPool = () => {
    const publicClient = usePublicClient();
    const [poolData, setPoolData] = useState({
        totalStaked: 0n,
        currentRewardRate: 0n,
        initialApr: 0n,
        minLockDuration: 0n,
        aprReductionPerThousand: 0n,
        emergencyWithdrawPenalty: 0n,
        totalRewards: 0n,
        isPaused: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPoolData = async () => {
            if (!publicClient) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch all pool data in parallel
                const [
                    totalStaked,
                    currentRewardRate,
                    initialApr,
                    minLockDuration,
                    aprReductionPerThousand,
                    emergencyWithdrawPenalty,
                    totalRewards,
                    isPaused,
                ] = await Promise.all([
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "totalStaked",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "currentRewardRate",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "initialApr",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "minLockDuration",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "aprReductionPerThousand",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "emergencyWithdrawPenalty",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "getTotalRewards",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "paused",
                    }),
                ]);

                setPoolData({
                    totalStaked,
                    currentRewardRate,
                    initialApr,
                    minLockDuration,
                    aprReductionPerThousand,
                    emergencyWithdrawPenalty,
                    totalRewards,
                    isPaused,
                });
            } catch (err) {
                console.error("Error fetching pool data:", err);
                setError(err.message || "Failed to fetch pool data");
            } finally {
                setLoading(false);
            }
        };

        fetchPoolData();
        
        // Refresh every 60 seconds
        const interval = setInterval(fetchPoolData, 60000);
        
        return () => clearInterval(interval);
    }, [publicClient]);

    const refetch = async () => {
        if (publicClient) {
            try {
                setLoading(true);
                
                const [
                    totalStaked,
                    currentRewardRate,
                    initialApr,
                    minLockDuration,
                    aprReductionPerThousand,
                    emergencyWithdrawPenalty,
                    totalRewards,
                    isPaused,
                ] = await Promise.all([
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "totalStaked",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "currentRewardRate",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "initialApr",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "minLockDuration",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "aprReductionPerThousand",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "emergencyWithdrawPenalty",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "getTotalRewards",
                    }),
                    publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "paused",
                    }),
                ]);

                setPoolData({
                    totalStaked,
                    currentRewardRate,
                    initialApr,
                    minLockDuration,
                    aprReductionPerThousand,
                    emergencyWithdrawPenalty,
                    totalRewards,
                    isPaused,
                });
                setError(null);
            } catch (err) {
                console.error("Error refetching pool data:", err);
                setError(err.message || "Failed to fetch pool data");
            } finally {
                setLoading(false);
            }
        }
    };

    return {
        poolData,
        loading,
        error,
        refetch,
    };
};

export default useStakingPool;
