import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './ChatMessage.module.css';

export default function ChatMessage({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`${styles.messageWrapper} ${isUser ? styles.userRow : styles.assistantRow}`}>
      <div className={`${styles.messageContent} ${isUser ? styles.userBubble : styles.assistantText}`}>
        {isUser ? (
          content
        ) : (
          <ReactMarkdown>{content || ''}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}