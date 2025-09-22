import axios from 'axios';

// Use direct backend URL for consistent communication
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increase to 30 seconds for slower operations
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server took too long to respond');
      error.message = 'Request timeout. The server is taking too long to respond.';
    } else if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network error - no response received:', error.message);
      error.message = 'Network error. Please check your connection.';
    }
    return Promise.reject(error);
  }
);

// Retry function for critical API calls
const retryRequest = async (apiCall, maxRetries = 2) => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries || (error.response && error.response.status !== 500 && error.code !== 'ECONNABORTED')) {
        throw error;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Customer API
export const customerAPI = {
  getStylists: () => retryRequest(() => api.get('/customer/stylists')),
  getServices: () => retryRequest(() => api.get('/customer/services').catch(error => {
    console.error('Error fetching services:', error);
    if (error.message.includes('ERR_INCOMPLETE_CHUNKED_ENCODING') || error.message.includes('Network Error')) {
      throw new Error('Server response error. Please refresh and try again.');
    }
    throw error;
  })),
  getServicesByStylist: (stylistId) => retryRequest(() => api.get(`/customer/services/stylist/${stylistId}`)),
  createBooking: (customerId, bookingData) => api.post(`/customer/bookings/${customerId}`, bookingData),
  getBookings: (customerId) => retryRequest(() => api.get(`/customer/bookings/${customerId}`)),
  getBookingHistory: (customerId) => retryRequest(() => api.get(`/customer/bookings/history/${customerId}`)),
  createFeedback: (customerId, feedbackData) => api.post(`/customer/feedback/${customerId}`, feedbackData),
  getFeedback: (customerId) => api.get(`/customer/feedback/${customerId}`),
  getStylistRating: (stylistId) => api.get(`/customer/stylist/${stylistId}/rating`),
};

// Stylist API
export const stylistAPI = {
  getBookings: (stylistId) => retryRequest(() => api.get(`/stylist/bookings/${stylistId}`)),
  getPendingBookings: (stylistId) => retryRequest(() => api.get(`/stylist/bookings/pending/${stylistId}`)),
  updateBookingStatus: (bookingId, status) => api.put(`/stylist/bookings/${bookingId}/status`, { status }),
  getServices: (stylistId) => retryRequest(() => api.get(`/stylist/services/${stylistId}`)),
  createService: (stylistId, serviceData) => api.post(`/stylist/services/${stylistId}`, serviceData),
  updateService: (serviceId, serviceData) => api.put(`/stylist/services/${serviceId}`, serviceData),
  deleteService: (serviceId) => api.delete(`/stylist/services/${serviceId}`),
  getProfile: (stylistId) => retryRequest(() => api.get(`/stylist/profile/${stylistId}`)),
  updateProfile: (stylistId, profileData) => api.put(`/stylist/profile/${stylistId}`, profileData),
  getFeedback: (stylistId) => retryRequest(() => api.get(`/stylist/feedback/${stylistId}`)),
  getCustomers: (stylistId) => retryRequest(() => api.get(`/stylist/customers/${stylistId}`)),
};

// Admin API
export const adminAPI = {
  getStylists: () => api.get('/admin/stylists'),
  getCustomers: () => api.get('/admin/customers'),
  getAllUsers: () => api.get('/admin/users'),
  getStylist: (stylistId) => api.get(`/admin/stylists/${stylistId}`),
  updateStylist: (stylistId, stylistData) => api.put(`/admin/stylists/${stylistId}`, stylistData),
  deleteStylist: (stylistId) => api.delete(`/admin/stylists/${stylistId}`),
  getBookings: () => api.get('/admin/bookings'),
  getBooking: (bookingId) => api.get(`/admin/bookings/${bookingId}`),
  getFeedback: () => api.get('/admin/feedback'),
  deleteFeedback: (feedbackId) => api.delete(`/admin/feedback/${feedbackId}`),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
};

export default api;