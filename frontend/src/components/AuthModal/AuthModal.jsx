import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosInstance from '../../axios';

export default function AuthModal({
  isOpen,
  initialMode = 'login',
  onClose,
  onAuthSuccess,
}) {
  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal yeroo banamu mode (login/signup) sirriitti jijjiiruu
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode !== 'signup');
      setError('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
      } else {
        setError('Server token hin deebisne. Maaloo irra deebi\'ii yaali.');
      }
    } catch (err) {
      console.error('Auth Error Response:', err.response?.data);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Authentication failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2>{isLogin ? 'Login' : 'Register'}</h2>

        {error && <p className="modal-error">{error}</p>}

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
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p
          className="modal-toggle"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
        >
          {isLogin
            ? "Account hin qabduu? Register godhi"
            : 'Account qabdaa? Login godhi'}
        </p>
      </div>
    </div>
  );
}
