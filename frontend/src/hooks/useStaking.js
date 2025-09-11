import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { parseAbiItem } from "viem";
import { stakingContractConfig, stakingTokenConfig, parseTokenAmount } from "../config/index.js";

/**
 * Hook for staking operations with toast notifications and event watching
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

    // Event watchers setup
    useEffect(() => {
        if (!publicClient || !stakingContractConfig.address) return;

        const unwatchFunctions = [];

        // Watch Staked events
        const unwatchStaked = publicClient.watchEvent({
            address: stakingContractConfig.address,
            event: parseAbiItem('event Staked(address indexed user, uint256 amount, uint256 timestamp, uint256 newTotalStaked, uint256 currentRewardRate)'),
            onLogs: logs => {
                console.log('Staked events detected:', logs);
                logs.forEach(log => {
                    console.log('Processing Staked log:', {
                        user: log.args?.user,
                        amount: log.args?.amount,
                        timestamp: log.args?.timestamp,
                        newTotalStaked: log.args?.newTotalStaked,
                        currentRewardRate: log.args?.currentRewardRate,
                        currentUser: address,
                        isForCurrentUser: log.args?.user?.toLowerCase() === address?.toLowerCase()
                    });
                    if (log.args?.user?.toLowerCase() === address?.toLowerCase()) {
                        toast.success(`Stake confirmed: ${log.args.amount} tokens staked`);
                    }
                });
            }
        });
        unwatchFunctions.push(unwatchStaked);

        // Watch Withdrawn events
        const unwatchWithdrawn = publicClient.watchEvent({
            address: stakingContractConfig.address,
            event: parseAbiItem('event Withdrawn(address indexed user, uint256 amount, uint256 timestamp, uint256 newTotalStaked)'),
            onLogs: logs => {
                console.log('Withdrawn events detected:', logs);
                logs.forEach(log => {
                    console.log('Processing Withdrawn log:', {
                        user: log.args?.user,
                        amount: log.args?.amount,
                        timestamp: log.args?.timestamp,
                        newTotalStaked: log.args?.newTotalStaked,
                        currentUser: address,
                        isForCurrentUser: log.args?.user?.toLowerCase() === address?.toLowerCase()
                    });
                    if (log.args?.user?.toLowerCase() === address?.toLowerCase()) {
                        toast.success(`Withdrawal confirmed: ${log.args.amount} tokens withdrawn`);
                    }
                });
            }
        });
        unwatchFunctions.push(unwatchWithdrawn);

        // Watch RewardsClaimed events
        const unwatchRewardsClaimed = publicClient.watchEvent({
            address: stakingContractConfig.address,
            event: parseAbiItem('event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp)'),
            onLogs: logs => {
                console.log('RewardsClaimed events detected:', logs);
                logs.forEach(log => {
                    console.log('Processing RewardsClaimed log:', {
                        user: log.args?.user,
                        amount: log.args?.amount,
                        timestamp: log.args?.timestamp,
                        currentUser: address,
                        isForCurrentUser: log.args?.user?.toLowerCase() === address?.toLowerCase()
                    });
                    if (log.args?.user?.toLowerCase() === address?.toLowerCase()) {
                        toast.success(`Rewards claimed: ${log.args.amount} tokens`);
                    }
                });
            }
        });
        unwatchFunctions.push(unwatchRewardsClaimed);

        // Watch EmergencyWithdrawn events
        const unwatchEmergencyWithdrawn = publicClient.watchEvent({
            address: stakingContractConfig.address,
            event: parseAbiItem('event EmergencyWithdrawn(address indexed user, uint256 amount, uint256 penalty, uint256 timestamp)'),
            onLogs: logs => {
                console.log('EmergencyWithdrawn events detected:', logs);
                logs.forEach(log => {
                    console.log('Processing EmergencyWithdrawn log:', {
                        user: log.args?.user,
                        amount: log.args?.amount,
                        penalty: log.args?.penalty,
                        timestamp: log.args?.timestamp,
                        currentUser: address,
                        isForCurrentUser: log.args?.user?.toLowerCase() === address?.toLowerCase()
                    });
                    if (log.args?.user?.toLowerCase() === address?.toLowerCase()) {
                        toast.warning(`Emergency withdrawal: ${log.args.amount} tokens (penalty: ${log.args.penalty})`);
                    }
                });
            }
        });
        unwatchFunctions.push(unwatchEmergencyWithdrawn);

        // Watch Approval events for token approvals
        const unwatchApproval = publicClient.watchEvent({
            address: stakingTokenConfig.address,
            event: parseAbiItem('event Approval(address indexed owner, address indexed spender, uint256 value)'),
            onLogs: logs => {
                console.log('Approval events detected:', logs);
                logs.forEach(log => {
                    console.log('Processing Approval log:', {
                        owner: log.args?.owner,
                        spender: log.args?.spender,
                        value: log.args?.value,
                        currentUser: address,
                        stakingContract: stakingContractConfig.address,
                        isForCurrentUser: log.args?.owner?.toLowerCase() === address?.toLowerCase(),
                        isForStakingContract: log.args?.spender?.toLowerCase() === stakingContractConfig.address?.toLowerCase()
                    });
                    if (log.args?.owner?.toLowerCase() === address?.toLowerCase() && 
                        log.args?.spender?.toLowerCase() === stakingContractConfig.address?.toLowerCase()) {
                        toast.success(`Token approval confirmed: ${log.args.value} tokens`);
                    }
                });
            }
        });
        unwatchFunctions.push(unwatchApproval);

        console.log('Watching staking events, unwatch functions:', unwatchFunctions);

        // Cleanup function
        return () => {
            unwatchFunctions.forEach(unwatch => {
                if (typeof unwatch === 'function') {
                    unwatch();
                }
            });
            console.log('Stopped watching staking events');
        };
    }, [publicClient, address]);

    // Check token allowance
    const checkAllowance = useCallback(async (amount) => {
        console.log('checkAllowance function called with amount:', amount);
        if (!address || !publicClient) {
            console.log('Cannot check allowance: missing address or publicClient');
            return false;
        }
        
        try {
            console.log('Reading allowance from contract...');
            const allowance = await publicClient.readContract({
                ...stakingTokenConfig,
                functionName: "allowance",
                args: [address, stakingContractConfig.address],
            });
            
            const requiredAmount = parseTokenAmount(amount);
            const hasEnoughAllowance = allowance >= requiredAmount;
            
            console.log('Allowance check results:', {
                currentAllowance: allowance.toString(),
                requiredAmount: requiredAmount.toString(),
                formattedAmount: amount,
                hasEnoughAllowance,
                userAddress: address,
                spenderAddress: stakingContractConfig.address
            });
            
            return hasEnoughAllowance;
        } catch (error) {
            console.error("Error checking allowance:", error);
            return false;
        }
    }, [address, publicClient]);

    // Approve tokens
    const approveTokens = useCallback(async (amount) => {
        console.log('approveTokens function called with amount:', amount);
        if (!address) {
            toast.error("Please connect your wallet first");
            throw new Error("Wallet not connected");
        }

        try {
            setIsApproving(true);
            toast.loading("Approving tokens...", { id: "approve" });
            console.log('Sending approve transaction...');
            console.log('Approval details:', {
                spender: stakingContractConfig.address,
                amount: parseTokenAmount(amount),
                formattedAmount: amount
            });
            
            const hash = await writeContractAsync({
                ...stakingTokenConfig,
                functionName: "approve",
                args: [stakingContractConfig.address, parseTokenAmount(amount)],
            });

            console.log('Approval transaction hash:', hash);
            console.log('Waiting for approval transaction receipt...');
            
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            console.log('Approval transaction receipt:', receipt);
            
            if (receipt.status === "reverted") {
                toast.error("Token approval failed - transaction reverted", { id: "approve" });
                throw new Error("Transaction reverted");
            }

            toast.success("Tokens approved successfully!", { id: "approve" });
            console.log('Token approval completed successfully');
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
        console.log('stake function called with amount:', amount);
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
            console.log('Checking allowance before staking...');

            // Check if approval is needed
            const hasAllowance = await checkAllowance(amount);
            console.log('Allowance check result:', hasAllowance);
            
            if (!hasAllowance) {
                console.log('Approval needed, approving tokens first...');
                toast.loading("Approving tokens first...", { id: "stake" });
                await approveTokens(amount);
            }

            console.log('Sending stake transaction...');
            console.log('Stake details:', {
                amount: parseTokenAmount(amount),
                formattedAmount: amount,
                userAddress: address
            });
            
            toast.loading("Staking tokens...", { id: "stake" });
            const hash = await writeContractAsync({
                ...stakingContractConfig,
                functionName: "stake",
                args: [parseTokenAmount(amount)],
            });

            console.log('Stake transaction hash:', hash);
            console.log('Waiting for stake transaction receipt...');

            // Wait for transaction to be mined
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            console.log('Stake transaction receipt:', receipt);
            
            if (receipt.status === "reverted") {
                toast.error("Stake transaction failed - transaction reverted", { id: "stake" });
                throw new Error("Transaction reverted");
            }
            
            toast.success(`Successfully staked ${amount} STK tokens!`, { id: "stake" });
            console.log('Stake completed successfully');
            return { success: true, hash };
        } catch (error) {
            console.error("Staking failed:", error);
            toast.error(`Staking failed: ${error.message || 'Unknown error'}`, { id: "stake" });
            throw error;
        } finally {
            setIsStaking(false);
        }
    }, [address, writeContractAsync, publicClient, checkAllowance, approveTokens]);

    // Withdraw tokens
    const withdraw = useCallback(async (amount) => {
        console.log('withdraw function called with amount:', amount);
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
            console.log('Sending withdraw transaction...');
            console.log('Withdraw details:', {
                amount: parseTokenAmount(amount),
                formattedAmount: amount,
                userAddress: address
            });
            
            const hash = await writeContractAsync({
                ...stakingContractConfig,
                functionName: "withdraw",
                args: [parseTokenAmount(amount)],
            });
            
            console.log('Withdraw transaction hash:', hash);
            console.log('Waiting for withdraw transaction receipt...');
            
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            console.log('Withdraw transaction receipt:', receipt);
            
            if (receipt.status === "reverted") {
                toast.error("Withdrawal failed - transaction reverted", { id: "withdraw" });
                throw new Error("Transaction reverted");
            }
            
            toast.success(`Successfully withdrew ${amount} STK tokens!`, { id: "withdraw" });
            console.log('Withdrawal completed successfully');
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
        console.log('claimRewards function called');
        if (!address) {
            toast.error("Please connect your wallet first");
            throw new Error("Wallet not connected");
        }

        try {
            setIsClaiming(true);
            toast.loading("Claiming your rewards...", { id: "claim" });
            console.log('Sending claimRewards transaction...');
            
            const hash = await writeContractAsync({
                ...stakingContractConfig,
                functionName: "claimRewards",
            });
            
            console.log('Transaction hash:', hash);
            console.log('Waiting for transaction receipt...');
            
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            console.log('Transaction receipt:', receipt);
            
            if (receipt.status === "reverted") {
                toast.error("Claim rewards failed - transaction reverted", { id: "claim" });
                throw new Error("Transaction reverted");
            }
            
            toast.success("Rewards claimed successfully!", { id: "claim" });
            console.log('Claim rewards completed successfully');
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
        console.log('emergencyWithdraw function called');
        if (!address) {
            toast.error("Please connect your wallet first");
            throw new Error("Wallet not connected");
        }

        try {
            setIsEmergencyWithdrawing(true);
            toast.loading("Processing emergency withdrawal...", { id: "emergency" });
            console.log('Sending emergency withdraw transaction...');
            console.log('Emergency withdraw details:', {
                userAddress: address,
                warning: 'This action will incur a penalty'
            });
            
            const hash = await writeContractAsync({
                ...stakingContractConfig,
                functionName: "emergencyWithdraw",
            });
            
            console.log('Emergency withdraw transaction hash:', hash);
            console.log('Waiting for emergency withdraw transaction receipt...');
            
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            console.log('Emergency withdraw transaction receipt:', receipt);
            
            if (receipt.status === "reverted") {
                toast.error("Emergency withdrawal failed - transaction reverted", { id: "emergency" });
                throw new Error("Transaction reverted");
            }
            
            toast.success("Emergency withdrawal completed (penalty applied)", { id: "emergency" });
            console.log('Emergency withdrawal completed successfully');
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
