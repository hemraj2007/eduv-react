import api from './api';

const staticPageService = {
  // Add new static page
  addStaticPage: async (pageData) => {
    try {
      const response = await api.post('/static-page/add', pageData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all static pages with pagination
  getAllStaticPages: async (page = 1, limit = 10, retryCount = 0) => {
    try {
      const response = await api.get(`/static-page?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      // Implement retry mechanism for 500 errors (up to 3 retries)
      if (error.response && error.response.status === 500 && retryCount < 3) {
        console.log(`Retrying getAllStaticPages (attempt ${retryCount + 1})...`);
        // Wait for a short delay before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return staticPageService.getAllStaticPages(page, limit, retryCount + 1);
      }
      
      // If we've exhausted retries or it's not a 500 error, return empty data
      console.error('Error fetching static pages:', error.message);
      return { data: [], total: 0 };
    }
  },

  // Get static page by slug
  getStaticPageBySlug: async (slug) => {
    try {
      const response = await api.get(`/static-page/${slug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update static page
  updateStaticPage: async (id, pageData) => {
    try {
      const response = await api.put(`/static-page/${id}`, pageData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete static page
  deleteStaticPage: async (id) => {
    try {
      const response = await api.delete(`/static-page/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get total static page count
  getTotalPageCount: async (retryCount = 0) => {
    try {
      // Try the main endpoint first
      const response = await api.get('/static-page?page=1&limit=10');
      if (response.data && response.data.totalCount) {
        return { count: response.data.totalCount };
      }
      if (response.data && response.data.total) {
        return { count: response.data.total };
      }
      if (response.data && Array.isArray(response.data.data)) {
        // If we get paginated data, estimate total from pagination info
        return { count: response.data.data.length * 10 }; // rough estimate
      }
      if (response.data && Array.isArray(response.data)) {
        return { count: response.data.length };
      }
      
      // Default fallback
      return { count: 0 };
    } catch (error) {
      // Implement retry mechanism for 500 errors (up to 3 retries)
      if (error.response && error.response.status === 500 && retryCount < 3) {
        console.log(`Retrying getTotalPageCount (attempt ${retryCount + 1})...`);
        // Wait for a short delay before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return staticPageService.getTotalPageCount(retryCount + 1);
      }
      
      console.error('Count endpoint failed, returning 0:', error.message);
      return { count: 0 };
    }
  },

  // Get static page by ID (alternative to slug)
  getStaticPageById: async (id) => {
    try {
      const response = await api.get(`/static-page/id/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default staticPageService;
