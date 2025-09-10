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

                const { stakedAmount, lastStakeTimestamp, pendingRewards, timeUntilUnlock, canWithdraw } = await publicClient.readContract({
                    ...stakingContractConfig,
                    functionName: "getUserDetails",
                    args: [address],
                });
                
                const result = [stakedAmount, lastStakeTimestamp, pendingRewards, timeUntilUnlock, canWithdraw];

                if (result) {
                    const userDetailsData = {
                        stakedAmount: result[0],
                        lastStakeTimestamp: result[1],
                        pendingRewards: result[2],
                        timeUntilUnlock: result[3],
                        canWithdraw: result[4],
                        formattedStakedAmount: formatTokenAmount(result[0]),
                        formattedPendingRewards: formatTokenAmount(result[2]),
                    };
                    setUserDetails(userDetailsData);
                } else {
                    setError("Invalid data format from contract");
                    setUserDetails(null);
                }
            } catch (err) {
                setError(err.message || "Failed to fetch user details");
                setUserDetails(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [address, publicClient, isConnected, ]);

    return {
        userDetails,
        loading,
        error,
    };
};

export default useUserStakingDetails;
