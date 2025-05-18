// src/components/chat/MessageInput.jsx

import React, { useState, useRef } from 'react';
import { Paperclip, Send, X } from 'lucide-react';
import './ChatStyles.css';

const MessageInput = ({ sendMessage, uploadAttachment, courseId }) => {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const fileInputRef = useRef(null);
  
  // Обробник відправки повідомлення
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && pendingAttachments.length === 0) {
      return;
    }
    
    try {
      // Відправка повідомлення
      const message = await sendMessage(content.trim());
      
      // Додавання вкладень до повідомлення
      if (message && pendingAttachments.length > 0) {
        setIsUploading(true);
        
        for (const file of pendingAttachments) {
          await uploadAttachment(message.id, file);
        }
      }
      
      // Очищення форми
      setContent('');
      setPendingAttachments([]);
      setIsUploading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsUploading(false);
    }
  };
  
  // Обробник натискання клавіш
  const handleKeyDown = (e) => {
    // Відправка повідомлення при натисканні Ctrl+Enter або Enter
    if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Обробник вибору файлу
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Додаємо файли до списку очікуваних вкладень
    setPendingAttachments(prev => [...prev, ...files]);
    
    // Очищаємо input для можливості повторного вибору того ж файлу
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Обробник видалення файлу зі списку очікуваних вкладень
  const handleRemoveAttachment = (index) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Максимальний розмір файлу в байтах (15 МБ)
  const MAX_FILE_SIZE = 15 * 1024 * 1024;
  
  // Перевірка розміру файлу
  const isFileSizeValid = (file) => {
    return file.size <= MAX_FILE_SIZE;
  };
  
  // Форматування розміру файлу
  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  
  // Визначення іконки для типу файлу
  const getFileTypeIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const iconMap = {
      'pdf': '📄',
      'doc': '📄', 'docx': '📄',
      'xls': '📊', 'xlsx': '📊',
      'ppt': '📊', 'pptx': '📊',
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
      'mp4': '🎬', 'avi': '🎬', 'mov': '🎬',
      'mp3': '🎵', 'wav': '🎵',
      'zip': '📦', 'rar': '📦'
    };
    
    return iconMap[extension] || '📎';
  };

  return (
    <div className="message-input-container">
      {/* Відображення списку обраних файлів */}
      {pendingAttachments.length > 0 && (
        <div className="attachments-preview">
          {pendingAttachments.map((file, index) => (
            <div 
              key={index} 
              className={`attachment-preview-item ${!isFileSizeValid(file) ? 'invalid-size' : ''}`}
            >
              <div className="attachment-preview-icon">
                {getFileTypeIcon(file.name)}
              </div>
              <div className="attachment-preview-info">
                <span className="attachment-preview-name">{file.name}</span>
                <span className="attachment-preview-size">
                  {formatFileSize(file.size)}
                  {!isFileSizeValid(file) && <span className="size-limit-warning"> (перевищення ліміту)</span>}
                </span>
              </div>
              <button
                className="attachment-remove-btn"
                onClick={() => handleRemoveAttachment(index)}
                disabled={isUploading}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Форма введення повідомлення */}
      <form className="message-form" onSubmit={handleSubmit}>
        <textarea
          className="message-input"
          placeholder="Введіть повідомлення..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isUploading}
        />
        
        <div className="message-input-actions">
          <div className="message-input-hints">
            Enter для відправки, Shift+Enter для нового рядка
          </div>
          
          <div className="message-input-buttons">
            <input
              type="file"
              id="attachment-input"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              multiple
              disabled={isUploading}
            />
            
            <button
              type="button"
              className="attachment-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Paperclip size={18} />
            </button>
            
            <button
              type="submit"
              className="send-button"
              disabled={(!content.trim() && pendingAttachments.length === 0) || isUploading}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </form>
      
      {/* Індикатор завантаження */}
      {isUploading && (
        <div className="uploading-indicator">
          <div className="uploading-spinner"></div>
          <span>Завантаження файлів...</span>
        </div>
      )}
    </div>
  );
};

export default MessageInput;