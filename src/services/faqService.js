import api from './api';

const faqService = {
  // Get all FAQs with pagination
  getAllFaqs: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/faq/getall?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get total FAQ count
  getTotalFaqCount: async () => {
    try {
      // Try multiple possible endpoints
      const endpoints = [
        '/faq/count',
        '/faq/total',
        '/faq/getall?count=true',
        '/faq/getall?limit=1&count=true'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          return response.data;
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.message);
          continue;
        }
      }
      
      // Fallback: Get all FAQs without pagination to count them
      try {
        const response = await api.get('/faq/getall?limit=1000');
        if (response.data && Array.isArray(response.data)) {
          return { count: response.data.length };
        }
      } catch (fallbackErr) {
        console.log('Fallback count method failed:', fallbackErr.message);
      }
      
      // If all methods fail, throw error
      throw new Error('No count endpoint available');
    } catch (error) {
      throw error;
    }
  },

  // Get FAQ by ID
  getFaqById: async (id) => {
    try {
      const response = await api.get(`/faq/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add new FAQ
  addFaq: async (faqData) => {
    try {
      const response = await api.post('/faq/add', faqData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update FAQ
  updateFaq: async (id, faqData) => {
    try {
      const response = await api.put(`/faq/edit/${id}`, faqData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete FAQ
  deleteFaq: async (id) => {
    try {
      const response = await api.delete(`/faq/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change FAQ status
  changeFaqStatus: async (id, status) => {
    try {
      const response = await api.put(`/faq/status/${id}`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default faqService;
