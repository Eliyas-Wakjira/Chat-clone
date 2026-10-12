import { useState } from 'react';
import { ChevronDown, LogIn, UserPlus, Settings, User, LogOut } from 'lucide-react';
import AuthModal from '../AuthModal/AuthModal';
import styles from './ChatHeader.module.css';

export default function ChatHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });

  const readUser = () => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };
  const [user, setUser] = useState(readUser);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span>ChatGPT</span>
        <ChevronDown size={16} />
      </div>

      <div className={styles.right}>
        <div className={styles.profileContainer}>
          <button className={styles.avatarBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {user ? (user.name ? user.name.charAt(0).toUpperCase() : <User size={18} color="white" />) : <User size={18} color="white" />}
          </button>

          {isMenuOpen && (
            <div className={styles.dropdown}>
              {user ? (
                <>
                  <div className={styles.dropdownHeader}>{user.email || 'User'}</div>
                  <div className={styles.divider} />
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button className={styles.dropdownItem} onClick={() => { setAuthModal({ open: true, mode: 'login' }); setIsMenuOpen(false); }}>
                    <LogIn size={16} /> Log in
                  </button>
                  <button className={styles.dropdownItem} onClick={() => { setAuthModal({ open: true, mode: 'signup' }); setIsMenuOpen(false); }}>
                    <UserPlus size={16} /> Sign up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={authModal.open} 
        initialMode={authModal.mode} 
        onClose={() => setAuthModal({ ...authModal, open: false })}
        onAuthSuccess={(userData) => setUser(userData)}
      />
    </header>
  );
}