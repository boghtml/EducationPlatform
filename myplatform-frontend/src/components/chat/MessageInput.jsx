// src/components/chat/MessageInput.jsx

import React, { useState, useEffect } from 'react';
import { Paperclip, Send, X, Image, FileText, Film, Music, File, Upload } from 'lucide-react';
import './ChatStyles.css';

const MessageInput = ({ sendMessage, uploadAttachment, courseId, fileInputRef }) => {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [showFileUploadZone, setShowFileUploadZone] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
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
      alert('Не вдалося відправити повідомлення. Спробуйте ще раз.');
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
    
    // Ховаємо зону завантаження файлів
    setShowFileUploadZone(false);
  };
  
  // Обробник видалення файлу зі списку очікуваних вкладень
  const handleRemoveAttachment = (index) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Обробники для drag-and-drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setPendingAttachments(prev => [...prev, ...files]);
    }
  };
  
  // Функція для переключення режиму завантаження файлів
  const toggleFileUploadZone = () => {
    setShowFileUploadZone(!showFileUploadZone);
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
    
    // Зображення
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return <Image size={20} />;
    }
    
    // Документи
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
      return <FileText size={20} />;
    }
    
    // Відео
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(extension)) {
      return <Film size={20} />;
    }
    
    // Аудіо
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(extension)) {
      return <Music size={20} />;
    }
    
    // Інші типи файлів
    return <File size={20} />;
  };

  // Перевірка, чи можна відправити повідомлення
  const canSendMessage = (content.trim().length > 0 || pendingAttachments.length > 0) && !isUploading;
  
  return (
    <div className="message-input-container">
      {/* Зона для завантаження файлів через drag-and-drop */}
      {showFileUploadZone && (
        <div 
          className={`file-upload-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="file-upload-icon">
            <Upload size={36} />
          </div>
          <p className="file-upload-text">
            Перетягніть файли сюди або натисніть, щоб обрати
          </p>
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
            className="file-upload-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Paperclip size={18} /> Обрати файли
          </button>
        </div>
      )}
      
      {/* Відображення списку обраних файлів */}
      {pendingAttachments.length > 0 && (
        <div className="attachments-preview">
          <div className="attachments-preview-header">
            <h4>Вкладення ({pendingAttachments.length})</h4>
            <button
              className="attachment-clear-all-btn"
              onClick={() => setPendingAttachments([])}
              disabled={isUploading}
            >
              Очистити все
            </button>
          </div>
          
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
                  {!isFileSizeValid(file) && <span className="size-limit-warning"> (перевищення ліміту в 15 MB)</span>}
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
            <button
              type="button"
              className={`attachment-button ${isDragOver ? 'drag-over' : ''}`}
              onClick={toggleFileUploadZone}
              disabled={isUploading}
              title="Додати вкладення"
            >
              <Paperclip size={20} />
            </button>
            
            <button
              type="submit"
              className="send-button"
              disabled={!canSendMessage}
              title="Відправити повідомлення"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </form>
      
      {/* Індикатор завантаження */}
      {isUploading && (
        <div className="uploading-indicator">
          <div className="uploading-spinner"></div>
          <span>Завантаження файлів... Зачекайте, будь ласка.</span>
        </div>
      )}
    </div>
  );
};

export default MessageInput;