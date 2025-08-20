// Authentication utility functions

export const isStudentAuthenticated = () => {
  const token = localStorage.getItem('studentToken');
  return !!token;
};

export const getStudentToken = () => {
  return localStorage.getItem('studentToken');
};

export const getStudentData = () => {
  const data = localStorage.getItem('studentData');
  try {
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error parsing student data:', error);
    return null;
  }
};

export const setStudentAuth = (token, studentData) => {
  localStorage.setItem('studentToken', token);
  localStorage.setItem('studentData', JSON.stringify(studentData));
};

export const clearStudentAuth = () => {
  localStorage.removeItem('studentToken');
  localStorage.removeItem('studentData');
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}; 