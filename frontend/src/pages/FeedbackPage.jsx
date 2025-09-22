import React, { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import Navbar from '../components/Navbar';

const FeedbackPage = () => {
  const { user } = useAuth();
  const [completedBookings, setCompletedBookings] = useState([]);
  const [existingFeedback, setExistingFeedback] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, feedbackRes] = await Promise.all([
        customerAPI.getBookings(user.id),
        customerAPI.getFeedback(user.id)
      ]);

      // Filter only completed bookings
      const completed = bookingsRes.data.filter(booking => booking.status === 'COMPLETED');
      
      // Filter out bookings that already have feedback
      const feedbackBookingIds = feedbackRes.data.map(f => f.booking.id);
      const completedWithoutFeedback = completed.filter(booking => 
        !feedbackBookingIds.includes(booking.id)
      );

      setCompletedBookings(completedWithoutFeedback);
      setExistingFeedback(feedbackRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error loading feedback data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await customerAPI.createFeedback(user.id, {
        bookingId: selectedBooking.id,
        rating: feedbackData.rating,
        comment: feedbackData.comment
      });

      setMessage('Feedback submitted successfully!');
      setSelectedBooking(null);
      setFeedbackData({ rating: 5, comment: '' });
      fetchData(); // Refresh data
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onStarClick(star) : undefined}
            className={`text-2xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            disabled={!interactive}
          >
            ★
          </button>
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
          <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
          <p className="text-gray-600 mt-2">Share your experience and help improve our services</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit New Feedback */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Leave Feedback</h2>
            
            {completedBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No completed bookings available for feedback</p>
                <p className="text-sm text-gray-400 mt-2">
                  Complete a booking to leave feedback
                </p>
              </div>
            ) : (
              <div>
                {!selectedBooking ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Select a completed booking to review:
                    </h3>
                    <div className="space-y-3">
                      {completedBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{booking.service.name}</h4>
                              <p className="text-sm text-gray-600">with {booking.stylist.name}</p>
                              <p className="text-sm text-gray-500">{formatDateTime(booking.bookingDateTime)}</p>
                            </div>
                            <span className="text-sm font-medium text-primary-600">${booking.service.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                      <h4 className="font-medium text-primary-900">{selectedBooking.service.name}</h4>
                      <p className="text-sm text-primary-700">with {selectedBooking.stylist.name}</p>
                      <p className="text-sm text-primary-600">{formatDateTime(selectedBooking.bookingDateTime)}</p>
                    </div>

                    <form onSubmit={handleSubmitFeedback} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Rating
                        </label>
                        {renderStars(feedbackData.rating, true, (rating) => 
                          setFeedbackData({ ...feedbackData, rating })
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comment
                        </label>
                        <textarea
                          required
                          className="input-field"
                          rows="4"
                          placeholder="Share your experience..."
                          value={feedbackData.comment}
                          onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                        />
                      </div>

                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="btn-primary disabled:opacity-50"
                        >
                          {submitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBooking(null);
                            setFeedbackData({ rating: 5, comment: '' });
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Previous Feedback */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Previous Feedback</h2>
            
            {existingFeedback.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No feedback submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {existingFeedback.map((feedback) => (
                  <div key={feedback.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900">{feedback.booking.service.name}</h4>
                      <p className="text-sm text-gray-600">with {feedback.stylist.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(feedback.booking.bookingDateTime)}
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      {renderStars(feedback.rating)}
                    </div>
                    
                    <p className="text-gray-700 text-sm">{feedback.comment}</p>
                    
                    <p className="text-xs text-gray-400 mt-2">
                      Submitted on {formatDateTime(feedback.createdAt)}
                    </p>
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

export default FeedbackPage;