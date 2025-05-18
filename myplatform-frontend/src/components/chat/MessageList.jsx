// src/components/chat/MessageList.jsx

import React, { useState } from 'react';
import MessageItem from './MessageItem';
import ReplyThread from './ReplyThread';
import './ChatStyles.css';

const MessageList = ({ 
  messages, 
  currentUserId, 
  currentUserRole,
  replyToMessage, 
  editMessage, 
  deleteMessage,
  addReaction,
  removeReaction,
  pinMessage,
  messagesEndRef
}) => {
  const [expandedThreads, setExpandedThreads] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  
  const toggleThread = (messageId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };
  
  const handleReply = (messageId) => {
    setReplyingTo(messageId);
  };
  
  const handleReplyComplete = () => {
    setReplyingTo(null);
  };
  
  const handleReplyCancel = () => {
    setReplyingTo(null);
  };

  if (messages.length === 0) {
    return (
      <div className="chat-no-messages">
        <p>Немає повідомлень у цьому чаті. Будьте першим, хто напише!</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map(message => (
        <div key={message.id} className="message-thread-wrapper">
          <MessageItem
            message={message}
            isCurrentUser={message.user.id === parseInt(currentUserId)}
            canModerate={currentUserRole === 'teacher' || currentUserRole === 'admin'}
            onReply={() => handleReply(message.id)}
            onEdit={(content) => editMessage(message.id, content)}
            onDelete={() => deleteMessage(message.id)}
            onAddReaction={(type) => addReaction(message.id, type)}
            onRemoveReaction={(type) => removeReaction(message.id, type)}
            onPin={() => pinMessage && pinMessage(message.id)}
            onToggleThread={() => toggleThread(message.id)}
            showReplies={message.reply_count > 0}
            isThreadExpanded={expandedThreads[message.id]}
          />
          
          {/* Відображаємо форму для відповіді, якщо користувач відповідає на це повідомлення */}
          {replyingTo === message.id && (
            <ReplyThread
              parentMessage={message}
              onReply={(content) => {
                replyToMessage(message.id, content);
                handleReplyComplete();
              }}
              onCancel={handleReplyCancel}
            />
          )}
          
          {/* Відображаємо розгорнутий тред відповідей */}
          {expandedThreads[message.id] && message.replies && message.replies.length > 0 && (
            <div className="message-replies">
              {message.replies.map(reply => (
                <MessageItem
                  key={reply.id}
                  message={reply}
                  isReply={true}
                  isCurrentUser={reply.user.id === parseInt(currentUserId)}
                  canModerate={currentUserRole === 'teacher' || currentUserRole === 'admin'}
                  onEdit={(content) => editMessage(reply.id, content)}
                  onDelete={() => deleteMessage(reply.id)}
                  onAddReaction={(type) => addReaction(reply.id, type)}
                  onRemoveReaction={(type) => removeReaction(reply.id, type)}
                />
              ))}
              
              {message.reply_count > message.replies.length && (
                <div className="load-more-replies">
                  <button className="load-more-button">
                    Завантажити більше відповідей ({message.reply_count - message.replies.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;