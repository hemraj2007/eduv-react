import api from './api';

const studentService = {
  // Get all students with pagination
  getAllStudents: async (page = 1, limit = 10, search = '') => {
    try {
      const params = {
        page,
        limit,
      };
      if (search) {
        params.search = search; // Correctly add search parameter
      }

      const response = await api.get('/student/all', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      // Return empty array instead of throwing to prevent UI errors
      return { students: [] };
    }
  },

  // Get student by ID
  getStudentById: async (id) => {
    try {
      if (!id) {
        console.warn('getStudentById called with invalid ID:', id);
        return { student: null };
      }
      
      const response = await api.get(`/student/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching student ID ${id}:`, error);
      // Return empty object instead of throwing to prevent UI errors
      return { student: null };
    }
  },

  // Check if email already exists
  checkEmailExists: async (email) => {
    try {
      const response = await api.post('/student/check-email', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add new student with profile picture upload support
  addStudent: async (formData) => {
    try {
      const response = await api.post('/student/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update student by ID with profile picture upload support
  updateStudent: async (id, studentData) => {
    try {
      // Check if studentData is FormData or regular object
      if (studentData instanceof FormData) {
        // Handle FormData (for file uploads and complex data)
        const response = await api.put(`/student/update/${id}`, studentData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      } else {
        // Handle regular object (for simple data updates like course assignment)
        const response = await api.put(`/student/update/${id}`, studentData, {
          headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  // Delete student by ID
  deleteStudent: async (id) => {
    try {
      const response = await api.delete(`/student/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Toggle student status by ID - backend toggles status, no need to send status here
  updateStudentStatus: async (id) => {
    try {
      const response = await api.put(`/student/status/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get courses assigned to a specific student
  getStudentCourses: async (studentId) => {
    try {
      const response = await api.get(`/student/${studentId}/courses`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching courses for student ${studentId}:`, error);
      // Return empty array instead of throwing to prevent UI errors
      return { courses: [] };
    }
  },

  // Student login
  loginStudent: async (loginData) => {
    try {
      const response = await api.post('/student/login', loginData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get students by course ID
  getStudentsByCourseId: async (courseId) => {
    try {
      if (!courseId) {
        console.warn('getStudentsByCourseId called with invalid courseId:', courseId);
        return { students: [] };
      }
      
      const response = await api.get(`/student/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching students for course ID ${courseId}:`, error);
      // Return empty array instead of throwing to prevent UI errors
      return { students: [] };
    }
  },
};

export default studentService;
