// src/api/zoomApi.js
import API_URL from '../../api';
import axios from 'axios';

// API методи для роботи з Zoom зустрічами
const zoomApi = {
  // Отримання списку зустрічей для курсу
  getCourseZoomMeetings: async (courseId) => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.get(`${API_URL}/zoom/course/${courseId}/meetings/`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course Zoom meetings:', error);
      throw error;
    }
  },

  // Отримання даних про конкретну зустріч
  getZoomMeeting: async (meetingId) => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.get(`${API_URL}/zoom/meetings/${meetingId}/`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Zoom meeting details:', error);
      throw error;
    }
  },

  // Створення нової Zoom зустрічі
  createZoomMeeting: async (meetingData) => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.post(`${API_URL}/zoom/meetings/`, meetingData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      throw error;
    }
  },

  // Оновлення існуючої Zoom зустрічі
  updateZoomMeeting: async (meetingId, meetingData) => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.patch(`${API_URL}/zoom/meetings/${meetingId}/`, meetingData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error updating Zoom meeting:', error);
      throw error;
    }
  },

  // Видалення Zoom зустрічі
  deleteZoomMeeting: async (meetingId) => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.delete(`${API_URL}/zoom/meetings/${meetingId}/`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting Zoom meeting:', error);
      throw error;
    }
  },

  // Приєднання до Zoom зустрічі
  joinZoomMeeting: async (meetingId) => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.post(`${API_URL}/zoom/meetings/${meetingId}/join/`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error joining Zoom meeting:', error);
      throw error;
    }
  },

  // Вихід із Zoom зустрічі
  leaveZoomMeeting: async (meetingId) => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.post(`${API_URL}/zoom/meetings/${meetingId}/leave/`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error leaving Zoom meeting:', error);
      throw error;
    }
  },

  // Отримання підпису для Zoom Meeting SDK
  getZoomSignature: async (meetingNumber, role = 0) => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.post(`${API_URL}/zoom/signature/`, {
        meeting_id: meetingNumber,
        role: role
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting Zoom signature:', error);
      throw error;
    }
  },
};

export default zoomApi;