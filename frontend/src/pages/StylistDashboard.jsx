import React, { useState, useEffect } from 'react';
import { stylistAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import Navbar from '../components/Navbar';

const StylistDashboard = () => {
  const { user } = useAuth();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, bookingsRes, servicesRes, customersRes, feedbackRes] = await Promise.all([
        stylistAPI.getPendingBookings(user.id),
        stylistAPI.getBookings(user.id),
        stylistAPI.getServices(user.id),
        stylistAPI.getCustomers(user.id),
        stylistAPI.getFeedback(user.id)
      ]);

      setPendingBookings(pendingRes.data || []);
      setAllBookings(bookingsRes.data || []);
      setServices(servicesRes.data || []);
      setCustomers(customersRes.data || []);
      setFeedback(feedbackRes.data || []);
      setMessage(''); // Clear any previous error messages
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Set default empty arrays to prevent crashes
      setPendingBookings([]);
      setAllBookings([]);
      setServices([]);
      setCustomers([]);
      setFeedback([]);
      
      // Show user-friendly error message
      if (error.code === 'ECONNABORTED') {
        setMessage('Request timeout. Please refresh the page and try again.');
      } else if (error.response) {
        setMessage(`Error loading dashboard data: ${error.response.status} ${error.response.statusText}`);
      } else {
        setMessage('Error loading dashboard data. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookingStatusUpdate = async (bookingId, status) => {
    try {
      await stylistAPI.updateBookingStatus(bookingId, status);
      setMessage(`Booking ${status.toLowerCase()} successfully!`);
      fetchData(); // Refresh data
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating booking status');
    }
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, f) => acc + f.rating, 0);
    return (sum / feedback.length).toFixed(1);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}!</h1>
          <p className="text-gray-600 mt-2">Manage your bookings and services</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600">{pendingBookings.length}</div>
            <div className="text-sm text-gray-600">Pending Bookings</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{allBookings.filter(b => b.status === 'CONFIRMED').length}</div>
            <div className="text-sm text-gray-600">Confirmed Bookings</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">{services.length}</div>
            <div className="text-sm text-gray-600">Services Offered</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600">{calculateAverageRating()}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'pending', label: 'Pending Bookings', count: pendingBookings.length },
              { id: 'all', label: 'All Bookings', count: allBookings.length },
              { id: 'customers', label: 'Customers', count: customers.length },
              { id: 'feedback', label: 'Feedback', count: feedback.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card">
          {activeTab === 'pending' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Booking Requests</h2>
              {pendingBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending bookings</p>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <div key={booking.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.service.name}</h4>
                          <p className="text-sm text-gray-600">Customer: {booking.customer.name}</p>
                          <p className="text-sm text-gray-600">Email: {booking.customer.email}</p>
                          <p className="text-sm text-gray-500">{formatDateTime(booking.bookingDateTime)}</p>
                          <p className="text-sm font-medium text-primary-600">${booking.service.price}</p>
                          {booking.notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Notes:</span> {booking.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleBookingStatusUpdate(booking.id, 'CONFIRMED')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleBookingStatusUpdate(booking.id, 'REJECTED')}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        INFO: When you accept/reject, the customer will be automatically notified via email.
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'all' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">All Bookings</h2>
              {allBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.service.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(booking.bookingDateTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status.toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {booking.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleBookingStatusUpdate(booking.id, 'COMPLETED')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                              >
                                Mark Complete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'customers' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Customers</h2>
              {customers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No customers yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900">{customer.name}</h4>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Bookings: {allBookings.filter(b => b.customer.id === customer.id).length}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Feedback</h2>
              {feedback.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No feedback yet</p>
              ) : (
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.customer.name}</h4>
                          <p className="text-sm text-gray-600">{item.booking.service.name}</p>
                        </div>
                        {renderStars(item.rating)}
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{item.comment}</p>
                      <p className="text-xs text-gray-400">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StylistDashboard;