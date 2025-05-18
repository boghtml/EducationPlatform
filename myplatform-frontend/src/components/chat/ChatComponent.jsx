// src/components/chat/ChatComponent.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import PinnedMessages from './PinnedMessages';
import './ChatStyles.css';
import { MessageCircle } from 'lucide-react';

const ChatComponent = () => {
  const { courseId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Отримуємо інформацію про поточного користувача з сесії
  const userId = sessionStorage.getItem('userId');
  const userRole = sessionStorage.getItem('userRole');
  
  // Функція для отримання CSRF токену
  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      if (response.data && response.data.csrftoken) {
        axios.defaults.headers.common['X-CSRFToken'] = response.data.csrftoken;
        return response.data.csrftoken;
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
    return null;
  };

  // Отримання чату курсу
  const fetchCourseChat = async () => {
    try {
      setLoading(true);
      await getCsrfToken();
      
      const response = await axios.get(`${API_URL}/chats/courses/${courseId}/`, {
        withCredentials: true
      });
      
      setChat(response.data);
      
      if (response.data.pinned_messages) {
        setPinnedMessages(response.data.pinned_messages);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course chat:', error);
      setError(error.response?.data?.error || 'Не вдалося завантажити чат курсу');
      setLoading(false);
    }
  };

  // Отримання повідомлень чату
  const fetchChatMessages = async () => {
    try {
      if (!chat) return;
      
      const response = await axios.get(`${API_URL}/chats/${chat.id}/messages/`, {
        withCredentials: true
      });
      
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  // Відправка нового повідомлення
  const sendMessage = async (content, mentions = []) => {
    try {
      if (!chat) return;
      
      await getCsrfToken();
      
      const messageData = {
        chat: chat.id,
        content,
        mentions
      };
      
      const response = await axios.post(`${API_URL}/chats/messages/create/`, messageData, {
        withCredentials: true
      });
      
      // Додаємо нове повідомлення до списку
      setMessages(prevMessages => [response.data, ...prevMessages]);
      
      // Прокрутка до нового повідомлення
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Відповідь на повідомлення
  const replyToMessage = async (parentId, content, mentions = []) => {
    try {
      if (!chat) return;
      
      await getCsrfToken();
      
      const messageData = {
        chat: chat.id,
        parent_message: parentId,
        content,
        mentions
      };
      
      const response = await axios.post(`${API_URL}/chats/messages/create/`, messageData, {
        withCredentials: true
      });
      
      // Оновлюємо список повідомлень після відповіді
      await fetchChatMessages();
      
      return response.data;
    } catch (error) {
      console.error('Error replying to message:', error);
      throw error;
    }
  };

  // Редагування повідомлення
  const editMessage = async (messageId, content) => {
    try {
      await getCsrfToken();
      
      const response = await axios.patch(`${API_URL}/chats/messages/${messageId}/`, 
        { content }, 
        { withCredentials: true }
      );
      
      // Оновлюємо повідомлення в списку
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? response.data : msg
        )
      );
      
      return response.data;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  };

  // Видалення повідомлення
  const deleteMessage = async (messageId) => {
    try {
      await getCsrfToken();
      
      await axios.delete(`${API_URL}/chats/messages/${messageId}/`, {
        withCredentials: true
      });
      
      // Видаляємо повідомлення зі списку
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  // Додавання реакції до повідомлення
  const addReaction = async (messageId, reactionType) => {
    try {
      await getCsrfToken();
      
      await axios.post(`${API_URL}/chats/messages/${messageId}/reaction/`, 
        { reaction_type: reactionType }, 
        { withCredentials: true }
      );
      
      // Оновлюємо список повідомлень після додавання реакції
      await fetchChatMessages();
      
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  };

  // Видалення реакції з повідомлення
  const removeReaction = async (messageId, reactionType) => {
    try {
      await getCsrfToken();
      
      await axios.delete(`${API_URL}/chats/messages/${messageId}/reaction/`, {
        params: { reaction_type: reactionType },
        withCredentials: true
      });
      
      // Оновлюємо список повідомлень після видалення реакції
      await fetchChatMessages();
      
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  };

  // Закріплення повідомлення
  const pinMessage = async (messageId) => {
    try {
      await getCsrfToken();
      
      await axios.post(`${API_URL}/chats/messages/${messageId}/pin/`, {}, {
        withCredentials: true
      });
      
      // Оновлюємо список закріплених повідомлень
      await fetchCourseChat();
      
    } catch (error) {
      console.error('Error pinning message:', error);
      throw error;
    }
  };

  // Відкріплення повідомлення
  const unpinMessage = async (messageId) => {
    try {
      await getCsrfToken();
      
      await axios.delete(`${API_URL}/chats/messages/${messageId}/pin/`, {
        withCredentials: true
      });
      
      // Оновлюємо список закріплених повідомлень
      await fetchCourseChat();
      
    } catch (error) {
      console.error('Error unpinning message:', error);
      throw error;
    }
  };

  // Завантаження прикріплень до повідомлення
  const uploadAttachment = async (messageId, file) => {
    try {
      await getCsrfToken();
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_URL}/chats/messages/${messageId}/attachment/`, 
        formData, 
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Оновлюємо список повідомлень після додавання вкладення
      await fetchChatMessages();
      
      return response.data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  };

  // Ініціалізація чату при завантаженні компонента
  useEffect(() => {
    fetchCourseChat();
  }, [courseId]);
  
  // Завантаження повідомлень, коли отримано чат
  useEffect(() => {
    if (chat) {
      fetchChatMessages();
    }
  }, [chat]);
  
  // Автоматичне оновлення повідомлень кожні 10 секунд
  useEffect(() => {
    if (!chat) return;
    
    const interval = setInterval(() => {
      fetchChatMessages();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [chat]);

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="chat-loading-spinner"></div>
        <p>Завантаження чату...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-error">
        <MessageCircle size={40} />
        <h3>Помилка завантаження чату</h3>
        <p>{error}</p>
        <button className="chat-retry-button" onClick={fetchCourseChat}>
          Спробувати знову
        </button>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="chat-error">
        <MessageCircle size={40} />
        <h3>Чат не знайдено</h3>
        <p>Неможливо завантажити чат для цього курсу.</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-info">
          <h2 className="chat-title">{chat.name}</h2>
          <p className="chat-description">{chat.description}</p>
        </div>
        <div className="chat-header-actions">
          <button 
            className="chat-pinned-button"
            onClick={() => setShowPinnedMessages(!showPinnedMessages)}
          >
            {pinnedMessages.length > 0 ? `Закріплені (${pinnedMessages.length})` : 'Закріплені'}
          </button>
        </div>
      </div>
      
      {showPinnedMessages && pinnedMessages.length > 0 && (
        <PinnedMessages 
          pinnedMessages={pinnedMessages} 
          unpinMessage={userRole === 'teacher' || userRole === 'admin' ? unpinMessage : undefined}
        />
      )}
      
      <div className="chat-messages-container">
        <MessageList 
          messages={messages} 
          currentUserId={userId}
          currentUserRole={userRole}
          replyToMessage={replyToMessage}
          editMessage={editMessage}
          deleteMessage={deleteMessage}
          addReaction={addReaction}
          removeReaction={removeReaction}
          pinMessage={userRole === 'teacher' || userRole === 'admin' ? pinMessage : undefined}
          messagesEndRef={messagesEndRef}
        />
      </div>
      
      <MessageInput 
        sendMessage={sendMessage} 
        uploadAttachment={uploadAttachment} 
        courseId={courseId}
      />
    </div>
  );
};

export default ChatComponent;