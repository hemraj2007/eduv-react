import api from './api';

const feeManagementService = {
  // Get all course assignments with payment details and pagination
  getAllAssignments: async (page = 1, limit = 10, search = '') => {
    try {
      const response = await api.get('/course-assignment/all', {
        params: {
          page,
          limit,
          search,
          populate: 'mobile'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Assign course to student with payment details
  assignCourse: async (assignmentData) => {
    try {
      const response = await api.post('/course-assignment/assign', assignmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update payment for a course assignment
  updatePayment: async (id, paymentData) => {
    try {
      const response = await api.put(`/course-assignment/payment/${id}`, paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get assignment by ID
  getAssignmentById: async (id) => {
    try {
      if (!id) {
        console.warn('getAssignmentById called with invalid ID:', id);
        return { assignment: null };
      }
      
      const response = await api.get(`/course-assignment/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assignment ID ${id}:`, error);
      // Return empty object instead of throwing to prevent UI errors
      return { assignment: null };
    }
  },

  // Get assignments by student ID
  getAssignmentsByStudentId: async (studentId) => {
    try {
      if (!studentId) {
        console.warn('getAssignmentsByStudentId called with invalid student ID:', studentId);
        return { assignments: [] };
      }
      
      const response = await api.get(`/course-assignment/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assignments for student ${studentId}:`, error);
      // Return empty array instead of throwing to prevent UI errors
      return { assignments: [] };
    }
  },

  // Get assignment by Student ID and Course ID
  getAssignmentByStudentAndCourse: async (studentId, courseId) => {
    try {
      if (!studentId || !courseId) {
        console.warn('getAssignmentByStudentAndCourse called with invalid IDs:', { studentId, courseId });
        return { assignments: [] };
      }
      
      const response = await api.get(`/course-assignment/student/${studentId}/course/${courseId}`);
      return response.data;
    } catch (error) {
      // For 404 errors, return empty assignments array instead of throwing
      if (error.response && error.response.status === 404) {
        console.log(`No assignments found for student ${studentId} and course ${courseId}`);
        return { assignments: [] };
      }
      
      console.error(`Error fetching assignments for student ${studentId} and course ${courseId}:`, error);
      // Return empty array instead of throwing to prevent UI errors
      return { assignments: [] };
    }
  },
};

export default feeManagementService;