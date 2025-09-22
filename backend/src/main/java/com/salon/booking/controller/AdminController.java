package com.salon.booking.controller;

import com.salon.booking.entity.Booking;
import com.salon.booking.entity.Feedback;
import com.salon.booking.entity.User;
import com.salon.booking.service.BookingService;
import com.salon.booking.service.FeedbackService;
import com.salon.booking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping("/stylists")
    public ResponseEntity<List<User>> getAllStylists() {
        List<User> stylists = userService.getAllStylists();
        return ResponseEntity.ok(stylists);
    }

    @GetMapping("/customers")
    public ResponseEntity<List<User>> getAllCustomers() {
        List<User> customers = userService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/stylists/{stylistId}")
    public ResponseEntity<?> getStylistById(@PathVariable Long stylistId) {
        Optional<User> stylistOptional = userService.getUserById(stylistId);
        if (stylistOptional.isPresent()) {
            return ResponseEntity.ok(stylistOptional.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/stylists/{stylistId}")
    public ResponseEntity<?> updateStylist(@PathVariable Long stylistId, @RequestBody Map<String, Object> stylistData) {
        try {
            Optional<User> stylistOptional = userService.getUserById(stylistId);
            if (stylistOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User stylist = stylistOptional.get();
            stylist.setName(stylistData.get("name").toString());
            stylist.setEmail(stylistData.get("email").toString());
            
            if (stylistData.containsKey("specialization")) {
                stylist.setSpecialization(stylistData.get("specialization").toString());
            }

            User updatedStylist = userService.updateUser(stylist);
            return ResponseEntity.ok(updatedStylist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/stylists/{stylistId}")
    public ResponseEntity<?> deleteStylist(@PathVariable Long stylistId) {
        try {
            userService.deleteUser(stylistId);
            return ResponseEntity.ok(Map.of("message", "Stylist deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<?> getBookingById(@PathVariable Long bookingId) {
        Optional<Booking> bookingOptional = bookingService.getBookingById(bookingId);
        if (bookingOptional.isPresent()) {
            return ResponseEntity.ok(bookingOptional.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/feedback")
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        List<Feedback> feedback = feedbackService.getAllFeedback();
        return ResponseEntity.ok(feedback);
    }

    @DeleteMapping("/feedback/{feedbackId}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long feedbackId) {
        try {
            feedbackService.deleteFeedback(feedbackId);
            return ResponseEntity.ok(Map.of("message", "Feedback deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            List<User> allStylists = userService.getAllStylists();
            List<User> allCustomers = userService.getAllCustomers();
            List<Booking> allBookings = bookingService.getAllBookings();
            List<Feedback> allFeedback = feedbackService.getAllFeedback();

            long pendingBookings = allBookings.stream()
                    .filter(booking -> booking.getStatus() == Booking.BookingStatus.PENDING)
                    .count();

            long confirmedBookings = allBookings.stream()
                    .filter(booking -> booking.getStatus() == Booking.BookingStatus.CONFIRMED)
                    .count();

            Map<String, Object> stats = Map.of(
                    "totalStylists", allStylists.size(),
                    "totalCustomers", allCustomers.size(),
                    "totalBookings", allBookings.size(),
                    "pendingBookings", pendingBookings,
                    "confirmedBookings", confirmedBookings,
                    "totalFeedback", allFeedback.size()
            );

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}