package com.salon.booking.service;

import com.salon.booking.entity.Service;
import com.salon.booking.entity.User;
import com.salon.booking.repository.ServiceRepository;
import com.salon.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.ArrayList;
import java.util.List;

import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
public class ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Service> getAllServices() {
        try {
            List<Service> services = serviceRepository.findAll();
            // Ensure all lazy collections are properly handled
            if (services != null) {
                services.forEach(service -> {
                    // Force initialization of stylist data we need
                    if (service.getStylist() != null) {
                        service.getStylist().getName(); // Initialize name
                        service.getStylist().getEmail(); // Initialize email
                    }
                });
            }
            return services != null ? services : new ArrayList<>();
        } catch (Exception e) {
            System.err.println("Error fetching all services: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<Service> getServicesByStylist(Long stylistId) {
        try {
            List<Service> services = serviceRepository.findByStylistId(stylistId);
            // Ensure all lazy collections are properly handled
            if (services != null) {
                services.forEach(service -> {
                    // Force initialization of stylist data we need
                    if (service.getStylist() != null) {
                        service.getStylist().getName();
                        service.getStylist().getEmail();
                    }
                });
            }
            return services != null ? services : new ArrayList<>();
        } catch (Exception e) {
            System.err.println("Error fetching services for stylist " + stylistId + ": " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public Optional<Service> getServiceById(Long id) {
        return serviceRepository.findById(id);
    }

    public Service createService(Service service) {
        return serviceRepository.save(service);
    }

    public Service updateService(Service service) {
        return serviceRepository.save(service);
    }

    public void deleteService(Long id) {
        serviceRepository.deleteById(id);
    }

    public List<Service> searchServicesByName(String name) {
        return serviceRepository.findByNameContainingIgnoreCase(name);
    }

    public Service createServiceForStylist(Long stylistId, Service service) {
        try {
            Optional<User> stylistOptional = userRepository.findById(stylistId);
            if (stylistOptional.isPresent() && stylistOptional.get().getRole() == User.Role.STYLIST) {
                service.setStylist(stylistOptional.get());
                return serviceRepository.save(service);
            }
            throw new RuntimeException("Stylist not found or invalid role");
        } catch (Exception e) {
            System.err.println("Error creating service for stylist " + stylistId + ": " + e.getMessage());
            throw new RuntimeException("Failed to create service: " + e.getMessage());
        }
    }
}