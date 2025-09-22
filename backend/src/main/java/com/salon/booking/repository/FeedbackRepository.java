package com.salon.booking.repository;

import com.salon.booking.entity.Feedback;
import com.salon.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByCustomer(User customer);
    
    List<Feedback> findByStylist(User stylist);
    
    List<Feedback> findByCustomerId(Long customerId);
    
    List<Feedback> findByStylistId(Long stylistId);
    
    @Query("SELECT f FROM Feedback f ORDER BY f.createdAt DESC")
    List<Feedback> findAllFeedbackOrderByCreatedAtDesc();
    
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.stylist.id = ?1")
    Double getAverageRatingByStylistId(Long stylistId);
}