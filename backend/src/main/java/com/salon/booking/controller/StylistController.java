package com.salon.booking.controller;

import com.salon.booking.entity.Booking;
import com.salon.booking.entity.Feedback;
import com.salon.booking.entity.Service;
import com.salon.booking.entity.User;
import com.salon.booking.service.BookingService;
import com.salon.booking.service.EmailService;
import com.salon.booking.service.FeedbackService;
import com.salon.booking.service.ServiceService;
import com.salon.booking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/stylist")
@CrossOrigin(origins = "http://localhost:5173")
public class StylistController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ServiceService serviceService;

    @Autowired
    private UserService userService;

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private EmailService emailService;

    // Test endpoint to verify API connectivity
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        return ResponseEntity.ok(Map.of("status", "success", "message", "Stylist API is working"));
    }

    @GetMapping("/bookings/{stylistId}")
    public ResponseEntity<List<Booking>> getStylistBookings(@PathVariable Long stylistId) {
        List<Booking> bookings = bookingService.getBookingsByStylist(stylistId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/bookings/pending/{stylistId}")
    public ResponseEntity<List<Booking>> getPendingBookings(@PathVariable Long stylistId) {
        List<Booking> pendingBookings = bookingService.getPendingBookingsByStylist(stylistId);
        return ResponseEntity.ok(pendingBookings);
    }

    @PutMapping("/bookings/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> statusData) {
        try {
            String status = statusData.get("status");
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            
            Booking updatedBooking = bookingService.updateBookingStatus(bookingId, bookingStatus);
            
            // Send appropriate email notification to customer
            if (bookingStatus == Booking.BookingStatus.CONFIRMED) {
                emailService.sendBookingConfirmationToCustomer(updatedBooking);
            } else if (bookingStatus == Booking.BookingStatus.REJECTED) {
                emailService.sendBookingRejectionToCustomer(updatedBooking);
            }
            
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/services/{stylistId}")
    public ResponseEntity<?> getStylistServices(@PathVariable Long stylistId) {
        try {
            // Verify stylist exists and has correct role
            Optional<User> stylistOptional = userService.getUserById(stylistId);
            if (stylistOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User stylist = stylistOptional.get();
            if (stylist.getRole() != User.Role.STYLIST) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a stylist"));
            }

            List<Service> services = serviceService.getServicesByStylist(stylistId);
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching services: " + e.getMessage()));
        }
    }

    @PostMapping("/services/{stylistId}")
    public ResponseEntity<?> createService(@PathVariable Long stylistId, @RequestBody Map<String, Object> serviceData) {
        try {
            // Validate stylist exists and is a stylist
            Optional<User> stylistOptional = userService.getUserById(stylistId);
            if (stylistOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Stylist not found with ID: " + stylistId));
            }
            
            User stylist = stylistOptional.get();
            if (stylist.getRole() != User.Role.STYLIST) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a stylist"));
            }

            // Validate required fields
            if (!serviceData.containsKey("name") || serviceData.get("name") == null || 
                serviceData.get("name").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Service name is required"));
            }
            
            if (!serviceData.containsKey("price") || serviceData.get("price") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Service price is required"));
            }
            
            if (!serviceData.containsKey("durationMinutes") || serviceData.get("durationMinutes") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Service duration is required"));
            }

            Service service = new Service();
            service.setName(serviceData.get("name").toString().trim());
            service.setDescription(serviceData.containsKey("description") && serviceData.get("description") != null ? 
                serviceData.get("description").toString() : "");
            service.setPrice(new BigDecimal(serviceData.get("price").toString()));
            service.setDurationMinutes(Integer.valueOf(serviceData.get("durationMinutes").toString()));

            Service createdService = serviceService.createServiceForStylist(stylistId, service);
            return ResponseEntity.ok(createdService);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid number format for price or duration"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error creating service: " + e.getMessage()));
        }
    }

    @PutMapping("/services/{serviceId}")
    public ResponseEntity<?> updateService(@PathVariable Long serviceId, @RequestBody Map<String, Object> serviceData) {
        try {
            Optional<Service> serviceOptional = serviceService.getServiceById(serviceId);
            if (serviceOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Service service = serviceOptional.get();
            service.setName(serviceData.get("name").toString());
            service.setDescription(serviceData.get("description").toString());
            service.setPrice(new BigDecimal(serviceData.get("price").toString()));
            service.setDurationMinutes(Integer.valueOf(serviceData.get("durationMinutes").toString()));

            Service updatedService = serviceService.updateService(service);
            return ResponseEntity.ok(updatedService);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/services/{serviceId}")
    public ResponseEntity<?> deleteService(@PathVariable Long serviceId) {
        try {
            serviceService.deleteService(serviceId);
            return ResponseEntity.ok(Map.of("message", "Service deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile/{stylistId}")
    public ResponseEntity<?> getStylistProfile(@PathVariable Long stylistId) {
        try {
            Optional<User> stylistOptional = userService.getUserById(stylistId);
            if (stylistOptional.isPresent() && stylistOptional.get().getRole() == User.Role.STYLIST) {
                User stylist = stylistOptional.get();
                // Create a clean response object to avoid serialization issues
                Map<String, Object> response = Map.of(
                    "id", stylist.getId(),
                    "name", stylist.getName(),
                    "email", stylist.getEmail(),
                    "specialization", stylist.getSpecialization() != null ? stylist.getSpecialization() : "",
                    "role", stylist.getRole().toString(),
                    "createdAt", stylist.getCreatedAt().toString()
                );
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/{stylistId}")
    public ResponseEntity<?> updateStylistProfile(@PathVariable Long stylistId, @RequestBody Map<String, Object> profileData) {
        try {
            Optional<User> stylistOptional = userService.getUserById(stylistId);
            if (stylistOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User stylist = stylistOptional.get();
            if (stylist.getRole() != User.Role.STYLIST) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a stylist"));
            }

            // Update fields safely
            if (profileData.containsKey("name") && profileData.get("name") != null) {
                stylist.setName(profileData.get("name").toString());
            }
            if (profileData.containsKey("email") && profileData.get("email") != null) {
                stylist.setEmail(profileData.get("email").toString());
            }
            if (profileData.containsKey("specialization")) {
                stylist.setSpecialization(profileData.get("specialization") != null ? 
                    profileData.get("specialization").toString() : null);
            }
            if (profileData.containsKey("password") && profileData.get("password") != null && 
                !profileData.get("password").toString().isEmpty()) {
                stylist.setPassword(profileData.get("password").toString());
            }

            User updatedStylist = userService.updateUser(stylist);
            
            // Return clean response
            Map<String, Object> response = Map.of(
                "id", updatedStylist.getId(),
                "name", updatedStylist.getName(),
                "email", updatedStylist.getEmail(),
                "specialization", updatedStylist.getSpecialization() != null ? updatedStylist.getSpecialization() : "",
                "role", updatedStylist.getRole().toString()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error updating profile: " + e.getMessage()));
        }
    }

    @GetMapping("/feedback/{stylistId}")
    public ResponseEntity<List<Feedback>> getStylistFeedback(@PathVariable Long stylistId) {
        List<Feedback> feedback = feedbackService.getFeedbackByStylist(stylistId);
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/customers/{stylistId}")
    public ResponseEntity<List<User>> getStylistCustomers(@PathVariable Long stylistId) {
        List<Booking> bookings = bookingService.getBookingsByStylist(stylistId);
        List<User> customers = bookings.stream()
                .map(Booking::getCustomer)
                .distinct()
                .toList();
        return ResponseEntity.ok(customers);
    }
}