package com.lastmiletracker.customer.service;

import com.lastmiletracker.customer.dto.CustomerProfileResponse;
import com.lastmiletracker.customer.dto.CustomerProfileUpdateRequest;
import com.lastmiletracker.customer.entity.Customer;
import com.lastmiletracker.customer.mapper.CustomerMapper;
import com.lastmiletracker.customer.repository.CustomerRepository;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.user.entity.User;
import com.lastmiletracker.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final CustomerMapper customerMapper;

    public CustomerService(
            CustomerRepository customerRepository,
            UserRepository userRepository,
            CustomerMapper customerMapper) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.customerMapper = customerMapper;
    }

    @Transactional(readOnly = true)
    public CustomerProfileResponse getProfile(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for email: " + email));
        return customerMapper.toResponse(customer);
    }

    @Transactional
    public CustomerProfileResponse updateProfile(String email, CustomerProfileUpdateRequest request) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        User user = customer.getUser();
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setPincode(request.getPincode());

        userRepository.save(user);
        Customer savedCustomer = customerRepository.save(customer);
        log.info("Customer profile updated successfully for: {}", email);

        return customerMapper.toResponse(savedCustomer);
    }

    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
        log.info("User and associated customer profile deleted successfully: {}", email);
    }

    @Transactional
    public void createProfile(User user) {
        Customer customer = Customer.builder()
                .user(user)
                .address("")
                .city("")
                .pincode("")
                .build();
        customerRepository.save(customer);
        log.info("Blank customer profile created for registered user: {}", user.getEmail());
    }
}
