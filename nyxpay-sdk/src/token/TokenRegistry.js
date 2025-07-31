// src/token/TokenRegistry.js

/**
 * TokenRegistry – Manages supported Solana tokens including native SOL and SPL tokens
 */
class TokenRegistry {
  constructor() {
    this.tokens = {
      SOL: {
        name: 'Solana',
        symbol: 'SOL',
        isNative: true,
        mintAddress: null, // Native SOL has no mint
        decimals: 9,
        maxTransferAmount: 100, // Max in SOL
        logoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png'
      }

      // Add additional SPL tokens below if needed:
      // USDC: {
      //   name: 'USD Coin',
      //   symbol: 'USDC',
      //   isNative: false,
      //   mintAddress: 'INSERT_MINT_ADDRESS_HERE',
      //   decimals: 6,
      //   maxTransferAmount: 1000,
      //   logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
      // }
    };
  }

  /**
   * Get token by symbol or mint address
   * @param {string} identifier - Symbol or mint address
   * @returns {Object|null}
   */
  getToken(identifier) {
    if (this.tokens[identifier]) {
      return this.tokens[identifier];
    }

    return Object.values(this.tokens).find(
      token => token.mintAddress && token.mintAddress === identifier
    ) || null;
  }

  /**
   * Add a new SPL token
   * @param {Object} token
   * @param {string} token.symbol - Token symbol (required)
   * @param {string|null} token.mintAddress - Mint address (required for SPL)
   * @param {string} [token.name] - Human-readable name
   * @param {number} [token.decimals=9] - Decimal places
   * @param {number} [token.maxTransferAmount=1000]
   * @param {string|null} [token.logoUrl]
   * @param {boolean} [token.isNative=false]
   * @returns {Object} - Registered token
   */
  addToken(token) {
    const { symbol, mintAddress, name, decimals, maxTransferAmount, logoUrl, isNative } = token;

    if (!symbol) throw new Error('Token must include a symbol');
    if (!isNative && !mintAddress) throw new Error('SPL token must include a mint address');

    this.tokens[symbol] = {
      name: name || symbol,
      symbol,
      mintAddress: isNative ? null : mintAddress,
      decimals: decimals ?? 9,
      maxTransferAmount: maxTransferAmount ?? 1000,
      logoUrl: logoUrl || null,
      isNative: !!isNative
    };

    return this.tokens[symbol];
  }

  /**
   * Get all registered tokens
   * @returns {Object}
   */
  getAllTokens() {
    return this.tokens;
  }

  /**
   * Remove a token from the registry
   * @param {string} symbol
   * @returns {boolean}
   */
  removeToken(symbol) {
    if (this.tokens[symbol]) {
      delete this.tokens[symbol];
      return true;
    }
    return false;
  }
}

export { TokenRegistry };
