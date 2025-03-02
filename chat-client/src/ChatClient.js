import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import FloatingChatIcon from './FloatingChatIcon';

const ChatClient = () => {
  const [message, setMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (isChatOpen && chatHistory.length === 0) {
      setChatHistory([{ 
        type: 'response', 
        content: "Hello! I'm Shree, an AI Agent here to assist you. How can I help you today?" 
      }]);
    }
  }, [isChatOpen]);

  const saveUserInputToBackend = async (input) => {
    try {
      const response = await fetch('http://localhost:8080/api/saveInput', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });
      if (!response.ok) {
        throw new Error('Failed to save input');
      }
      const data = await response.json();
      console.log('Input saved:', data);
    } catch (error) {
      console.error('Error saving input:', error);
    }
  };

  const handleUserInput = (input) => {
    setUserInput(input);
    saveUserInputToBackend(input);
    setChatHistory(prevHistory => [...prevHistory, { type: 'input', content: input }]);
  };

  const handleResponse = (response) => {
    setChatHistory(prevHistory => [...prevHistory, { type: 'response', content: response }]);
  };

  const handleSend = () => {
    if (message.trim()) {
      handleUserInput(message);
      stompClient.publish({
        destination: '/app/message',
        body: message,
      });
      setMessage('');
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      setFormData({ name: '', email: '', password: '' });
      setActiveTab('chat');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/chat');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe('/topic/response', (message) => {
        handleResponse(message.body);
      });
    };

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, []);

  const ChatHeader = () => (
    <div style={styles.chatHeader}>
      <div style={styles.avatarContainer}>
        <img src="/avatar.png" alt="Shree AI Avatar" style={styles.avatar} />
        <div style={styles.statusIndicator} />
      </div>
      <div style={styles.agentInfo}>
        <h3 style={styles.agentName}>Shree</h3>
        <p style={styles.agentDescription}>Vagudu AI Agent Specialist</p>
      </div>
    </div>
  );

  return (
    <>
      <FloatingChatIcon onClick={toggleChat} style={styles.floatingButton}>
        <img src="/avatar.png" alt="Shree AI Avatar" style={styles.floatingAvatar} />
      </FloatingChatIcon>
      {isChatOpen && (
        <div style={styles.container}>
          <button style={styles.closeButton} onClick={toggleChat}>×</button>
          <ChatHeader />
          <div style={styles.content}>
            {activeTab === 'chat' ? (
              <>
                <div style={styles.chatWindow}>
                  {chatHistory.map((item, index) => (
                    <div key={index} style={item.type === 'input' ? styles.inputMessage : styles.response}>
                      {item.content}
                    </div>
                  ))}
                </div>
                <div style={styles.inputContainer}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSend();
                      }
                    }}
                    style={styles.input}
                    placeholder="Type your message..."
                  />
                  <button style={styles.button} onClick={handleSend}>
                    Send
                  </button>
                </div>
              </>
            ) : activeTab === 'voice' ? (
              <div style={styles.voiceTabContent}>
                <h3>Voice Interface</h3>
                <p>Voice functionality coming soon!</p>
              </div>
            ) : (
              <form onSubmit={handleRegistrationSubmit} style={styles.registrationForm}>
                <h3>User Registration</h3>
                <input 
                  type="text" 
                  placeholder="Name" 
                  required 
                  style={styles.formInput}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  required 
                  style={styles.formInput}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  required 
                  style={styles.formInput}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button type="submit" style={styles.formButton}>
                  Register
                </button>
              </form>
            )}
          </div>
          <div style={styles.tabBar}>
            <button
              style={activeTab === 'chat' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('chat')}
            >
              <span className="material-icons" style={styles.icon}>chat</span>
              Chat
            </button>
            <button
              style={activeTab === 'voice' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('voice')}
            >
              <span className="material-icons" style={styles.icon}>mic</span>
              Voice
            </button>
            <button
              style={activeTab === 'history' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('history')}
            >
              <span className="material-icons" style={styles.icon}>history</span>
              History
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '600px',
    height: '700px',
    backgroundColor: '#FFF',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    fontFamily: 'Inter, sans-serif',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '20px'
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(135deg, #5e3977, #7a4a93)',
    borderRadius: '12px 12px 0 0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  avatarContainer: {
    position: 'relative',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.4)'
    }
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  statusIndicator: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '12px',
    height: '12px',
    backgroundColor: '#28a745',
    borderRadius: '50%',
    border: '2px solid #FFF',
    animation: 'pulse 1.5s infinite'
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)' }
  },
  agentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  agentName: {
    margin: '0',
    fontSize: '18px',
    color: '#FFF',
    fontWeight: '600',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  },
  agentDescription: {
    margin: '0',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  },
  tabBar: {
    display: 'flex',
    backgroundColor: '#EFE8FA',
    borderRadius: '0 0 12px 12px',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)'
  },
  tab: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#0a1551',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      color: '#0a1551'
    }
  },
  activeTab: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#0a1551',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      height: '2px',
      backgroundColor: '#5e3977',
      transform: 'scaleX(1)',
      transition: 'transform 0.3s ease'
    }
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  chatWindow: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    backgroundColor: '#FFF',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  inputContainer: {
    display: 'flex',
    gap: '12px',
    padding: '24px',
  },
  input: {
    flex: 1,
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #EFE8FA',
    fontSize: '16px',
    backgroundColor: '#EFE8FA',
    color: '#0a1551'
  },
  button: {
    padding: '16px 24px',
    backgroundColor: '#5e3977',
    color: '#FFF',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#4a2c5d'
    }
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    border: 'none',
    borderRadius: '50%',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#5e3977',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#FFF',
      transform: 'scale(1.1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    }
  },
  registrationForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '24px',
  },
  formInput: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #EFE8FA',
    fontSize: '14px',
    backgroundColor: '#EFE8FA',
    color: '#0a1551'
  },
  formButton: {
    padding: '12px 24px',
    backgroundColor: '#5e3977',
    color: '#FFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#4a2c5d'
    }
  },
  response: {
    padding: '16px',
    marginBottom: '16px',
    background: 'linear-gradient(135deg, #caa5ed, #adc0f9)',
    borderRadius: '12px',
    color: '#0a1551',
    fontSize: '16px',
    maxWidth: '80%',
    alignSelf: 'flex-start'
  },
  inputMessage: {
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: '#5e3977',
    color: '#fff',
    borderRadius: '12px',
    textAlign: 'right',
    fontSize: '16px',
    maxWidth: '80%',
    alignSelf: 'flex-end'
  },
  icon: {
    marginRight: '0',
    fontSize: '20px',
    verticalAlign: 'middle'
  },
  voiceTabContent: {
    padding: '24px',
    textAlign: 'center'
  },
  floatingButton: {
    position: 'fixed',
    bottom: '32px',
    right: '32px',
    width: '64px',
    height: '64px',
    backgroundColor: 'transparent',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.4)'
    },
    '&:active': {
      transform: 'scale(0.95)'
    }
  },
  floatingAvatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%'
  }
};

export default ChatClient;