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
    try {
        if (amount === null || amount === undefined || amount === '') {
            return '0.0000';
        }
        
        const numAmount = Number(amount);
        if (isNaN(numAmount)) {
            return '0.0000';
        }
        
        return (numAmount / Math.pow(10, decimals)).toFixed(4);
    } catch (error) {
        console.error('Error formatting token amount:', error);
        return '0.0000';
    }
};

export const parseTokenAmount = (amount, decimals = 18) => {
    try {
        if (amount === null || amount === undefined || amount === '') {
            return BigInt(0);
        }
        
        const numAmount = Number(amount);
        if (isNaN(numAmount)) {
            return BigInt(0);
        }
        
        return BigInt(Math.floor(numAmount * Math.pow(10, decimals)));
    } catch (error) {
        console.error('Error parsing token amount:', error);
        return BigInt(0);
    }
};

export const formatDuration = (seconds) => {
    try {
        if (seconds === null || seconds === undefined || seconds === '') {
            return '0m';
        }
        
        const numSeconds = Number(seconds);
        if (isNaN(numSeconds) || numSeconds <= 0) {
            return '0m';
        }
        
        const days = Math.floor(numSeconds / (24 * 60 * 60));
        const hours = Math.floor((numSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((numSeconds % (60 * 60)) / 60);
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    } catch (error) {
        console.error('Error formatting duration:', error);
        return '0m';
    }
};
