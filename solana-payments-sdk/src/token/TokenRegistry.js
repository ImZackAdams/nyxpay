// src/token/TokenRegistry.js

/**
 * Registry for managing supported tokens
 */
class TokenRegistry {
    constructor() {
      this.tokens = {
        // Default tokens
        'TBALL': {
          name: 'TeleportBall',
          symbol: 'TBALL',
          mintAddress: 'CWnzqQVFaD7sKsZyh116viC48G7qLz8pa5WhFpBEg9wM',
          decimals: 9,
          maxTransferAmount: 1000,
          logoUrl: 'https://example.com/tball-logo.png'
        }
        // Additional tokens can be added here
      };
    }
    
    /**
     * Get token by symbol or mint address
     * @param {string} tokenIdentifier - Token symbol or mint address
     * @returns {Object|null} - Token info or null if not found
     */
    getToken(tokenIdentifier) {
      // Check if direct lookup by token symbol works
      if (this.tokens[tokenIdentifier]) {
        return this.tokens[tokenIdentifier];
      }
      
      // Otherwise search by mint address
      return Object.values(this.tokens).find(
        token => token.mintAddress === tokenIdentifier
      ) || null;
    }
    
    /**
     * Add a new token to the registry
     * @param {Object} tokenInfo - Token information
     * @returns {Object} - Added token info
     */
    addToken(tokenInfo) {
      if (!tokenInfo.symbol || !tokenInfo.mintAddress) {
        throw new Error('Token must have symbol and mintAddress');
      }
      
      this.tokens[tokenInfo.symbol] = {
        name: tokenInfo.name || tokenInfo.symbol,
        symbol: tokenInfo.symbol,
        mintAddress: tokenInfo.mintAddress,
        decimals: tokenInfo.decimals || 9,
        maxTransferAmount: tokenInfo.maxTransferAmount || 1000,
        logoUrl: tokenInfo.logoUrl || null
      };
      
      return this.tokens[tokenInfo.symbol];
    }
    
    /**
     * Get all tokens in the registry
     * @returns {Object} - All tokens
     */
    getAllTokens() {
      return this.tokens;
    }
    
    /**
     * Remove a token from the registry
     * @param {string} symbol - Token symbol
     * @returns {boolean} - True if token was removed
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