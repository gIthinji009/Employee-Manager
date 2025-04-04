package com.example.employeemanager.jwt;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write(
                "{\"status\": " + HttpServletResponse.SC_UNAUTHORIZED +
                        ", \"error\": \"Unauthorized\"," +
                        "\"message\": \"Full authentication is required to access this resource\"," +
                        "\"path\": \"" + request.getServletPath() + "\"}"
        );
    }
}