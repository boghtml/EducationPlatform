// src/utils/userUtils.js

/**
 * UTF-8 safe version of btoa to handle non-Latin1 characters
 * @param {string} str - The string to encode
 * @returns {string} Base64 encoded string
 */
function utf8ToBase64(str) {
    
    const utf8Encoder = new TextEncoder();
    const utf8Bytes = utf8Encoder.encode(str);
    
    let binaryString = '';
    utf8Bytes.forEach(byte => {
      binaryString += String.fromCharCode(byte);
    });
    
    return btoa(binaryString);
  }
  
  /**
   * Generates a default avatar for users based on their name
   * If name is not provided, returns a generic avatar
   * 
   * @param {string} name - User's name or username
   * @param {string} role - User's role (student, teacher, admin)
   * @returns {string} URL to the default avatar image
   */
  export const getDefaultAvatar = (name, role = 'user') => {
    
    const getColorFromName = (name) => {
      if (!name) return '#6c757d'; 
      
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      let hue;
      switch(role.toLowerCase()) {
        case 'teacher':
          hue = (hash % 60) + 200; 
          break;
        case 'admin':
          hue = (hash % 60) + 330; 
          break;
        case 'student':
        default:
          hue = (hash % 60) + 20; 
          break;
      }
      
      return `hsl(${hue}, 70%, 60%)`;
    };
    
    const getInitials = (name) => {
      if (!name) return '?';
      
      const nameParts = name.trim().split(/\s+/);
      if (nameParts.length === 1) {
        return nameParts[0].charAt(0).toUpperCase();
      } else {
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
      }
    };
    
    const color = getColorFromName(name, role);
    const initials = getInitials(name);
    
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="${color}" />
        <text x="50" y="50" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central" dy="2">${initials}</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${utf8ToBase64(svgContent)}`;
  };
  
  /**
   * A simpler fallback avatar function that doesn't use SVG
   * For browsers with encoding issues
   * 
   * @param {string} name - User's name or username
   * @param {string} role - User's role
   * @returns {string} URL to a default avatar image
   */
  export const getSimpleAvatar = (name, role = 'user') => {
    const roleColors = {
      'teacher': '#4a90e2', // Blue for teachers
      'admin': '#9c44dc',   // Purple for admins
      'student': '#ff6b6b', // Red for students
      'user': '#6c757d'     // Gray for default
    };
    
    const backgroundColor = roleColors[role.toLowerCase()] || roleColors.user;
    
    const initials = name ? encodeURIComponent(name.trim().substring(0, 2).toUpperCase()) : '?';
    
    return `https://ui-avatars.com/api/?name=${initials}&background=${backgroundColor.substring(1)}&color=ffffff&size=128`;
  };
  
  /**
   * Returns the appropriate user profile URL based on user role and ID
   * 
   * @param {string} role - User's role (student, teacher, admin)
   * @param {number|string} userId - User's ID
   * @returns {string} API URL for the user profile
   */
  export const getUserProfileEndpoint = (role, userId) => {
    switch(role.toLowerCase()) {
      case 'teacher':
        return `/users/teacher/${userId}/`;
      case 'student':
        return `/users/student/${userId}/`;
      case 'admin':
        return `/users/admin/${userId}/`;
      default:
        return `/users/${userId}/`;
    }
  };