import React, { useState } from 'react';
import axiosInstance from '../../axios';

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin
      ? { email: email.trim(), password: password.trim() }
      : { username: username.trim(), email: email.trim(), password: password.trim() };

    try {
      const response = await axiosInstance.post(endpoint, payload);

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        if (onAuthSuccess) onAuthSuccess(response.data.user || null);
        if (onClose) onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error('Auth Error Response:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>

        {error && <p style={{ color: '#ff4d4d', marginBottom: '10px' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isLogin ? 'Sign In' : 'Sign Up'}</button>
        </form>

        <p
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          style={{ cursor: 'pointer', marginTop: '12px' }}
        >
          {isLogin ? "Account hin qabduu? Register godhi" : 'Account qabdaa? Login godhi'}
        </p>
      </div>
    </div>
  );
}