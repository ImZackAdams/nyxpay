# 🧠 NyxPay Digest (Checkout + Link Builder)
_Generated on Fri Aug  1 04:42:31 AM EDT 2025_\n
---

## 📄 `nyxpay-linkbuilder/script.js`

```js
document.getElementById('builderForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const labelRaw = document.getElementById('label').value.trim();
  const amount = parseFloat(document.getElementById('amount').value.trim());
  const recipient = document.getElementById('recipient').value.trim();

  if (!labelRaw || !amount || !recipient) return;

  const label = encodeURIComponent(labelRaw);
  const baseUrl = 'https://nyxpaycheckout.vercel.app';
  const link = `${baseUrl}/?recipient=${recipient}&amount=${amount}&label=${label}&tokenMint=SOL`;

  // Show checkout link
  const output = document.getElementById('output');
  const linkBox = document.getElementById('checkoutLink');
  output.classList.remove('hidden');
  linkBox.value = link;

  // Generate embed code with button
  const embedSection = document.getElementById('buttonEmbed');
  const embedTextarea = document.getElementById('buttonCode');

  const embedHTML = `
    <a href="${link}" target="_blank" rel="noopener noreferrer"
       style="padding: 10px 16px; background: #FEB02E; color: black;
              text-decoration: none; border-radius: 6px; font-weight: bold;
              font-family: sans-serif;">
      ${labelRaw || 'Pay'} – ${amount} SOL
    </a>`.trim();

  embedTextarea.value = embedHTML;
  embedSection.classList.remove('hidden');

  // Show live preview
  const preview = document.getElementById('buttonPreview');
  preview.innerHTML = embedHTML;
});

document.getElementById('copyButton').addEventListener('click', () => {
  const link = document.getElementById('checkoutLink');
  link.select();
  document.execCommand('copy');
  alert('Link copied to clipboard!');
});

document.getElementById('copyEmbed').addEventListener('click', () => {
  const embedTextarea = document.getElementById('buttonCode');
  embedTextarea.select();
  document.execCommand('copy');
  alert('Embed code copied to clipboard!');
});
```

---


## 📄 `nyxpay-linkbuilder/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nyx Pay – Link Builder</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="container">
    <h1>NyxPay Link Builder</h1>
    <p>Create a checkout link you can share with buyers, friends, or fans.</p>

    <form id="builderForm">
      <label for="label">Item Name/Reason:</label>
      <input type="text" id="label" placeholder="e.g. nyxpay Hat" required />

      <label for="amount">Amount (SOL):</label>
      <input type="number" id="amount" placeholder="e.g. 25" required min="0.01" step="0.01"/>

      <label for="recipient">Recipient Wallet:</label>
      <input type="text" id="recipient" placeholder="Your Solana wallet address" required />

      <button type="submit">Generate Link</button>
    </form>

    <div id="output" class="hidden">
      <h2>🎯 Your Checkout Link</h2>
      <input type="text" id="checkoutLink" readonly />
      <button id="copyButton">Copy to Clipboard</button>
    </div>

    <div id="buttonEmbed" class="hidden">
      <h2>🧩 Embed Checkout Button</h2>
      <p>Paste this HTML where you want the payment button to appear:</p>
      <textarea id="buttonCode" rows="5" readonly></textarea>
      <button id="copyEmbed">Copy Embed Code</button>

      <div id="buttonPreview" style="margin-top: 1rem;"></div>
    </div>

      <section id="about" style="margin-top: 3rem;">
        <h2>About NyxPay</h2>
      
        <p>
          NyxPay is not a product. It’s a weapon.  
          A browser native protocol that lets you move money without begging anyone.
        </p>
      
        <p>
          No backend. No accounts. No databases. No surveillance.  
          Open the page. Connect your wallet. Fire off a transaction.
        </p>
      
        <p>
          Two files <code>index.html</code> and <code>script.js</code>.  
          That’s all it takes. No servers. No setup. No one to block or ban you.
        </p>
      
        <p>
          The SDK builds raw Solana transactions in your browser.  
          Simulates. Signs. Sends. No API keys. No third parties. Just chain access and execution.
        </p>
      
        <p>
          We don’t log. We don’t track. We couldn’t spy on you if we tried.  
          There is no backend. There is no "us."
        </p>
      
        <p>
          Host it anywhere; IPFS, GitHub Pages, localhost, or straight off a flash drive in a Faraday cage.
        </p>
      
        <p>
          The Vercel demo exists to make it easy for noobs.  
          You don’t need it. The protocol runs without infrastructure.
        </p>
      
        <p>
          This is not a service. It’s code. It’s yours.  
          If you need permission or support to get paid, go cry to Stripe.
        </p>
      </section>
      
      
    

    <footer>
     
    </footer>
  </div>

  <script src="script.js"></script>
