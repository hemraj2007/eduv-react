import api from './api';

// Mock storage for offline mode
const mockDocuments = {};
let mockDocumentId = 1;

const studentDocumentService = {
  // Upload documents for a student
  uploadDocuments: async (formData) => {
    try {
      const studentId = formData.get('student_id');
      const documents = formData.getAll('documents');

      // Validate
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      if (!documents || documents.length === 0) {
        throw new Error('No documents to upload');
      }

      // Try multiple endpoints for document upload
      const endpoints = [
        '/student-document/add',
        `/student-document/student/${studentId}`,
        `/student-document/by-student/${studentId}`
      ];

      let lastError = null;
      for (const endpoint of endpoints) {
        try {
          console.log(`Attempting upload to ${endpoint}`);
          const response = await api.post(endpoint, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          console.log(`Upload succeeded at ${endpoint}`);
          
          // Check if response has the expected structure
          if (response.data && (response.data.success || response.data.data)) {
            return response.data;
          } else {
            console.warn(`Upload response from ${endpoint} has unexpected format:`, response.data);
            // Try to normalize the response format
            return { success: true, data: response.data };
          }
        } catch (err) {
          console.warn(`Upload failed at ${endpoint}:`, err.response?.data || err.message);
          lastError = err;
        }
      }
      
      // If we get here, all endpoints failed
      throw lastError || new Error('All upload endpoints failed')

    } catch (error) {
      console.error('Error in uploadDocuments:', error.message);

      // Fallback: mock implementation
      console.warn('Using mock uploadDocuments fallback');
      const studentId = formData.get('student_id');
      const docs = formData.getAll('documents');
      const types = formData.getAll('document_types');
      if (!mockDocuments[studentId]) mockDocuments[studentId] = [];

      const uploadedDocs = docs.map((file, i) => {
        const type = types[i] || (file.type.includes('image') ? 'image' : 'pdf');
        const newDoc = {
          _id: `mock_${mockDocumentId++}`,
          student_id: studentId,
          document_url: URL.createObjectURL(file),
          document_type: type,
          document_name: file.name,
          document_size: file.size,
          created_at: new Date().toISOString(),
        };
        mockDocuments[studentId].push(newDoc);
        return newDoc;
      });

      return { success: true, data: uploadedDocs };
    }
  },

  getAllDocuments: async () => {
    const endpoint = '/student-document/getall';
    try {
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error in getAllDocuments:', error.message);
      throw error;
    }
  },

  getDocumentsByStudentId: async (studentId) => {
    const endpoints = [
      `/student-document/student/${studentId}`,
      `/student-document/by-student/${studentId}`,
      `/student-document/get-by-id/${studentId}`,
      `/student-document?student_id=${studentId}`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint);
        console.log(`Endpoint ${endpoint} succeeded`);
        
        // Check if response has the expected structure
        if (response.data) {
          // If response.data.data exists, return the whole response.data
          // If not, wrap the response.data in a standard format
          if (response.data.data !== undefined) {
            return response.data;
          } else {
            return { success: true, data: response.data };
          }
        }
        return { success: false, data: [] };
      } catch (err) {
        console.warn(`Endpoint ${endpoint} failed:`, err.message);
      }
    }

    console.warn('Using mock getDocumentsByStudentId fallback');
    return { success: true, data: mockDocuments[studentId] || [] };
  },

  deleteDocument: async (documentId) => {
    if (!documentId) throw new Error('Document ID is required');

    const endpoint = `/student-document/${documentId}`;
    try {
      const response = await api.delete(endpoint);
      return response.data;
    } catch (err) {
      console.warn(`Delete failed at ${endpoint}:`, err.message);

      // Mock delete
      if (documentId.startsWith('mock_')) {
        for (const studentId in mockDocuments) {
          const idx = mockDocuments[studentId].findIndex(doc => doc._id === documentId);
          if (idx !== -1) mockDocuments[studentId].splice(idx, 1);
        }
      }
      return { success: true, message: 'Document deleted (mock)' };
    }
  },

  getTotalDocumentCount: async () => {
    try {
      const response = await api.get('/student-document/getall');
      if (Array.isArray(response.data?.data)) {
        return { count: response.data.data.length };
      }
    } catch (err) {
      console.warn('Count API failed:', err.message);
    }

    // Mock fallback
    let totalCount = 0;
    for (const studentId in mockDocuments) {
      totalCount += mockDocuments[studentId].length;
    }
    return { count: totalCount };
  },

  getDocumentById: async (documentId) => {
    const endpoints = [
      `/student-document/${documentId}`,
      `/student-document/get-by-id/${documentId}`
    ];
    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint);
        return response.data;
      } catch (err) {
        console.warn(`Endpoint ${endpoint} failed:`, err.message);
      }
    }

    // Mock fallback
    if (documentId.startsWith('mock_')) {
      for (const studentId in mockDocuments) {
        const doc = mockDocuments[studentId].find(doc => doc._id === documentId);
        if (doc) return { success: true, data: doc };
      }
    }
    return { success: false, message: 'Document not found' };
  },

  updateDocument: async (documentId, documentData) => {
    try {
      const response = await api.put(`/student-document/${documentId}`, documentData);
      return response.data;
    } catch (err) {
      console.warn(`Update failed:`, err.message);

      // Mock update
      if (documentId.startsWith('mock_')) {
        for (const studentId in mockDocuments) {
          const idx = mockDocuments[studentId].findIndex(doc => doc._id === documentId);
          if (idx !== -1) {
            mockDocuments[studentId][idx] = {
              ...mockDocuments[studentId][idx],
              ...documentData,
              updated_at: new Date().toISOString()
            };
            return { success: true, data: mockDocuments[studentId][idx] };
          }
        }
      }
      return { success: false, message: 'Document not found' };
    }
  },
};

export default studentDocumentService;
