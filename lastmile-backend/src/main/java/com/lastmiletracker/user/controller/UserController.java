package com.lastmiletracker.user.controller;

import com.lastmiletracker.auth.dto.ChangePasswordRequest;
import com.lastmiletracker.auth.service.AuthService;
import com.lastmiletracker.common.response.ApiResponse;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.user.dto.UserResponse;
import com.lastmiletracker.user.entity.User;
import com.lastmiletracker.user.mapper.UserMapper;
import com.lastmiletracker.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Controller", description = "Endpoints for managing authenticated user profile details")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AuthService authService;

    public UserController(
            UserRepository userRepository,
            UserMapper userMapper,
            AuthService authService) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.authService = authService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get the authenticated user's profile details")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UserResponse response = userMapper.toResponse(user);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully!", response));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change password for the authenticated user")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        authService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.success("Password updated successfully!"));
    }
}
