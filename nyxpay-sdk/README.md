# 🏐 Solana Payments SDK

A lightweight JavaScript SDK to power custom token payments on the Solana blockchain. Easily connect Phantom, manage balances, and send SPL tokens (like $nyxpay) from any browser app — no smart contracts or backend required.

## 🚀 Features

- 🔐 Phantom wallet integration (connect/disconnect)
- 🪙 Send SPL tokens (e.g. nyxpay) between wallets
- 🧠 Token registry with built-in metadata
- ✅ Input validation and transaction simulation
- 🔄 Real-time balance fetching
- 📦 Bundled for browser or module-based usage

## 📦 Installation

### Option 1: Import UMD bundle in browser (no build step)

```html
<script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js"></script>
<script src="https://unpkg.com/bn.js@5.2.1/lib/bn.js"></script>
<script src="./dist/solana-payments-sdk.js"></script>
```

### Option 2: Install via npm

```bash
npm install solana-payments-sdk
```

## 🧪 Example (Browser App)

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Solana Payments SDK Example</title>
</head>
<body>
  <h1>Solana Payments SDK</h1>
  <button id="connectWallet">Connect Wallet</button>
  <button id="sendPayment">Send 5 nyxpay</button>
  <div id="statusMessage"></div>
  <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js"></script>
  <script src="https://unpkg.com/bn.js@5.2.1/lib/bn.js"></script>
  <script>
    window.BN = BN;
  </script>
  <script src="./dist/solana-payments-sdk.js"></script>
  <script>
    const { PaymentProcessor, PhantomAdapter } = SolanaPaymentsSDK;
    const processor = new PaymentProcessor({ network: 'mainnet-beta' });
    processor.setWalletAdapter(new PhantomAdapter());
    document.getElementById('connectWallet').onclick = async () => {
      await processor.init();
      await processor.connectWallet();
      alert('Wallet connected!');
    };
    document.getElementById('sendPayment').onclick = async () => {
      const result = await processor.sendTokens({
        recipient: 'EnterRecipientPublicKeyHere',
        amount: 5,
        tokenMint: 'nyxpay'
      });
      document.getElementById('statusMessage').innerHTML =
        `Payment sent! <a href="${result.explorerUrl}" target="_blank">View on Solscan</a>`;
    };
  </script>
</body>
</html>
```

## ⚙️ API Overview

### PaymentProcessor(config)
- `network`: Solana cluster (e.g. 'mainnet-beta')
- `rpcEndpoint`: Optional custom RPC endpoint

#### Methods
- `init()` – Initialize SDK and Solana connection
- `setWalletAdapter(adapter)` – Attach a wallet adapter
- `connectWallet()` – Prompt Phantom to connect
- `disconnectWallet()` – Disconnect the wallet
- `getTokenBalance(tokenSymbolOrMint)` – Get the wallet's token balance
- `sendTokens({ recipient, amount, tokenMint })` – Send SPL tokens

### PhantomAdapter()
Adapter for Phantom Wallet. Required for connecting and signing.

### TokenRegistry
Manage supported tokens and metadata.

```javascript
const registry = new TokenRegistry();
registry.addToken({
  symbol: 'DOGE',
  mintAddress: 'YourTokenMintAddressHere',
  decimals: 9,
  maxTransferAmount: 100000
});
```

## 📁 Project Structure

```
solana-payments-sdk/
├── dist/                      # Bundled SDK (UMD)
├── examples/simple-payment/   # Full demo: index.html + app.js
├── src/
│   ├── core/PaymentProcessor.js
│   ├── wallet/PhantomAdapter.js
│   ├── token/TokenRegistry.js
│   └── utils/
│       ├── transaction.js
│       └── validation.js
├── webpack.config.js
└── package.json
```

## 🛡️ Security & Best Practices

- Always simulate and confirm transactions before marking them complete
- Validate addresses with `isValidSolanaAddress()` before sending
- Never hardcode private keys or RPC endpoints client-side
- Always check balances and limits before sending transactions

## 🧠 TODOs & Roadmap

- [ ] Add support for TransferChecked instruction
- [ ] Support other wallets (e.g. Solflare, Backpack)
- [ ] React/Vue wrappers
- [ ] Token swap & NFT utilities
- [ ] Add TypeScript types

## 👨‍🍳 Created by Zack Adams

Built for memecoins, games, marketplaces, and crypto-native experiences.
Let the blockchain be your backend.

## 🧵 Feedback / Issues

Open a GitHub issue or contact @hackingbaseball on Twitter.