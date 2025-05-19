// src/components/api/zoomApi.js - Оновлений для кращої обробки пароля
import axios from 'axios';
import API_URL from '../../api'; // Правильний шлях до API_URL

// API методи для роботи з Zoom зустрічами
const zoomApi = {
  // Отримання списку зустрічей для курсу
  getCourseZoomMeetings: async (courseId) => {
    try {
      console.log(`Getting Zoom meetings for course ID: ${courseId}`);
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
      console.log(`Getting Zoom meeting details for ID: ${meetingId}`);
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
      console.log('Creating new Zoom meeting with data:', meetingData);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Перевірка і форматування даних перед відправкою
      const formattedData = {
        course: parseInt(meetingData.course),
        topic: meetingData.topic,
        description: meetingData.description || '',
        start_time: (new Date(meetingData.start_time)).toISOString(),
        duration: parseInt(meetingData.duration),
        host_video: Boolean(meetingData.host_video),
        participant_video: Boolean(meetingData.participant_video),
        join_before_host: Boolean(meetingData.join_before_host),
        mute_upon_entry: Boolean(meetingData.mute_upon_entry),
        auto_recording: meetingData.auto_recording || 'none'
      };
      
      console.log('Sending formatted meeting data:', formattedData);
      
      const response = await axios.post(`${API_URL}/zoom/meetings/`, formattedData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      if (error.response && error.response.data) {
        console.error('Server error response:', error.response.data);
      }
      throw error;
    }
  },

  // Оновлення існуючої Zoom зустрічі
  updateZoomMeeting: async (meetingId, meetingData) => {
    try {
      console.log(`Updating Zoom meeting ID: ${meetingId}`, meetingData);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Форматуємо дату і час, якщо вони передані
      const formattedData = { ...meetingData };
      if (formattedData.start_time) {
        formattedData.start_time = (new Date(formattedData.start_time)).toISOString();
      }
      
      // Перетворюємо логічні значення
      if (formattedData.host_video !== undefined) formattedData.host_video = Boolean(formattedData.host_video);
      if (formattedData.participant_video !== undefined) formattedData.participant_video = Boolean(formattedData.participant_video);
      if (formattedData.join_before_host !== undefined) formattedData.join_before_host = Boolean(formattedData.join_before_host);
      if (formattedData.mute_upon_entry !== undefined) formattedData.mute_upon_entry = Boolean(formattedData.mute_upon_entry);
      
      console.log('Sending formatted update data:', formattedData);
      
      const response = await axios.patch(`${API_URL}/zoom/meetings/${meetingId}/`, formattedData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
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
      console.log(`Deleting Zoom meeting ID: ${meetingId}`);
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
      console.log(`Joining Zoom meeting ID: ${meetingId}`);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.post(`${API_URL}/zoom/meetings/${meetingId}/join/`, {}, {
        withCredentials: true
      });
      
      console.log('Join response received with keys:', Object.keys(response.data));
      
      // Перевірка чи є в даних необхідні поля
      if (!response.data || !response.data.meeting) {
        console.error('Meeting data missing in response:', response.data);
        throw new Error('Не вдалося отримати дані зустрічі для приєднання');
      }
      
      const meetingData = response.data.meeting;
      console.log('Meeting data:', {
        id: meetingData.id,
        topic: meetingData.topic,
        meeting_id: meetingData.meeting_id,
        has_password: !!meetingData.meeting_password
      });
      
      // Перевірка наявності пароля
      if (!meetingData.meeting_password && meetingData.meeting_password !== '') {
        console.warn('Meeting password is missing or undefined!');
      }
      
      // Перевірка SDK data
      const sdkData = response.data.sdk_data || {};
      console.log('SDK data keys:', Object.keys(sdkData));
      
      // Додаємо пароль в sdk_data, якщо він відсутній
      if (sdkData && !sdkData.passWord && meetingData.meeting_password) {
        sdkData.passWord = meetingData.meeting_password;
        console.log('Added password to SDK data');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error joining Zoom meeting:', error);
      throw error;
    }
  },

  // Вихід із Zoom зустрічі
  leaveZoomMeeting: async (meetingId) => {
    try {
      console.log(`Leaving Zoom meeting ID: ${meetingId}`);
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
      console.log(`Getting Zoom signature for meeting: ${meetingNumber}, role: ${role}`);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.post(`${API_URL}/zoom/sdk-auth/`, {
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