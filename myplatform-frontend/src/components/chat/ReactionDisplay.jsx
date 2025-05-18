// src/components/chat/ReactionDisplay.jsx

import React from 'react';
import './ChatStyles.css';

const ReactionDisplay = ({ reactions, onRemoveReaction, currentUserId }) => {
  if (!reactions || reactions.length === 0) {
    return null;
  }
  
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.reaction_type]) {
      acc[reaction.reaction_type] = [];
    }
    acc[reaction.reaction_type].push(reaction);
    return acc;
  }, {});
  
  const hasUserReacted = (reactions) => {
    return reactions.some(reaction => 
      reaction.user.id === parseInt(currentUserId)
    );
  };
  
  
  const getEmojiByType = (type) => {
    const emojiMap = {
      'thumbsup': '👍',
      'like': '👍',
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
  
  const handleRemoveReaction = (type) => {
    if (onRemoveReaction) {
      onRemoveReaction(type);
    }
  };

  return (
    <div className="reactions-display">
      {Object.entries(groupedReactions).map(([type, typeReactions]) => (
        <button 
          key={type}
          className={`reaction-bubble ${hasUserReacted(typeReactions) ? 'user-reacted' : ''}`}
          onClick={() => hasUserReacted(typeReactions) && handleRemoveReaction(type)}
          title={typeReactions.map(r => `${r.user.first_name} ${r.user.last_name}`).join(', ')}
        >
          <span className="reaction-emoji">{getEmojiByType(type)}</span>
          <span className="reaction-count">{typeReactions.length}</span>
        </button>
      ))}
    </div>
  );
};

export default ReactionDisplay;