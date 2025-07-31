/**
 * Registry for managing supported Solana tokens (including native SOL)
 */
class TokenRegistry {
  constructor() {
    this.tokens = {
      // Native SOL (does not use a mint address)
      'SOL': {
        name: 'Solana',
        symbol: 'SOL',
        mintAddress: null, // Native, no mint
        decimals: 9,
        maxTransferAmount: 100, // Max in SOL
        logoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png'
      }

      // Add SPL tokens here if needed (e.g., USDC, NYXPAY)
    };
  }

  /**
   * Get token by symbol or mint address
   * @param {string} tokenIdentifier - Token symbol or mint address
   * @returns {Object|null} - Token info or null if not found
   */
  getToken(tokenIdentifier) {
    // Check by symbol
    if (this.tokens[tokenIdentifier]) {
      return this.tokens[tokenIdentifier];
    }

    // Check by mint address (skip nulls like SOL)
    return Object.values(this.tokens).find(
      token => token.mintAddress && token.mintAddress === tokenIdentifier
    ) || null;
  }

  /**
   * Add a new SPL token to the registry
   * @param {Object} tokenInfo - Token information
   * @returns {Object} - Added token info
   */
  addToken(tokenInfo) {
    if (!tokenInfo.symbol || (!tokenInfo.mintAddress && tokenInfo.symbol !== 'SOL')) {
      throw new Error('Token must have symbol and (for SPL tokens) a mintAddress');
    }

    this.tokens[tokenInfo.symbol] = {
      name: tokenInfo.name || tokenInfo.symbol,
      symbol: tokenInfo.symbol,
      mintAddress: tokenInfo.mintAddress || null,
      decimals: tokenInfo.decimals ?? 9,
      maxTransferAmount: tokenInfo.maxTransferAmount ?? 1000,
      logoUrl: tokenInfo.logoUrl || null
    };

    return this.tokens[tokenInfo.symbol];
  }

  /**
   * Get all registered tokens
   * @returns {Object} - All tokens
   */
  getAllTokens() {
    return this.tokens;
  }

  /**
   * Remove a token from the registry
   * @param {string} symbol - Token symbol
   * @returns {boolean} - True if removed
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
