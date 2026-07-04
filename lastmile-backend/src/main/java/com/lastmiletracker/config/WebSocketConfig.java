package com.lastmiletracker.config;

import com.lastmiletracker.agent.entity.DeliveryAgent;
import com.lastmiletracker.agent.repository.DeliveryAgentRepository;
import com.lastmiletracker.order.entity.Order;
import com.lastmiletracker.order.repository.OrderRepository;
import com.lastmiletracker.security.JwtTokenProvider;
import com.lastmiletracker.user.entity.User;
import com.lastmiletracker.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Optional;

@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final DeliveryAgentRepository agentRepository;

    public WebSocketConfig(
            JwtTokenProvider tokenProvider,
            UserRepository userRepository,
            @Lazy OrderRepository orderRepository,
            @Lazy DeliveryAgentRepository agentRepository) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.agentRepository = agentRepository;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null) {
                    return message;
                }

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        if (tokenProvider.validateToken(token)) {
                            String username = tokenProvider.getUsernameFromJwt(token);
                            Optional<User> userOpt = userRepository.findByEmail(username);
                            if (userOpt.isPresent()) {
                                User user = userOpt.get();
                                accessor.setUser(() -> user.getEmail());
                                accessor.getSessionAttributes().put("userRole", user.getRole().name());
                            }
                        }
                    }
                } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    String destination = accessor.getDestination();
                    java.security.Principal principal = accessor.getUser();
                    if (principal == null) {
                        log.warn("Subscription request denied. Unauthorized connection attempt to destination: {}", destination);
                        throw new AccessDeniedException("Unauthorized connection");
                    }

                    String email = principal.getName();
                    String userRole = (String) accessor.getSessionAttributes().get("userRole");
                    if (userRole == null) {
                        Optional<User> userOpt = userRepository.findByEmail(email);
                        if (userOpt.isPresent()) {
                            userRole = userOpt.get().getRole().name();
                        }
                    }

                    if (userRole == null) {
                        throw new AccessDeniedException("Access Denied: User role not found");
                    }

                    // ADMIN has all permissions
                    if ("ADMIN".equals(userRole)) {
                        return message;
                    }

                    if (destination != null) {
                        // 1. Subscription to Order Tracking: /topic/tracking/{trackingNumber}
                        if (destination.startsWith("/topic/tracking/")) {
                            String trackingNumber = destination.substring("/topic/tracking/".length());
                            Optional<Order> orderOpt = orderRepository.findByTrackingNumber(trackingNumber);
                            if (orderOpt.isPresent()) {
                                Order order = orderOpt.get();
                                if ("CUSTOMER".equals(userRole) && !order.getSender().getEmail().equals(email)) {
                                    throw new AccessDeniedException("Access Denied: You do not have permission to subscribe to this shipment");
                                }
                                if ("DELIVERY_AGENT".equals(userRole) && (order.getAssignedAgent() == null 
                                        || !order.getAssignedAgent().getUser().getEmail().equals(email))) {
                                    throw new AccessDeniedException("Access Denied: This shipment is not assigned to you");
                                }
                            } else {
                                throw new AccessDeniedException("Access Denied: Shipment not found");
                            }
                        }
                        // 2. Subscription to Admin live tracking feed: /topic/admin/live
                        else if (destination.startsWith("/topic/admin/live")) {
                            if (!"ADMIN".equals(userRole)) {
                                throw new AccessDeniedException("Access Denied: Only administrators can subscribe to the administrative live coordinates feed");
                            }
                        }
                        // 3. Subscription to Agent updates: /topic/agent/{agentId}
                        else if (destination.startsWith("/topic/agent/")) {
                            String agentIdStr = destination.substring("/topic/agent/".length());
                            try {
                                Long agentId = Long.parseLong(agentIdStr);
                                Optional<DeliveryAgent> agentOpt = agentRepository.findByUserEmail(email);
                                if (agentOpt.isEmpty() || !agentOpt.get().getId().equals(agentId)) {
                                    throw new AccessDeniedException("Access Denied: You do not have permission to subscribe to updates for this delivery agent");
                                }
                            } catch (NumberFormatException e) {
                                throw new AccessDeniedException("Access Denied: Invalid agent ID format");
                            }
                        }
                    }
                }
                return message;
            }
        });
    }
}
