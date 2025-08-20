import api from './api';

const attendanceService = {
  // Get all attendances with pagination and filters
  getAllAttendances: async (
    page = 1,
    limit = 25,
    studentIds = [], // Now expects an array of student IDs
    courseIds = [],   // Now expects an array of course IDs
    date = '',
    dateFilterType = 'all',
    status = 'all'
  ) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      // Append each student ID if the array is not empty
      if (studentIds && studentIds.length > 0) {
        studentIds.forEach(id => params.append('studentIds', id));
      }
      // Append each course ID if the array is not empty
      if (courseIds && courseIds.length > 0) {
        courseIds.forEach(id => params.append('courseIds', id));
      }
      if (date) {
        params.append('date', date);
      } else if (dateFilterType !== 'all') {
        params.append('dateFilterType', dateFilterType);
      }
      if (status !== 'all') params.append('status', status);
      
      const queryString = params.toString();
      const url = `/attendance/all?${queryString}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get total attendance count with filters
  getTotalAttendanceCount: async (
    studentIds = [], // Now expects an array of student IDs
    courseIds = [],   // Now expects an array of course IDs
    date = '',
    dateFilterType = 'all',
    status = 'all'
  ) => {
    try {
      const params = new URLSearchParams();
      params.append('countOnly', true); // Indicate that only count is needed
      // Append each student ID if the array is not empty
      if (studentIds && studentIds.length > 0) {
        studentIds.forEach(id => params.append('studentIds', id));
      }
      // Append each course ID if the array is not empty
      if (courseIds && courseIds.length > 0) {
        courseIds.forEach(id => params.append('courseIds', id));
      }
      if (date) params.append('date', date);
      if (dateFilterType !== 'all') params.append('dateFilterType', dateFilterType);
      if (status !== 'all') params.append('status', status);

      const queryString = params.toString();
      const url = `/attendance/all?${queryString}`; // Assuming /attendance/all can return count with filters
      
      const response = await api.get(url);
      // The response should contain a 'total' or 'count' field
      return { count: response.data.totalAttendances || response.data.total || response.data.count || 0 };
    } catch (error) {
      console.error("Error fetching total attendance count with filters:", error);
      throw error;
    }
  },

  // Get attendance by ID
  getAttendanceById: async (id) => {
    try {
      const response = await api.get(`/attendance/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add multiple attendances (bulk)
  addAttendances: async (attendancesData) => {
    try {
      const response = await api.post('/attendance/add', attendancesData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add single attendance (wrapper for bulk add)
  addAttendance: async (attendanceData) => {
    try {
      const response = await api.post('/attendance/add', [attendanceData]);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update attendance
  updateAttendance: async (id, attendanceData) => {
    try {
      const response = await api.put(`/attendance/update/${id}`, attendanceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete attendance
  deleteAttendance: async (id) => {
    try {
      const response = await api.delete(`/attendance/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change attendance status
  changeAttendanceStatus: async (id, status) => {
    try {
      const response = await api.put(`/attendance/status/${id}`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default attendanceService;
