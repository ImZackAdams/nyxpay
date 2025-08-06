# NyxPay

A protocol that fits inside a static HTML file.  
No backend. No APIs. No surveillance. No gatekeepers.

## What is this

NyxPay lets you send SOL or SPL tokens from a web page.  
No login. No tracking. No middleman.  
Just browser, wallet, blockchain.

It builds raw transactions in the browser using direct RPC calls to Solana.  
It signs them using Phantom.  
It sends them without ever touching a server.  
You can view the source and see exactly what you are signing.

## Folders

```
nyxpay/
├── core/                   # PaymentProcessor
├── token/                  # TokenRegistry
├── utils/                  # transaction builders and validation
├── wallet/                 # PhantomAdapter
├── index.js               # Export point for bundlers
└── nyxpay-linkbuilder/    # UI for generating checkout links and buttons
```

## Core

The core is a set of JavaScript modules that form the protocol.

### PaymentProcessor.js

This is the engine. It connects to Phantom, builds transactions, simulates them, sends them, waits for confirmation.  
Supports both native SOL and SPL tokens.  
Has retry logic, safety limits, and no external dependencies.

### TokenRegistry.js

Keeps track of supported tokens. SOL is built in.  
You can add custom SPL tokens with mint address, decimals, max transfer amount.  
Zero reliance on external metadata sources.

### transaction.js

Builds low level Solana instructions.  
Finds associated token accounts.  
Creates them if missing.  
Encodes token transfers using raw bytes.

### validation.js

Checks that recipient is a valid address.  
Checks that amount is sane.  
Enforces token-specific safety limits.

### PhantomAdapter.js

Interface for Phantom.  
Connects wallet, fetches balances, signs and sends transactions.  
Handles rejections and disconnects cleanly.

## Link Builder

This is the frontend for people who just want to get paid.  
Open the page. Enter an amount, label, and wallet address.  

It gives you:
- A shareable link  
- A self-contained button  
- A live preview

You can paste the button into a blog or website. No script tags. No SDKs. No nonsense.

### Generated Output

**Checkout URL**  
```
https://nyxpaycheckout.vercel.app/?recipient=YourWallet&amount=5&label=nyxpay%20Tshirt&tokenMint=SOL
```

**HTML Button**  
```html
<a href="https://nyxpaycheckout.vercel.app/?recipient=...&amount=5&label=nyxpay%20Tshirt&tokenMint=SOL"
   target="_blank" rel="noopener noreferrer"
   style="padding: 10px 16px; background: #FEB02E; color: black; text-decoration: none; border-radius: 6px; font-weight: bold;">
  nyxpay Tshirt  5 SOL
</a>
```

## Code Example

```js
import { PaymentProcessor } from './core/PaymentProcessor.js'
import { PhantomAdapter } from './wallet/PhantomAdapter.js'

const processor = new PaymentProcessor({ network: 'devnet' })
const adapter = new PhantomAdapter()

await processor.setWalletAdapter(adapter)
await processor.connectWallet()

const result = await processor.sendTokens({
  recipient: 'Fg6PaFpoGXkYsidMpWxTWqGHmQ78A1g...',
  amount: 2.5,
  tokenMint: 'SOL'
})

console.log('Explorer:', result.explorerUrl)
```

## Why

Because payments should not require permission.  
Because a transaction is a message, and no one should filter what you can say.  
Because centralized payment processors are parasites.  
Because the browser is enough.

This is not a product.  
It is not a business.  
There is no us.  
There is no support.  
There is only code.

If you need help, use Stripe.  
If you are ready to build without permission, use Nyx.

## How to run

Open `index.html` in the `nyxpay-linkbuilder` directory.  
No build step required.  
No server required.

To include the SDK in your own app, just import the modules.  
It works with any bundler. It works without one too.

## License

MIT

Take it. Use it. Break it. There are no strings.
