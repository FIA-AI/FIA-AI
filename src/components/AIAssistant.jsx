import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your FIA AI Assistant. How can I help you today?", 
      sender: 'ai' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: generateAIResponse(input),
        sender: 'ai'
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const generateAIResponse = (userInput) => {
    // Simple response generation logic
    const userQuestion = userInput.toLowerCase();
    
    if (userQuestion.includes('hello') || userQuestion.includes('hi')) {
      return "Hello there! How can I assist you today?";
    } else if (userQuestion.includes('how are you')) {
      return "I'm functioning perfectly! Thank you for asking. How can I help you?";
    } else if (userQuestion.includes('name')) {
      return "I'm the FIA AI Assistant, powered by the FIA token on Solana.";
    } else if (userQuestion.includes('fia') || userQuestion.includes('token')) {
      return "FIA is the token that powers this AI assistant. Only holders of FIA tokens can access this service.";
    } else if (userQuestion.includes('solana')) {
      return "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale.";
    } else if (userQuestion.includes('weather')) {
      return "I'm sorry, I don't have access to real-time weather data. You might want to check a weather service for that information.";
    } else if (userQuestion.includes('thank')) {
      return "You're welcome! If you have any more questions, feel free to ask.";
    } else if (userQuestion.includes('help')) {
      return "I can answer basic questions about various topics. Just ask me anything, and I'll do my best to assist you!";
    } else {
      return "That's an interesting question. As a basic AI assistant, I have limited knowledge, but I'm learning more every day. Is there something else I can help you with?";
    }
  };

  return (
    <AssistantContainer>
      <ChatHeader>
        <h2>AI Assistant</h2>
        <StatusIndicator active={true}>Active</StatusIndicator>
      </ChatHeader>
      
      <MessagesContainer>
        {messages.map(message => (
          <MessageBubble key={message.id} sender={message.sender}>
            {message.text}
          </MessageBubble>
        ))}
        
        {isTyping && (
          <TypingIndicator>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </TypingIndicator>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputForm onSubmit={handleSendMessage}>
        <MessageInput
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isTyping}
        />
        <SendButton type="submit" disabled={!input.trim() || isTyping}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </SendButton>
      </InputForm>
    </AssistantContainer>
  );
};

const AssistantContainer = styled.div`
  background: var(--card-bg-color);
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ChatHeader = styled.div`
  padding: 1rem 1.5rem;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    color: white;
    font-size: 1.25rem;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  
  &:before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${props => props.active ? '#00f5d4' : '#ff4757'};
    margin-right: 8px;
    animation: ${props => props.active ? 'pulse 2s infinite' : 'none'};
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(0, 245, 212, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(0, 245, 212, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0, 245, 212, 0);
    }
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-image: radial-gradient(circle at center, rgba(111, 66, 193, 0.05) 0%, transparent 70%);
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  line-height: 1.5;
  animation: fadeIn 0.3s ease-out;
  
  ${props => props.sender === 'user' ? `
    align-self: flex-end;
    background-color: var(--primary-color);
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background-color: var(--card-bg-color);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom-left-radius: 4px;
  `}
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  align-self: flex-start;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  margin-top: 0.5rem;
  
  .dot {
    width: 8px;
    height: 8px;
    background-color: var(--accent-color);
    border-radius: 50%;
    margin: 0 3px;
    animation: bounce 1.5s infinite;
  }
  
  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes bounce {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-6px);
    }
  }
`;

const InputForm = styled.form`
  display: flex;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-color);
  font-size: 1rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-left: 0.75rem;
  border-radius: 50%;
  background-color: var(--accent-color);
  color: var(--background-color);
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
  }
  
  &:disabled {
    background-color: var(--disabled-color);
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export default AIAssistant;
