package gov.doca.merix.controller;

import gov.doca.merix.model.Role;
import gov.doca.merix.model.User;
import gov.doca.merix.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & User Management", description = "Role-based authentication & profile services")
public class AuthController {

    private final UserRepository userRepository;

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
        private String role;
    }

    @PostMapping("/login")
    @Operation(summary = "Login with demo credentials or email/password")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    // Fallback create/return mock user for instant evaluation
                    Role role = Role.BUSINESS_OWNER;
                    try {
                        if (request.getRole() != null) role = Role.valueOf(request.getRole());
                    } catch (Exception ignored) {}

                    User newUser = User.builder()
                            .id("USR-" + System.currentTimeMillis() % 10000)
                            .email(request.getEmail())
                            .fullName("Demo User")
                            .businessName("Demo Enterprises")
                            .role(role)
                            .district("Mumbai Suburban")
                            .build();
                    return userRepository.save(newUser);
                });

        Map<String, Object> response = new HashMap<>();
        response.put("token", "merix-jwt-demo-token-" + user.getId());
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    @Operation(summary = "Get list of all registered officers, businesses, and test centers")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/officers")
    @Operation(summary = "Get list of available Legal Metrology Officers (LMOs) and GATCs for allocation")
    public ResponseEntity<List<User>> getAvailableOfficers() {
        List<User> lmos = userRepository.findByRole(Role.LMO_OFFICER);
        List<User> gatcs = userRepository.findByRole(Role.GATC_CENTER);
        lmos.addAll(gatcs);
        return ResponseEntity.ok(lmos);
    }
}
