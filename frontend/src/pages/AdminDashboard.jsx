import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [stylists, setStylists] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [editingStylist, setEditingStylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, stylistsRes, customersRes, bookingsRes, feedbackRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getStylists(),
        adminAPI.getCustomers(),
        adminAPI.getBookings(),
        adminAPI.getFeedback()
      ]);

      setStats(statsRes.data);
      setStylists(stylistsRes.data);
      setCustomers(customersRes.data);
      setBookings(bookingsRes.data);
      setFeedback(feedbackRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStylistUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await adminAPI.updateStylist(editingStylist.id, {
        name: editingStylist.name,
        email: editingStylist.email,
        specialization: editingStylist.specialization
      });

      setMessage('Stylist updated successfully!');
      setEditingStylist(null);
      fetchData(); // Refresh data
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating stylist');
    } finally {
      setSaving(false);
    }
  };

  const handleStylistDelete = async (stylistId) => {
    if (!window.confirm('Are you sure you want to delete this stylist? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteStylist(stylistId);
      setMessage('Stylist deleted successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error deleting stylist');
    }
  };

  const handleFeedbackDelete = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await adminAPI.deleteFeedback(feedbackId);
      setMessage('Feedback deleted successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error deleting feedback');
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your salon booking system</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'stylists', label: 'Stylists', count: stylists.length },
              { id: 'customers', label: 'Customers', count: customers.length },
              { id: 'bookings', label: 'Bookings', count: bookings.length },
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
                {tab.label} {tab.count !== undefined && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-primary-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{stats.totalStylists || 0}</div>
                  <div className="text-sm text-primary-700">Total Stylists</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.totalCustomers || 0}</div>
                  <div className="text-sm text-green-700">Total Customers</div>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalBookings || 0}</div>
                  <div className="text-sm text-blue-700">Total Bookings</div>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings || 0}</div>
                  <div className="text-sm text-yellow-700">Pending Bookings</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.confirmedBookings || 0}</div>
                  <div className="text-sm text-purple-700">Confirmed Bookings</div>
                </div>
                <div className="bg-pink-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">{stats.totalFeedback || 0}</div>
                  <div className="text-sm text-pink-700">Total Feedback</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Stylist
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.stylist.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.service.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status.toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(booking.bookingDateTime)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stylists' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Stylists</h2>
              
              {stylists.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No stylists registered yet</p>
              ) : (
                <div className="space-y-4">
                  {stylists.map((stylist) => (
                    <div key={stylist.id} className="p-4 border border-gray-200 rounded-lg">
                      {editingStylist && editingStylist.id === stylist.id ? (
                        <form onSubmit={handleStylistUpdate} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              required
                              className="input-field"
                              placeholder="Name"
                              value={editingStylist.name}
                              onChange={(e) => setEditingStylist({ ...editingStylist, name: e.target.value })}
                            />
                            <input
                              type="email"
                              required
                              className="input-field"
                              placeholder="Email"
                              value={editingStylist.email}
                              onChange={(e) => setEditingStylist({ ...editingStylist, email: e.target.value })}
                            />
                          </div>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Specialization"
                            value={editingStylist.specialization || ''}
                            onChange={(e) => setEditingStylist({ ...editingStylist, specialization: e.target.value })}
                          />
                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              disabled={saving}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingStylist(null)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{stylist.name}</h4>
                            <p className="text-sm text-gray-600">{stylist.email}</p>
                            {stylist.specialization && (
                              <p className="text-sm text-primary-600 mt-1">
                                Specialization: {stylist.specialization}
                              </p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              Joined: {formatDateTime(stylist.createdAt)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingStylist(stylist)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleStylistDelete(stylist.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'customers' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer List</h2>
              
              {customers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No customers registered yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Join Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Bookings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(customer.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {bookings.filter(b => b.customer.id === customer.id).length}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">All Bookings</h2>
              
              {bookings.length === 0 ? (
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
                          Stylist
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
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.stylist.name}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                            ${booking.service.price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                          <p className="text-sm text-gray-600">
                            for {item.stylist.name} - {item.booking.service.name}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {renderStars(item.rating)}
                          <button
                            onClick={() => handleFeedbackDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
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

export default AdminDashboard;