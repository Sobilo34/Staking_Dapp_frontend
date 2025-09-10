import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useCallback, useState } from "react";
import { stakingContractConfig, stakingTokenConfig, parseTokenAmount } from "../config/index.js";

/**
 * Hook for staking operations
 */
export const useStaking = () => {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const { writeContractAsync } = useWriteContract();
    
    const [isStaking, setIsStaking] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isEmergencyWithdrawing, setIsEmergencyWithdrawing] = useState(false);

    // Check token allowance
    const checkAllowance = useCallback(async (amount) => {
        if (!address || !publicClient) return false;
        
        try {
            const allowance = await publicClient.readContract({
                ...stakingTokenConfig,
                functionName: "allowance",
                args: [address, stakingContractConfig.address],
            });
            
            return allowance >= parseTokenAmount(amount);
        } catch (error) {
            console.error("Error checking allowance:", error);
            return false;
        }
    }, [address, publicClient]);

    // Approve tokens
    const approveTokens = useCallback(async (amount) => {
        if (!address) {
            throw new Error("Wallet not connected");
        }

        try {
            setIsApproving(true);
            
            const hash = await writeContractAsync({
                ...stakingTokenConfig,
                functionName: "approve",
                args: [stakingContractConfig.address, parseTokenAmount(amount)],
            });

            // Wait for transaction to be mined
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            
            if (receipt.status === "reverted") {
                throw new Error("Transaction reverted");
            }

            return { success: true, hash };
        } catch (error) {
            console.error("Approval failed:", error);
            throw error;
        } finally {
            setIsApproving(false);
        }
    }, [address, writeContractAsync, publicClient]);

    // Stake tokens
    const stake = useCallback(async (amount) => {
        if (!address) {
            throw new Error("Wallet not connected");
        }

        if (!amount || amount <= 0) {
            throw new Error("Invalid amount");
        }

        try {
            setIsStaking(true);

            // Check if approval is needed
            const hasAllowance = await checkAllowance(amount);
            if (!hasAllowance) {
                await approveTokens(amount);
            }

            const hash = await writeContractAsync({
                ...stakingContractConfig,
                functionName: "stake",
                args: [parseTokenAmount(amount)],
            });

            // Wait for transaction to be mined
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            
            if (receipt.status === "reverted") {
                throw new Error("Transaction reverted");
            }

            return { success: true, hash };
        } catch (error) {
            console.error("Staking failed:", error);
            throw error;
        } finally {
            setIsStaking(false);
        }
    }, [address, writeContractAsync, publicClient, checkAllowance, approveTokens]);

    // Withdraw tokens
    const withdraw = useCallback(async (amount) => {
        if (!address) {
            throw new Error("Wallet not connected");
        }

        if (!amount || amount <= 0) {
            throw new Error("Invalid amount");
        }

        try {
            setIsWithdrawing(true);
            const hash = await writeContractAsync({
                ...stakingContractConfig,
                functionName: "withdraw",
                args: [parseTokenAmount(amount)],
            });
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            if (receipt.status === "reverted") {
                throw new Error("Transaction reverted");
            }
            return { success: true, hash };
        } catch (error) {
            throw error;
        } finally {
            setIsWithdrawing(false);
        }
    }, [address, writeContractAsync, publicClient]);

    // Claim rewards
    const claimRewards = useCallback(async () => {
        if (!address) {
            throw new Error("Wallet not connected");
        }

        try {
            setIsClaiming(true);
            const hash = await writeContractAsync({
                ...stakingContractConfig,
                functionName: "claimRewards",
            });
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            if (receipt.status === "reverted") {
                throw new Error("Transaction reverted");
            }
            return { success: true, hash };
        } catch (error) {
            throw error;
        } finally {
            setIsClaiming(false);
        }
    }, [address, writeContractAsync, publicClient]);

    // Emergency withdraw
    const emergencyWithdraw = useCallback(async () => {
        if (!address) {
            throw new Error("Wallet not connected");
        }

        try {
            setIsEmergencyWithdrawing(true);
            const hash = await writeContractAsync({
                ...stakingContractConfig,
                functionName: "emergencyWithdraw",
            });
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            if (receipt.status === "reverted") {
                throw new Error("Transaction reverted");
            }
            return { success: true, hash };
        } catch (error) {
            throw error;
        } finally {
            setIsEmergencyWithdrawing(false);
        }
    }, [address, writeContractAsync, publicClient]);

    return {
        stake,
        withdraw,
        claimRewards,
        emergencyWithdraw,
        approveTokens,
        checkAllowance,
        isStaking,
        isWithdrawing,
        isClaiming,
        isApproving,
        isEmergencyWithdrawing,
    };
};

export default useStaking;
