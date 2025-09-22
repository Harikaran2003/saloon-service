package com.salon.booking.repository;

import com.salon.booking.entity.Service;
import com.salon.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByStylist(User stylist);
    
    @Query("SELECT s FROM Service s WHERE s.stylist.id = ?1 ORDER BY s.createdAt DESC")
    List<Service> findByStylistId(Long stylistId);
    
    @Query("SELECT s FROM Service s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', ?1, '%')) ORDER BY s.name")
    List<Service> findByNameContainingIgnoreCase(String name);
}