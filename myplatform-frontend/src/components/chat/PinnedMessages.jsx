// src/components/chat/PinnedMessages.jsx

import React from 'react';
import { Pin, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import uk from 'date-fns/locale/uk';
import './ChatStyles.css';

const PinnedMessages = ({ pinnedMessages, unpinMessage }) => {
  if (!pinnedMessages || pinnedMessages.length === 0) {
    return null;
  }
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: uk 
      });
    } catch (error) {
      return 'невідомо коли';
    }
  };
  
  const handleUnpin = (messageId) => {
    if (unpinMessage) {
      unpinMessage(messageId);
    }
  };

  return (
    <div className="pinned-messages-container">
      <div className="pinned-messages-header">
        <h3 className="pinned-messages-title">
          <Pin size={16} /> Закріплені повідомлення
        </h3>
      </div>
      
      <div className="pinned-messages-list">
        {pinnedMessages.map((pinned) => (
          <div key={pinned.id} className="pinned-message-item">
            <div className="pinned-message-info">
              <div className="pinned-message-header">
                <span className="pinned-message-author">
                  {pinned.message.user.first_name} {pinned.message.user.last_name}
                </span>
                <span className="pinned-message-date">
                  {formatDate(pinned.message.created_at)}
                </span>
              </div>
              
              <div className="pinned-message-content">
                {pinned.message.content}
              </div>
              
              <div className="pinned-message-meta">
                <span className="pinned-by">
                  Закріплено користувачем {pinned.pinned_by.first_name} {pinned.pinned_by.last_name}
                </span>
                <span className="pinned-time">
                  {formatDate(pinned.pinned_at)}
                </span>
              </div>
            </div>
            
            {unpinMessage && (
              <div className="pinned-message-actions">
                <button 
                  className="unpin-button"
                  onClick={() => handleUnpin(pinned.message.id)}
                  title="Відкріпити повідомлення"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedMessages;