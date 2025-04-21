// src/utils/transaction.js
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';

// Constants
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

/**
 * Find the associated token account address
 * @param {PublicKey} owner - Account owner
 * @param {PublicKey} mint - Token mint address
 * @returns {Promise<PublicKey>} - Associated token account address
 */
export async function findAssociatedTokenAccount(owner, mint) {
  return PublicKey.findProgramAddressSync(
    [
      owner.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
}

/**
 * Create instruction to create an associated token account
 * @param {PublicKey} payer - Fee payer
 * @param {PublicKey} owner - Account owner
 * @param {PublicKey} mint - Token mint
 * @returns {TransactionInstruction} - Transaction instruction
 */
export function createAssociatedTokenAccountInstruction(payer, owner, mint) {
  return new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: findAssociatedTokenAccount(owner, mint), isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });
}

/**
 * Create instruction to transfer tokens
 * @param {PublicKey} source - Source account
 * @param {PublicKey} destination - Destination account
 * @param {PublicKey} owner - Token owner
 * @param {number} amount - Amount to transfer (in raw units)
 * @returns {TransactionInstruction} - Transaction instruction
 */
export function createTransferInstruction(source, destination, owner, amount) {
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