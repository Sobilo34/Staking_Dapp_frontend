import { STAKING_CONTRACT_ABI, STAKING_TOKEN_ABI } from "./ABI.js";

// Contract addresses
export const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT_ADDRESS || "0xAE134B123A10cb031B67d3fCc50B9F98db38d6Ac";
export const STAKING_TOKEN_ADDRESS = import.meta.env.VITE_STAKING_TOKEN_ADDRESS || "0xF92b847500a0a8B9D6A8f625efE9AC9095865878";

// Debug logging
console.log("Contract Addresses:", {
    STAKING_CONTRACT_ADDRESS,
    STAKING_TOKEN_ADDRESS,
    env: import.meta.env
});

// Contract configurations
export const stakingContractConfig = {
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
};

export const stakingTokenConfig = {
    address: STAKING_TOKEN_ADDRESS,
    abi: STAKING_TOKEN_ABI,
};

// Contract constants
export const PRECISION = 1e18;
export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
export const SECONDS_PER_MINUTE = 60;

// Utility functions
export const formatTokenAmount = (amount, decimals = 18) => {
    return (Number(amount) / Math.pow(10, decimals)).toFixed(4);
};

export const parseTokenAmount = (amount, decimals = 18) => {
    return BigInt(Math.floor(Number(amount) * Math.pow(10, decimals)));
};

export const formatDuration = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};
