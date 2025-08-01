// checkout/app.js - Rewritten for clean SOL/SPL separation
document.addEventListener('DOMContentLoaded', async () => {
  const checkout = new CheckoutApp();
  await checkout.init();
});

class CheckoutApp {
  constructor() {
    this.sdk = null;
    this.paymentParams = null;
    this.isProcessing = false;
  }

  async init() {
    try {
      // Parse URL parameters
      this.paymentParams = this.parsePaymentURL();
      
      // Validate required parameters
      if (!this.validatePaymentParams()) {
        this.showError('Invalid payment link. Missing required parameters.');
        return;
      }

      // Initialize SDK with clean architecture
      await this.initializeSDK();
      
      // Setup UI
      this.setupUI();
      this.populatePaymentDetails();
      
      // Auto-connect wallet if available
      await this.autoConnectWallet();
      
    } catch (error) {
      console.error('Checkout initialization failed:', error);
      this.showError(`Failed to initialize checkout: ${error.message}`);
    }
  }

  parsePaymentURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      recipient: urlParams.get('recipient'),
      amount: parseFloat(urlParams.get('amount')),
      label: decodeURIComponent(urlParams.get('label') || 'Payment'),
      tokenMint: urlParams.get('tokenMint') || 'SOL',
      memo: urlParams.get('memo'),
      redirectUrl: urlParams.get('redirect')
    };
  }

  validatePaymentParams() {
    const { recipient, amount, tokenMint } = this.paymentParams;
    
    if (!recipient || !this.isValidSolanaAddress(recipient)) {
      return false;
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return false;
    }
    
    if (!tokenMint) {
      return false;
    }
    
    return true;
  }

  async initializeSDK() {
    // Import SDK dynamically to handle different environments
    const { PaymentProcessor, PhantomAdapter } = window.nyxpayPaySDK || 
      await import('./dist/nyxpay-sdk.min.js');

    this.sdk = new PaymentProcessor({ 
      network: 'mainnet-beta',
      commitment: 'confirmed'
    });
    
    this.sdk.setWalletAdapter(new PhantomAdapter());
    await this.sdk.init();
  }

  setupUI() {
    // Get DOM elements
    this.elements = {
      payButton: document.getElementById('payButton'),
      connectButton: document.getElementById('connectWallet'),
      statusMessage: document.getElementById('statusMessage'),
      paymentAmount: document.getElementById('paymentAmount'),
      paymentLabel: document.getElementById('paymentLabel'),
      recipientAddress: document.getElementById('recipientAddress'),
      walletInfo: document.getElementById('walletInfo'),
      balanceInfo: document.getElementById('balanceInfo'),
      loadingSpinner: document.getElementById('loadingSpinner')
    };

    // Setup event listeners
    this.elements.connectButton?.addEventListener('click', () => this.connectWallet());
    this.elements.payButton?.addEventListener('click', () => this.processPayment());
    
    // Disable pay button initially
    this.setPayButtonState(false);
  }

  populatePaymentDetails() {
    const { amount, label, tokenMint, recipient } = this.paymentParams;
    
    if (this.elements.paymentAmount) {
      this.elements.paymentAmount.textContent = `${amount} ${tokenMint}`;
    }
    
    if (this.elements.paymentLabel) {
      this.elements.paymentLabel.textContent = label;
    }
    
    if (this.elements.recipientAddress) {
      this.elements.recipientAddress.textContent = this.truncateAddress(recipient);
    }
  }

  async autoConnectWallet() {
    try {
      // Check if wallet is already connected
      if (window.phantom?.solana?.isConnected) {
        await this.connectWallet();
      }
    } catch (error) {
      // Ignore auto-connect errors, user can manually connect
      console.log('Auto-connect failed, will require manual connection');
    }
  }

  async connectWallet() {
    if (this.isProcessing) return;
    
    this.setProcessing(true);
    this.updateStatus('Connecting wallet...', 'info');
    
    try {
      const wallet = await this.sdk.connectWallet();
      
      this.elements.walletInfo.textContent = 
        `Connected: ${this.truncateAddress(wallet.publicKey.toString())}`;
      
      await this.updateBalance();
      this.setPayButtonState(true);
      this.updateStatus('Wallet connected successfully', 'success');
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      this.showError(`Failed to connect wallet: ${error.message}`);
    } finally {
      this.setProcessing(false);
    }
  }

  async updateBalance() {
    try {
      const { tokenMint } = this.paymentParams;
      const balance = await this.sdk.getTokenBalance(tokenMint);
      
      if (this.elements.balanceInfo) {
        this.elements.balanceInfo.textContent = 
          `Balance: ${balance} ${tokenMint}`;
      }
      
      // Check if user has sufficient balance
      const hasEnoughBalance = parseFloat(balance) >= this.paymentParams.amount;
      this.setPayButtonState(hasEnoughBalance);
      
      if (!hasEnoughBalance) {
        this.showError(`Insufficient balance. Need ${this.paymentParams.amount} ${tokenMint}, have ${balance}`);
      }
      
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      this.elements.balanceInfo.textContent = 'Balance: Unable to fetch';
    }
  }

  async processPayment() {
    if (this.isProcessing) return;
    
    // Check wallet connection
    if (!this.sdk.wallet) {
      await this.connectWallet();
      return;
    }
    
    this.setProcessing(true);
    this.updateStatus('Preparing transaction...', 'info');
    
    try {
      const { recipient, amount, tokenMint, memo } = this.paymentParams;
      
      // Update status for user approval
      this.updateStatus('Please approve the transaction in your wallet...', 'info');
      
      // Process the payment
      const result = await this.sdk.sendTokens({
        recipient,
        amount,
        tokenMint,
        memo
      });
      
      // Payment successful
      this.onPaymentSuccess(result);
      
    } catch (error) {
      console.error('Payment failed:', error);
      this.onPaymentError(error);
    } finally {
      this.setProcessing(false);
    }
  }

  onPaymentSuccess(result) {
    this.updateStatus('Payment successful! 🎉', 'success');
    
    // Show transaction link
    if (result.explorerUrl) {
      const linkElement = document.createElement('a');
      linkElement.href = result.explorerUrl;
      linkElement.target = '_blank';
      linkElement.textContent = 'View transaction';
      linkElement.className = 'transaction-link';
      
      this.elements.statusMessage.appendChild(document.createElement('br'));
      this.elements.statusMessage.appendChild(linkElement);
    }
    
    // Update balance
    this.updateBalance();
    
    // Handle redirect if specified
    if (this.paymentParams.redirectUrl) {
      setTimeout(() => {
        window.location.href = this.paymentParams.redirectUrl;
      }, 3000);
    }
    
    // Disable pay button after successful payment
    this.setPayButtonState(false);
  }

  onPaymentError(error) {
    let errorMessage = 'Payment failed. Please try again.';
    
    // Handle specific error types
    if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction was rejected by user.';
    } else if (error.message.includes('Insufficient')) {
      errorMessage = 'Insufficient funds to complete transaction.';
    } else if (error.message.includes('Network')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    this.showError(errorMessage);
  }

  // UI Helper Methods
  setProcessing(processing) {
    this.isProcessing = processing;
    
    if (this.elements.loadingSpinner) {
      this.elements.loadingSpinner.style.display = processing ? 'block' : 'none';
    }
    
    if (this.elements.payButton) {
      this.elements.payButton.disabled = processing;
      this.elements.payButton.textContent = processing ? 'Processing...' : 'Pay Now';
    }
    
    if (this.elements.connectButton) {
      this.elements.connectButton.disabled = processing;
    }
  }

  setPayButtonState(enabled) {
    if (this.elements.payButton) {
      this.elements.payButton.disabled = !enabled || this.isProcessing;
      
      if (!enabled && !this.sdk?.wallet) {
        this.elements.payButton.textContent = 'Connect Wallet First';
      } else if (!enabled) {
        this.elements.payButton.textContent = 'Insufficient Balance';
      } else {
        this.elements.payButton.textContent = 'Pay Now';
      }
    }
  }

  updateStatus(message, type = 'info') {
    if (!this.elements.statusMessage) return;
    
    this.elements.statusMessage.textContent = message;
    this.elements.statusMessage.className = `status ${type}`;
  }

  showError(message) {
    this.updateStatus(message, 'error');
  }

  // Utility Methods
  isValidSolanaAddress(address) {
    try {
      // Basic Solana address validation (base58, 32-44 chars)
      return /^[A-HJ-NP-Za-km-z1-9]{32,44}$/.test(address);
    } catch {
      return false;
    }
  }

  truncateAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  }
}

// Export for testing or external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CheckoutApp;
}