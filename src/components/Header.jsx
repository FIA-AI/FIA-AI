import React from 'react';
import styled from 'styled-components';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Header = () => {
  return (
    <HeaderContainer>
      <div className="container">
        <HeaderContent>
          <Logo>
            <img src="/ai-icon.svg" alt="FIA AI" />
            <h1>FIA AI Assistant</h1>
          </Logo>
          <WalletButtonContainer>
            <WalletMultiButton />
          </WalletButtonContainer>
        </HeaderContent>
      </div>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  background-color: rgba(10, 14, 23, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem 0;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  img {
    width: 40px;
    height: 40px;
  }
  
  h1 {
    font-size: 1.5rem;
    background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const WalletButtonContainer = styled.div`
  .wallet-adapter-button {
    background-color: var(--primary-color);
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--secondary-color);
    }
  }
`;

export default Header;
