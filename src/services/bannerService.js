import api from './api';

const bannerService = {
  // Get all banners
  getAllBanners: async () => {
    try {
      const response = await api.get("/banner/all");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get banner by ID
  getBannerById: async (id) => {
    try {
      const response = await api.get(`/banner/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new banner
  createBanner: async (bannerData) => {
    try {
      const response = await api.post('/banner/create', bannerData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update banner
  updateBanner: async (id, bannerData) => {
    try {
      const response = await api.put(`/banner/update/${id}`, bannerData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete banner
  deleteBanner: async (id) => {
    try {
      const response = await api.delete(`/banner/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update banner status
  updateBannerStatus: async (id, status) => {
    try {
      // Try the specific status endpoint first
      try {
        const response = await api.put(`/banner/status/${id}`, { status });
        return response.data;
      } catch (statusError) {
        console.log("Status endpoint failed, trying general update endpoint");
        // Fallback to general update endpoint
        const formData = new FormData();
        formData.append('status', status);
        const response = await api.put(`/banner/update/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },
};

export default bannerService; 