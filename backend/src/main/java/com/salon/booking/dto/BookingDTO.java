package com.salon.booking.dto;

import com.salon.booking.entity.Booking;
import java.time.LocalDateTime;

public class BookingDTO {
    private Long id;
    private ServiceInfo service;
    private StylistInfo stylist;
    private CustomerInfo customer;
    private LocalDateTime bookingDateTime;
    private String status;
    private String notes;
    private LocalDateTime createdAt;

    // Inner classes for nested objects
    public static class ServiceInfo {
        private String name;
        private String description;
        private Double price;
        private Integer durationMinutes;

        public ServiceInfo() {}

        public ServiceInfo(com.salon.booking.entity.Service service) {
            this.name = service.getName();
            this.description = service.getDescription();
            this.price = service.getPrice().doubleValue();
            this.durationMinutes = service.getDurationMinutes();
        }

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    }

    public static class StylistInfo {
        private String name;
        private String email;
        private String specialization;

        public StylistInfo() {}

        public StylistInfo(com.salon.booking.entity.User stylist) {
            this.name = stylist.getName();
            this.email = stylist.getEmail();
            this.specialization = stylist.getSpecialization();
        }

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }
    }

    public static class CustomerInfo {
        private String name;
        private String email;

        public CustomerInfo() {}

        public CustomerInfo(com.salon.booking.entity.User customer) {
            this.name = customer.getName();
            this.email = customer.getEmail();
        }

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    // Constructors
    public BookingDTO() {}

    public BookingDTO(Booking booking) {
        this.id = booking.getId();
        this.service = new ServiceInfo(booking.getService());
        this.stylist = new StylistInfo(booking.getStylist());
        this.customer = new CustomerInfo(booking.getCustomer());
        this.bookingDateTime = booking.getBookingDateTime();
        this.status = booking.getStatus().toString();
        this.notes = booking.getNotes();
        this.createdAt = booking.getCreatedAt();
    }

    // Main getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ServiceInfo getService() {
        return service;
    }

    public void setService(ServiceInfo service) {
        this.service = service;
    }

    public StylistInfo getStylist() {
        return stylist;
    }

    public void setStylist(StylistInfo stylist) {
        this.stylist = stylist;
    }

    public CustomerInfo getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerInfo customer) {
        this.customer = customer;
    }

    public LocalDateTime getBookingDateTime() {
        return bookingDateTime;
    }

    public void setBookingDateTime(LocalDateTime bookingDateTime) {
        this.bookingDateTime = bookingDateTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}