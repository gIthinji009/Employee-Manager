package com.example.employeemanager.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // Disable CSRF (only for development)
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers("/employee/**").permitAll() // Allow API access
                                .anyRequest().authenticated()  // Other pages require authentication
                );

        return http.build();
    }
}
