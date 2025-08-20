import api from './api';

const videoService = {
  // Create new video
  createVideo: async (videoData) => {
    try {
      console.log("API Request - URL:", '/video/create');
      console.log("API Request - Data:", videoData);
      
      const response = await api.post('/video/create', videoData);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API Error Details:", error.response?.data);
      throw error;
    }
  },


  
  // Get all videos
  getAllVideos: async () => {
    try {
      const response = await api.get('/video/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },



  // Get video by ID
  getVideoById: async (id) => {
    try {
      console.log("API Request - URL:", `/video/${id}`);
      const response = await api.get(`/video/${id}`);
      console.log("API Response:", response.data);
      
      // Handle the response structure where video data might be nested
      const result = {
        data: response.data.video || response.data
      };
      console.log("Processed result:", result);
      return result;
    } catch (error) {
      console.error("API Error Details:", error.response?.data);
      throw error;
    }
  },

  // Get videos by package ID
  getVideosByPackageId: async (packageId) => {
    try {
      const response = await api.get(`/video/package/${packageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update video
  updateVideo: async (id, videoData) => {
    try {
      console.log("API Request - URL:", `/video/update/${id}`);
      console.log("API Request - Data:", videoData);
      
      const response = await api.put(`/video/update/${id}`, videoData);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API Error Details:", error.response?.data);
      throw error;
    }
  },

  // Delete video
  deleteVideo: async (id) => {
    try {
      const response = await api.delete(`/video/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update video status
  updateVideoStatus: async (id, status) => {
    try {
      // Try the specific status endpoint first
      try {
        const response = await api.put(`/video/status/${id}`, { status });
        return response.data;
      } catch (statusError) {
        console.log("Status endpoint failed, trying general update endpoint");
        // Fallback to general update endpoint
        const response = await api.put(`/video/update/${id}`, { status });
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },
};

export default videoService; 