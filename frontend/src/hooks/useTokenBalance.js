import { useAccount, usePublicClient } from "wagmi";
import { useState, useEffect } from "react";
import { stakingTokenConfig } from "../config/index.js";

/**
 * Hook to get user's token balance
 */
export const useTokenBalance = () => {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const [balance, setBalance] = useState(0n);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBalance = async () => {
            if (!address || !publicClient) {
                setBalance(0n);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const result = await publicClient.readContract({
                    ...stakingTokenConfig,
                    functionName: "balanceOf",
                    args: [address],
                });

                setBalance(result);
            } catch (err) {
                console.error("Error fetching balance:", err);
                setError(err.message || "Failed to fetch balance");
                setBalance(0n);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchBalance, 30000);
        
        return () => clearInterval(interval);
    }, [address, publicClient]);

    const refetch = async () => {
        if (address && publicClient) {
            try {
                setLoading(true);
                const result = await publicClient.readContract({
                    ...stakingTokenConfig,
                    functionName: "balanceOf",
                    args: [address],
                });

                setBalance(result);
                setError(null);
            } catch (err) {
                console.error("Error refetching balance:", err);
                setError(err.message || "Failed to fetch balance");
            } finally {
                setLoading(false);
            }
        }
    };

    return {
        balance,
        loading,
        error,
        refetch,
    };
};

export default useTokenBalance;
