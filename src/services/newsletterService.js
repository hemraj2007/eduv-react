import api from './api';

const newsletterService = {
  // Get all newsletters with pagination
  getAllNewsletters: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/newsletter/getall?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get total count of newsletters
  getTotalNewsletterCount: async () => {
    try {
      const response = await api.get('/newsletter/count');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get newsletter by ID
  getNewsletterById: async (id) => {
    try {
      const response = await api.get(`/newsletter/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add new newsletter
  addNewsletter: async (newsletterData) => {
    try {
      const response = await api.post('/newsletter/add', newsletterData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update newsletter
  updateNewsletter: async (id, newsletterData) => {
    try {
      const response = await api.put(`/newsletter/update/${id}`, newsletterData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete newsletter
  deleteNewsletter: async (id) => {
    try {
      const response = await api.delete(`/newsletter/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change newsletter status
  changeNewsletterStatus: async (id, status) => {
    try {
      const response = await api.put(`/newsletter/status/${id}`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Subscribe to newsletter (for frontend footer)
  subscribe: async (email) => {
    try {
      const response = await api.post('/newsletter/subscribe', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Unsubscribe from newsletter (for frontend footer)
  unsubscribe: async (email) => {
    try {
      const response = await api.post('/newsletter/unsubscribe', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default newsletterService;
