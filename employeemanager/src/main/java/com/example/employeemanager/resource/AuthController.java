package com.example.employeemanager.resource;

import com.example.employeemanager.dto.LoginRequest;
import com.example.employeemanager.dto.RegisterRequest;
import com.example.employeemanager.model.User;
import com.example.employeemanager.repo.UserRepo;
import com.example.employeemanager.jwt.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication and registration endpoints")
public class AuthController {
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public AuthController(UserRepo userRepo, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager, JwtUtil jwtUtil,
                          UserDetailsService userDetailsService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Operation(summary = "Register a new user", description = "Creates a new user account")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User registered successfully",
                    content = @Content(schema = @Schema(implementation = Map.class),
                            examples = @ExampleObject(value = "{\"message\": \"User registered successfully\", \"username\": \"testuser\", \"token\": \"eyJhb...\"}"))),
            @ApiResponse(responseCode = "400", description = "Bad request - validation failed or username exists")
    })
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @Valid @RequestBody RegisterRequest registerRequest) {

        if (userRepo.findByUsername(registerRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole() != null ? registerRequest.getRole() : "USER");
        userRepo.save(user);

        // Create UserDetails without loading from service to avoid caching issues
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );

        String token = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(Map.of(
                "message", "User registered successfully",
                "username", user.getUsername(),
                "token", token
        ));
    }

    @Operation(summary = "Authenticate user", description = "Logs in a user and returns JWT token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Authentication successful",
                    content = @Content(schema = @Schema(implementation = Map.class),
                            examples = @ExampleObject(value = "{\"token\": \"eyJhbGciOiJIUzI1NiJ9...\", \"username\": \"testuser\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "username", userDetails.getUsername()
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Authentication failed",
                    "message", e.getMessage()
            ));
        }
    }
}