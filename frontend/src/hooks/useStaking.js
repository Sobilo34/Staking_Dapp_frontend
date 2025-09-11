import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { stakingContractConfig, stakingTokenConfig, parseTokenAmount, formatTokenAmount } from "../config/index.js";
import { ethers } from "ethers";

/**
 * Hook for staking operations with toast notifications and ethers event watching
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
    
    // Debug state to track event updates
    const [eventUpdateCount, setEventUpdateCount] = useState(0);

    // Event data state - comprehensive tracking
    const [eventData, setEventData] = useState({
        lastStakeEvent: null,
        lastWithdrawEvent: null,
        lastClaimEvent: null,
        lastEmergencyWithdrawEvent: null,
        lastApprovalEvent: null,
        // Real-time values from events
        userStakedAmount: null,
        totalStaked: null,
        currentRewardRate: null,
        pendingRewards: null,
        lastStakeTimestamp: null,
        // Trigger for UI updates
        lastUpdateTimestamp: null
    });

    // Ethers event listening setup
    useEffect(() => {
        if (!publicClient || !stakingContractConfig.address || !address) return;
        
        console.log('Setting up ethers event listeners for address:', address);
        
        // Initialize current user data
        const initializeUserData = async () => {
            try {
                console.log('Initializing user staking data...');
                const userDetails = await publicClient.readContract({
                    ...stakingContractConfig,
                    functionName: "getUserDetails",
                    args: [address],
                });
                
                if (userDetails && userDetails.length >= 3) {
                    const [stakedAmount, lastStakeTimestamp, pendingRewards] = userDetails;
                    setEventData(prev => ({
                        ...prev,
                        userStakedAmount: formatTokenAmount(stakedAmount.toString()),
                        pendingRewards: formatTokenAmount(pendingRewards.toString()),
                        lastStakeTimestamp: lastStakeTimestamp.toString(),
                        lastUpdateTimestamp: Date.now()
                    }));
                    console.log('Initialized user data:', {
                        stakedAmount: formatTokenAmount(stakedAmount.toString()),
                        pendingRewards: formatTokenAmount(pendingRewards.toString())
                    });
                }
            } catch (error) {
                console.error('Error initializing user data:', error);
            }
        };

        initializeUserData();
        
        // Create ethers provider from publicClient
        const rpcUrl = publicClient.chain?.rpcUrls?.default.http[0];
        if (!rpcUrl) {
            console.error('No RPC URL available from publicClient');
            return;
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const stakingContract = new ethers.Contract(
            stakingContractConfig.address,
            stakingContractConfig.abi,
            provider
        );
        const tokenContract = new ethers.Contract(
            stakingTokenConfig.address,
            stakingTokenConfig.abi,
            provider
        );

        // Event handlers
        const handleStakedEvent = (user, amount, timestamp, newTotalStaked, currentRewardRate, event) => {
            console.log('🥩 STAKED EVENT RECEIVED - RAW PARAMETERS:', {
                user,
                amount: amount?.toString(),
                timestamp: timestamp?.toString(), 
                newTotalStaked: newTotalStaked?.toString(),
                currentRewardRate: currentRewardRate?.toString(),
                event: event || 'no event object',
                currentUserAddress: address
            });

            console.log('🔍 USER COMPARISON:', {
                eventUser: user?.toLowerCase(),
                currentUser: address?.toLowerCase(),
                isMatch: user?.toLowerCase() === address?.toLowerCase()
            });

            if (user?.toLowerCase() === address?.toLowerCase()) {
                console.log('✅ STAKED EVENT IS FOR CURRENT USER!');
                
                const formattedAmount = formatTokenAmount(amount.toString());
                const formattedTotalStaked = formatTokenAmount(newTotalStaked.toString());
                
                console.log('🚀 PROCESSING STAKE EVENT FOR CURRENT USER');
                console.log('💰 Amount staked:', formattedAmount);
                console.log('📊 New total staked:', formattedTotalStaked);
                
                setEventData(prev => {
                    // Calculate new user staked amount
                    const currentUserStaked = prev.userStakedAmount ? 
                        parseFloat(prev.userStakedAmount) : 0;
                    const newUserStaked = currentUserStaked + parseFloat(formattedAmount);
                    
                    console.log('📈 CALCULATING NEW USER STAKED:', {
                        previousAmount: currentUserStaked,
                        stakingAmount: parseFloat(formattedAmount),
                        newAmount: newUserStaked
                    });
                    
                    const newData = {
                        ...prev,
                        lastStakeEvent: {
                            user,
                            amount: formattedAmount,
                            timestamp: new Date(Number(timestamp) * 1000),
                            transactionHash: event?.transactionHash || 'unknown'
                        },
                        userStakedAmount: newUserStaked.toFixed(4),
                        totalStaked: formattedTotalStaked,
                        currentRewardRate: currentRewardRate.toString(),
                        lastStakeTimestamp: timestamp.toString(),
                        lastUpdateTimestamp: Date.now()
                    };
                    
                    console.log('📊 NEW EVENT DATA STATE AFTER STAKE:', newData);
                    return newData;
                });
                
                setEventUpdateCount(prev => {
                    const newCount = prev + 1;
                    console.log('🔄 Event update count incremented to:', newCount);
                    return newCount;
                });
                
                toast.success(`Stake confirmed: ${formattedAmount} STK tokens staked`);
                console.log('✅ Updated user staked amount after stake event');
            } else {
                console.log('❌ Staked event is NOT for current user, ignoring');
            }
        };

        const handleWithdrawnEvent = (user, amount, timestamp, newTotalStaked, currentRewardRate, rewardsAccrued, event) => {
            console.log('Withdrawn event received:', {
                user,
                amount: amount.toString(),
                timestamp: timestamp.toString(),
                newTotalStaked: newTotalStaked.toString(),
                currentRewardRate: currentRewardRate.toString(),
                rewardsAccrued: rewardsAccrued.toString(),
                isCurrentUser: user.toLowerCase() === address.toLowerCase()
            });

            if (user.toLowerCase() === address.toLowerCase()) {
                const formattedAmount = formatTokenAmount(amount.toString());
                const formattedRewards = formatTokenAmount(rewardsAccrued.toString());
                
                setEventData(prev => {
                    // Calculate new user staked amount (decreased by withdrawal)
                    const currentUserStaked = prev.userStakedAmount ? 
                        parseFloat(prev.userStakedAmount) : 0;
                    const newUserStaked = Math.max(0, currentUserStaked - parseFloat(formattedAmount));
                    
                    return {
                        ...prev,
                        lastWithdrawEvent: {
                            user,
                            amount: formattedAmount,
                            timestamp: new Date(Number(timestamp) * 1000),
                            rewardsAccrued: formattedRewards,
                            transactionHash: event.transactionHash
                        },
                        userStakedAmount: newUserStaked.toFixed(4),
                        totalStaked: formatTokenAmount(newTotalStaked.toString()),
                        currentRewardRate: currentRewardRate.toString(),
                        lastUpdateTimestamp: Date.now()
                    };
                });
                
                toast.success(`Withdrawal confirmed: ${formattedAmount} STK tokens withdrawn (${formattedRewards} rewards accrued)`);
                console.log('Updated user staked amount after withdrawal event');
            }
        };

        const handleRewardsClaimedEvent = (user, amount, timestamp, newPendingRewards, totalStaked, event) => {
            console.log('RewardsClaimed event received:', {
                user,
                amount: amount.toString(),
                timestamp: timestamp.toString(),
                newPendingRewards: newPendingRewards.toString(),
                totalStaked: totalStaked.toString(),
                isCurrentUser: user.toLowerCase() === address.toLowerCase()
            });

            if (user.toLowerCase() === address.toLowerCase()) {
                const formattedAmount = formatTokenAmount(amount.toString());
                const formattedPendingRewards = formatTokenAmount(newPendingRewards.toString());
                
                setEventData(prev => ({
                    ...prev,
                    lastClaimEvent: {
                        user,
                        amount: formattedAmount,
                        timestamp: new Date(Number(timestamp) * 1000),
                        transactionHash: event.transactionHash
                    },
                    pendingRewards: formattedPendingRewards,
                    lastUpdateTimestamp: Date.now()
                }));
                
                toast.success(`Rewards claimed: ${formattedAmount} STK tokens`);
                console.log('Updated pending rewards after claim event');
            }
        };

        const handleEmergencyWithdrawnEvent = (user, amount, penalty, timestamp, newTotalStaked, event) => {
            console.log('EmergencyWithdrawn event received:', {
                user,
                amount: amount.toString(),
                penalty: penalty.toString(),
                timestamp: timestamp.toString(),
                newTotalStaked: newTotalStaked.toString(),
                isCurrentUser: user.toLowerCase() === address.toLowerCase()
            });

            if (user.toLowerCase() === address.toLowerCase()) {
                const formattedAmount = formatTokenAmount(amount.toString());
                const formattedPenalty = formatTokenAmount(penalty.toString());
                
                setEventData(prev => {
                    // Emergency withdraw removes all staked amount
                    return {
                        ...prev,
                        lastEmergencyWithdrawEvent: {
                            user,
                            amount: formattedAmount,
                            penalty: formattedPenalty,
                            timestamp: new Date(Number(timestamp) * 1000),
                            transactionHash: event.transactionHash
                        },
                        userStakedAmount: '0.0000', // Reset to 0 after emergency withdrawal
                        totalStaked: formatTokenAmount(newTotalStaked.toString()),
                        pendingRewards: '0.0000', // Also reset pending rewards
                        lastUpdateTimestamp: Date.now()
                    };
                });
                
                toast.warning(`Emergency withdrawal: ${formattedAmount} STK tokens (penalty: ${formattedPenalty} STK)`);
                console.log('Updated user staked amount to 0 after emergency withdrawal');
            }
        };

        const handleApprovalEvent = (owner, spender, value, event) => {
            console.log('Approval event received:', {
                owner,
                spender,
                value: value.toString(),
                isCurrentUser: owner.toLowerCase() === address.toLowerCase(),
                isForStakingContract: spender.toLowerCase() === stakingContractConfig.address.toLowerCase()
            });

            if (owner.toLowerCase() === address.toLowerCase() && 
                spender.toLowerCase() === stakingContractConfig.address.toLowerCase()) {
                const formattedValue = formatTokenAmount(value.toString());
                setEventData(prev => ({
                    ...prev,
                    lastApprovalEvent: {
                        owner,
                        spender,
                        value: formattedValue,
                        timestamp: new Date(),
                        transactionHash: event.transactionHash
                    }
                }));
                toast.success(`Token approval confirmed: ${formattedValue} STK tokens`);
            }
        };

        // Attach event listeners
        console.log('🎯 Attaching ethers event listeners...');
        console.log('📍 Staking contract address:', stakingContractConfig.address);
        console.log('📍 Token contract address:', stakingTokenConfig.address);
        console.log('👤 Listening for user:', address);
        
        // Test connection first
        stakingContract.removeAllListeners(); // Clean any existing listeners
        
        // Add listeners one by one with verification
        console.log('🔗 Adding Staked event listener...');
        
        // Primary listener
        stakingContract.on('Staked', handleStakedEvent);
        
        // Alternative generic listener to catch any Staked events
        stakingContract.on('Staked', (...args) => {
            console.log('🔥 RAW STAKED EVENT CAPTURED:', {
                argumentCount: args.length,
                arguments: args.map((arg, index) => ({
                    index,
                    value: arg?.toString ? arg.toString() : arg,
                    type: typeof arg
                }))
            });
        });
        
        // Also try with event filter as backup
        try {
            const stakedFilter = stakingContract.filters.Staked(address);
            console.log('🎯 Created filter for Staked events for user:', address);
            
            stakingContract.on(stakedFilter, (...args) => {
                console.log('🎯 STAKED EVENT VIA FILTER:', args);
                if (args.length >= 5) {
                    const [user, amount, timestamp, newTotalStaked, currentRewardRate] = args;
                    const event = args[args.length - 1]; // Last argument is usually the event object
                    handleStakedEvent(user, amount, timestamp, newTotalStaked, currentRewardRate, event);
                }
            });
        } catch (err) {
            console.log('Could not create filter for Staked events:', err);
        }
        
        console.log('🔗 Adding Withdrawn event listener...');
        stakingContract.on('Withdrawn', handleWithdrawnEvent);
        
        console.log('🔗 Adding RewardsClaimed event listener...');
        stakingContract.on('RewardsClaimed', handleRewardsClaimedEvent);
        
        console.log('🔗 Adding EmergencyWithdrawn event listener...');
        stakingContract.on('EmergencyWithdrawn', handleEmergencyWithdrawnEvent);
        
        console.log('🔗 Adding Approval event listener...');
        tokenContract.on('Approval', handleApprovalEvent);
        
        console.log('✅ All event listeners attached successfully');

        // Test that events can be detected
        stakingContract.queryFilter('Staked', -10).then(events => {
            console.log('📊 Recent Staked events (last 10 blocks):', events.length);
            if (events.length > 0) {
                console.log('🔍 Latest Staked event:', events[events.length - 1]);
            }
        }).catch(err => console.log('No recent Staked events found or error:', err));

        // Try to get the current listener count
        setTimeout(() => {
            console.log('📡 Event listeners verification:');
            console.log('- Staked listeners:', stakingContract.listenerCount('Staked'));
            console.log('- Contract connected:', stakingContract.provider ? 'Yes' : 'No');
        }, 1000);

        // Cleanup function
        return () => {
            console.log('🧹 Cleaning up ethers event listeners...');
            stakingContract.off('Staked', handleStakedEvent);
            stakingContract.off('Withdrawn', handleWithdrawnEvent);
            stakingContract.off('RewardsClaimed', handleRewardsClaimedEvent);
            stakingContract.off('EmergencyWithdrawn', handleEmergencyWithdrawnEvent);
            tokenContract.off('Approval', handleApprovalEvent);
            
            // Also remove all listeners as backup
            stakingContract.removeAllListeners();
            tokenContract.removeAllListeners();
            
            console.log('✅ Event listeners cleaned up successfully');
        };
    }, [publicClient, address]);

    // Check token allowance
    const checkAllowance = useCallback(async (amount) => {
        if (!address || !publicClient) {
            return false;
        }
        
        try {
            const allowance = await publicClient.readContract({
                ...stakingTokenConfig,
                functionName: "allowance",
                args: [address, stakingContractConfig.address],
            });
            
            const requiredAmount = parseTokenAmount(amount);
            const hasEnoughAllowance = allowance >= requiredAmount;
            
            return hasEnoughAllowance;
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
            console.log('Stake completed successfully');
            
            // Force refresh of user data after 2 seconds if event doesn't come
            setTimeout(async () => {
                console.log('🔄 Force refreshing user data after stake...');
                try {
                    const userDetails = await publicClient.readContract({
                        ...stakingContractConfig,
                        functionName: "getUserDetails",
                        args: [address],
                    });
                    
                    if (userDetails && userDetails.length >= 3) {
                        const [stakedAmount] = userDetails;
                        setEventData(prev => {
                            const newAmount = formatTokenAmount(stakedAmount.toString());
                            console.log('✅ Force updated user staked amount to:', newAmount);
                            return {
                                ...prev,
                                userStakedAmount: newAmount,
                                lastUpdateTimestamp: Date.now()
                            };
                        });
                        setEventUpdateCount(prev => prev + 1);
                    }
                } catch (error) {
                    console.error('Error force refreshing user data:', error);
                }
            }, 2000);
            
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
            
            toast.success(`Successfully withdrew ${amount} STK tokens!`, { id: "withdraw" });
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
            
            toast.success("Rewards claimed successfully!", { id: "claim" });
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
        eventData,
        eventUpdateCount, // For debugging
    };
};

export default useStaking;
