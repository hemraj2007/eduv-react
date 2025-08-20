import api from './api';

const enquiryService = {
  // Get all enquiries
  getAllEnquiries: async () => {
    try {
      const response = await api.get('/enquiry/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get enquiry by ID
  getEnquiryById: async (id) => {
    try {
      const response = await api.get(`/enquiry/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get enquiry statistics
  getEnquiryStats: async () => {
    try {
      const response = await api.get('/enquiry/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add new enquiry
  addEnquiry: async (enquiryData) => {
    try {
      const response = await api.post('/enquiry/add', enquiryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update enquiry
  updateEnquiry: async (id, enquiryData) => {
    try {
      const response = await api.put(`/enquiry/update/${id}`, enquiryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete enquiry
  deleteEnquiry: async (id) => {
    try {
      const response = await api.delete(`/enquiry/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change enquiry status
  changeEnquiryStatus: async (id, status, status_description) => {
    try {
      console.log('Changing status to:', status, 'for ID:', id, 'with description:', status_description);
      const response = await api.put(`/enquiry/status/${id}`, { status, status_description });
      return response.data;
    } catch (error) {
      console.error('Error in changeEnquiryStatus:', error);
      throw error;
    }
  },
};

export default enquiryService;