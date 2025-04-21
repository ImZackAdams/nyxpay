# 🏐 Solana Payments SDK

A lightweight JavaScript SDK to power custom token payments on the Solana blockchain. Easily connect Phantom, manage balances, and send SPL tokens (like $TBALL) from any browser app — no smart contracts or backend required.

---

## 🚀 Features

- 🔐 Phantom wallet integration (connect/disconnect)
- 🪙 Send SPL tokens (e.g. TBALL) between wallets
- 🧠 Token registry with built-in metadata
- ✅ Input validation and transaction simulation
- 🔄 Real-time balance fetching
- 📦 Bundled for browser or module-based usage

---

## 📦 Installation

### Option 1: Import UMD bundle in browser (no build step)
```html
<script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js"></script>
<script src="https://unpkg.com/bn.js@5.2.1/lib/bn.js"></script>
<script src="./dist/solana-payments-sdk.js"></script>
