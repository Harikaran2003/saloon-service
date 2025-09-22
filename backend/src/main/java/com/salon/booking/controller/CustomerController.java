package com.salon.booking.controller;

import com.salon.booking.dto.BookingDTO;
import com.salon.booking.dto.BookingRequest;
import com.salon.booking.entity.Booking;
import com.salon.booking.entity.Feedback;
import com.salon.booking.entity.Service;
import com.salon.booking.entity.User;
import com.salon.booking.service.BookingService;
import com.salon.booking.service.FeedbackService;
import com.salon.booking.service.ServiceService;
import com.salon.booking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerController {

    @Autowired
    private UserService userService;

    @Autowired
    private ServiceService serviceService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private FeedbackService feedbackService;

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "OK", "message", "Customer API is working"));
    }

    @GetMapping("/stylists")
    public ResponseEntity<List<User>> getAllStylists() {
        try {
            List<User> stylists = userService.getAllStylists();
            // Return empty list if no stylists found, don't return null
            return ResponseEntity.ok(stylists != null ? stylists : new ArrayList<>());
        } catch (Exception e) {
            // Log error and return empty list to prevent timeout
            System.err.println("Error fetching stylists: " + e.getMessage());
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/services")
    public ResponseEntity<List<Service>> getAllServices() {
        try {
            List<Service> services = serviceService.getAllServices();
            // Always return a valid List, never null
            List<Service> safeServices = services != null ? services : new ArrayList<>();
            return ResponseEntity.ok(safeServices);
        } catch (Exception e) {
            System.err.println("Error in CustomerController.getAllServices: " + e.getMessage());
            e.printStackTrace();
            // Return empty list to prevent incomplete chunked encoding
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/services/stylist/{stylistId}")
    public ResponseEntity<List<Service>> getServicesByStylist(@PathVariable Long stylistId) {
        try {
            List<Service> services = serviceService.getServicesByStylist(stylistId);
            return ResponseEntity.ok(services != null ? services : new ArrayList<>());
        } catch (Exception e) {
            System.err.println("Error fetching services for stylist " + stylistId + ": " + e.getMessage());
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @PostMapping("/bookings/{customerId}")
    public ResponseEntity<?> createBooking(@PathVariable Long customerId, @Valid @RequestBody BookingRequest bookingRequest) {
        try {
            Booking booking = bookingService.createBooking(customerId, bookingRequest);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/bookings/{customerId}")
    public ResponseEntity<List<BookingDTO>> getCustomerBookings(@PathVariable Long customerId) {
        try {
            List<BookingDTO> bookings = bookingService.getBookingsByCustomerAsDTO(customerId);
            return ResponseEntity.ok(bookings != null ? bookings : new ArrayList<>());
        } catch (Exception e) {
            System.err.println("Error fetching bookings for customer " + customerId + ": " + e.getMessage());
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/bookings/history/{customerId}")
    public ResponseEntity<List<Booking>> getBookingHistory(@PathVariable Long customerId) {
        List<Booking> bookings = bookingService.getBookingHistory(customerId);
        return ResponseEntity.ok(bookings);
    }

    @PostMapping("/feedback/{customerId}")
    public ResponseEntity<?> createFeedback(
            @PathVariable Long customerId,
            @RequestBody Map<String, Object> feedbackData) {
        try {
            Long bookingId = Long.valueOf(feedbackData.get("bookingId").toString());
            Integer rating = Integer.valueOf(feedbackData.get("rating").toString());
            String comment = feedbackData.get("comment").toString();

            Feedback feedback = feedbackService.createFeedback(customerId, bookingId, rating, comment);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/feedback/{customerId}")
    public ResponseEntity<List<Feedback>> getCustomerFeedback(@PathVariable Long customerId) {
        List<Feedback> feedback = feedbackService.getFeedbackByCustomer(customerId);
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/stylist/{stylistId}/rating")
    public ResponseEntity<Map<String, Object>> getStylistRating(@PathVariable Long stylistId) {
        Double averageRating = feedbackService.getAverageRatingForStylist(stylistId);
        return ResponseEntity.ok(Map.of("averageRating", averageRating != null ? averageRating : 0.0));
    }
}