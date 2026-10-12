import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  SquarePen, Search, Image as ImageIcon, LayoutGrid, 
  Compass, Code, Folder, Mic, Send 
} from 'lucide-react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // App yeroo jalqabu history DB irraa dubbisuu
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:3888/api/chat/history');
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userPrompt = input;
    const userMessage = { role: 'user', content: userPrompt };

    // UI irratti battalatti ergaa user agarsiisuu
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3888/api/chat/ask', {
        prompt: userPrompt,
      });

      if (res.data.success) {
        const aiMessage = { role: 'assistant', content: res.data.message };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert(err.response?.data?.error || 'Failed to generate response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <button className="new-chat-btn">
            <SquarePen size={18} />
            <span>New chat</span>
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
      </aside>

      {/* Main Chat Content Area */}
      <main className="main-content">
        <header className="chat-header">
          <h2>ChatGPT</h2>
        </header>

        <div className="chat-messages">
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
                <div className="message-content">{msg.content}</div>
              </div>
            ))
          )}
          {loading && (
            <div className="message-bubble assistant loading">
              <strong>ChatGPT:</strong>
              <p>Thinking...</p>
            </div>
          )}
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
              <button type="button" className="icon-btn"><Mic size={18} /></button>
              <button type="submit" disabled={loading} className="send-btn">
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;