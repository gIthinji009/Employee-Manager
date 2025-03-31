package com.example.employeemanager.config;

import com.example.employeemanager.model.User;
import com.example.employeemanager.repo.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("!prod") // Only run in non-production environments
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.password:Admin@1234}")
    private String adminPassword;

    @Value("${app.admin.role:ADMIN}")
    private String adminRole;

    public AdminUserInitializer(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        userRepo.findByUsername(adminUsername).ifPresentOrElse(
                user -> {
                    System.out.println("Admin user already exists: " + user.getUsername());
                },
                () -> {
                    User admin = new User();
                    admin.setUsername(adminUsername);
                    admin.setPassword(passwordEncoder.encode(adminPassword));
                    admin.setRole(adminRole);
                    userRepo.save(admin);
                    System.out.printf("Created default admin user: %s with role %s%n",
                            adminUsername, adminRole);
                }
        );
    }
}