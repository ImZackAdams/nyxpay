// Import required libraries
const { 
    Connection, 
    PublicKey, 
    Transaction, 
    SystemProgram,
    TransactionInstruction 
} = solanaWeb3;

// Import BN from the window object after the script is loaded
const BN = window.BN;

// SPL Token Program ID and Associated Token Program ID
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

// Configuration
const TBALL_MINT = new PublicKey('CWnzqQVFaD7sKsZyh116viC48G7qLz8pa5WhFpBEg9wM');
const LAMPORTS_PER_TBALL = 1_000_000_000;
const MAX_TRANSFER_AMOUNT = 1000; // Maximum transfer amount in TBALL
const CONFIRMATION_BLOCKS = 32; // Increased number of blocks to wait for confirmation
const TRANSACTION_TIMEOUT = 90000; // 90 seconds timeout
const RETRY_ATTEMPTS = 5; // Increased retry attempts

class TballPaymentProcessor {
    constructor() {
        this.wallet = null;
        this.connection = null;
        this.network = 'mainnet-beta';
        this.rpcEndpoint = '';
        this.init();
    }

    async init() {
        try {
            console.log('Initializing payment processor...');
            // Fetch API key from backend
            const response = await fetch('/api/get-key');
            const data = await response.json();
            this.rpcEndpoint = `https://rpc.helius.xyz/?api-key=${data.apiKey}`;

            

            this.connection = new Connection(this.rpcEndpoint, {
                commitment: 'processed',
                wsEndpoint: this.rpcEndpoint.replace('https', 'wss'),
                confirmTransactionInitialTimeout: 120000,
                secondaryRateLimit: 10
            });

            this.setupEventListeners();
            await this.checkWalletConnection();
        } catch (error) {
            console.error('Failed to fetch API key:', error);
            this.updateStatus('Error initializing connection. Please try again later.', true);
        }
    }

    setupEventListeners() {
        // Immediately bind the send payment button
        const bindButtons = () => {
            console.log('Binding event listeners...');
            const connectButton = document.getElementById('connectWallet');
            const disconnectButton = document.getElementById('disconnectWallet');
            const sendButton = document.getElementById('sendPayment');
            const networkSelect = document.getElementById('network');

            if (connectButton) {
                console.log('Found connect button, adding listener');
                connectButton.addEventListener('click', () => this.connectWallet());
            } else {
                console.warn('Connect button not found');
            }

            if (disconnectButton) {
                console.log('Found disconnect button, adding listener');
                disconnectButton.addEventListener('click', async () => {
                    try {
                        await window.solana.disconnect();
                        this.wallet = null;
                        this.updateStatus('Wallet disconnected');
                        this.updateBalance(0);
                    } catch (err) {
                        console.error('Error disconnecting:', err);
                        this.updateStatus('Error disconnecting wallet', true);
                    }
                });
            }

            if (sendButton) {
                console.log('Found send button, adding listener');
                const boundSendPayment = this.sendPayment.bind(this);
                sendButton.addEventListener('click', boundSendPayment);
                // Add a test click handler to verify listener attachment
                sendButton.addEventListener('click', () => {
                    console.log('Send button clicked - initial handler');
                });
            } else {
                console.warn('Send button not found');
            }

            if (networkSelect) {
                networkSelect.addEventListener('change', (e) => {
                    this.network = e.target.value;
                    this.init(); // Reinitialize with new network
                });
            }
        };

        // Bind immediately if document is already loaded
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            bindButtons();
        }

        // Also bind on DOMContentLoaded to ensure we don't miss it
        document.addEventListener('DOMContentLoaded', bindButtons);

        // Handle wallet disconnection event
        window.solana?.on("disconnect", () => {
            this.wallet = null;
            this.updateStatus("Wallet disconnected. Please reconnect.", true);
            console.log("Wallet disconnected.");
        });
    }

    async checkWalletConnection() {
        try {
            console.log('Checking for Phantom wallet...');
            if (window.solana && window.solana.isPhantom) {
                console.log('Phantom wallet detected. Please click "Connect Wallet" to begin.');
                this.updateStatus('Please connect your wallet to begin.');
            } else {
                throw new Error('Phantom Wallet not detected. Please install it from https://phantom.app/');
            }
        } catch (err) {
            console.warn('Wallet check failed:', err);
            this.updateStatus(err.message, true);
        }
    }

    updateStatus(message, isError = false, hasLink = false) {
        console.log(message);
        const statusEl = document.getElementById('statusMessage');
        if (statusEl) {
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
            statusEl.className = isError ? 'error' : 'success';
        }
    }

    async connectWallet() {
        try {
            console.log('Attempting to connect Phantom Wallet...');
            if (!window.solana || !window.solana.isPhantom) {
                throw new Error('Phantom Wallet not detected. Please install it from https://phantom.app/');
            }

            this.updateStatus('Connecting wallet...');
            
            // First disconnect any existing connection
            try {
                await window.solana.disconnect();
                console.log('Disconnected existing wallet connection');
            } catch (err) {
                console.log('No existing connection to disconnect');
            }

            // Request fresh connection
            const response = await window.solana.connect({ onlyIfTrusted: false });
            this.wallet = new PublicKey(response.publicKey.toString());

            console.log('Connected to wallet:', this.wallet.toString());
            this.updateStatus(`Connected: ${this.wallet.toString().slice(0, 8)}...`);
            await this.fetchAndUpdateBalance();
        } catch (err) {
            console.error('Wallet connection error:', err);
            this.updateStatus(`Wallet connection failed: ${err.message}`, true);
        }
    }

    async fetchAndUpdateBalance() {
        try {
            if (!this.wallet) return;

            console.log('Fetching TBALL balance for:', this.wallet.toString());
            const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
                this.wallet,
                { mint: TBALL_MINT }
            );

            if (tokenAccounts.value.length > 0) {
                const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
                console.log('Current balance:', balance);
                this.updateBalance(balance);
            } else {
                this.updateBalance(0);
            }
        } catch (err) {
            console.error('Error fetching balance:', err);
            this.updateBalance('Error');
        }
    }

    updateBalance(balance) {
        const balanceEl = document.getElementById('balance');
        if (balanceEl) {
            balanceEl.textContent = typeof balance === 'number' ? 
                `Balance: ${balance.toFixed(2)} TBALL` : `Balance: ${balance}`;
        }
    }

    async createTransaction(recipient, amount) {
        if (!this.wallet || !this.connection) {
            throw new Error('Wallet or connection not initialized');
        }

        const recipientPubKey = new PublicKey(recipient);
        const senderTokenAccount = await this.findAssociatedTokenAccount(this.wallet, TBALL_MINT);
        const recipientTokenAccount = await this.findAssociatedTokenAccount(recipientPubKey, TBALL_MINT);

        // Check if recipient token account exists
        let transaction = new Transaction();
        
        const recipientAccountInfo = await this.connection.getAccountInfo(recipientTokenAccount);
        if (!recipientAccountInfo) {
            console.log('Creating associated token account for recipient');
            transaction.add(
                this.createAssociatedTokenAccountInstruction(
                    this.wallet,
                    recipientPubKey,
                    TBALL_MINT
                )
            );
        }

        // Add transfer instruction
        const transferAmount = amount * LAMPORTS_PER_TBALL;
        transaction.add(
            this.createTransferInstruction(
                senderTokenAccount,
                recipientTokenAccount,
                this.wallet,
                transferAmount
            )
        );

        // Get recent blockhash
        const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = this.wallet;

        return transaction;
    }

    async findAssociatedTokenAccount(owner, mint) {
        return PublicKey.findProgramAddressSync(
            [
                owner.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        )[0];
    }

    createAssociatedTokenAccountInstruction(payer, owner, mint) {
        return new TransactionInstruction({
            keys: [
                { pubkey: payer, isSigner: true, isWritable: true },
                { pubkey: owner, isSigner: false, isWritable: false },
                { pubkey: mint, isSigner: false, isWritable: false },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            ],
            programId: ASSOCIATED_TOKEN_PROGRAM_ID,
            data: Buffer.from([]),
        });
    }

    createTransferInstruction(source, destination, owner, amount) {
        return new TransactionInstruction({
            keys: [
                { pubkey: source, isSigner: false, isWritable: true },
                { pubkey: destination, isSigner: false, isWritable: true },
                { pubkey: owner, isSigner: true, isWritable: false },
            ],
            programId: TOKEN_PROGRAM_ID,
            data: Buffer.from([3, ...new BN(amount).toArray('le', 8)]), // 3 is the instruction index for transfer
        });
    }

    async sendPayment() {
        try {
            console.log('Starting payment process...');
            const recipientElement = document.getElementById('recipient');
            const amountElement = document.getElementById('amount');
            
            if (!recipientElement || !amountElement) {
                throw new Error('Required input fields not found');
            }
            
            const recipient = recipientElement.value.trim();
            const amount = parseFloat(amountElement.value);

            console.log(`Sending ${amount} TBALL to ${recipient}`);

            await this.validateTransfer(recipient, amount);

            // Get recent blockhash before creating transaction
            const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('finalized');
            
            const transaction = await this.createTransaction(recipient, amount);
            transaction.recentBlockhash = blockhash;
            transaction.lastValidBlockHeight = lastValidBlockHeight;
            
            console.log('Transaction created:', transaction);

            // Verify the transaction before sending
            const simulation = await this.connection.simulateTransaction(transaction);
            if (simulation.value.err) {
                throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
            }
            
            // Set transaction options
            const opts = {
                skipPreflight: false,
                preflightCommitment: 'processed',
                maxRetries: 5
            };

            this.updateStatus('Please approve the transaction in your wallet...');
            
            try {
                // Sign and send with options
                const signed = await window.solana.signAndSendTransaction(transaction, opts);
                console.log('Transaction signed and sent:', signed);
                
                // Immediately verify the transaction was received
                const confirmedSignature = await this.connection.getSignatureStatus(signed.signature);
                console.log('Initial signature status:', confirmedSignature);

                // Verify the transaction was received by the network
                const latestBlockhash = await this.connection.getLatestBlockhash('confirmed');
                const verification = await this.connection.confirmTransaction({
                    signature: signed.signature,
                    blockhash: latestBlockhash.blockhash,
                    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
                }, 'confirmed');

                if (verification.value.err) {
                    throw new Error(`Transaction verification failed: ${JSON.stringify(verification.value.err)}`);
                }

                console.log('Transaction verification:', verification);
                this.updateStatus('Confirming transaction...');
                
                // Wait for more confirmations
                const confirmation = await this.waitForConfirmation(signed.signature);
                
                if (confirmation.status === 'pending') {
                    const explorerLink = `https://solscan.io/tx/${signed.signature}`;
                    this.updateStatus(`Transaction pending. Check status: ${explorerLink}`, false, true);
                } else {
                    await this.fetchAndUpdateBalance();
                    const explorerLink = `https://solscan.io/tx/${signed.signature}`;
                    this.updateStatus(`Payment successful! View transaction: ${explorerLink}`, false, true);
                }
            } catch (err) {
                if (err.message.includes('User rejected')) {
                    throw new Error('Transaction was rejected by user');
                }
                throw new Error(`Failed to send transaction: ${err.message}`);
            }
        } catch (err) {
            console.error('Payment error:', err);
            this.updateStatus(`Transaction failed: ${err.message}`, true);
        }
    }

    async waitForConfirmation(signature) {
        let timeoutId;
        let intervalId;
        let attempt = 0;

        const confirmationPromise = new Promise(async (resolve, reject) => {
            const timeout = () => {
                clearInterval(intervalId);
                reject(new Error('Transaction confirmation timeout - please check your wallet for status'));
            };

            const checkConfirmation = async () => {
                console.log(`Checking confirmation attempt ${attempt + 1}/${RETRY_ATTEMPTS}`);
                
                try {
                    const status = await this.connection.getSignatureStatus(signature);
                    console.log('Transaction status:', status?.value?.confirmationStatus);
                    
                    if (!status?.value) {
                        this.updateStatus(`Waiting for transaction to be processed... (${attempt + 1}/${RETRY_ATTEMPTS})`);
                        if (attempt >= RETRY_ATTEMPTS) {
                            clearInterval(intervalId);
                            clearTimeout(timeoutId);
                            // Instead of rejecting, we'll provide a link to check the transaction
                            const explorerLink = `https://solscan.io/tx/${signature}`;
                            this.updateStatus(`Transaction sent but confirmation taking longer than expected. Check status here: ${explorerLink}`);
                            resolve({ status: 'pending', signature, explorerLink });
                            return;
                        }
                    } else {
                        const confirmations = status.value.confirmations;
                        this.updateStatus(`Transaction processing... Confirmations: ${confirmations || 0}`);

                        if (status.value.err) {
                            clearInterval(intervalId);
                            clearTimeout(timeoutId);
                            reject(new Error('Transaction failed on chain'));
                            return;
                        }

                        if (confirmations >= CONFIRMATION_BLOCKS || status.value.confirmationStatus === 'finalized') {
                            clearInterval(intervalId);
                            clearTimeout(timeoutId);
                            resolve(status);
                            return;
                        }
                    }
                    
                    attempt++;
                } catch (err) {
                    console.warn('Confirmation check failed:', err);
                    this.updateStatus(`Checking transaction status... (${attempt + 1}/${RETRY_ATTEMPTS})`);
                    attempt++;
                }
            };

            timeoutId = setTimeout(timeout, TRANSACTION_TIMEOUT);
            intervalId = setInterval(checkConfirmation, 2000); // Increased interval to 2 seconds
            await checkConfirmation(); // Check immediately
        });

        return confirmationPromise;
    }

    async validateTransfer(recipient, amount) {
        if (!this.wallet) throw new Error('Please connect your wallet first');
        if (!recipient || !this.isValidSolanaAddress(recipient)) throw new Error('Invalid recipient address');
        if (isNaN(amount) || amount <= 0 || amount > MAX_TRANSFER_AMOUNT) throw new Error(`Amount must be between 0 and ${MAX_TRANSFER_AMOUNT} TBALL`);
    }

    isValidSolanaAddress(address) {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    }
}

// Initialize the payment processor when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing app...');
    window.paymentProcessor = new TballPaymentProcessor();
});