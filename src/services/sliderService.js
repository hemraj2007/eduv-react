import api from './api';

const sliderService = {
  // Get all sliders
  getAllSliders: async () => {
    try {
      const response = await api.get('/slider/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching sliders:', error);
      throw error;
    }
  },

  // Get slider by ID
  getSliderById: async (id) => {
    try {
      const response = await api.get(`/slider/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching slider:', error);
      throw error;
    }
  },

  // Create new slider
  createSlider: async (sliderData) => {
    try {
      console.log("Slider Service - Creating slider with data:", sliderData);
      
      // If sliderData is already FormData, use it directly
      let formData;
      if (sliderData instanceof FormData) {
        formData = sliderData;
      } else {
        // Create FormData from object
        formData = new FormData();
        Object.keys(sliderData).forEach(key => {
          if (sliderData[key] !== null && sliderData[key] !== undefined) {
            formData.append(key, sliderData[key]);
          }
        });
      }

      const response = await api.post('/slider/create', formData, {
        headers: {
          'Content-Type': undefined,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating slider:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      throw error;
    }
  },

  // Update slider
  updateSlider: async (id, sliderData) => {
    try {
      console.log("Slider Service - Updating slider with data:", sliderData);
      
      // If sliderData is already FormData, use it directly
      let formData;
      if (sliderData instanceof FormData) {
        formData = sliderData;
      } else {
        // Create FormData from object
        formData = new FormData();
        Object.keys(sliderData).forEach(key => {
          if (sliderData[key] !== null && sliderData[key] !== undefined) {
            formData.append(key, sliderData[key]);
          }
        });
      }

      const response = await api.put(`/slider/update/${id}`, formData, {
        headers: {
          'Content-Type': undefined,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating slider:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      throw error;
    }
  },

  // Update slider status
  updateSliderStatus: async (id, status) => {
    try {
      const response = await api.patch(`/slider/status/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating slider status:', error);
      throw error;
    }
  },

  // Delete slider
  deleteSlider: async (id) => {
    try {
      const response = await api.delete(`/slider/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting slider:', error);
      throw error;
    }
  },

  // Get active sliders (for frontend display)
  getActiveSliders: async () => {
    try {
      const response = await api.get('/slider/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active sliders:', error);
      throw error;
    }
  }
};

export default sliderService;
