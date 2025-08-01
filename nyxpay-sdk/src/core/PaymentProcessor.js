// src/core/PaymentProcessor.js - Fixed RPC endpoints
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction
} from '@solana/web3.js';
import { TokenRegistry } from '../token/TokenRegistry';
import {
  findAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction
} from '../utils/transaction';
import { isValidSolanaAddress } from '../utils/validation';

/**
 * Core Payment Processor for Solana token and SOL payments
 */
class PaymentProcessor {
  constructor(config = {}) {
    // Better default RPC endpoints
    const getDefaultRPC = (network) => {
      switch (network) {
        case 'devnet':
          return 'https://api.devnet.solana.com';
        case 'testnet':
          return 'https://api.testnet.solana.com';
        case 'mainnet-beta':
        default:
          // Use a more reliable mainnet endpoint
          return 'https://solana-api.projectserum.com';
      }
    };

    this.config = {
      network: config.network || 'devnet', // Default to devnet for testing
      rpcEndpoint: config.rpcEndpoint || getDefaultRPC(config.network || 'devnet'),
      commitment: config.commitment || 'confirmed', // Changed from 'processed' for better reliability
      confirmationBlocks: config.confirmationBlocks || 15, // Reduced for faster confirmations
      transactionTimeout: config.transactionTimeout || 60000, // Reduced timeout
      retryAttempts: config.retryAttempts || 3, // Reduced retries
      ...config
    };

    this.wallet = null;
    this.connection = null;
    this.walletAdapter = null;
    this.tokenRegistry = new TokenRegistry();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return true;

    // Add retry logic for connection initialization
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        this.connection = new Connection(this.config.rpcEndpoint, {
          commitment: this.config.commitment,
          confirmTransactionInitialTimeout: 60000, // Reduced timeout
          disableRetryOnRateLimit: false,
          httpHeaders: {
            'Content-Type': 'application/json',
          }
        });

        // Test the connection
        await this.connection.getLatestBlockhash();
        this.initialized = true;
        return true;
        
      } catch (error) {
        attempts++;
        console.warn(`RPC connection attempt ${attempts} failed:`, error.message);
        
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to connect to RPC after ${maxAttempts} attempts. Last error: ${error.message}`);
        }
        
        // Try fallback endpoints
        if (attempts === 2 && this.config.network === 'mainnet-beta') {
          this.config.rpcEndpoint = 'https://rpc.ankr.com/solana';
        }
        if (attempts === 3 && this.config.network === 'mainnet-beta') {
          this.config.rpcEndpoint = 'https://solana-mainnet.g.alchemy.com/v2/demo';
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  setWalletAdapter(adapter) {
    this.walletAdapter = adapter;
  }

  async connectWallet(options = {}) {
    await this.init();

    if (!this.walletAdapter) throw new Error('No wallet adapter set.');

    const walletAccount = await this.walletAdapter.connect(options);
    this.wallet = walletAccount;
    return walletAccount;
  }

  async disconnectWallet() {
    if (!this.walletAdapter) throw new Error('No wallet adapter set');

    await this.walletAdapter.disconnect();
    this.wallet = null;
    return true;
  }

  async getTokenBalance(tokenIdentifier) {
    if (!this.wallet) throw new Error('Wallet not connected');

    const tokenInfo = this.tokenRegistry.getToken(tokenIdentifier);
    if (!tokenInfo) throw new Error(`Unknown token: ${tokenIdentifier}`);

    return await this.walletAdapter.getTokenBalance(
      this.connection,
      new PublicKey(this.wallet.publicKey),
      tokenInfo.mintAddress
    );
  }

  async sendTokens({ recipient, amount, tokenMint, memo }) {
    if (!this.wallet) throw new Error('Wallet not connected');
    if (!this.walletAdapter) throw new Error('No wallet adapter set');
    if (!recipient || !isValidSolanaAddress(recipient)) throw new Error('Invalid recipient address');

    const senderPubKey = new PublicKey(this.wallet.publicKey);
    const recipientPubKey = new PublicKey(recipient);

    // Handle native SOL transfers
    if (tokenMint === 'SOL') {
      const lamports = Math.floor(amount * 1e9);
      
      // Validate amount is reasonable
      if (lamports > 1000 * 1e9) { // More than 1000 SOL
        throw new Error('Amount too large for safety. Maximum 1000 SOL per transaction.');
      }
      
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPubKey,
          toPubkey: recipientPubKey,
          lamports
        })
      );

      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
      tx.lastValidBlockHeight = lastValidBlockHeight;
      tx.feePayer = senderPubKey;

      const simulation = await this.connection.simulateTransaction(tx);
      if (simulation.value.err) {
        throw new Error(`SOL transfer simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }

      const signature = await this.walletAdapter.signAndSendTransaction(tx);
      const confirmation = await this.waitForConfirmation(signature);

      const explorerBaseUrl = this.config.network === 'devnet' ? 
        'https://solscan.io/tx' : 'https://solscan.io/tx';
      const clusterParam = this.config.network === 'devnet' ? '?cluster=devnet' : '';

      return {
        signature,
        confirmation,
        explorerUrl: `${explorerBaseUrl}/${signature}${clusterParam}`
      };
    }

    // SPL token fallback
    const tokenInfo = this.tokenRegistry.getToken(tokenMint);
    if (!tokenInfo) throw new Error(`Unknown token: ${tokenMint}`);
    if (isNaN(amount) || amount <= 0 || amount > tokenInfo.maxTransferAmount) {
      throw new Error(`Amount must be between 0 and ${tokenInfo.maxTransferAmount} ${tokenInfo.symbol}`);
    }

    const transaction = await this.createTokenTransferTransaction({
      recipient: recipientPubKey,
      amount,
      tokenMint,
      memo
    });

    const simulation = await this.connection.simulateTransaction(transaction);
    if (simulation.value.err) {
      throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
    }

    const signature = await this.walletAdapter.signAndSendTransaction(transaction);
    const confirmation = await this.waitForConfirmation(signature);

    const explorerBaseUrl = this.config.network === 'devnet' ? 
      'https://solscan.io/tx' : 'https://solscan.io/tx';
    const clusterParam = this.config.network === 'devnet' ? '?cluster=devnet' : '';

    return {
      signature,
      confirmation,
      explorerUrl: `${explorerBaseUrl}/${signature}${clusterParam}`
    };
  }

  async createTokenTransferTransaction({ recipient, amount, tokenMint, memo }) {
    const senderPubKey = new PublicKey(this.wallet.publicKey);
    const tokenInfo = this.tokenRegistry.getToken(tokenMint);
    const mintPubKey = new PublicKey(tokenInfo.mintAddress);
    const transferAmount = Math.floor(amount * Math.pow(10, tokenInfo.decimals));

    const senderTokenAccount = await findAssociatedTokenAccount(senderPubKey, mintPubKey);
    const recipientTokenAccount = await findAssociatedTokenAccount(recipient, mintPubKey);

    let transaction = new Transaction();

    const recipientAccountInfo = await this.connection.getAccountInfo(recipientTokenAccount);
    if (!recipientAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          senderPubKey,
          recipient,
          mintPubKey
        )
      );
    }

    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        senderPubKey,
        transferAmount
      )
    );

    if (memo) {
      // Add memo logic here if needed
    }

    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = senderPubKey;

    return transaction;
  }

  async waitForConfirmation(signature) {
    let timeoutId;
    let intervalId;
    let attempt = 0;

    return new Promise((resolve, reject) => {
      const timeout = () => {
        clearInterval(intervalId);
        reject(new Error('Transaction confirmation timeout'));
      };

      const check = async () => {
        try {
          const status = await this.connection.getSignatureStatus(signature);
          if (!status?.value) {
            if (attempt >= this.config.retryAttempts) {
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              resolve({
                status: 'pending',
                signature,
                explorerUrl: `https://solscan.io/tx/${signature}${this.config.network === 'devnet' ? '?cluster=devnet' : ''}`
              });
              return;
            }
          } else {
            if (status.value.err) {
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              reject(new Error('Transaction failed on chain'));
              return;
            }

            if (
              status.value.confirmations >= this.config.confirmationBlocks ||
              status.value.confirmationStatus === 'finalized'
            ) {
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              resolve(status);
              return;
            }
          }
        } catch (err) {
          console.warn('Confirmation check failed:', err);
        }

        attempt++;
      };

      timeoutId = setTimeout(timeout, this.config.transactionTimeout);
      intervalId = setInterval(check, 1500); // Slightly faster polling
      check();
    });
  }
}

export { PaymentProcessor };