import api from './api';

const userService = {
  // Get all users with pagination and filters
  getAllUsers: async (page = 1, limit = 25, name = '', fromDate = '', toDate = '', status = 'all') => {
    try {
      let url = `/user/getall?page=${page}&limit=${limit}`;
      if (name) {
        url += `&name=${encodeURIComponent(name)}`;
      }
      if (fromDate) {
        url += `&fromDate=${encodeURIComponent(fromDate)}`;
      }
      if (toDate) {
        url += `&toDate=${encodeURIComponent(toDate)}`;
      }
      if (status !== 'all') {
        url += `&status=${encodeURIComponent(status)}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get total user count
  getTotalUserCount: async () => {
    try {
      // Use a single reliable endpoint
      const response = await api.get('/user/getall?count=true');
      return response.data;
    } catch (error) {
      console.error('Error getting user count:', error);
      // Return a default count to prevent UI issues
      return { count: 0 };
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/user/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add a new user
  addUser: async (userData) => {
    try {
      // If userData is FormData (for file uploads), use it directly
      // Otherwise, create a new FormData object
      let formData;
      if (userData instanceof FormData) {
        formData = userData;
      } else {
        formData = new FormData();
        // Add all user data fields to FormData
        for (const key in userData) {
          if (userData[key] === null || userData[key] === undefined) {
            continue; // Skip null or undefined values
          }
          
          if (key === 'hobbies') {
            // Only append hobbies if it's an array with values
            if (Array.isArray(userData[key]) && userData[key].length > 0) {
              formData.append('hobbies', userData[key].join(','));
            }
          } else if (key === 'documents' && Array.isArray(userData[key])) {
            // Handle documents array - append each file individually
            userData[key].forEach((doc) => {
              formData.append('documents', doc);
            });
          } else if (key === 'image' && userData[key] instanceof File) {
            // Handle image file
            formData.append('image', userData[key]);
          } else if (key === 'profileImage' && userData[key] instanceof File) {
            // Handle profile image file (alternative name)
            formData.append('image', userData[key]);
          } else {
            formData.append(key, userData[key].toString());
          }
        }
      }
      
      // Ensure all required fields have values
      const requiredFields = ['fullName', 'email', 'password', 'mobile', 'gender', 'dob', 'country', 'state', 'city', 'address', 'pincode'];
      const missingFields = [];
      
      requiredFields.forEach(field => {
        if (!formData.has(field)) {
          missingFields.push(field);
          console.error(`Missing required field: ${field}`);
        }
      });
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Log formData for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`Sending to API - ${key}: ${value}`);
      }

      // Add empty values for optional fields if they don't exist
      const optionalFields = ['linkedinUrl', 'githubUrl', 'accountOn'];
      optionalFields.forEach(field => {
        if (!formData.has(field)) {
          formData.append(field, '');
        }
      });

      // Make sure hobbies field exists even if empty
      if (!formData.has('hobbies')) {
        formData.append('hobbies', '');
      }

      try {
        const response = await api.post('/user/register', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 10000 // 10 second timeout
        });
        return response.data;
      } catch (apiError) {
        // Handle network errors specifically
        if (apiError.code === 'ERR_NETWORK') {
          console.error('Network Error: Unable to connect to the server. Please check if the backend server is running.');
          throw new Error('Network Error: Unable to connect to the server. Please check if the backend server is running.');
        }
        // Handle timeout errors
        if (apiError.code === 'ECONNABORTED') {
          console.error('Request timeout: The server took too long to respond.');
          throw new Error('Request timeout: The server took too long to respond.');
        }
        // Handle other API errors
        console.error('Add User API error:', apiError.response?.data || apiError.message);
        throw apiError;
      }
    } catch (error) {
      console.error('Add User error:', error.message);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      // If userData is FormData (for file uploads), use it directly
      // Otherwise, create a new FormData object
      let formData;
      if (userData instanceof FormData) {
        formData = userData;
      } else {
        formData = new FormData();
        // Add all user data fields to FormData
        for (const key in userData) {
          if (key === 'hobbies') {
            // Only append hobbies if it's an array with values
            if (Array.isArray(userData[key]) && userData[key].length > 0) {
              formData.append('hobbies', userData[key].join(','));
            }
          } else if (key === 'documents' && Array.isArray(userData[key])) {
            // Handle documents array - append each file/path individually
            userData[key].forEach((doc) => {
              formData.append('documents', doc); // Append both File objects and string paths
            });
          } else if (key === 'image' && userData[key] instanceof File) {
            // Handle image file
            formData.append('image', userData[key]);
          } else {
            formData.append(key, userData[key]);
          }
        }
      }

      const response = await api.put(`/user/edit/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/user/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change user status
  changeUserStatus: async (id, status) => {
    try {
      const response = await api.put(`/user/status/${id}`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // User login
  login: async (credentials) => {
    try {
      // Check if this is an admin login
      if (credentials.isAdmin) {
        const response = await api.post('/admin/login-admin', {
          email: credentials.email,
          password: credentials.password
        });
        return response.data;
      } else {
        const response = await api.post('/user/login', credentials);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  // User registration
  register: async (userData) => {
    try {
      // Handle FormData for file uploads if needed
      let formData;
      if (userData instanceof FormData) {
        formData = userData;
      } else {
        formData = new FormData();
        // Add all user data fields to FormData
        for (const key in userData) {
          if (userData[key] === null || userData[key] === undefined) {
            continue; // Skip null or undefined values
          }
          
          if (key === 'hobbies') {
            // Only append hobbies if it's an array with values
            if (Array.isArray(userData[key]) && userData[key].length > 0) {
              formData.append('hobbies', userData[key].join(','));
            }
          } else if (key === 'documents' && Array.isArray(userData[key])) {
            // Handle documents array
            userData[key].forEach((doc) => {
              formData.append('documents', doc);
            });
          } else if (key === 'image' && userData[key] instanceof File) {
            // Handle image file
            formData.append('image', userData[key]);
          } else {
            formData.append(key, userData[key].toString());
          }
        }
      }

      // Log formData for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`Sending to API - ${key}: ${value}`);
      }

      try {
        const response = await api.post('/user/register', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 10000 // 10 second timeout
        });
        return response.data;
      } catch (apiError) {
        // Handle network errors specifically
        if (apiError.code === 'ERR_NETWORK') {
          console.error('Network Error: Unable to connect to the server. Please check if the backend server is running.');
          throw new Error('Network Error: Unable to connect to the server. Please check if the backend server is running.');
        }
        // Handle timeout errors
        if (apiError.code === 'ECONNABORTED') {
          console.error('Request timeout: The server took too long to respond.');
          throw new Error('Request timeout: The server took too long to respond.');
        }
        // Handle other API errors
        console.error('Register API error:', apiError.response?.data || apiError.message);
        throw apiError;
      }
    } catch (error) {
      console.error('Register error:', error.message);
      throw error;
    }
  },

  // Upload user documents
  uploadUserDocuments: async (id, documents) => {
    try {
      const formData = new FormData();
      
      // Add documents to FormData
      if (Array.isArray(documents)) {
        documents.forEach(doc => {
          formData.append('documents', doc);
        });
      } else {
        // If single document is provided
        formData.append('documents', documents);
      }

      const response = await api.post(`/user/upload-documents/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default userService;
