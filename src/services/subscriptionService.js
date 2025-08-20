import api from './api';

const subscriptionService = {
  // Create new subscription
  createSubscription: async (subscriptionData) => {
    try {
      const response = await api.post('/subscription/create', subscriptionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all subscriptions
  getAllSubscriptions: async () => {
    try {
      const response = await api.get('/subscription/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get subscription by ID
  getSubscriptionById: async (id) => {
    try {
      console.log("API Request - URL:", `/subscription/${id}`);
      const response = await api.get(`/subscription/${id}`);
      console.log("API Response:", response.data);
      
      // Handle the response structure where subscription data is in response.data.subscription
      const result = {
        data: response.data.subscription || response.data
      };
      console.log("Processed result:", result);
      return result;
    } catch (error) {
      console.error("API Error Details:", error.response?.data);
      throw error;
    }
  },

  // Get subscriptions by membership ID
  getSubscriptionsByMembershipId: async (membershipId) => {
    try {
      const response = await api.get(`/subscription/membership/${membershipId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get subscriptions by student ID
  getSubscriptionsByStudentId: async (studentId) => {
    try {
      const response = await api.get(`/subscription/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update subscription
  updateSubscription: async (id, subscriptionData) => {
    try {
      console.log("API Request - URL:", `/subscription/update/${id}`);
      console.log("API Request - Data:", subscriptionData);
      const response = await api.put(`/subscription/update/${id}`, subscriptionData);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API Error Details:", error.response?.data);
      throw error;
    }
  },

  // Delete subscription
  deleteSubscription: async (id) => {
    try {
      const response = await api.delete(`/subscription/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default subscriptionService; 