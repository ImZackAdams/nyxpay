// Simple example app
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize SDK (in a production app, you would import this from the SDK package)
    const { createSolanaPaymentSDK } = SolanaPaymentsSDK;
    
    let sdk;
    try {
      // Create and initialize the SDK
      sdk = await createSolanaPaymentSDK({
        network: 'mainnet-beta'
      }).init();
      
      console.log('SDK initialized successfully');
      updateStatus('SDK initialized. Please connect your wallet.');
    } catch (error) {
      console.error('Failed to initialize SDK:', error);
      updateStatus(`Error initializing: ${error.message}`, true);
      return;
    }
    
    // Set up UI elements
    setupEventListeners(sdk);
    populateTokenSelector(sdk);
  });
  
  // Set up event listeners for UI interactions
  function setupEventListeners(sdk) {
    const connectButton = document.getElementById('connectWallet');
    const disconnectButton = document.getElementById('disconnectWallet');
    const sendButton = document.getElementById('sendPayment');
    const tokenSelector = document.getElementById('tokenSelector');
    
    // Connect wallet button
    if (connectButton) {
      connectButton.addEventListener('click', async () => {
        try {
          updateStatus('Connecting wallet...');
          const wallet = await sdk.processor.connectWallet({ forceReapproval: true });
          
          document.getElementById('walletInfo').textContent = 
            `Connected: ${wallet.publicKey.toString().slice(0, 8)}...${wallet.publicKey.toString().slice(-8)}`;
          
          updateStatus('Wallet connected successfully');
          
          // Get selected token balance
          const selectedToken = tokenSelector.value;
          const balance = await sdk.processor.getTokenBalance(selectedToken);
          updateBalance(balance, selectedToken);
        } catch (error) {
          console.error('Connection error:', error);
          updateStatus(`Connection failed: ${error.message}`, true);
        }
      });
    }
    
    // Disconnect wallet button
    if (disconnectButton) {
      disconnectButton.addEventListener('click', async () => {
        try {
          await sdk.processor.disconnectWallet();
          document.getElementById('walletInfo').textContent = 'Not connected';
          updateBalance(0, tokenSelector.value);
          updateStatus('Wallet disconnected');
        } catch (error) {
          console.error('Disconnection error:', error);
          updateStatus(`Disconnection failed: ${error.message}`, true);
        }
      });
    }
    
    // Token selector change
    if (tokenSelector) {
      tokenSelector.addEventListener('change', async () => {
        const selectedToken = tokenSelector.value;
        try {
          if (sdk.processor.wallet) {
            const balance = await sdk.processor.getTokenBalance(selectedToken);
            updateBalance(balance, selectedToken);
          }
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      });
    }
    
    // Send payment button
    if (sendButton) {
      sendButton.addEventListener('click', async () => {
        try {
          const recipient = document.getElementById('recipient').value.trim();
          const amount = parseFloat(document.getElementById('amount').value);
          const tokenMint = tokenSelector.value;
          
          if (!recipient) {
            updateStatus('Please enter a recipient address', true);
            return;
          }
          
          if (isNaN(amount) || amount <= 0) {
            updateStatus('Please enter a valid amount', true);
            return;
          }
          
          updateStatus('Preparing transaction...');
          
          // Ensure wallet is connected
          if (!sdk.processor.wallet) {
            await sdk.processor.connectWallet();
          }
          
          // Send payment
          updateStatus('Please approve the transaction in your wallet...');
          const result = await sdk.processor.sendTokens({
            recipient,
            amount,
            tokenMint
          });
          
          // Update status with transaction link
          updateStatus(
            `Payment successful! View transaction: ${result.explorerUrl}`, 
            false, 
            true
          );
          
          // Update balance
          const newBalance = await sdk.processor.getTokenBalance(tokenMint);
          updateBalance(newBalance, tokenMint);
          
        } catch (error) {
          console.error('Payment error:', error);
          updateStatus(`Payment failed: ${error.message}`, true);
        }
      });
    }
  }
  
  // Helper function to populate token selector
  function populateTokenSelector(sdk) {
    const selector = document.getElementById('tokenSelector');
    if (!selector) return;
    
    // Clear existing options
    selector.innerHTML = '';
    
    // Add tokens from registry
    const tokens = sdk.tokenRegistry.getAllTokens();
    Object.values(tokens).forEach(token => {
      const option = document.createElement('option');
      option.value = token.symbol;
      option.textContent = `${token.name} (${token.symbol})`;
      selector.appendChild(option);
    });
  }
  
  // Helper function to update status message
  function updateStatus(message, isError = false, hasLink = false) {
    console.log(message);
    const statusEl = document.getElementById('statusMessage');
    if (!statusEl) return;
    
    if (hasLink && message.includes('http')) {
      const parts = message.split(/(https:\/\/[^\s]+)/);
      statusEl.innerHTML = parts.map(part => 
        part.startsWith('https://') ? 
        `<a href="${part}" target="_blank" style="color: #0279FF; text-decoration: underline;">${part}</a>` : 
        part
      ).join('');
    } else {
      statusEl.textContent = message;
    }
    
    statusEl.className = isError ? 'status error' : 'status success';
  }
  
  // Helper function to update balance display
  function updateBalance(balance, tokenSymbol) {
    const balanceEl = document.getElementById('balance');
    if (!balanceEl) return;
    
    balanceEl.textContent = typeof balance === 'number' ? 
      `Balance: ${balance.toFixed(2)} ${tokenSymbol}` : 
      `Balance: ${balance} ${tokenSymbol}`;
  }