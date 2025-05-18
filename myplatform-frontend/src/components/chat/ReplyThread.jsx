// src/components/chat/ReplyThread.jsx

import React, { useState } from 'react';
import { ArrowUp, X } from 'lucide-react';
import './ChatStyles.css';

const ReplyThread = ({ parentMessage, onReply, onCancel }) => {
  const [replyContent, setReplyContent] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      return;
    }
    
    onReply(replyContent.trim());
    setReplyContent('');
  };
  
  const handleKeyDown = (e) => {
    
    if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
    
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="reply-thread">
      <div className="reply-to-info">
        <div className="reply-parent-message">
          <span className="reply-to-label">
            Відповідь на повідомлення від <strong>{parentMessage.user.first_name} {parentMessage.user.last_name}</strong>:
          </span>
          <span className="reply-parent-content">{parentMessage.content.substring(0, 50)}{parentMessage.content.length > 50 ? '...' : ''}</span>
        </div>
        <button className="reply-cancel-btn" onClick={onCancel}>
          <X size={16} />
        </button>
      </div>
      
      <form className="reply-form" onSubmit={handleSubmit}>
        <textarea
          className="reply-input"
          placeholder="Напишіть вашу відповідь..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        
        <div className="reply-actions">
          <button type="button" className="reply-cancel-button" onClick={onCancel}>
            Скасувати
          </button>
          <button 
            type="submit" 
            className="reply-submit-button"
            disabled={!replyContent.trim()}
          >
            <ArrowUp size={16} />
            Відповісти
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReplyThread;