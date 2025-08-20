import api from './api';

const membershipPlanService = {
  // Create new membership plan
  createMembershipPlan: async (membershipPlanData) => {
    try {
      console.log("API Request - URL:", '/membership-plan/create');
      console.log("API Request - Data:", membershipPlanData);
      const response = await api.post('/membership-plan/create', membershipPlanData);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API Error Details:", error.response?.data);
      throw error;
    }
  },

  // Get all membership plans
  getAllMembershipPlans: async () => {
    try {
      const response = await api.get('/membership-plan/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get membership plans by package ID
  getMembershipPlansByPackageId: async (packageId) => {
    try {
      const response = await api.get(`/membership-plan/package/${packageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get membership plan by ID
  getMembershipPlanById: async (id) => {
    try {
      const response = await api.get(`/membership-plan/${id}`);
      // Handle the response structure where membership plan data is in response.data.membershipPlan
      return {
        data: response.data.membershipPlan || response.data
      };
    } catch (error) {
      throw error;
    }
  },

  // Update membership plan
  updateMembershipPlan: async (id, membershipPlanData) => {
    try {
      console.log("API Request - URL:", `/membership-plan/update/${id}`);
      console.log("API Request - Data:", membershipPlanData);
      const response = await api.put(`/membership-plan/update/${id}`, membershipPlanData);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API Error Details:", error.response?.data);
      throw error;
    }
  },

  // Delete membership plan
  deleteMembershipPlan: async (id) => {
    try {
      const response = await api.delete(`/membership-plan/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default membershipPlanService; 