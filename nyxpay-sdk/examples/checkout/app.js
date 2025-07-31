// Simple example app
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize SDK (from your renamed UMD bundle)
  const { PaymentProcessor, PhantomAdapter } = nyxpayPaySDK;

  let sdk;
  try {
    // 1️⃣ Instantiate & configure
    sdk = new PaymentProcessor({ network: 'mainnet-beta' });
    sdk.setWalletAdapter(new PhantomAdapter());

    // 2️⃣ Initialize connection
    await sdk.init();

    console.log('SDK initialized successfully');
    updateStatus('SDK initialized. Please connect your wallet.');
  } catch (error) {
    console.error('Failed to initialize SDK:', error);
    updateStatus(`Error initializing: ${error.message}`, true);
    return;
  }

  // Wire up the UI
  setupEventListeners(sdk);
  populateTokenSelector(sdk);
});

function setupEventListeners(sdk) {
  const connectButton    = document.getElementById('connectWallet');
  const disconnectButton = document.getElementById('disconnectWallet');
  const sendButton       = document.getElementById('sendPayment');
  const tokenSelector    = document.getElementById('tokenSelector');

  connectButton?.addEventListener('click', async () => {
    try {
      updateStatus('Connecting wallet...');
      const wallet = await sdk.connectWallet();
      document.getElementById('walletInfo').textContent =
        `Connected: ${wallet.publicKey.toString().slice(0,8)}…${wallet.publicKey.toString().slice(-8)}`;
      updateStatus('Wallet connected successfully');

      const selectedToken = tokenSelector.value;
      const balance = await sdk.getTokenBalance(selectedToken);
      updateBalance(balance, selectedToken);
    } catch (error) {
      console.error('Connection error:', error);
      updateStatus(`Connection failed: ${error.message}`, true);
    }
  });

  disconnectButton?.addEventListener('click', async () => {
    try {
      await sdk.disconnectWallet();
      document.getElementById('walletInfo').textContent = 'Not connected';
      updateBalance(0, tokenSelector.value);
      updateStatus('Wallet disconnected');
    } catch (error) {
      console.error('Disconnection error:', error);
      updateStatus(`Disconnection failed: ${error.message}`, true);
    }
  });

  tokenSelector?.addEventListener('change', async () => {
    if (!sdk.wallet) return;
    try {
      const balance = await sdk.getTokenBalance(tokenSelector.value);
      updateBalance(balance, tokenSelector.value);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  });

  sendButton?.addEventListener('click', async () => {
    try {
      const recipient = document.getElementById('recipient').value.trim();
      const amount    = parseFloat(document.getElementById('amount').value);
      const tokenMint = tokenSelector.value;

      if (!recipient) {
        return updateStatus('Please enter a recipient address', true);
      }
      if (isNaN(amount) || amount <= 0) {
        return updateStatus('Please enter a valid amount', true);
      }

      updateStatus('Preparing transaction...');

      if (!sdk.wallet) {
        await sdk.connectWallet();
      }

      updateStatus('Please approve the transaction in your wallet...');
      const result = await sdk.sendTokens({ recipient, amount, tokenMint });

      updateStatus(
        `Payment successful! View transaction: ${result.explorerUrl}`,
        false,
        true
      );

      const newBalance = await sdk.getTokenBalance(tokenMint);
      updateBalance(newBalance, tokenMint);
    } catch (error) {
      console.error('Payment error:', error);
      updateStatus(`Payment failed: ${error.message}`, true);
    }
  });
}

function populateTokenSelector(sdk) {
  const selector = document.getElementById('tokenSelector');
  if (!selector) return;
  selector.innerHTML = '';
  const tokens = sdk.tokenRegistry.getAllTokens();
  Object.values(tokens).forEach(token => {
    const opt = document.createElement('option');
    opt.value       = token.symbol;
    opt.textContent = `${token.name} (${token.symbol})`;
    selector.appendChild(opt);
  });
}

function updateStatus(message, isError = false, hasLink = false) {
  const statusEl = document.getElementById('statusMessage');
  if (!statusEl) return;
  if (hasLink && message.includes('http')) {
    const parts = message.split(/(https:\/\/[^\s]+)/);
    statusEl.innerHTML = parts.map(part =>
      part.startsWith('https://')
        ? `<a href="${part}" target="_blank" style="color: #0279FF; text-decoration: underline;">${part}</a>`
        : part
    ).join('');
  } else {
    statusEl.textContent = message;
  }
  statusEl.className = isError ? 'status error' : 'status success';
}

function updateBalance(balance, tokenSymbol) {
  const el = document.getElementById('balance');
  if (!el) return;
  el.textContent =
    typeof balance === 'number'
      ? `Balance: ${balance.toFixed(2)} ${tokenSymbol}`
      : `Balance: ${balance} ${tokenSymbol}`;
}
