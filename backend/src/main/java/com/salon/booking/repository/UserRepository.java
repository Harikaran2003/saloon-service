package com.salon.booking.repository;

import com.salon.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(User.Role role);
    
    @Query("SELECT u FROM User u WHERE u.role = 'STYLIST' ORDER BY u.createdAt DESC")
    List<User> findAllStylists();
    
    @Query("SELECT u FROM User u WHERE u.role = 'CUSTOMER' ORDER BY u.createdAt DESC")
    List<User> findAllCustomers();
}