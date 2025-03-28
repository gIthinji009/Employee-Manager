package com.example.employeemanager.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer"
)
public class SwaggerConfig {
    @Bean
    public OpenAPI employeeManagerOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Employee Manager API")
                        .description("API for managing employees and users")
                        .version("v1.0")
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")));
    }
}
