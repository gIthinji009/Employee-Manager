package com.example.employeemanager.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/api/auth/register") || path.equals("/api/auth/login"); // Ensures login is also excluded
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);

            if (jwt != null && !jwt.isBlank()) {
                authenticateWithJwt(jwt, request);
            }

            filterChain.doFilter(request, response);

        } catch (IllegalArgumentException | JwtValidationException e) {
            handleJwtError(response, request, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized", e.getMessage());
        } catch (UsernameNotFoundException e) {
            handleJwtError(response, request, HttpServletResponse.SC_NOT_FOUND, "User Not Found", "User associated with token not found");
        } catch (Exception e) {
            logger.error("Authentication error: {}", e.getMessage(), e);
            handleJwtError(response, request, HttpServletResponse.SC_FORBIDDEN, "Forbidden", "Authentication failed");
        }
    }

    private void authenticateWithJwt(String jwt, HttpServletRequest request) {
        String username = jwtUtil.extractUsername(jwt);

        if (username == null || username.isBlank()) {
            throw new JwtValidationException("JWT does not contain a valid username");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (!jwtUtil.validateToken(jwt, userDetails)) {
            throw new JwtValidationException("Invalid or expired JWT token");
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            String token = headerAuth.substring(7).trim();
            if (token.isBlank()) {
                throw new IllegalArgumentException("JWT token is empty");
            }
            return token;
        }
        return null;
    }

    private void handleJwtError(HttpServletResponse response,
                                HttpServletRequest request,
                                int status,
                                String error,
                                String message) throws IOException {
        logger.warn("JWT Authentication failed: {}", message);

        response.setContentType("application/json");
        response.setStatus(status);
        response.getWriter().write(
                String.format("""
                {
                    "status": %d,
                    "error": "%s",
                    "message": "%s",
                    "path": "%s",
                    "timestamp": "%s"
                }""",
                        status, error, message, request.getServletPath(), java.time.LocalDateTime.now())
        );
    }

    private static class JwtValidationException extends RuntimeException {
        public JwtValidationException(String message) {
            super(message);
        }
    }
}
