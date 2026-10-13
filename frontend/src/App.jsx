import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  SquarePen,
  Search,
  Image as ImageIcon,
  LayoutGrid,
  Compass,
  Code,
  Folder,
  Mic,
  Send,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  User,
} from 'lucide-react';
import AuthModal from './components/AuthModal/AuthModal';
import API from './axios';
import './App.css';

function readStoredUser() {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function getApiErrorMessage(err, fallback) {
  if (typeof err.response?.data?.error === 'string') {
    return err.response.data.error;
  }
  if (err.response) {
    return `${fallback} (API returned HTTP ${err.response.status}).`;
  }
  if (err.request) {
    return 'Could not reach the chat server. Check that the API is running and try again.';
  }
  return err.message || fallback;
}

function App() {
  const [messages, setMessages] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [historyError, setHistoryError] = useState('');
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(readStoredUser);
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationId, setConversationId] = useState(() => {
    const existingId = localStorage.getItem('conversationId');
    if (existingId) return existingId;
    const newId = crypto.randomUUID();
    localStorage.setItem('conversationId', newId);
    return newId;
  });

  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    let isCurrent = true;
    API.get('/chat/history', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params: {
        conversationId,
        ...(user?.id ? { userId: user.id } : {}),
      },
    })
      .then((res) => {
        if (isCurrent && res.data.success) {
          setMessages(res.data.messages);
        }
      })
      .catch((err) => {
        console.error('Error fetching history:', err);
        if (isCurrent) {
          setError(getApiErrorMessage(err, 'Could not load chat history.'));
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [user?.id, conversationId, token]);

  useEffect(() => {
    let isCurrent = true;
    API.get('/chat/conversations', {
      params: user?.id ? { userId: user.id } : {},
    })
      .then((res) => {
        if (isCurrent && res.data.success) {
          setRecentConversations(res.data.conversations);
          setHistoryError('');
        }
      })
      .catch((err) => {
        console.error('Error fetching recent conversations:', err);
        if (isCurrent) {
          setHistoryError(getApiErrorMessage(err, 'Could not load recent chats.'));
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [user?.id, token, historyRefresh]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleNewChat = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem('conversationId', newId);
    setConversationId(newId);
    setMessages([]);
    setError('');
    setInput('');
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id) => {
    localStorage.setItem('conversationId', id);
    setConversationId(id);
    setError('');
    setSidebarOpen(false);
  };

  const openAuth = (mode) => {
    setAuthModal({ open: true, mode });
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMessages([]);
    handleNewChat();
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData || readStoredUser());
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userPrompt = input;
    const userMessage = { role: 'user', content: userPrompt };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const res = await API.post(
        '/chat/ask',
        {
          prompt: userPrompt,
          userId: user?.id || null,
          conversationId,
          history: messages.slice(-20).map(({ role, content }) => ({ role, content })),
        },
        { headers: authHeaders }
      );

      if (res.data.success) {
        const aiMessage = { role: 'assistant', content: res.data.message };
        setMessages((prev) => [...prev, aiMessage]);
        setHistoryRefresh((refresh) => refresh + 1);
      } else {
        setError(res.data.error || 'The chat server could not generate a response.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(getApiErrorMessage(err, 'Failed to generate a response. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <button className="new-chat-btn" onClick={handleNewChat}>
            <SquarePen size={18} />
            <span>New chat</span>
          </button>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item"><Search size={18} /><span>Search chats</span></div>
          <div className="nav-item"><ImageIcon size={18} /><span>Images</span></div>
          <div className="nav-item"><LayoutGrid size={18} /><span>Apps</span></div>
          <div className="nav-item"><Compass size={18} /><span>Deep research</span></div>
          <div className="nav-item"><Code size={18} /><span>Codex</span></div>
          <div className="nav-item"><Folder size={18} /><span>Projects</span></div>
        </nav>

        <section className="recent-chats" aria-label="Recent chats">
          <h3>Recent chats</h3>
          {historyError ? (
            <p className="history-status" role="alert">{historyError}</p>
          ) : recentConversations.length ? (
            <div className="recent-chat-list">
              {recentConversations.map((conversation) => (
                <button
                  key={conversation.conversationId}
                  className={`recent-chat${conversation.conversationId === conversationId ? ' active' : ''}`}
                  onClick={() => handleSelectConversation(conversation.conversationId)}
                  title={conversation.title || 'New chat'}
                >
                  {conversation.title || 'New chat'}
                </button>
              ))}
            </div>
          ) : (
            <p className="history-status">Your recent chats will appear here.</p>
          )}
        </section>
      </aside>

      {/* Main Chat Content Area */}
      <main className="main-content">
        <header className="chat-header">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <h2>ChatGPT</h2>

          <div className="auth-area">
            {user ? (
              <>
                <div className="user-chip">
                  <span className="user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                  </span>
                  <span className="user-name">{user.name || user.email}</span>
                </div>
                <button className="auth-btn ghost" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button className="auth-btn ghost" onClick={() => openAuth('login')}>
                  <LogIn size={16} />
                  <span>Login</span>
                </button>
                <button className="auth-btn solid" onClick={() => openAuth('signup')}>
                  <UserPlus size={16} />
                  <span>Sign up</span>
                </button>
              </>
            )}
          </div>
        </header>

        <div className="chat-messages">
          {error && <div className="chat-error" role="alert">{error}</div>}
          {messages.length === 0 ? (
            <div className="empty-state">
              <h1>What's on your mind today?</h1>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`message-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className="message-header">
                  <strong>{msg.role === 'user' ? 'You:' : 'ChatGPT:'}</strong>
                </div>
                <div className="message-content">
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown>{msg.content || ''}</ReactMarkdown>
                  ) : msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="message-bubble assistant loading">
              <strong>ChatGPT:</strong>
              <p>Thinking...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Box */}
        <div className="input-container">
          <form onSubmit={handleSendMessage} className="input-box">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
            />
            <div className="input-actions">
              <button type="button" className="icon-btn" aria-label="Voice input">
                <Mic size={18} />
              </button>
              <button type="submit" disabled={loading} className="send-btn" aria-label="Send">
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </main>

      <AuthModal
        isOpen={authModal.open}
        initialMode={authModal.mode}
        onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
