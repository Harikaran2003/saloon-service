package com.salon.booking.service;

import com.salon.booking.entity.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendBookingNotificationToStylist(Booking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(booking.getStylist().getEmail());
            message.setSubject("New Booking Request - Salon Management");
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");
            String formattedDateTime = booking.getBookingDateTime().format(formatter);
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "You have received a new booking request!\n\n" +
                "Booking Details:\n" +
                "Customer: %s\n" +
                "Customer Email: %s\n" +
                "Service: %s\n" +
                "Date & Time: %s\n" +
                "Notes: %s\n\n" +
                "Please log in to your dashboard to accept or reject this booking.\n\n" +
                "Best regards,\n" +
                "Salon Management Team",
                booking.getStylist().getName(),
                booking.getCustomer().getName(),
                booking.getCustomer().getEmail(),
                booking.getService().getName(),
                formattedDateTime,
                booking.getNotes() != null ? booking.getNotes() : "No additional notes"
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
            // Log the error but don't throw exception to avoid booking failure
        }
    }

    public void sendBookingConfirmationToCustomer(Booking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(booking.getCustomer().getEmail());
            message.setSubject("Booking Confirmation - Salon Management");
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");
            String formattedDateTime = booking.getBookingDateTime().format(formatter);
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Your booking has been confirmed!\n\n" +
                "Booking Details:\n" +
                "Stylist: %s\n" +
                "Service: %s\n" +
                "Date & Time: %s\n" +
                "Price: $%.2f\n" +
                "Duration: %d minutes\n\n" +
                "Please arrive 10 minutes before your appointment time.\n\n" +
                "Best regards,\n" +
                "Salon Management Team",
                booking.getCustomer().getName(),
                booking.getStylist().getName(),
                booking.getService().getName(),
                formattedDateTime,
                booking.getService().getPrice(),
                booking.getService().getDurationMinutes()
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
        } catch (Exception e) {
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
    }

    public void sendBookingRejectionToCustomer(Booking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(booking.getCustomer().getEmail());
            message.setSubject("Booking Update - Salon Management");
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");
            String formattedDateTime = booking.getBookingDateTime().format(formatter);
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "We regret to inform you that your booking request has been declined.\n\n" +
                "Booking Details:\n" +
                "Stylist: %s\n" +
                "Service: %s\n" +
                "Date & Time: %s\n\n" +
                "Please feel free to book another appointment with a different time or stylist.\n\n" +
                "Best regards,\n" +
                "Salon Management Team",
                booking.getCustomer().getName(),
                booking.getStylist().getName(),
                booking.getService().getName(),
                formattedDateTime
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
        } catch (Exception e) {
            System.err.println("Failed to send rejection email: " + e.getMessage());
        }
    }
}