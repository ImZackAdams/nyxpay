// src/index.js
import { PaymentProcessor } from './core/PaymentProcessor';
import { PhantomAdapter } from './wallet/PhantomAdapter';
import { TokenRegistry } from './token/TokenRegistry';
import * as TransactionUtils from './utils/transaction';
import * as ValidationUtils from './utils/validation';

// Export all components
export {
  PaymentProcessor,
  PhantomAdapter,
  TokenRegistry,
  TransactionUtils,
  ValidationUtils
};

// Default export for easier importing
export default {
  PaymentProcessor,
  PhantomAdapter,
  TokenRegistry,
  TransactionUtils,
  ValidationUtils
};

// Helper function to create a pre-configured SDK instance
export function createSolanaPaymentSDK(config = {}) {
  const processor = new PaymentProcessor(config);
  const phantomAdapter = new PhantomAdapter();
  
  // Set up the wallet adapter
  processor.setWalletAdapter(phantomAdapter);
  
  return {
    processor,
    phantomAdapter,
    tokenRegistry: processor.tokenRegistry,
    
    // Initialize everything
    async init() {
      await processor.init();
      return this;
    }
  };
}