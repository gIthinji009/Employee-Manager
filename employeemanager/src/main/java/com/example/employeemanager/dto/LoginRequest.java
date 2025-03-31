package com.example.employeemanager.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Login credentials")
public class LoginRequest {
    @Schema(example = "admin", required = true)
    @NotBlank(message = "Username is required")
    private String username;

    @Schema(example = "admin123", required = true)
    @NotBlank(message = "Password is required")

    private String password;
}
