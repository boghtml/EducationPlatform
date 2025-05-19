// src/components/api/zoomApi.js
import axios from 'axios';
import API_URL from '../../api'; // Base API URL

// API methods for Zoom meetings
const zoomApi = {
  // Get meeting list for a course
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

  // Get data for a specific meeting
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

  // Create a new Zoom meeting
  createZoomMeeting: async (meetingData) => {
    try {
      console.log('Creating new Zoom meeting with data:', meetingData);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Format data before sending
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

  // Update an existing Zoom meeting
  updateZoomMeeting: async (meetingId, meetingData) => {
    try {
      console.log(`Updating Zoom meeting ID: ${meetingId}`, meetingData);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Format data
      const formattedData = { ...meetingData };
      if (formattedData.start_time) {
        formattedData.start_time = (new Date(formattedData.start_time)).toISOString();
      }
      
      // Convert boolean values
      ['host_video', 'participant_video', 'join_before_host', 'mute_upon_entry'].forEach(field => {
        if (formattedData[field] !== undefined) {
          formattedData[field] = Boolean(formattedData[field]);
        }
      });
      
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

  // Delete a Zoom meeting
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

  // Join a Zoom meeting
  joinZoomMeeting: async (meetingId) => {
    try {
      console.log(`Joining Zoom meeting ID: ${meetingId}`);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const response = await axios.post(`${API_URL}/zoom/meetings/${meetingId}/join/`, {}, {
        withCredentials: true
      });
      
      console.log('Join response received:', response.data);
      
      // Validate response data
      if (!response.data || !response.data.meeting || !response.data.sdk_data) {
        console.error('Invalid response format:', response.data);
        throw new Error('Некоректний формат відповіді від сервера');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error joining Zoom meeting:', error);
      
      // Handle specific errors
      if (error.response) {
        if (error.response.status === 403) {
          throw new Error('У вас немає прав для доступу до цієї зустрічі');
        } else if (error.response.status === 404) {
          throw new Error('Зустріч не знайдена');
        } else if (error.response.data && error.response.data.error) {
          throw new Error(error.response.data.error);
        }
      }
      
      throw error;
    }
  },

  // Leave a Zoom meeting
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

  // Get SDK signature for meeting
  getZoomSignature: async (meetingNumber, role = 0, leaveUrl = '/dashboard') => {
    try {
      console.log(`Getting Zoom signature for meeting: ${meetingNumber}, role: ${role}`);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.post(`${API_URL}/zoom/sdk-auth/`, {
        meeting_id: meetingNumber,
        role: role,
        leave_url: leaveUrl
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