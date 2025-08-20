import api from './api';

const courseService = {
  // Get all courses with pagination and sorting
  getAllCourses: async (page = 1, limit = 10, search = '', sortBy = 'createdDate', sortOrder = 'desc') => {
    try {
      // Try the main endpoint first
      try {
        const response = await api.get('/course/all', {
          params: {
            page,
            limit,
            search,
            sortBy,    // Add sortBy parameter
            sortOrder  // Add sortOrder parameter (e.g., 'asc' or 'desc')
          }
        });
        return response.data;
      } catch (mainError) {
        console.log('Error with main endpoint, trying fallback:', mainError);

        // Try fallback endpoint without pagination or sorting parameters
        const fallbackResponse = await api.get('/course');
        return fallbackResponse.data;
      }
    } catch (error) {
      console.error('All course fetch attempts failed:', error);
      // Return empty array instead of throwing to prevent UI errors
      return { courses: [] };
    }
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      if (!id) {
        console.warn('getCourseById called with invalid ID:', id);
        return { course: null }; // Consistent return format
      }

      const response = await api.get(`/course/${id}`);
      // Return the course object directly from the response
      // assuming your API returns { "course": { ... } }
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ID ${id}:`, error);
      // Ensure the return format is consistent for error cases
      return { course: null, message: 'Failed to fetch course' };
    }
  },
  // Add new course
  addCourse: async (courseData) => {
    try {
      // Check if courseData contains file (FormData) or regular object
      const config = courseData instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : {};

      const response = await api.post('/course/add', courseData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update course
  updateCourse: async (id, courseData) => {
    try {
      // Check if courseData contains file (FormData) or regular object
      const config = courseData instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : {};

      const response = await api.put(`/course/update/${id}`, courseData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (id) => {
    try {
      const response = await api.delete(`/course/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change course status
  changeCourseStatus: async (id, status) => {
    try {
      const response = await api.put(`/course/status/${id}`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update course status (alias for changeCourseStatus)
  updateCourseStatus: async (id, status) => {
    try {
      const response = await api.put(`/course/status/${id}`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get courses assigned to a specific student
  getCoursesByStudentId: async (studentId) => {
    try {
      // Try to get courses by student ID - this endpoint should return courses assigned to the student
      const response = await api.get(`/course/student/${studentId}`);
      return response.data;
    } catch (error) {
      // If the student-specific endpoint doesn't exist, try alternative endpoints
      try {
        // Alternative: Get all courses and filter by enrolled students
        const allCoursesResponse = await api.get('/course/all');
        const allCourses = allCoursesResponse.data.courses || allCoursesResponse.data || [];

        // Filter courses where the student is enrolled
        const studentCourses = allCourses.filter(course =>
          course.enrolledStudents && course.enrolledStudents.includes(studentId)
        );

        return { courses: studentCourses };
      } catch (fallbackError) {
        console.error("Error fetching courses for student:", fallbackError);
        throw fallbackError;
      }
    }
  },
};

export default courseService;
