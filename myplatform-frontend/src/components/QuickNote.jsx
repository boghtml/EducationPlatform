import React, { useState } from 'react';
import axios from 'axios';
import { X, Save, RefreshCw, AlertTriangle, Check } from 'lucide-react';
import API_URL from '../api';
import '../css/QuickNote.css';

const QuickNote = ({ lessonId, onClose, onSaved }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      if (response.data && response.data.csrftoken) {
        axios.defaults.headers.common['X-CSRFToken'] = response.data.csrftoken;
        return response.data.csrftoken;
      }
    } catch (error) {
      console.error('Помилка отримання CSRF токену:', error);
    }
    return null;
  };

  const saveNote = async () => {
    if (!title.trim()) {
      setStatus('error');
      setErrorMessage('Потрібно вказати назву нотатки');
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    try {
      setIsSaving(true);
      await getCsrfToken();
      
      const noteData = {
        title: title,
        content: content,
        lesson_id: lessonId
      };
      
      const response = await axios.post(`${API_URL}/notes/create/`, noteData, {
        withCredentials: true
      });
      
      setIsSaving(false);
      setStatus('success');
      
      setTimeout(() => {
        if (onSaved) onSaved(response.data);
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Помилка створення нотатки:", error);
      setIsSaving(false);
      setStatus('error');
      setErrorMessage('Не вдалося зберегти нотатку. Спробуйте знову.');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="quick-note">
      <div className="quick-note-header">
        <input 
          type="text"
          className="quick-note-title"
          placeholder="Назва нотатки"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="quick-note-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      
      <div className="quick-note-content">
        <textarea
          className="quick-note-textarea"
          placeholder="Введіть текст нотатки..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
      </div>
      
      <div className="quick-note-footer">
        {status === 'success' && (
          <div className="quick-note-status success">
            <Check size={14} />
            <span>Нотатка збережена</span>
          </div>
        )}
        
        {status === 'error' && (
          <div className="quick-note-status error">
            <AlertTriangle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}
        
        <button 
          className="quick-note-save" 
          onClick={saveNote}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <RefreshCw className="animate-spin" size={14} />
              <span>Збереження...</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Зберегти</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuickNote;