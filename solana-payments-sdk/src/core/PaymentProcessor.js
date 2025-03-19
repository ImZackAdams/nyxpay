// src/core/PaymentProcessor.js
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TokenRegistry } from '../token/TokenRegistry';
import { findAssociatedTokenAccount, createAssociatedTokenAccountInstruction, createTransferInstruction } from '../utils/transaction';
import { isValidSolanaAddress } from '../utils/validation';

/**
 * Core Payment Processor for Solana token payments
 */
class PaymentProcessor {
  /**
   * Create a new payment processor
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      network: config.network || 'mainnet-beta',
      rpcEndpoint: config.rpcEndpoint || null,
      commitment: config.commitment || 'processed',
      confirmationBlocks: config.confirmationBlocks || 32,
      transactionTimeout: config.transactionTimeout || 90000,
      retryAttempts: config.retryAttempts || 5,
      ...config
    };
    
    this.wallet = null;
    this.connection = null;
    this.walletAdapter = null;
    this.tokenRegistry = new TokenRegistry();
    this.initialized = false;
  }
  
  /**
   * Initialize the payment processor
   * @returns {Promise<boolean>} - True if initialization was successful
   */
  async init() {
    try {
      if (this.initialized) return true;
      
      console.log('Initializing payment processor...');
      
      // Get RPC endpoint (from config or fetch from server)
      if (!this.config.rpcEndpoint) {
        const response = await fetch('/api/get-key');
        const data = await response.json();
        this.config.rpcEndpoint = `https://rpc.helius.xyz/?api-key=${data.apiKey}`;
      }
      
      // Initialize Solana connection
      this.connection = new Connection(this.config.rpcEndpoint, {
        commitment: this.config.commitment,
        wsEndpoint: this.config.rpcEndpoint.replace('https', 'wss'),
        confirmTransactionInitialTimeout: 120000,
      });
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize payment processor:', error);
      throw error;
    }
  }

  /**
   * Set wallet adapter to use for transactions
   * @param {Object} adapter - Wallet adapter
   */
  setWalletAdapter(adapter) {
    this.walletAdapter = adapter;
  }
  
  /**
   * Connect to wallet
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} - Wallet account info
   */
  async connectWallet(options = {}) {
    try {
      await this.init();
      
      if (!this.walletAdapter) {
        throw new Error('No wallet adapter set. Call setWalletAdapter() first.');
      }
      
      const walletAccount = await this.walletAdapter.connect(options);
      this.wallet = walletAccount;
      return walletAccount;
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  }
  
  /**
   * Disconnect wallet
   * @returns {Promise<boolean>} - True if disconnection was successful
   */
  async disconnectWallet() {
    try {
      if (!this.walletAdapter) {
        throw new Error('No wallet adapter set');
      }
      
      await this.walletAdapter.disconnect();
      this.wallet = null;
      return true;
    } catch (error) {
      console.error('Wallet disconnection error:', error);
      throw error;
    }
  }
  
  /**
   * Get token balance
   * @param {string} tokenIdentifier - Token symbol or mint address
   * @returns {Promise<number>} - Token balance
   */
  async getTokenBalance(tokenIdentifier) {
    try {
      if (!this.wallet) throw new Error('Wallet not connected');
      
      const tokenInfo = this.tokenRegistry.getToken(tokenIdentifier);
      if (!tokenInfo) throw new Error(`Unknown token: ${tokenIdentifier}`);
      
      return await this.walletAdapter.getTokenBalance(
        this.connection, 
        this.wallet.publicKey, 
        tokenInfo.mintAddress
      );
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  }
  
  /**
   * Send tokens
   * @param {Object} params - Payment parameters
   * @param {string} params.recipient - Recipient address
   * @param {number} params.amount - Amount to send
   * @param {string} params.tokenMint - Token identifier (symbol or mint address)
   * @param {string} [params.memo] - Optional memo to include
   * @returns {Promise<Object>} - Transaction result
   */
  async sendTokens(params) {
    try {
      const { recipient, amount, tokenMint, memo } = params;
      
      if (!this.wallet) throw new Error('Wallet not connected');
      if (!this.walletAdapter) throw new Error('No wallet adapter set');
      
      // Validate inputs
      if (!recipient || !isValidSolanaAddress(recipient)) {
        throw new Error('Invalid recipient address');
      }
      
      const tokenInfo = this.tokenRegistry.getToken(tokenMint);
      if (!tokenInfo) throw new Error(`Unknown token: ${tokenMint}`);
      
      if (isNaN(amount) || amount <= 0 || amount > tokenInfo.maxTransferAmount) {
        throw new Error(`Amount must be between 0 and ${tokenInfo.maxTransferAmount} ${tokenInfo.symbol}`);
      }
      
      // Create and send transaction
      const transaction = await this.createTokenTransferTransaction({
        recipient,
        amount,
        tokenMint,
        memo
      });
      
      // Simulate transaction first
      const simulation = await this.connection.simulateTransaction(transaction);
      if (simulation.value.err) {
        throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }
      
      // Sign and send transaction
      const signature = await this.walletAdapter.signAndSendTransaction(transaction);
      
      // Confirm transaction
      const confirmation = await this.waitForConfirmation(signature);
      
      return {
        signature,
        confirmation,
        explorerUrl: `https://solscan.io/tx/${signature}`
      };
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }
  
  /**
   * Create token transfer transaction
   * @param {Object} params - Transfer parameters
   * @returns {Promise<Transaction>} - Prepared transaction
   * @private
   */
  async createTokenTransferTransaction(params) {
    const { recipient, amount, tokenMint, memo } = params;
    
    const recipientPubKey = new PublicKey(recipient);
    const tokenInfo = this.tokenRegistry.getToken(tokenMint);
    const mintPubKey = new PublicKey(tokenInfo.mintAddress);
    
    // Calculate token amount with decimals
    const transferAmount = Math.floor(amount * Math.pow(10, tokenInfo.decimals));
    
    // Get associated token accounts
    const senderTokenAccount = await findAssociatedTokenAccount(
      this.wallet.publicKey,
      mintPubKey
    );
    
    const recipientTokenAccount = await findAssociatedTokenAccount(
      recipientPubKey,
      mintPubKey
    );
    
    // Initialize transaction
    let transaction = new Transaction();
    
    // Check if recipient token account exists and create if needed
    const recipientAccountInfo = await this.connection.getAccountInfo(recipientTokenAccount);
    if (!recipientAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          this.wallet.publicKey,
          recipientPubKey,
          mintPubKey
        )
      );
    }
    
    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        this.wallet.publicKey,
        transferAmount
      )
    );
    
    // Add memo if provided
    if (memo) {
      // Memo instruction logic would go here
    }
    
    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = this.wallet.publicKey;
    
    return transaction;
  }
  
  /**
   * Wait for transaction confirmation
   * @param {string} signature - Transaction signature
   * @returns {Promise<Object>} - Confirmation status
   * @private
   */
  async waitForConfirmation(signature) {
    let timeoutId;
    let intervalId;
    let attempt = 0;

    const confirmationPromise = new Promise(async (resolve, reject) => {
      const timeout = () => {
        clearInterval(intervalId);
        reject(new Error('Transaction confirmation timeout'));
      };

      const checkConfirmation = async () => {
        console.log(`Checking confirmation attempt ${attempt + 1}/${this.config.retryAttempts}`);
        
        try {
          const status = await this.connection.getSignatureStatus(signature);
          console.log('Transaction status:', status?.value?.confirmationStatus);
          
          if (!status?.value) {
            if (attempt >= this.config.retryAttempts) {
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              resolve({ 
                status: 'pending', 
                signature, 
                explorerUrl: `https://solscan.io/tx/${signature}`
              });
              return;
            }
          } else {
            const confirmations = status.value.confirmations;

            if (status.value.err) {
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              reject(new Error('Transaction failed on chain'));
              return;
            }

            if (confirmations >= this.config.confirmationBlocks || 
                status.value.confirmationStatus === 'finalized') {
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              resolve(status);
              return;
            }
          }
          
          attempt++;
        } catch (err) {
          console.warn('Confirmation check failed:', err);
          attempt++;
        }
      };

      timeoutId = setTimeout(timeout, this.config.transactionTimeout);
      intervalId = setInterval(checkConfirmation, 2000);
      await checkConfirmation(); // Check immediately
    });

    return confirmationPromise;
  }
}

export { PaymentProcessor };