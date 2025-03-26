package com.example.employeemanager.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "User registration details")
public class RegisterRequest {
    @Schema(example = "newuser", required = true)
    @NotBlank(message = "Username is required")
    private String username;

    @Schema(example = "Password@123", required = true)
    @NotBlank(message = "Password is required")
    private String password;

    @Schema(example = "USER", allowableValues = {"USER", "ADMIN"})
    private String role;
}
