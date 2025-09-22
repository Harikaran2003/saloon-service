package com.salon.booking.repository;

import com.salon.booking.entity.Booking;
import com.salon.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomer(User customer);
    
    List<Booking> findByStylist(User stylist);
    
    List<Booking> findByCustomerId(Long customerId);
    
    List<Booking> findByStylistId(Long stylistId);
    
    List<Booking> findByStatus(Booking.BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.stylist.id = ?1 AND b.status = 'PENDING'")
    List<Booking> findPendingBookingsByStylistId(Long stylistId);
    
    @Query("SELECT b FROM Booking b WHERE b.customer.id = ?1 ORDER BY b.bookingDateTime DESC")
    List<Booking> findBookingHistoryByCustomerId(Long customerId);
    
    @Query("SELECT b FROM Booking b WHERE b.bookingDateTime BETWEEN ?1 AND ?2")
    List<Booking> findBookingsBetweenDates(LocalDateTime startDate, LocalDateTime endDate);
}