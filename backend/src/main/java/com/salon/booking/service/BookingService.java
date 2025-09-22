package com.salon.booking.service;

import com.salon.booking.dto.BookingDTO;
import com.salon.booking.dto.BookingRequest;
import com.salon.booking.entity.Booking;
import com.salon.booking.entity.Service;
import com.salon.booking.entity.User;
import com.salon.booking.repository.BookingRepository;
import com.salon.booking.repository.ServiceRepository;
import com.salon.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private EmailService emailService;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByCustomer(Long customerId) {
        return bookingRepository.findByCustomerId(customerId);
    }

    public List<Booking> getBookingsByStylist(Long stylistId) {
        return bookingRepository.findByStylistId(stylistId);
    }

    public List<Booking> getPendingBookingsByStylist(Long stylistId) {
        return bookingRepository.findPendingBookingsByStylistId(stylistId);
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public Booking createBooking(Long customerId, BookingRequest bookingRequest) {
        try {
            Optional<User> customerOptional = userRepository.findById(customerId);
            Optional<User> stylistOptional = userRepository.findById(bookingRequest.getStylistId());
            Optional<Service> serviceOptional = serviceRepository.findById(bookingRequest.getServiceId());

            if (customerOptional.isEmpty() || stylistOptional.isEmpty() || serviceOptional.isEmpty()) {
                throw new RuntimeException("Customer, Stylist, or Service not found");
            }

            User customer = customerOptional.get();
            User stylist = stylistOptional.get();
            Service service = serviceOptional.get();

            if (customer.getRole() != User.Role.CUSTOMER) {
                throw new RuntimeException("Invalid customer role");
            }

            if (stylist.getRole() != User.Role.STYLIST) {
                throw new RuntimeException("Invalid stylist role");
            }

            Booking booking = new Booking();
            booking.setCustomer(customer);
            booking.setStylist(stylist);
            booking.setService(service);
            booking.setBookingDateTime(bookingRequest.getBookingDateTime());
            booking.setNotes(bookingRequest.getNotes());
            booking.setStatus(Booking.BookingStatus.PENDING);

            Booking savedBooking = bookingRepository.save(booking);

            // Send email notification to stylist
            emailService.sendBookingNotificationToStylist(savedBooking);

            return savedBooking;

        } catch (Exception e) {
            throw new RuntimeException("Failed to create booking: " + e.getMessage());
        }
    }

    public Booking updateBookingStatus(Long bookingId, Booking.BookingStatus status) {
        Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);
        if (bookingOptional.isPresent()) {
            Booking booking = bookingOptional.get();
            booking.setStatus(status);
            return bookingRepository.save(booking);
        }
        throw new RuntimeException("Booking not found");
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    public List<Booking> getBookingHistory(Long customerId) {
        return bookingRepository.findBookingHistoryByCustomerId(customerId);
    }

    public List<BookingDTO> getBookingsByCustomerAsDTO(Long customerId) {
        try {
            List<Booking> bookings = bookingRepository.findByCustomerId(customerId);
            return bookings.stream()
                    .map(BookingDTO::new)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch customer bookings: " + e.getMessage());
        }
    }
}