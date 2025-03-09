import { PublicKey } from '@solana/web3.js';

// Correct constant for TOKEN_PROGRAM_ID
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

/**
 * Check if a wallet owns any FIA tokens
 * @param {Connection} connection - Solana connection object
 * @param {PublicKey} walletAddress - User's wallet public key
 * @param {PublicKey} tokenMintAddress - FIA token mint address
 * @returns {Promise<boolean>} - Whether the wallet owns any FIA tokens
 */
export async function checkForFIAToken(connection, walletAddress, tokenMintAddress) {
  try {
    console.log('Checking for FIA tokens...');
    console.log('Wallet address:', walletAddress.toString());
    console.log('Token mint address:', tokenMintAddress.toString());
    
    // Use a more reliable approach with better error handling
    try {
      // Get all token accounts owned by the wallet
      const allTokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletAddress,
        { programId: TOKEN_PROGRAM_ID }
      );
      
      console.log('Found total token accounts:', allTokenAccounts.value.length);
      
      // Check all token accounts for the FIA token
      for (const { account } of allTokenAccounts.value) {
        try {
          const parsedInfo = account.data.parsed.info;
          const tokenMint = parsedInfo.mint;
          
          // Check if this token account is for the FIA token
          if (tokenMint === tokenMintAddress.toString()) {
            const balance = Number(parsedInfo.tokenAmount.amount);
            console.log('Found FIA token with balance:', balance);
            
            // If the balance is greater than 0, the user has FIA tokens
            if (balance > 0) {
              console.log('User has FIA tokens, granting access');
              return true;
            }
          }
        } catch (parseErr) {
          console.error('Error parsing token account:', parseErr);
          // Continue to next account if there's an error with this one
          continue;
        }
      }
      
      // No FIA tokens found
      console.log('No FIA tokens found with positive balance');
      return false;
    } catch (err) {
      console.error('Error in token check:', err);
      throw err;
    }
  } catch (error) {
    console.error('Error checking for FIA token:', error);
    throw error;
  }
}
