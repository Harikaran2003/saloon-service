import React, { useState, useEffect } from 'react';
import { stylistAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import Navbar from '../components/Navbar';

const ProfileManagement = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    specialization: '',
    password: ''
  });
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    durationMinutes: ''
  });
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, servicesRes] = await Promise.all([
        stylistAPI.getProfile(user.id),
        stylistAPI.getServices(user.id)
      ]);

      setProfile({
        name: profileRes.data.name || '',
        email: profileRes.data.email || '',
        specialization: profileRes.data.specialization || '',
        password: ''
      });
      setServices(servicesRes.data || []);
      setMessage(''); // Clear any previous error messages
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Set default values to prevent crashes
      setProfile({
        name: user.name || '',
        email: user.email || '',
        specialization: user.specialization || '',
        password: ''
      });
      setServices([]);
      
      if (error.code === 'ECONNABORTED') {
        setMessage('Request timeout. Please refresh the page and try again.');
      } else if (error.response) {
        setMessage(`Error loading profile data: ${error.response.status}`);
      } else {
        setMessage('Error loading profile data. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const updateData = {
        name: profile.name,
        email: profile.email,
        specialization: profile.specialization
      };

      if (profile.password) {
        updateData.password = profile.password;
      }

      const response = await stylistAPI.updateProfile(user.id, updateData);
      
      // Update user context with new data
      const updatedUser = { ...user, ...response.data };
      login(updatedUser);

      setMessage('Profile updated successfully!');
      setProfile({ ...profile, password: '' }); // Clear password field
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleServiceCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Validate form data before sending
      if (!newService.name.trim()) {
        setMessage('Service name is required');
        return;
      }
      
      if (!newService.price || parseFloat(newService.price) <= 0) {
        setMessage('Valid price is required');
        return;
      }
      
      if (!newService.durationMinutes || parseInt(newService.durationMinutes) <= 0) {
        setMessage('Valid duration is required');
        return;
      }

      await stylistAPI.createService(user.id, {
        ...newService,
        price: parseFloat(newService.price),
        durationMinutes: parseInt(newService.durationMinutes)
      });

      setMessage('Service created successfully!');
      setNewService({ name: '', description: '', price: '', durationMinutes: '' });
      fetchData(); // Refresh services
    } catch (error) {
      console.error('Service creation error:', error);
      
      if (error.code === 'ECONNABORTED') {
        setMessage('Request timeout. Please try again.');
      } else if (error.response) {
        setMessage(error.response.data?.error || `Error creating service: ${error.response.status}`);
      } else {
        setMessage('Error creating service. Please check your connection and try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleServiceUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await stylistAPI.updateService(editingService.id, {
        ...editingService,
        price: parseFloat(editingService.price),
        durationMinutes: parseInt(editingService.durationMinutes)
      });

      setMessage('Service updated successfully!');
      setEditingService(null);
      fetchData(); // Refresh services
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating service');
    } finally {
      setSaving(false);
    }
  };

  const handleServiceDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await stylistAPI.deleteService(serviceId);
      setMessage('Service deleted successfully!');
      fetchData(); // Refresh services
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error deleting service');
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
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
          <p className="text-gray-600 mt-2">Manage your profile and services</p>
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
              { id: 'profile', label: 'Profile Information' },
              { id: 'services', label: 'Manage Services' }
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
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Hair Cutting, Facial, Massage"
                  value={profile.specialization}
                  onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter new password"
                  value={profile.password}
                  onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-8">
            {/* Add New Service */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Service</h2>
              
              <form onSubmit={handleServiceCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Name
                    </label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="e.g., Haircut"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="input-field"
                      placeholder="25.00"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="input-field"
                    placeholder="60"
                    value={newService.durationMinutes}
                    onChange={(e) => setNewService({ ...newService, durationMinutes: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="Describe your service..."
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Service'}
                </button>
              </form>
            </div>

            {/* Existing Services */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Services</h2>
              
              {services.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No services created yet</p>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="p-4 border border-gray-200 rounded-lg">
                      {editingService && editingService.id === service.id ? (
                        <form onSubmit={handleServiceUpdate} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                              type="text"
                              required
                              className="input-field"
                              value={editingService.name}
                              onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                            />
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              className="input-field"
                              value={editingService.price}
                              onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                            />
                            <input
                              type="number"
                              min="1"
                              required
                              className="input-field"
                              value={editingService.durationMinutes}
                              onChange={(e) => setEditingService({ ...editingService, durationMinutes: e.target.value })}
                            />
                          </div>
                          <textarea
                            className="input-field"
                            rows="2"
                            value={editingService.description}
                            onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
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
                              onClick={() => setEditingService(null)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-600">{service.description}</p>
                            <div className="flex space-x-4 mt-2">
                              <span className="text-sm font-medium text-primary-600">${service.price}</span>
                              <span className="text-sm text-gray-500">{service.durationMinutes} mins</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingService(service)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleServiceDelete(service.id)}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileManagement;