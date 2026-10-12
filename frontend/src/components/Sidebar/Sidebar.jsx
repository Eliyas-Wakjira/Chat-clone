import {
  MessageSquare,
  Search,
  Image as ImageIcon,
  LayoutGrid,
  Microscope,
  Code2,
  FolderKanban,
  PanelLeftClose,
} from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar({ onNewChat }) {
  const handleNewChat = (e) => {
    e.preventDefault();
    if (onNewChat) {
      onNewChat();
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.iconBtn}>
            <PanelLeftClose size={20} />
          </div>
        </div>
        <button className={styles.iconBtn} onClick={handleNewChat} title="New Chat">
          <MessageSquare size={20} />
        </button>
      </div>

      <nav className={styles.nav}>
        <a href='#' className={styles.item} onClick={handleNewChat}>
          <MessageSquare size={18} />
          <span>New chat</span>
        </a>
        <a href='#' className={styles.item} onClick={(e) => e.preventDefault()}>
          <Search size={18} />
          <span>Search chats</span>
        </a>
        <a href='#' className={styles.item} onClick={(e) => e.preventDefault()}>
          <ImageIcon size={18} />
          <span>Images</span>
        </a>
        <a href='#' className={styles.item} onClick={(e) => e.preventDefault()}>
          <LayoutGrid size={18} />
          <span>Apps</span>
        </a>
        <a href='#' className={styles.item} onClick={(e) => e.preventDefault()}>
          <Microscope size={18} />
          <span>Deep research</span>
        </a>
        <a href='#' className={styles.item} onClick={(e) => e.preventDefault()}>
          <Code2 size={18} />
          <span>Codex</span>
        </a>
        <a href='#' className={styles.item} onClick={(e) => e.preventDefault()}>
          <FolderKanban size={18} />
          <span>Projects</span>
        </a>
      </nav>
    </aside>
  );
}