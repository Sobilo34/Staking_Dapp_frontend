import { useAccount, usePublicClient } from "wagmi";
import { useState, useEffect } from "react";
import { stakingContractConfig, formatTokenAmount } from "../config/index.js";

/**
 * Hook to get user's staking details
 */
export const useUserStakingDetails = () => {
    const { address, isConnected } = useAccount();
    const publicClient = usePublicClient();
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!address || !publicClient || !isConnected) {
                setUserDetails(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const result = await publicClient.readContract({
                    ...stakingContractConfig,
                    functionName: "getUserDetails",
                    args: [address],
                });
                
                console.log("Raw result from contract:", result);

                if (result && Array.isArray(result) && result.length >= 5) {
                    const userDetailsData = {
                        stakedAmount: result[0],
                        lastStakeTimestamp: result[1],
                        pendingRewards: result[2],
                        timeUntilUnlock: result[3],
                        canWithdraw: result[4],
                        // Formatted versions for display
                        formattedStakedAmount: formatTokenAmount(result[0]),
                        formattedPendingRewards: formatTokenAmount(result[2]),
                    };
                    
                    console.log("Processed user details:", userDetailsData);
                    setUserDetails(userDetailsData);
                } else {
                    console.warn("Invalid result format:", result);
                    setError("Invalid data format from contract");
                    setUserDetails(null);
                }
            } catch (err) {
                console.error("Error fetching user details:", err);
                setError(err.message || "Failed to fetch user details");
                setUserDetails(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchUserDetails, 30000);
        
        return () => clearInterval(interval);
    }, [address, publicClient, isConnected]);

    const refetch = async () => {
        if (address && publicClient && isConnected) {
            try {
                setLoading(true);
                setError(null);
                
                const result = await publicClient.readContract({
                    ...stakingContractConfig,
                    functionName: "getUserDetails",
                    args: [address],
                });

                if (result && Array.isArray(result) && result.length >= 5) {
                    const userDetailsData = {
                        stakedAmount: result[0],
                        lastStakeTimestamp: result[1],
                        pendingRewards: result[2],
                        timeUntilUnlock: result[3],
                        canWithdraw: result[4],
                        // Formatted versions for display
                        formattedStakedAmount: formatTokenAmount(result[0]),
                        formattedPendingRewards: formatTokenAmount(result[2]),
                    };
                    
                    setUserDetails(userDetailsData);
                } else {
                    setError("Invalid data format from contract");
                    setUserDetails(null);
                }
            } catch (err) {
                console.error("Error refetching user details:", err);
                setError(err.message || "Failed to fetch user details");
                setUserDetails(null);
            } finally {
                setLoading(false);
            }
        }
    };

    return {
        userDetails,
        loading,
        error,
        refetch,
    };
};

export default useUserStakingDetails;
