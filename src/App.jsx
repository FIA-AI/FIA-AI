import React, { useState, useEffect, useCallback } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import styled from 'styled-components';
import '@solana/wallet-adapter-react-ui/styles.css';
import AIAssistant from './components/AIAssistant';
import Header from './components/Header';
import { checkForFIAToken } from './utils/tokenCheck';

// Use a reliable RPC endpoint with higher rate limits
const endpoint = "https://solana-mainnet.g.alchemy.com/v2/demo";

// Backup endpoints if the primary one fails
const BACKUP_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-api.projectserum.com",
  "https://rpc.ankr.com/solana"
];

const wallets = [new PhantomWalletAdapter()];

// FIA token mint address - using the actual contract address
const FIA_TOKEN_MINT = new PublicKey("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263");

function App() {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function AppContent() {
  const { publicKey, connected } = useWallet();
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenCheckAttempted, setTokenCheckAttempted] = useState(false);
  const [currentEndpointIndex, setCurrentEndpointIndex] = useState(-1); // -1 means using primary endpoint

  const checkTokenOwnership = useCallback(async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting token verification process...');
      
      // Try the primary endpoint first
      setCurrentEndpointIndex(-1);
      let connection = new Connection(endpoint, {
        commitment: 'confirmed',
        disableRetryOnRateLimit: false,
        confirmTransactionInitialTimeout: 30000
      });
      
      let success = false;
      let hasToken = false;
      
      try {
        console.log('Trying primary endpoint');
        hasToken = await checkForFIAToken(connection, publicKey, FIA_TOKEN_MINT);
        console.log('Token check result from primary endpoint:', hasToken);
        setHasToken(hasToken);
        setTokenCheckAttempted(true);
        success = true;
      } catch (err) {
        console.error('Error with primary endpoint:', err);
        // If primary fails, try backup endpoints
        for (let i = 0; i < BACKUP_ENDPOINTS.length; i++) {
          if (success) break;
          
          setCurrentEndpointIndex(i);
          const backupEndpoint = BACKUP_ENDPOINTS[i];
          
          try {
            console.log(`Trying backup endpoint ${i + 1}: ${backupEndpoint}`);
            connection = new Connection(backupEndpoint, {
              commitment: 'confirmed',
              disableRetryOnRateLimit: false,
              confirmTransactionInitialTimeout: 30000
            });
            
            hasToken = await checkForFIAToken(connection, publicKey, FIA_TOKEN_MINT);
            console.log(`Token check result from backup endpoint ${i + 1}:`, hasToken);
            setHasToken(hasToken);
            setTokenCheckAttempted(true);
            success = true;
            break;
          } catch (backupErr) {
            console.error(`Error with backup endpoint ${i + 1}:`, backupErr);
            // Continue to next endpoint
          }
        }
        
        if (!success) {
          throw new Error('Unable to verify token ownership. Please try again later.');
        }
      }
      
    } catch (err) {
      console.error('Error checking token ownership:', err);
      
      // Format error message
      let errorMessage = 'Failed to verify token ownership';
      if (err.message) {
        errorMessage += ': ' + err.message;
      } else if (typeof err === 'string') {
        errorMessage += ': ' + err;
      } else {
        errorMessage += '. Please try again later.';
      }
      
      setError(errorMessage);
      setHasToken(false);
      setTokenCheckAttempted(true);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      checkTokenOwnership();
    } else {
      setHasToken(false);
      setTokenCheckAttempted(false);
    }
  }, [connected, publicKey, checkTokenOwnership]);

  return (
    <AppContainer>
      <Header />
      <MainContent>
        {!connected ? (
          <ConnectSection>
            <h2>Connect Your Wallet</h2>
            <p>Please connect your Phantom wallet to access the AI Assistant</p>
            <WalletMultiButton />
          </ConnectSection>
        ) : isLoading ? (
          <LoadingSection>
            <div className="loader"></div>
            <p>Verifying FIA token ownership...</p>
            {currentEndpointIndex >= 0 && (
              <p className="endpoint-info">Using backup endpoint {currentEndpointIndex + 1}</p>
            )}
          </LoadingSection>
        ) : error ? (
          <ErrorSection>
            <h3>Verification Error</h3>
            <p>{error}</p>
            <button onClick={checkTokenOwnership}>Try Again</button>
          </ErrorSection>
        ) : hasToken ? (
          <AIAssistant />
        ) : tokenCheckAttempted ? (
          <NoTokenSection>
            <h3>Access Denied</h3>
            <p>You need to have FIA tokens in your wallet to access the AI Assistant.</p>
            <p className="wallet-info">Connected wallet: {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}</p>
            <p className="token-info">Looking for token: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263</p>
            <div className="button-group">
              <button onClick={checkTokenOwnership} className="retry-button">Retry Verification</button>
              <a href="https://jup.ag/swap/USDC-FIA" target="_blank" rel="noopener noreferrer">
                <button>Get FIA Tokens</button>
              </a>
            </div>
          </NoTokenSection>
        ) : (
          <LoadingSection>
            <div className="loader"></div>
            <p>Initializing...</p>
          </LoadingSection>
        )}
      </MainContent>
      <Footer>
        <p>© 2023 FIA AI Assistant | Powered by Solana</p>
      </Footer>
    </AppContainer>
  );
}

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const ConnectSection = styled.div`
  background: var(--card-bg-color);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  h2 {
    color: var(--accent-color);
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 2rem;
    opacity: 0.8;
  }
  
  button {
    margin-top: 1rem;
  }
`;

const LoadingSection = styled.div`
  text-align: center;
  
  .loader {
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top: 4px solid var(--accent-color);
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  .endpoint-info {
    font-size: 0.8rem;
    opacity: 0.6;
    margin-top: 0.5rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorSection = styled.div`
  background: var(--card-bg-color);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
  border: 1px solid #ff4757;
  
  h3 {
    color: #ff4757;
    margin-bottom: 1rem;
  }
  
  button {
    background: var(--primary-color);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    margin-top: 1.5rem;
    
    &:hover {
      background: var(--secondary-color);
    }
  }
`;

const NoTokenSection = styled.div`
  background: var(--card-bg-color);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
  
  h3 {
    color: #ff9f43;
    margin-bottom: 1rem;
  }
  
  .wallet-info, .token-info {
    font-size: 0.85rem;
    opacity: 0.7;
    margin: 0.5rem 0;
    font-family: monospace;
  }
  
  .button-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
  
  .retry-button {
    background: var(--primary-color);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    
    &:hover {
      background: var(--secondary-color);
    }
  }
  
  button {
    background: var(--accent-color);
    color: var(--background-color);
    font-weight: bold;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    
    &:hover {
      opacity: 0.9;
    }
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 1.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  
  p {
    font-size: 0.9rem;
    opacity: 0.7;
  }
`;

export default App;