</body>
</html>
```

---


## 📄 `nyxpay-linkbuilder/styles.css`

> ⚠️ File too long (726 lines). Showing first 300 lines.\n
```css
/* 
 * NYXPAY - NIGHT GODDESS INCARNATE
 * Born from darkness, wielded by mortals
 * 
 * "In the depths of night, true power awakens."
 * 
 * Embrace the void. Command the shadows.
 */

 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');

 /* Reset - where all things begin */
 * {
   box-sizing: border-box;
   margin: 0;
   padding: 0;
 }
 
 ::selection {
   background: #8b5cf6;
   color: #000;
 }
 
 body {
   font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
   background: 
     radial-gradient(ellipse at top, #1a0633 0%, transparent 50%),
     radial-gradient(ellipse at bottom, #0f0419 0%, transparent 50%),
     linear-gradient(180deg, #000000 0%, #0a0012 30%, #1a0633 70%, #000000 100%);
   background-attachment: fixed;
   color: #d1d5db;
   padding: 20px;
   min-height: 100vh;
   font-size: 16px;
   line-height: 1.5;
   font-weight: 400;
   overflow-x: hidden;
 }
 
 /* Divine proclamation - status bar of the goddess */
 body::before {
   content: '🌑 NYX • Decentralized • Local • Serverless 🌑';
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   background: 
     linear-gradient(90deg, 
       #000000 0%, 
       #4c1d95 20%, 
       #7c3aed 40%, 
       #a855f7 50%, 
       #7c3aed 60%, 
       #4c1d95 80%, 
       #000000 100%
     );
   color: #ffffff;
   text-align: center;
   font-size: 12px;
   font-weight: 700;
   padding: 12px;
   z-index: 1000;
   letter-spacing: 1px;
   text-shadow: 0 0 10px rgba(168, 85, 247, 0.8);
   box-shadow: 
     0 4px 20px rgba(0, 0, 0, 0.8),
     inset 0 1px 0 rgba(168, 85, 247, 0.3);
   border-bottom: 1px solid rgba(168, 85, 247, 0.3);
 }
 
 /* Sacred container - vessel of divine power */
 .container {
   max-width: 650px;
   margin: 80px auto 40px;
   background: 
     radial-gradient(circle at top left, rgba(79, 70, 229, 0.03) 0%, transparent 50%),
     radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.02) 0%, transparent 50%),
     rgba(0, 0, 0, 0.6);
   backdrop-filter: blur(15px);
   border: 2px solid transparent;
   border-image: linear-gradient(135deg, 
     rgba(168, 85, 247, 0.3) 0%, 
     rgba(0, 0, 0, 0.1) 50%, 
     rgba(124, 58, 237, 0.3) 100%
   ) 1;
   border-radius: 16px;
   padding: 50px;
   position: relative;
   box-shadow: 
     0 20px 60px rgba(0, 0, 0, 0.8),
     0 0 0 1px rgba(168, 85, 247, 0.1),
     inset 0 1px 0 rgba(168, 85, 247, 0.05),
     inset 0 -1px 0 rgba(0, 0, 0, 0.3);
   transition: all 0.4s ease;
 }
 
 .container::before {
   content: '';
   position: absolute;
   inset: -2px;
   padding: 2px;
   background: linear-gradient(135deg, 
     rgba(168, 85, 247, 0.4) 0%, 
     rgba(0, 0, 0, 0.2) 30%, 
     rgba(124, 58, 237, 0.4) 70%, 
     rgba(0, 0, 0, 0.2) 100%
   );
   border-radius: 16px;
   mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
   mask-composite: exclude;
   z-index: -1;
   opacity: 0;
   transition: opacity 0.4s ease;
 }
 
 .container:hover::before {
   opacity: 1;
 }
 
 .container:hover {
   transform: translateY(-2px);
   box-shadow: 
     0 30px 80px rgba(0, 0, 0, 0.9),
     0 0 40px rgba(168, 85, 247, 0.2),
     inset 0 1px 0 rgba(168, 85, 247, 0.1),
     inset 0 -1px 0 rgba(0, 0, 0, 0.4);
 }
 
 /* Divine typography - words of power */
 h1 {
   font-size: 42px;
   font-weight: 700;
   margin-bottom: 20px;
   color: #ffffff;
   background: linear-gradient(135deg, 
     #8b5cf6 0%, 
     #c084fc 25%, 
     #e879f9 50%, 
     #c084fc 75%, 
     #8b5cf6 100%
   );
   background-clip: text;
   -webkit-background-clip: text;
   -webkit-text-fill-color: transparent;
   line-height: 1.1;
   text-shadow: 0 0 30px rgba(168, 85, 247, 0.5);
   letter-spacing: -0.5px;
 }
 
 h2 {
   font-size: 22px;
   font-weight: 600;
   margin-bottom: 18px;
   color: #c084fc;
   display: flex;
   align-items: center;
   gap: 10px;
   text-shadow: 0 0 15px rgba(192, 132, 252, 0.4);
 }
 
 h2::before {
   content: '⭐';
   font-size: 18px;
   filter: drop-shadow(0 0 8px rgba(192, 132, 252, 0.6));
 }
 
 /* Whispered secrets - body text */
 p {
   color: #a1a1aa;
   margin: 18px 0;
   line-height: 1.7;
   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
 }
 
 /* Sacred forms - channels of power */
 label {
   display: block;
   color: #f3f4f6;
   font-weight: 600;
   margin: 28px 0 10px;
   font-size: 14px;
   letter-spacing: 0.5px;
   text-transform: uppercase;
   text-shadow: 0 0 10px rgba(243, 244, 246, 0.3);
 }
 
 input, select, textarea {
   width: 100%;
   padding: 18px 24px;
   background: 
     linear-gradient(135deg, 
       rgba(0, 0, 0, 0.6) 0%, 
       rgba(139, 92, 246, 0.05) 50%, 
       rgba(0, 0, 0, 0.6) 100%
     );
   color: #f3f4f6;
   border: 1px solid rgba(139, 92, 246, 0.2);
   border-radius: 10px;
   font-family: 'Inter', sans-serif;
   font-size: 16px;
   font-weight: 500;
   transition: all 0.3s ease;
   backdrop-filter: blur(10px);
   box-shadow: 
     inset 0 2px 4px rgba(0, 0, 0, 0.6),
     0 1px 0 rgba(139, 92, 246, 0.1);
 }
 
 input:focus, select:focus, textarea:focus {
   outline: none;
   border-color: #8b5cf6;
   background: 
     linear-gradient(135deg, 
       rgba(0, 0, 0, 0.7) 0%, 
       rgba(139, 92, 246, 0.1) 50%, 
       rgba(0, 0, 0, 0.7) 100%
     );
   box-shadow: 
     0 0 0 2px rgba(139, 92, 246, 0.3),
     0 0 20px rgba(139, 92, 246, 0.2),
     inset 0 2px 4px rgba(0, 0, 0, 0.7);
   transform: translateY(-1px);
   text-shadow: 0 0 8px rgba(243, 244, 246, 0.3);
 }
 
 input::placeholder, textarea::placeholder {
   color: rgba(161, 161, 170, 0.5);
   font-weight: 400;
   font-style: italic;
 }
 
 /* Sacred numbers - divine calculations */
 input[type="number"] {
   font-size: 22px;
   font-weight: 700;
   text-align: right;
   font-family: 'JetBrains Mono', monospace;
   text-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
 }
 
 /* Immutable truths - readonly inputs */
 input[readonly] {
   background: 
     linear-gradient(135deg, 
       rgba(139, 92, 246, 0.15) 0%, 
       rgba(0, 0, 0, 0.6) 50%, 
       rgba(139, 92, 246, 0.15) 100%
     );
   color: #c084fc;
   font-weight: 700;
   cursor: pointer;
   font-family: 'JetBrains Mono', monospace;
   font-size: 14px;
   border-color: rgba(192, 132, 252, 0.3);
   text-shadow: 0 0 8px rgba(192, 132, 252, 0.4);
 }
 
 input[readonly]:hover {
   background: 
     linear-gradient(135deg, 
       rgba(139, 92, 246, 0.25) 0%, 
       rgba(0, 0, 0, 0.7) 50%, 
       rgba(139, 92, 246, 0.25) 100%
     );
   box-shadow: 0 0 15px rgba(192, 132, 252, 0.3);
 }
 
 /* Sacred scrolls - textarea */
 textarea {
   resize: vertical;
   min-height: 140px;
   font-size: 14px;
   font-family: 'JetBrains Mono', monospace;
   line-height: 1.6;
 }
 
 /* Command of power - primary button */
 button[type="submit"] {
   width: 100%;
   padding: 20px 28px;
   background: 
     linear-gradient(135deg, 
       #6d28d9 0%, 
       #8b5cf6 25%, 
       #a855f7 50%, 
       #8b5cf6 75%, 
       #6d28d9 100%
     );
   color: #ffffff;
   border: none;
   border-radius: 12px;
   font-family: 'Inter', sans-serif;
   font-weight: 700;
   font-size: 17px;
   cursor: pointer;
   margin-top: 32px;
   transition: all 0.3s ease;
   text-transform: uppercase;
   letter-spacing: 1px;
   position: relative;
... (truncated)
```

---


## 📄 `nyxpay-sdk/examples/checkout/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>NyxPay Checkout</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>

  <div class="container">
    <h1>🌑 NyxPay Checkout</h1>

    <div class="payment-details">
      <div class="payment-amount" id="paymentAmount">--</div>
      <div class="payment-label" id="paymentLabel">--</div>
      <div class="payment-recipient">
        <span class="label">Recipient</span>
        <span class="address" id="recipientAddress">--</span>
      </div>
    </div>

    <div class="wallet-section">
      <button id="connectWallet" class="btn btn-secondary btn-block">Connect Wallet</button>
      <div id="walletInfo" class="wallet-address mt-2">Not connected</div>
      <div id="balanceInfo" class="wallet-balance mb-3">Balance: --</div>
    </div>

    <button id="payButton" class="btn btn-primary btn-block" disabled>Pay Now</button>

    <div id="loadingSpinner" class="loading-spinner hidden"></div>
    <div id="statusMessage" class="status hidden mt-3"></div>
  </div>

  <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js"></script>
  <script src="nyxpay-pay-sdk.umd.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

---


## 📄 `nyxpay-sdk/examples/checkout/styles.css`

```css
/* NyxPay Checkout - Night Goddess Theme */

* {
  box-sizing: border-box;
}

body {
  background: radial-gradient(ellipse at top, #0a0018 0%, #000 100%);
  color: #f0e6ff;
  font-family: 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Main container */
.checkout-container {
  background: rgba(24, 0, 40, 0.9);
  border: 1px solid #8f00ff33;
  box-shadow: 0 0 40px rgba(175, 0, 255, 0.4);
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
}

/* Header */
.checkout-header h1 {
  font-size: 28px;
  color: #dcb3ff;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 0 4px #b342ff;
}

.checkout-header .subtitle {
  font-size: 16px;
  color: #aa88cc;
  margin: 0;
}

/* Payment section */
.payment-details {
  background: #150024;
  border: 1px solid #360052;
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
}

.payment-amount {
  font-size: 36px;
  font-weight: 800;
  color: #ff6bfa;
  text-shadow: 0 0 4px #ff6bfa;
  margin: 0 0 10px;
}

.payment-label {
  font-size: 18px;
  color: #fff;
  margin-bottom: 8px;
}

.payment-recipient {
  font-size: 14px;
  color: #b78eff;
}

.payment-recipient .address {
  display: inline-block;
  background: #230034;
  border-radius: 6px;
  padding: 8px 12px;
  font-family: monospace;
  color: #e8d0ff;
}

/* Wallet Info */
.wallet-info, .wallet-address, .wallet-balance {
  background: #1a001f;
  color: #dcb3ff;
  border: 1px solid #3a005a;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  margin-top: 16px;
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  min-width: 160px;
  margin: 8px 0;
}

.btn-primary {
  background: linear-gradient(135deg, #b300ff, #ff00d0);
  color: #fff;
  box-shadow: 0 0 12px #ff00e0a0;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #9900cc, #e600aa);
  transform: scale(1.02);
  box-shadow: 0 0 20px #ff00f5c2;
}

.btn-secondary {
  background: transparent;
  color: #f0e6ff;
  border: 1px solid #8f00ff66;
}

.btn-secondary:hover:not(:disabled) {
  background: #1c002f;
  border-color: #c366ff;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* Status messages */
.status {
  font-size: 14px;
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
  font-weight: bold;
}

.status.info {
  background: rgba(70, 0, 130, 0.2);
  border: 1px solid #8a2be2;
  color: #c8a4ff;
}

.status.success {
  background: rgba(0, 255, 136, 0.08);
  border: 1px solid #00ffb3;
  color: #85ffd1;
}

.status.error {
  background: rgba(255, 0, 77, 0.1);
  border: 1px solid #ff0073;
  color: #ff99c8;
}

/* Spinner */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #440066;
  border-top-color: #d53fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 16px auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transaction Link */
.transaction-link {
  color: #ff9dff;
  font-weight: 600;
  text-decoration: none;
}

.transaction-link:hover {
  text-decoration: underline;
  color: #ffc8ff;
}

/* Misc */
.hidden {
  display: none !important;
}

@media (max-width: 480px) {
  .checkout-container {
    padding: 20px;
  }

  .payment-amount {
    font-size: 28px;
  }

  .btn {
    font-size: 15px;
    padding: 12px 20px;
  }
}
```

---


## 📄 `nyxpay-sdk/examples/checkout/app.js`

> ⚠️ File too long (325 lines). Showing first 300 lines.\n
```js
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
... (truncated)
```

---

