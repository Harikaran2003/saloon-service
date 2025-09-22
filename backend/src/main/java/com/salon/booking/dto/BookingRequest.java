package com.salon.booking.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class BookingRequest {
    @NotNull(message = "Stylist ID is required")
    private Long stylistId;

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Booking date and time is required")
    private LocalDateTime bookingDateTime;

    private String notes;

    // Constructors
    public BookingRequest() {}

    public BookingRequest(Long stylistId, Long serviceId, LocalDateTime bookingDateTime, String notes) {
        this.stylistId = stylistId;
        this.serviceId = serviceId;
        this.bookingDateTime = bookingDateTime;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getStylistId() {
        return stylistId;
    }

    public void setStylistId(Long stylistId) {
        this.stylistId = stylistId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public LocalDateTime getBookingDateTime() {
        return bookingDateTime;
    }

    public void setBookingDateTime(LocalDateTime bookingDateTime) {
        this.bookingDateTime = bookingDateTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}