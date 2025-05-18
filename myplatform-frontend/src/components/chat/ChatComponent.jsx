// src/components/chat/ChatComponent.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import PinnedMessages from './PinnedMessages';
import './ChatStyles.css';
import { MessageCircle, Pin, AlertCircle, Loader, Users, X } from 'lucide-react';

const ChatComponent = () => {
  const { courseId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const userId = sessionStorage.getItem('userId');
  const userRole = sessionStorage.getItem('userRole');
  
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

  const fetchChatMessages = async () => {
    try {
      if (!chat) return;
      
      const response = await axios.get(`${API_URL}/chats/${chat.id}/messages/`, {
        withCredentials: true
      });
      
      setMessages(response.data);
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const fetchChatParticipants = async () => {
    try {
      if (!courseId) return;
      
      await getCsrfToken();
      
      const response = await axios.get(`${API_URL}/course/${courseId}/participants/`, {
        withCredentials: true
      });
      
      const allParticipants = [
        ...response.data.students,
        ...response.data.teachers
      ];
      
      setParticipants(allParticipants);
    } catch (error) {
      console.error('Error fetching chat participants:', error);
    }
  };

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
      
      const newMessage = {
        ...response.data,
        isNew: true 
      };
      
      setMessages(prevMessages => [newMessage, ...prevMessages]);
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

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
      
      await fetchChatMessages();
      
      return response.data;
    } catch (error) {
      console.error('Error replying to message:', error);
      throw error;
    }
  };

  const editMessage = async (messageId, content) => {
    try {
      await getCsrfToken();
      
      const response = await axios.patch(`${API_URL}/chats/messages/${messageId}/`, 
        { content }, 
        { withCredentials: true }
      );
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? {
            ...response.data,
            isEdited: true 
          } : msg
        )
      );
      
      return response.data;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await getCsrfToken();
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, isDeleting: true } : msg
        )
      );
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await axios.delete(`${API_URL}/chats/messages/${messageId}/`, {
        withCredentials: true
      });
      
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  const addReaction = async (messageId, reactionType) => {
    try {
      await getCsrfToken();
      
      await axios.post(`${API_URL}/chats/messages/${messageId}/reaction/`, 
        { reaction_type: reactionType }, 
        { withCredentials: true }
      );
      
      await fetchChatMessages();
      
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  };

  const removeReaction = async (messageId, reactionType) => {
    try {
      await getCsrfToken();
      
      await axios.delete(`${API_URL}/chats/messages/${messageId}/reaction/`, {
        params: { reaction_type: reactionType },
        withCredentials: true
      });
      
      await fetchChatMessages();
      
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  };

  const pinMessage = async (messageId) => {
    try {
      await getCsrfToken();
      
      await axios.post(`${API_URL}/chats/messages/${messageId}/pin/`, {}, {
        withCredentials: true
      });
      
      await fetchCourseChat();
      
      setShowPinnedMessages(true);
      
    } catch (error) {
      console.error('Error pinning message:', error);
      throw error;
    }
  };

  const unpinMessage = async (messageId) => {
    try {
      await getCsrfToken();
      
      setPinnedMessages(prev => 
        prev.map(pinned => 
          pinned.message.id === messageId ? { ...pinned, isRemoving: true } : pinned
        )
      );
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await axios.delete(`${API_URL}/chats/messages/${messageId}/pin/`, {
        withCredentials: true
      });
      
      await fetchCourseChat();
      
    } catch (error) {
      console.error('Error unpinning message:', error);
      throw error;
    }
  };

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
      
      await fetchChatMessages();
      
      return response.data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (chatContainerRef.current) {
      chatContainerRef.current.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (chatContainerRef.current) {
      chatContainerRef.current.classList.remove('drag-over');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (chatContainerRef.current) {
      chatContainerRef.current.classList.remove('drag-over');
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  useEffect(() => {
    fetchCourseChat();
    fetchChatParticipants();
  }, [courseId]);
  
  useEffect(() => {
    if (chat) {
      fetchChatMessages();
    }
  }, [chat]);
  
  useEffect(() => {
    if (!chat) return;
    
    const interval = setInterval(() => {
      fetchChatMessages();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [chat]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    
    if (chatContainer) {
      chatContainer.addEventListener('dragover', handleDragOver);
      chatContainer.addEventListener('dragleave', handleDragLeave);
      chatContainer.addEventListener('drop', handleDrop);
    }
    
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('dragover', handleDragOver);
        chatContainer.removeEventListener('dragleave', handleDragLeave);
        chatContainer.removeEventListener('drop', handleDrop);
      }
    };
  }, []);

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
        <AlertCircle size={48} color="#dc3545" />
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
        <MessageCircle size={48} color="#6c757d" />
        <h3>Чат не знайдено</h3>
        <p>Неможливо завантажити чат для цього курсу.</p>
      </div>
    );
  }

  return (
    <div className="chat-container" ref={chatContainerRef}>
      <div className="chat-header">
        <div className="chat-header-info">
          <h2 className="chat-title">{chat.name}</h2>
          <p className="chat-description">{chat.description}</p>
        </div>
        <div className="chat-header-actions">
          <button 
            className="chat-pinned-button"
            onClick={() => setShowPinnedMessages(!showPinnedMessages)}
            title={showPinnedMessages ? "Сховати закріплені повідомлення" : "Показати закріплені повідомлення"}
          >
            <Pin size={16} />
            {pinnedMessages.length > 0 ? `Закріплені (${pinnedMessages.length})` : 'Закріплені'}
          </button>
          <button 
            className="chat-pinned-button"
            onClick={() => setShowParticipants(!showParticipants)}
            style={{ marginLeft: '10px' }}
            title={showParticipants ? "Сховати учасників" : "Показати учасників"}
          >
            <Users size={16} />
            Учасники ({participants.length})
          </button>
        </div>
      </div>
      
      {showPinnedMessages && pinnedMessages.length > 0 && (
        <PinnedMessages 
          pinnedMessages={pinnedMessages} 
          unpinMessage={userRole === 'teacher' || userRole === 'admin' ? unpinMessage : undefined}
        />
      )}
      
      {showParticipants && (
        <div className="participants-container">
          <div className="participants-header">
            <h3 className="participants-title">
              <Users size={16} /> Учасники чату
            </h3>
            <button 
              className="participants-close-btn"
              onClick={() => setShowParticipants(false)}
            >
              <X size={16} />
            </button>
          </div>
          <div className="participants-list">
            {participants.map((participant) => (
              <div key={participant.id} className="participant-item">
                <img 
                  src={participant.profile_image_url || "https://via.placeholder.com/40"} 
                  alt={participant.username} 
                  className="participant-avatar"
                />
                <div className="participant-info">
                  <span className="participant-name">
                    {participant.first_name} {participant.last_name}
                  </span>
                  <span className="participant-role">
                    {participant.role === 'teacher' ? 'Викладач' : 
                     participant.role === 'admin' ? 'Адміністратор' : 'Студент'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="chat-no-messages">
            <p>
              Немає повідомлень у цьому чаті. Будьте першим, хто напише!
              <br />
              <small>Ви також можете перетягнути файли сюди для завантаження</small>
            </p>
          </div>
        ) : (
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
        )}
      </div>
      
      <MessageInput 
        sendMessage={sendMessage} 
        uploadAttachment={uploadAttachment} 
        courseId={courseId}
        fileInputRef={fileInputRef}
      />
      
      {/* Прихований елемент для прокрутки до останнього повідомлення */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatComponent;