// src/core/PaymentProcessor.js
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
    this.config = {
      network: config.network || 'mainnet-beta',
      rpcEndpoint: config.rpcEndpoint || 'https://api.mainnet-beta.solana.com',
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

  async init() {
    if (this.initialized) return true;

    this.connection = new Connection(this.config.rpcEndpoint, {
      commitment: this.config.commitment,
      wsEndpoint: this.config.rpcEndpoint.replace('https', 'wss'),
      confirmTransactionInitialTimeout: 120000
    });

    this.initialized = true;
    return true;
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
      this.wallet.publicKey,
      tokenInfo.mintAddress
    );
  }

  async sendTokens({ recipient, amount, tokenMint, memo }) {
    if (!this.wallet) throw new Error('Wallet not connected');
    if (!this.walletAdapter) throw new Error('No wallet adapter set');
    if (!recipient || !isValidSolanaAddress(recipient)) throw new Error('Invalid recipient address');

    // Handle native SOL transfers
    if (tokenMint === 'SOL') {
      const lamports = Math.floor(amount * 1e9);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.wallet.publicKey,
          toPubkey: new PublicKey(recipient),
          lamports
        })
      );

      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
      tx.lastValidBlockHeight = lastValidBlockHeight;
      tx.feePayer = this.wallet.publicKey;

      const simulation = await this.connection.simulateTransaction(tx);
      if (simulation.value.err) throw new Error(`SOL transfer simulation failed: ${JSON.stringify(simulation.value.err)}`);

      const signature = await this.walletAdapter.signAndSendTransaction(tx);
      const confirmation = await this.waitForConfirmation(signature);

      return {
        signature,
        confirmation,
        explorerUrl: `https://solscan.io/tx/${signature}`
      };
    }

    // SPL token fallback
    const tokenInfo = this.tokenRegistry.getToken(tokenMint);
    if (!tokenInfo) throw new Error(`Unknown token: ${tokenMint}`);
    if (isNaN(amount) || amount <= 0 || amount > tokenInfo.maxTransferAmount) {
      throw new Error(`Amount must be between 0 and ${tokenInfo.maxTransferAmount} ${tokenInfo.symbol}`);
    }

    const transaction = await this.createTokenTransferTransaction({ recipient, amount, tokenMint, memo });
    const simulation = await this.connection.simulateTransaction(transaction);
    if (simulation.value.err) {
      throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
    }

    const signature = await this.walletAdapter.signAndSendTransaction(transaction);
    const confirmation = await this.waitForConfirmation(signature);

    return {
      signature,
      confirmation,
      explorerUrl: `https://solscan.io/tx/${signature}`
    };
  }

  async createTokenTransferTransaction({ recipient, amount, tokenMint, memo }) {
    const recipientPubKey = new PublicKey(recipient);
    const tokenInfo = this.tokenRegistry.getToken(tokenMint);
    const mintPubKey = new PublicKey(tokenInfo.mintAddress);
    const transferAmount = Math.floor(amount * Math.pow(10, tokenInfo.decimals));

    const senderTokenAccount = await findAssociatedTokenAccount(this.wallet.publicKey, mintPubKey);
    const recipientTokenAccount = await findAssociatedTokenAccount(recipientPubKey, mintPubKey);

    let transaction = new Transaction();

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

    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        this.wallet.publicKey,
        transferAmount
      )
    );

    if (memo) {
      // Memo instruction logic could be added here
    }

    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = this.wallet.publicKey;

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
                explorerUrl: `https://solscan.io/tx/${signature}`
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
      intervalId = setInterval(check, 2000);
      check();
    });
  }
}

export { PaymentProcessor };
