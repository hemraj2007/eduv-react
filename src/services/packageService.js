import api from './api';

const packageService = {
  // Create new package
  createPackage: async (packageData) => {
    try {
      const response = await api.post('/package/create', packageData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all packages
  getAllPackages: async () => {
    try {
      const response = await api.get('/package/all');
      console.log("Package service - getAllPackages response:", response.data);
      
      // Handle different response structures
      let packages = [];
      
      if (response.data?.packages && Array.isArray(response.data.packages)) {
        // Structure: { packages: [...] }
        packages = response.data.packages;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Structure: { data: [...] }
        packages = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        packages = response.data;
      } else {
        console.log("Unexpected package response structure:", response.data);
        packages = [];
      }
      
      console.log("Extracted packages:", packages);
      console.log("Package names:", packages.map(pkg => ({ id: pkg._id, name: pkg.name })));
      
      return {
        packages: packages
      };
    } catch (error) {
      console.error("Package service - getAllPackages error:", error);
      throw error;
    }
  },

  // Get package by ID
  getPackageById: async (id) => {
    try {
      console.log(`Fetching package with ID: ${id}`);
      const response = await api.get(`/package/${id}`);
      console.log("Package by ID response:", response.data);
      
      // Handle different response structures
      let packageData = null;
      
      if (response.data?.package) {
        // Structure: { package: {...} }
        packageData = response.data.package;
      } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        // Direct object response
        packageData = response.data;
      }
      
      console.log("Extracted package data:", packageData);
      
      return {
        data: packageData
      };
    } catch (error) {
      console.error("Error fetching package by ID:", error);
      throw error;
    }
  },

  // Update package
  updatePackage: async (id, packageData) => {
    try {
      const response = await api.put(`/package/update/${id}`, packageData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete package
  deletePackage: async (id) => {
    try {
      const response = await api.delete(`/package/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default packageService;