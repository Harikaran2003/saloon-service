import React, { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import Navbar from '../components/Navbar';
import NotificationBanner from '../components/NotificationBanner';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [bookingData, setBookingData] = useState({
    stylistId: '',
    serviceId: '',
    bookingDateTime: '',
    notes: ''
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stylistsRes, servicesRes, bookingsRes] = await Promise.all([
        customerAPI.getStylists(),
        customerAPI.getServices(),
        customerAPI.getBookings(user.id)
      ]);

      // Handle successful responses
      setStylists(stylistsRes.data || []);
      setServices(servicesRes.data || []);
      setRecentBookings((bookingsRes.data || []).slice(0, 5)); // Show last 5 bookings
      setMessage(''); // Clear any previous error messages
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set default empty arrays to prevent crashes
      setStylists([]);
      setServices([]);
      setRecentBookings([]);
      
      // Show user-friendly error message
      if (error.code === 'ECONNABORTED') {
        setMessage('Request timeout. Please check your connection and try again.');
      } else if (error.message && error.message.includes('ERR_INCOMPLETE_CHUNKED_ENCODING')) {
        setMessage('Server response error. The server is having issues. Please refresh and try again.');
      } else if (error.message && error.message.includes('Network Error')) {
        setMessage('Network error. Please check if the backend server is running and try again.');
      } else if (error.response) {
        setMessage(`Error loading dashboard data: ${error.response.status} ${error.response.statusText}`);
      } else {
        setMessage('Error loading dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setMessage('');

    try {
      await customerAPI.createBooking(user.id, bookingData);
      setMessage('Booking created successfully! The stylist will be notified via email and you will receive a confirmation once they accept.');
      setBookingData({
        stylistId: '',
        serviceId: '',
        bookingDateTime: '',
        notes: ''
      });
      setSelectedStylist(null);
      fetchData(); // Refresh recent bookings
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error creating booking');
    } finally {
      setBookingLoading(false);
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

  const getStatusMessage = (status) => {
    switch (status) {
      case 'PENDING': return 'Waiting for stylist confirmation';
      case 'CONFIRMED': return 'Confirmed - You will receive an email';
      case 'REJECTED': return 'Declined by stylist';
      case 'COMPLETED': return 'Service completed';
      case 'CANCELLED': return 'Cancelled';
      default: return status.toLowerCase();
    }
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
          <p className="text-gray-600 mt-2">Book your next salon appointment</p>
        </div>

        {message && (
          <NotificationBanner 
            message={message} 
            type={message.includes('Error') ? 'error' : 'success'}
            onClose={() => setMessage('')}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Services and Booking Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Services</h2>
            
            {/* All Services Display */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Browse All Services</h3>
              {services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No services available at the moment</p>
                  <button 
                    onClick={fetchData}
                    className="mt-2 text-primary-600 hover:text-primary-500 text-sm"
                  >
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        bookingData.serviceId === service.id.toString()
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                      onClick={() => {
                        setBookingData({
                          ...bookingData,
                          serviceId: service.id,
                          stylistId: service.stylist.id
                        });
                        setSelectedStylist(service.stylist);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                          <p className="text-sm text-primary-600 font-medium mt-1">
                            Stylist: {service.stylist.name}
                          </p>
                          {service.stylist.specialization && (
                            <p className="text-sm text-gray-500">
                              Specialization: {service.stylist.specialization}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-primary-600">${service.price}</span>
                          <p className="text-sm text-gray-500">{service.durationMinutes} mins</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Form */}
            {bookingData.serviceId && selectedStylist && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Book This Service</h3>
                <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-800">
                    <span className="font-medium">Selected:</span> {services.find(s => s.id.toString() === bookingData.serviceId.toString())?.name} 
                    with {selectedStylist.name}
                  </p>
                </div>
                
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="input-field"
                      value={bookingData.bookingDateTime}
                      onChange={(e) => setBookingData({ ...bookingData, bookingDateTime: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      className="input-field"
                      rows="3"
                      placeholder="Any special requests or notes..."
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {bookingLoading ? 'Booking...' : 'Book Appointment'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBookingData({
                          stylistId: '',
                          serviceId: '',
                          bookingDateTime: '',
                          notes: ''
                        });
                        setSelectedStylist(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Recent Bookings and Status */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Bookings & Status</h2>
            
            {recentBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {booking.service.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          with {booking.stylist.name}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDateTime(booking.bookingDateTime)}
                    </p>
                    <p className="text-sm font-medium text-primary-600 mb-2">
                      ${booking.service.price}
                    </p>
                    <p className="text-xs text-gray-600">
                      Status: {getStatusMessage(booking.status)}
                    </p>
                    {booking.status === 'CONFIRMED' && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Check your email for confirmation details
                      </p>
                    )}
                    {booking.status === 'REJECTED' && (
                      <p className="text-xs text-red-600 mt-1">
                        ✗ You can book a different time or stylist
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;