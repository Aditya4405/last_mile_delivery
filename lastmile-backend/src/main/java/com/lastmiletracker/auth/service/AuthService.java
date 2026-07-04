package com.lastmiletracker.auth.service;

import com.lastmiletracker.auth.dto.*;
import com.lastmiletracker.auth.entity.PasswordResetToken;
import com.lastmiletracker.auth.entity.RefreshToken;
import com.lastmiletracker.auth.entity.VerificationToken;
import com.lastmiletracker.auth.repository.PasswordResetTokenRepository;
import com.lastmiletracker.auth.repository.RefreshTokenRepository;
import com.lastmiletracker.auth.repository.VerificationTokenRepository;
import com.lastmiletracker.exception.BadRequestException;
import com.lastmiletracker.exception.DuplicateResourceException;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.exception.UnauthorizedException;
import com.lastmiletracker.security.JwtTokenProvider;
import com.lastmiletracker.user.entity.Role;
import com.lastmiletracker.user.entity.User;
import com.lastmiletracker.user.repository.UserRepository;
import com.lastmiletracker.customer.service.CustomerService;
import com.lastmiletracker.agent.service.AgentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;
    private final CustomerService customerService;
    private final AgentService agentService;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            VerificationTokenRepository verificationTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            AuthenticationManager authenticationManager,
            JavaMailSender mailSender,
            CustomerService customerService,
            AgentService agentService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.mailSender = mailSender;
        this.customerService = customerService;
        this.agentService = agentService;
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.CUSTOMER;

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(role)
                .enabled(false) // disabled until email verification
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create profile based on role
        if (role == Role.CUSTOMER) {
            customerService.createProfile(savedUser);
        } else if (role == Role.DELIVERY_AGENT) {
            agentService.createProfile(savedUser);
        }

        // Generate email verification token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(savedUser)
                .expiryDate(Instant.now().plusSeconds(86400)) // 24 hours
                .build();
        verificationTokenRepository.save(verificationToken);

        // Send mock/real email
        String verifyLink = "http://localhost:8084/api/auth/verify-email?token=" + token;
        log.info(">>>> [EMAIL VERIFICATION] Click link to verify: {}", verifyLink);
        sendEmail(savedUser.getEmail(), "Verify Your Email - Last Mile Tracker",
                "Hello " + savedUser.getFullName() + ",\n\nPlease verify your email by clicking: " + verifyLink);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isEnabled()) {
            throw new UnauthorizedException("Please verify your email before logging in");
        }

        String accessToken = jwtTokenProvider.generateToken(authentication);

        // Generate / Update Refresh Token
        RefreshToken refreshToken = generateOrCreateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFullName())
                .build();
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findByToken(requestRefreshToken)
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token was expired. Please make a new signin request");
        }

        User user = refreshToken.getUser();
        String accessToken = jwtTokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFullName())
                .build();
    }

    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        refreshTokenRepository.deleteByUser(user);
        log.info("User {} logged out successfully. Refresh tokens revoked.", email);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        // Revoke any existing reset tokens
        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(Instant.now().plusSeconds(3600)) // 1 hour
                .build();
        passwordResetTokenRepository.save(resetToken);

        String resetLink = "http://localhost:5173/reset-password?token=" + token; // Frontend port
        log.info(">>>> [PASSWORD RESET] Click link to reset: {}", resetLink);
        sendEmail(user.getEmail(), "Reset Your Password - Last Mile Tracker",
                "Hello " + user.getFullName() + ",\n\nPlease reset your password by clicking: " + resetLink);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Reset token not found"));

        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
        log.info("Password reset successfully for user {}", user.getEmail());
    }

    @Transactional
    public void verifyEmail(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Verification token not found"));

        if (verificationToken.getExpiryDate().isBefore(Instant.now())) {
            verificationTokenRepository.delete(verificationToken);
            throw new BadRequestException("Verification token has expired");
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);
        log.info("Email verified successfully for user {}", user.getEmail());
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password updated successfully for user {}", email);
    }

    private RefreshToken generateOrCreateRefreshToken(User user) {
        // If user already has a token, check/update it or create new
        return refreshTokenRepository.findById(user.getId())
                .map(existingToken -> {
                    existingToken.setToken(UUID.randomUUID().toString());
                    existingToken.setExpiryDate(Instant.now().plusMillis(refreshExpirationMs));
                    return refreshTokenRepository.save(existingToken);
                })
                .orElseGet(() -> {
                    RefreshToken newToken = RefreshToken.builder()
                            .user(user)
                            .token(UUID.randomUUID().toString())
                            .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                            .build();
                    return refreshTokenRepository.save(newToken);
                });
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.warn("Failed to send email via SMTP to {}: {}. Verification link was logged in console.", to, e.getMessage());
        }
    }
}
