// src/components/chat/MessageAttachments.jsx

import React from 'react';
import { File, Download, ExternalLink } from 'lucide-react';
import './ChatStyles.css';

const MessageAttachments = ({ attachments }) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }
  
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
  
  // Перевірка, чи файл є зображенням
  const isImage = (attachment) => {
    if (attachment.file_type === 'image') return true;
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const filename = attachment.file_name.toLowerCase();
    
    return imageExtensions.some(ext => filename.endsWith(ext));
  };
  
  // Перевірка, чи файл є PDF
  const isPDF = (attachment) => {
    return attachment.file_type === 'pdf' || attachment.file_name.toLowerCase().endsWith('.pdf');
  };
  
  // Отримання іконки для типу файлу
  const getFileIcon = (attachment) => {
    if (isImage(attachment)) return '🖼️';
    if (isPDF(attachment)) return '📄';
    
    const extension = attachment.file_name.split('.').pop().toLowerCase();
    
    const iconMap = {
      'doc': '📄', 'docx': '📄',
      'xls': '📊', 'xlsx': '📊',
      'ppt': '📊', 'pptx': '📊',
      'mp4': '🎬', 'avi': '🎬', 'mov': '🎬',
      'mp3': '🎵', 'wav': '🎵',
      'zip': '📦', 'rar': '📦',
      'txt': '📝',
    };
    
    return iconMap[extension] || '📎';
  };

  return (
    <div className="message-attachments">
      {attachments.map((attachment, index) => (
        <div key={index} className="attachment-item">
          {isImage(attachment) ? (
            <div className="attachment-image-container">
              <img 
                src={attachment.file_url} 
                alt={attachment.file_name} 
                className="attachment-image"
                onClick={() => window.open(attachment.file_url, '_blank')}
              />
            </div>
          ) : isPDF(attachment) ? (
            <div className="attachment-pdf-preview">
              <div className="pdf-icon">{getFileIcon(attachment)}</div>
              <div className="pdf-info">
                <span className="pdf-name">{attachment.file_name}</span>
                <span className="pdf-size">{formatFileSize(attachment.file_size)}</span>
              </div>
              <div className="pdf-actions">
                <a 
                  href={attachment.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="pdf-view-link"
                >
                  <ExternalLink size={16} />
                  Переглянути
                </a>
                <a 
                  href={attachment.file_url} 
                  download={attachment.file_name}
                  className="pdf-download-link"
                >
                  <Download size={16} />
                  Завантажити
                </a>
              </div>
            </div>
          ) : (
            <div className="attachment-file">
              <div className="file-icon">{getFileIcon(attachment)}</div>
              <div className="file-info">
                <span className="file-name">{attachment.file_name}</span>
                <span className="file-size">{formatFileSize(attachment.file_size)}</span>
              </div>
              <a 
                href={attachment.file_url} 
                download={attachment.file_name}
                className="file-download-link"
              >
                <Download size={16} />
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageAttachments;