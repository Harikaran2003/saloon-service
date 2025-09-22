package com.salon.booking.service;

import com.salon.booking.dto.AuthResponse;
import com.salon.booking.dto.LoginRequest;
import com.salon.booking.dto.SignupRequest;
import com.salon.booking.entity.User;
import com.salon.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public AuthResponse signup(SignupRequest signupRequest) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(signupRequest.getEmail())) {
                return new AuthResponse(false, "User with this email already exists");
            }

            // Create new user
            User user = new User();
            user.setName(signupRequest.getName());
            user.setEmail(signupRequest.getEmail());
            user.setPassword(signupRequest.getPassword()); // In production, hash the password
            user.setRole(signupRequest.getRole());
            
            if (signupRequest.getRole() == User.Role.STYLIST) {
                user.setSpecialization(signupRequest.getSpecialization());
            }

            User savedUser = userRepository.save(user);
            return new AuthResponse(savedUser, "User registered successfully", true);

        } catch (Exception e) {
            return new AuthResponse(false, "Registration failed: " + e.getMessage());
        }
    }

    public AuthResponse login(LoginRequest loginRequest) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
            
            if (userOptional.isEmpty()) {
                return new AuthResponse(false, "User not found with email: " + loginRequest.getEmail());
            }

            User user = userOptional.get();
            
            // In production, use proper password hashing and verification
            if (!user.getPassword().equals(loginRequest.getPassword())) {
                return new AuthResponse(false, "Invalid password");
            }

            // Return full user details on successful login
            AuthResponse response = new AuthResponse(user, "Login successful", true);
            return response;

        } catch (Exception e) {
            return new AuthResponse(false, "Login failed: " + e.getMessage());
        }
    }

    public List<User> getAllStylists() {
        try {
            List<User> stylists = userRepository.findAllStylists();
            return stylists != null ? stylists : new ArrayList<>();
        } catch (Exception e) {
            System.err.println("Error fetching stylists: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<User> getAllCustomers() {
        try {
            List<User> customers = userRepository.findAllCustomers();
            return customers != null ? customers : new ArrayList<>();
        } catch (Exception e) {
            System.err.println("Error fetching customers: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateUser(User user) {
        user.setUpdatedAt(java.time.LocalDateTime.now());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}