// src/wallet/PhantomAdapter.js
import { PublicKey } from '@solana/web3.js';

/**
 * Wallet adapter for Phantom wallet
 */
class PhantomAdapter {
  constructor() {
    this.wallet = null;
  }
  
  /**
   * Check if wallet is available
   * @returns {Promise<boolean>} - True if wallet is available
   */
  async checkAvailability() {
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom Wallet not detected. Please install it from https://phantom.app/');
    }
    return true;
  }
  
  /**
   * Connect to wallet
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} - Wallet account info
   */
  async connect(options = {}) {
    try {
      await this.checkAvailability();
      
      // Disconnect existing connection if any
      try {
        await window.solana.disconnect();
      } catch (err) {
        console.log('No existing connection to disconnect');
      }
      
      // Connect with options
      const connectOptions = {
        onlyIfTrusted: false,
        forceReapproval: true, // Always force user to re-approve
        ...options
      };
      
      const response = await window.solana.connect(connectOptions);
      this.wallet = {
        publicKey: new PublicKey(response.publicKey.toString())
      };
      
      return this.wallet;
    } catch (error) {
      if (error.message.includes('User rejected')) {
        throw new Error('Connection rejected by user');
      }
      throw error;
    }
  }
  
  /**
   * Disconnect from wallet
   * @returns {Promise<boolean>} - True if disconnection was successful
   */
  async disconnect() {
    try {
      await window.solana.disconnect();
      this.wallet = null;
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get token balance
   * @param {Connection} connection - Solana connection
   * @param {PublicKey} owner - Token owner
   * @param {string} mintAddress - Token mint address
   * @returns {Promise<number>} - Token balance
   */
  async getTokenBalance(connection, owner, mintAddress) {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      owner,
      { mint: new PublicKey(mintAddress) }
    );
    
    if (tokenAccounts.value.length > 0) {
      return tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    }
    
    return 0;
  }
  
  /**
   * Sign and send transaction
   * @param {Transaction} transaction - Transaction to sign and send
   * @returns {Promise<string>} - Transaction signature
   */
  async signAndSendTransaction(transaction) {
    try {
      const opts = {
        skipPreflight: false,
        preflightCommitment: 'processed',
        maxRetries: 5
      };
      
      const signed = await window.solana.signAndSendTransaction(transaction, opts);
      return signed.signature;
    } catch (error) {
      if (error.message.includes('User rejected')) {
        throw new Error('Transaction was rejected by user');
      }
      throw error;
    }
  }
}

export { PhantomAdapter };