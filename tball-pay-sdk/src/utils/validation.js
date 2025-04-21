// src/utils/validation.js
import { PublicKey } from '@solana/web3.js';

/**
 * Check if a string is a valid Solana address
 * @param {string} address - Address to validate
 * @returns {boolean} - True if address is valid
 */
export function isValidSolanaAddress(address) {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate payment parameters
 * @param {Object} params - Payment parameters
 * @param {string} params.recipient - Recipient address
 * @param {number} params.amount - Amount to send
 * @param {Object} tokenInfo - Token information
 * @returns {Object} - Validation result {isValid, error}
 */
export function validatePaymentParams(params, tokenInfo) {
  const { recipient, amount } = params;
  
  if (!recipient || !isValidSolanaAddress(recipient)) {
    return {
      isValid: false,
      error: 'Invalid recipient address'
    };
  }
  
  if (!tokenInfo) {
    return {
      isValid: false,
      error: 'Invalid token'
    };
  }
  
  if (isNaN(amount) || amount <= 0) {
    return {
      isValid: false,
      error: 'Amount must be greater than 0'
    };
  }
  
  if (tokenInfo.maxTransferAmount && amount > tokenInfo.maxTransferAmount) {
    return {
      isValid: false,
      error: `Amount exceeds maximum transfer amount of ${tokenInfo.maxTransferAmount} ${tokenInfo.symbol}`
    };
  }
  
  return {
    isValid: true,
    error: null
  };
}