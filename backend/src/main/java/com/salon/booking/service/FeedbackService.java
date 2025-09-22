package com.salon.booking.service;

import com.salon.booking.entity.Feedback;
import com.salon.booking.entity.User;
import com.salon.booking.entity.Booking;
import com.salon.booking.repository.FeedbackRepository;
import com.salon.booking.repository.UserRepository;
import com.salon.booking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAllFeedbackOrderByCreatedAtDesc();
    }

    public List<Feedback> getFeedbackByCustomer(Long customerId) {
        return feedbackRepository.findByCustomerId(customerId);
    }

    public List<Feedback> getFeedbackByStylist(Long stylistId) {
        return feedbackRepository.findByStylistId(stylistId);
    }

    public Optional<Feedback> getFeedbackById(Long id) {
        return feedbackRepository.findById(id);
    }

    public Feedback createFeedback(Long customerId, Long bookingId, Integer rating, String comment) {
        try {
            Optional<User> customerOptional = userRepository.findById(customerId);
            Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);

            if (customerOptional.isEmpty() || bookingOptional.isEmpty()) {
                throw new RuntimeException("Customer or Booking not found");
            }

            User customer = customerOptional.get();
            Booking booking = bookingOptional.get();
            User stylist = booking.getStylist();

            if (customer.getRole() != User.Role.CUSTOMER) {
                throw new RuntimeException("Invalid customer role");
            }

            // Check if booking belongs to the customer
            if (!booking.getCustomer().getId().equals(customerId)) {
                throw new RuntimeException("Booking does not belong to this customer");
            }

            // Check if booking is completed
            if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
                throw new RuntimeException("Can only provide feedback for completed bookings");
            }

            Feedback feedback = new Feedback();
            feedback.setCustomer(customer);
            feedback.setStylist(stylist);
            feedback.setBooking(booking);
            feedback.setRating(rating);
            feedback.setComment(comment);

            return feedbackRepository.save(feedback);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create feedback: " + e.getMessage());
        }
    }

    public Double getAverageRatingForStylist(Long stylistId) {
        return feedbackRepository.getAverageRatingByStylistId(stylistId);
    }

    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }
}