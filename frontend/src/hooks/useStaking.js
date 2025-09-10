import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { stakingContractConfig, stakingTokenConfig, parseTokenAmount } from "../config/index.js";
// import { useEthersProvider } from "./ethersAdapter";

/**
 * Hook for staking operations with toast notifications
 */
export const useStaking = () => {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const { writeContractAsync } = useWriteContract();
    // const { ethersProvider } = useEthersProvider();
    // const { waitForTransactionReceipt } = useWaitForTransactionReceipt();
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
            toast.error("Please connect your wallet first");
            throw new Error("Wallet not connected");
        }

        try {
            setIsApproving(true);
            toast.loading("Approving tokens...", { id: "approve" });
            
            const hash = await writeContractAsync({
                ...stakingTokenConfig,
                functionName: "approve",
                args: [stakingContractConfig.address, parseTokenAmount(amount)],
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            
            if (receipt.status === "reverted") {
                toast.error("Token approval failed - transaction reverted", { id: "approve" });
                throw new Error("Transaction reverted");
            }

            toast.success("Tokens approved successfully!", { id: "approve" });
            return { success: true, hash };
        } catch (error) {
            console.error("Approval failed:", error);
            toast.error(`Approval failed: ${error.message || 'Unknown error'}`, { id: "approve" });
            throw error;
        } finally {
            setIsApproving(false);
        }
    }, [address, writeContractAsync, publicClient]);

    // Stake tokens
    const stake = useCallback(async (amount) => {
        if (!address) {
            toast.error("Please connect your wallet first");
            throw new Error("Wallet not connected");
        }

        if (!amount || amount <= 0) {
            toast.error("Please enter a valid amount to stake");
            throw new Error("Invalid amount");
        }

        try {
            setIsStaking(true);
            toast.loading("Processing stake transaction...", { id: "stake" });

            // Check if approval is needed
            const hasAllowance = await checkAllowance(amount);
            if (!hasAllowance) {
                toast.loading("Approving tokens first...", { id: "stake" });
                await approveTokens(amount);
            }

            toast.loading("Staking tokens...", { id: "stake" });
            const hash = await writeContractAsync({
                ...stakingContractConfig,
                functionName: "stake",
                args: [parseTokenAmount(amount)],
            });

            // Wait for transaction to be mined
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            
            if (receipt.status === "reverted") {
                toast.error("Stake transaction failed - transaction reverted", { id: "stake" });
                throw new Error("Transaction reverted");
            }
            toast.success(`Successfully staked ${amount} STK tokens!`, { id: "stake" });
            return { success: true, hash };
        } catch (error) {
            console.error("Staking failed:", error);
            toast.error(`Staking failed: ${error.message || 'Unknown error'}`, { id: "stake" });
            throw error;
        } finally {
            setIsStaking(false);
        }
    }, [address, writeContractAsync, publicClient, checkAllowance, approveTokens]);

    // useEffect(() => {
    //     const onStake = (staker, amount, timestamp) => {
    //         if (address && staker.toLowerCase() === address.toLowerCase()) {
    //             toast.success(`Successfully staked ${amount} STK tokens!`, { id: "stake" });
    //         }
    //     };

    //     const contract = new ethers.Contract(
    //         stakingContractConfig.address,
    //         stakingContractConfig.abi,
    //         ethersProvider
    //     );

    //     contract.on("Staked", onStake);

    //     return () => contract.off("Staked", onStake);
    // }, [address, ethersProvider]);

    // Withdraw tokens
    const withdraw = useCallback(async (amount) => {
        if (!address) {
            toast.error("Please connect your wallet first");
            throw new Error("Wallet not connected");
        }

        if (!amount || amount <= 0) {
            toast.error("Please enter a valid amount to withdraw");
            throw new Error("Invalid amount");
        }

        try {
            setIsWithdrawing(true);
            toast.loading("Processing withdrawal...", { id: "withdraw" });
            
            const hash = await writeContractAsync({
                ...stakingContractConfig,
                functionName: "withdraw",
                args: [parseTokenAmount(amount)],
            });
            
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            
            if (receipt.status === "reverted") {
                toast.error("Withdrawal failed - transaction reverted", { id: "withdraw" });
                throw new Error("Transaction reverted");
            }
            
            return { success: true, hash };
        } catch (error) {
            console.error("Withdrawal failed:", error);
            toast.error(`Withdrawal failed: ${error.message || 'Unknown error'}`, { id: "withdraw" });
            throw error;
        } finally {
            setIsWithdrawing(false);
        }
    }, [address, writeContractAsync, publicClient]);

    // Claim rewards
    const claimRewards = useCallback(async () => {
        if (!address) {
            toast.error("Please connect your wallet first");
            throw new Error("Wallet not connected");
        }

        try {
            setIsClaiming(true);
            toast.loading("Claiming your rewards...", { id: "claim" });
            
            const hash = await writeContractAsync({
                ...stakingContractConfig,
                functionName: "claimRewards",
            });
            
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            
            if (receipt.status === "reverted") {
                toast.error("Claim rewards failed - transaction reverted", { id: "claim" });
                throw new Error("Transaction reverted");
            }
            
            toast.success("Rewards claimed successfully! 🎉", { id: "claim" });
            return { success: true, hash };
        } catch (error) {
            console.error("Claim rewards failed:", error);
            toast.error(`Claim rewards failed: ${error.message || 'Unknown error'}`, { id: "claim" });
            throw error;
        } finally {
            setIsClaiming(false);
        }
    }, [address, writeContractAsync, publicClient]);

    // Emergency withdraw
    const emergencyWithdraw = useCallback(async () => {
        if (!address) {
            toast.error("Please connect your wallet first");
            throw new Error("Wallet not connected");
        }

        try {
            setIsEmergencyWithdrawing(true);
            toast.loading("Processing emergency withdrawal...", { id: "emergency" });
            
            const hash = await writeContractAsync({
                ...stakingContractConfig,
                functionName: "emergencyWithdraw",
            });
            
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            
            if (receipt.status === "reverted") {
                toast.error("Emergency withdrawal failed - transaction reverted", { id: "emergency" });
                throw new Error("Transaction reverted");
            }
            
            toast.success("Emergency withdrawal completed (penalty applied)", { id: "emergency" });
            return { success: true, hash };
        } catch (error) {
            console.error("Emergency withdrawal failed:", error);
            toast.error(`Emergency withdrawal failed: ${error.message || 'Unknown error'}`, { id: "emergency" });
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
