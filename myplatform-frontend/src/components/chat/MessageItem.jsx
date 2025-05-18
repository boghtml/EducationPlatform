// src/components/chat/MessageItem.jsx

import React, { useState } from 'react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import uk from 'date-fns/locale/uk';
import { Edit, Trash2, MessageSquare, ThumbsUp, Heart, Smile, Pin, MoreHorizontal } from 'lucide-react';
import MessageAttachments from './MessageAttachments';
import ReactionDisplay from './ReactionDisplay';
import './ChatStyles.css';

const MessageItem = ({ 
  message, 
  isCurrentUser,
  canModerate,
  isReply = false,
  onReply,
  onEdit,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  onPin,
  onToggleThread,
  showReplies = false,
  isThreadExpanded = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  
  // Визначення, чи може користувач редагувати це повідомлення
  const canEdit = isCurrentUser;
  // Визначення, чи може користувач видаляти це повідомлення
  const canDelete = isCurrentUser || canModerate;
  // Визначення, чи може користувач закріплювати це повідомлення
  const canPin = canModerate && onPin && !isReply;
  
  // Форматування дати
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
  
  // Обробник для початку редагування повідомлення
  const handleEditClick = () => {
    setIsEditing(true);
    setEditedContent(message.content);
  };
  
  // Обробник для збереження змін при редагуванні
  const handleSaveEdit = () => {
    if (editedContent.trim()) {
      onEdit(editedContent);
      setIsEditing(false);
    }
  };
  
  // Обробник для скасування редагування
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };
  
  // Обробник для відповіді на повідомлення
  const handleReplyClick = () => {
    if (onReply) {
      onReply();
    }
  };
  
  // Обробник для додавання реакції
  const handleAddReaction = (type) => {
    onAddReaction(type);
    setShowReactions(false);
  };
  
  // Перевірка, чи встановив поточний користувач певну реакцію
  const hasUserReaction = (type) => {
    return message.reactions?.some(
      reaction => reaction.user.id === parseInt(sessionStorage.getItem('userId')) && 
                 reaction.reaction_type === type
    );
  };
  
  // Отримання заголовка для кнопки розгорнути/згорнути відповіді
  const getToggleRepliesButtonText = () => {
    if (isThreadExpanded) {
      return 'Сховати відповіді';
    }
    return `${message.reply_count} ${getWordForm(message.reply_count, 'відповідь', 'відповіді', 'відповідей')}`;
  };
  
  // Вибір правильної форми слова залежно від кількості
  const getWordForm = (count, form1, form2, form5) => {
    let n = Math.abs(count) % 100;
    if (n >= 5 && n <= 20) {
      return form5;
    }
    n %= 10;
    if (n === 1) {
      return form1;
    }
    if (n >= 2 && n <= 4) {
      return form2;
    }
    return form5;
  };

  // Реакції для швидкого додавання
  const quickReactions = [
    { type: 'like', icon: <ThumbsUp size={18} /> },
    { type: 'heart', icon: <Heart size={18} /> },
    { type: 'smile', icon: <Smile size={18} /> }
  ];

  return (
    <div className={`message-item ${isReply ? 'message-reply' : ''} ${isCurrentUser ? 'message-own' : ''}`}>
      <div className="message-avatar">
        <img 
          src={message.user.profile_image_url || 'https://via.placeholder.com/40'} 
          alt={message.user.username} 
          className="avatar-img"
        />
      </div>
      
      <div className="message-content">
        <div className="message-header">
          <div className="message-user-info">
            <span className="message-username">{message.user.first_name} {message.user.last_name}</span>
            <span className="message-time">{formatDate(message.created_at)}</span>
            {message.is_edited && <span className="message-edited">(редаговано)</span>}
            {message.is_pinned && <Pin size={14} className="message-pinned-icon" />}
          </div>
          
          <div className="message-actions">
            <button 
              className="message-more-btn" 
              onClick={() => setShowActions(!showActions)}
              aria-label="Показати дії"
            >
              <MoreHorizontal size={16} />
            </button>
            
            {showActions && (
              <div className="message-actions-dropdown">
                {!isReply && onReply && (
                  <button 
                    className="action-btn" 
                    onClick={handleReplyClick}
                  >
                    <MessageSquare size={16} /> Відповісти
                  </button>
                )}
                
                {canEdit && (
                  <button 
                    className="action-btn" 
                    onClick={handleEditClick}
                  >
                    <Edit size={16} /> Редагувати
                  </button>
                )}
                
                {canDelete && (
                  <button 
                    className="action-btn action-delete" 
                    onClick={onDelete}
                  >
                    <Trash2 size={16} /> Видалити
                  </button>
                )}
                
                {canPin && (
                  <button 
                    className="action-btn" 
                    onClick={onPin}
                  >
                    <Pin size={16} /> {message.is_pinned ? 'Відкріпити' : 'Закріпити'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="message-body">
          {isEditing ? (
            <div className="message-edit-form">
              <textarea
                className="message-edit-input"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                autoFocus
              />
              <div className="message-edit-actions">
                <button 
                  className="message-edit-cancel" 
                  onClick={handleCancelEdit}
                >
                  Скасувати
                </button>
                <button 
                  className="message-edit-save" 
                  onClick={handleSaveEdit}
                >
                  Зберегти
                </button>
              </div>
            </div>
          ) : (
            <div className="message-text">{message.content}</div>
          )}
          
          {/* Вкладення до повідомлення */}
          {message.attachments && message.attachments.length > 0 && (
            <MessageAttachments attachments={message.attachments} />
          )}
        </div>
        
        {/* Відображення реакцій на повідомлення */}
        {message.reactions && message.reactions.length > 0 && (
          <ReactionDisplay 
            reactions={message.reactions} 
            onRemoveReaction={onRemoveReaction} 
            currentUserId={sessionStorage.getItem('userId')}
          />
        )}
        
        <div className="message-footer">
          {/* Кнопки швидких реакцій */}
          <div className="message-reactions-buttons">
            {quickReactions.map(reaction => (
              <button 
                key={reaction.type}
                className={`reaction-btn ${hasUserReaction(reaction.type) ? 'active' : ''}`} 
                onClick={() => hasUserReaction(reaction.type) 
                  ? onRemoveReaction(reaction.type) 
                  : handleAddReaction(reaction.type)
                }
              >
                {reaction.icon}
              </button>
            ))}
            <button 
              className="reaction-btn reaction-more" 
              onClick={() => setShowReactions(!showReactions)}
            >
              <Smile size={18} />
            </button>
            
            {/* Меню з більшою кількістю реакцій */}
            {showReactions && (
              <div className="reactions-dropdown">
                <div className="reactions-grid">
                  {['thumbsup', 'heart', 'smile', 'tada', 'thinking', 'clap', 'fire', 'eyes', 'rocket'].map(type => (
                    <button 
                      key={type} 
                      className={`reaction-emoji-btn ${hasUserReaction(type) ? 'active' : ''}`}
                      onClick={() => handleAddReaction(type)}
                    >
                      {getEmojiByType(type)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Кнопка для розгортання відповідей */}
          {showReplies && message.reply_count > 0 && (
            <button 
              className="toggle-replies-btn"
              onClick={onToggleThread}
            >
              <MessageSquare size={16} />
              <span>{getToggleRepliesButtonText()}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Функція для отримання emoji за типом реакції
const getEmojiByType = (type) => {
  const emojiMap = {
    'thumbsup': '👍',
    'heart': '❤️',
    'smile': '😊',
    'tada': '🎉',
    'thinking': '🤔',
    'clap': '👏',
    'fire': '🔥',
    'eyes': '👀',
    'rocket': '🚀'
  };
  
  return emojiMap[type] || '👍';
};

export default MessageItem;