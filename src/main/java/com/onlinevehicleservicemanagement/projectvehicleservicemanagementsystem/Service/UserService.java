package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.User;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ── Register ──────────────────────────────────
    public User register(User user) {
        if (repository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        if (repository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        // Password hash කරලා save කරන්න
        user.setPassword(encoder.encode(user.getPassword()));
        return repository.save(user);
    }

    // ── Login ─────────────────────────────────────
    public User login(String username, String password) {
        User user = repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }
        return user;
    }

    // ── Forgot Password ───────────────────────────
    public String forgotPassword(String email) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));


        String token = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        user.setResetToken(token);
        repository.save(user);


        return token;
    }

    // ── Reset Password ────────────────────────────
    public void resetPassword(String token, String newPassword) {
        User user = repository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        user.setPassword(encoder.encode(newPassword));
        user.setResetToken(null);
        repository.save(user);
    }

    // ── Get All Users ─────────────────────────────
    public List<User> getAll() {
        return repository.findAll();
    }

    // ── Get By ID ─────────────────────────────────
    public User getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── Update User ───────────────────────────────
    public User update(Long id, User updated) {
        User existing = getById(id);
        existing.setFullName(updated.getFullName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setNic(updated.getNic());
        existing.setRole(updated.getRole());
        existing.setAddress(updated.getAddress());
        existing.setDrivingLicense(updated.getDrivingLicense());
        existing.setBusinessName(updated.getBusinessName());
        existing.setBusinessReg(updated.getBusinessReg());
        existing.setGarageAddress(updated.getGarageAddress());
        existing.setOpenHours(updated.getOpenHours());
        existing.setGaragePhone(updated.getGaragePhone());
        return repository.save(existing);
    }

    // ── Delete User ───────────────────────────────
    public void delete(Long id) {
        repository.deleteById(id);
    }

    // ── Seed Demo Users ───────────────────────────
    public void seedDemoUsers() {
        if (repository.count() > 0) return;

        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(encoder.encode("admin123"));
        admin.setEmail("admin@autoserve.lk");
        admin.setFullName("System Admin");
        admin.setRole("Admin");
        repository.save(admin);

        User garage = new User();
        garage.setUsername("garage1");
        garage.setPassword(encoder.encode("garage123"));
        garage.setEmail("garage1@autoserve.lk");
        garage.setFullName("Amal Perera");
        garage.setRole("Garage Owner");
        garage.setBusinessName("ABC Auto Garage");
        repository.save(garage);

        User owner = new User();
        owner.setUsername("owner1");
        owner.setPassword(encoder.encode("owner123"));
        owner.setEmail("owner1@autoserve.lk");
        owner.setFullName("Nimal Silva");
        owner.setRole("Vehicle Owner");
        repository.save(owner);
    }
}